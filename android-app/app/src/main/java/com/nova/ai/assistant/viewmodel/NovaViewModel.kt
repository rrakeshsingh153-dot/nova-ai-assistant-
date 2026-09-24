package com.nova.ai.assistant.viewmodel

import android.app.Application
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.nova.ai.assistant.agent.AgentExecutionState
import com.nova.ai.assistant.agent.AgentOrchestrator
import com.nova.ai.assistant.agent.AgentTaskStatus
import com.nova.ai.assistant.data.AssistantPersonality
import com.nova.ai.assistant.data.AssistantState
import com.nova.ai.assistant.data.ChatMessage
import com.nova.ai.assistant.data.ConversationSession
import com.nova.ai.assistant.data.LanguageMode
import com.nova.ai.assistant.data.PersonalMemory
import com.nova.ai.assistant.data.PreferencesRepository
import com.nova.ai.assistant.data.UserPreferences
import com.nova.ai.assistant.network.ApiClient
import com.nova.ai.assistant.network.HistoryItem
import com.nova.ai.assistant.voice.VoiceManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream

class NovaViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = PreferencesRepository(application)
    val agentOrchestrator = AgentOrchestrator(application, repository)

    val preferences: StateFlow<UserPreferences> = repository.userPreferencesFlow.stateIn(
        scope = viewModelScope,
        started = SharingStarted.Eagerly,
        initialValue = UserPreferences()
    )

    val sessions: StateFlow<List<ConversationSession>> = repository.sessionsFlow.stateIn(
        scope = viewModelScope,
        started = SharingStarted.Eagerly,
        initialValue = emptyList()
    )

    val agentTaskStatus: StateFlow<AgentTaskStatus> = agentOrchestrator.taskStatus

    private val _activeSessionId = MutableStateFlow<String?>(null)
    val activeSessionId: StateFlow<String?> = _activeSessionId.asStateFlow()

    private val _assistantState = MutableStateFlow(AssistantState.IDLE)
    val assistantState: StateFlow<AssistantState> = _assistantState.asStateFlow()

    private val _speakingMessageId = MutableStateFlow<String?>(null)
    val speakingMessageId: StateFlow<String?> = _speakingMessageId.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    private val _pendingConfirmationAction = MutableStateFlow<(() -> Unit)?>(null)
    val pendingConfirmationAction: StateFlow<(() -> Unit)?> = _pendingConfirmationAction.asStateFlow()

    private val _currentActiveTool = MutableStateFlow<String?>(null)
    val currentActiveTool: StateFlow<String?> = _currentActiveTool.asStateFlow()

    // Attached image & file for multimodal analysis
    private val _attachedImageBase64 = MutableStateFlow<String?>(null)
    val attachedImageBase64: StateFlow<String?> = _attachedImageBase64.asStateFlow()

    private val _attachedImageUri = MutableStateFlow<Uri?>(null)
    val attachedImageUri: StateFlow<Uri?> = _attachedImageUri.asStateFlow()

    private val _attachedFileUri = MutableStateFlow<Uri?>(null)
    val attachedFileUri: StateFlow<Uri?> = _attachedFileUri.asStateFlow()

    private val _voiceManager: VoiceManager by lazy {
        VoiceManager(
            context = application,
            onSpeechResult = { spokenText ->
                sendMessage(spokenText, isVoiceInput = true)
            },
            onError = { err ->
                _assistantState.value = AssistantState.IDLE
                _errorMessage.value = err
            }
        )
    }

    val isListening: StateFlow<Boolean> get() = _voiceManager.isListening
    val interimText: StateFlow<String> get() = _voiceManager.interimText

    init {
        viewModelScope.launch {
            repository.activeSessionIdFlow.collect { id ->
                _activeSessionId.value = id
            }
        }
        viewModelScope.launch {
            preferences.collect { prefs ->
                ApiClient.setCustomBackendUrl(prefs.customBackendUrl)
            }
        }
        viewModelScope.launch {
            _voiceManager.isSpeaking.collect { speaking ->
                if (speaking) {
                    _assistantState.value = AssistantState.SPEAKING
                } else if (_assistantState.value == AssistantState.SPEAKING) {
                    _assistantState.value = AssistantState.IDLE
                    _speakingMessageId.value = null
                }
            }
        }
        viewModelScope.launch {
            _voiceManager.isListening.collect { listening ->
                if (listening) {
                    _assistantState.value = AssistantState.LISTENING
                } else if (_assistantState.value == AssistantState.LISTENING) {
                    _assistantState.value = AssistantState.IDLE
                }
            }
        }
        viewModelScope.launch {
            agentTaskStatus.collect { task ->
                when (task.state) {
                    AgentExecutionState.SEARCHING, AgentExecutionState.THINKING, AgentExecutionState.UNDERSTANDING, AgentExecutionState.EXECUTING_TOOL -> {
                        _assistantState.value = AssistantState.THINKING
                    }
                    AgentExecutionState.WAITING_CONFIRMATION -> {
                        _pendingConfirmationAction.value = task.pendingAction
                    }
                    AgentExecutionState.COMPLETED, AgentExecutionState.IDLE -> {
                        if (!_voiceManager.isSpeaking.value) {
                            _assistantState.value = AssistantState.IDLE
                        }
                    }
                    AgentExecutionState.ERROR -> {
                        _assistantState.value = AssistantState.IDLE
                    }
                }
            }
        }
    }

    fun startListening() {
        _errorMessage.value = null
        _voiceManager.startListening(preferences.value.language)
    }

    fun stopListening() {
        _voiceManager.stopListening()
    }

    fun stopSpeaking() {
        _voiceManager.stopSpeaking()
        _speakingMessageId.value = null
        _assistantState.value = AssistantState.IDLE
    }

    fun speakText(text: String, messageId: String? = null) {
        _speakingMessageId.value = messageId
        _voiceManager.speak(
            text = text,
            speechRate = preferences.value.speechRate,
            speechPitch = preferences.value.speechPitch
        )
    }

    fun cancelAgentTask() {
        agentOrchestrator.cancelCurrentTask()
        _assistantState.value = AssistantState.IDLE
    }

    fun selectSession(session: ConversationSession) {
        viewModelScope.launch {
            _activeSessionId.value = session.id
            repository.setActiveSessionId(session.id)
        }
    }

    fun createNewChat() {
        stopSpeaking()
        stopListening()
        clearAttachedImage()
        clearAttachedFile()
        val newSession = ConversationSession(
            id = "sess_${System.currentTimeMillis()}",
            title = "New Conversation",
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis(),
            messages = emptyList()
        )
        val updated = listOf(newSession) + sessions.value
        viewModelScope.launch {
            _activeSessionId.value = newSession.id
            repository.saveSessions(updated)
            repository.setActiveSessionId(newSession.id)
        }
    }

    fun deleteSession(sessionId: String) {
        val updated = sessions.value.filter { it.id != sessionId }
        viewModelScope.launch {
            if (_activeSessionId.value == sessionId) {
                val next = updated.firstOrNull()?.id
                _activeSessionId.value = next
                repository.setActiveSessionId(next)
            }
            repository.saveSessions(updated)
        }
    }

    fun clearAllSessions() {
        viewModelScope.launch {
            _activeSessionId.value = null
            repository.saveSessions(emptyList())
            repository.setActiveSessionId(null)
        }
    }

    fun clearChat() {
        val currentId = _activeSessionId.value ?: return
        val updated = sessions.value.map { sess ->
            if (sess.id == currentId) {
                sess.copy(messages = emptyList(), updatedAt = System.currentTimeMillis())
            } else sess
        }
        viewModelScope.launch {
            repository.saveSessions(updated)
        }
    }

    fun attachImage(uri: Uri) {
        _attachedImageUri.value = uri
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val inputStream = getApplication<Application>().contentResolver.openInputStream(uri)
                val bitmap = BitmapFactory.decodeStream(inputStream)
                inputStream?.close()

                if (bitmap != null) {
                    val maxDimension = 1024
                    val scale = if (bitmap.width > maxDimension || bitmap.height > maxDimension) {
                        val factor = maxDimension.toFloat() / Math.max(bitmap.width, bitmap.height)
                        Bitmap.createScaledBitmap(bitmap, (bitmap.width * factor).toInt(), (bitmap.height * factor).toInt(), true)
                    } else {
                        bitmap
                    }
                    val outputStream = ByteArrayOutputStream()
                    scale.compress(Bitmap.CompressFormat.JPEG, 85, outputStream)
                    val byteArray = outputStream.toByteArray()
                    val b64 = Base64.encodeToString(byteArray, Base64.NO_WRAP)
                    withContext(Dispatchers.Main) {
                        _attachedImageBase64.value = b64
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _errorMessage.value = "Failed to load image: ${e.localizedMessage}"
                }
            }
        }
    }

    fun clearAttachedImage() {
        _attachedImageUri.value = null
        _attachedImageBase64.value = null
    }

    fun attachFile(uri: Uri) {
        _attachedFileUri.value = uri
    }

    fun clearAttachedFile() {
        _attachedFileUri.value = null
    }

    fun sendMessage(text: String, isVoiceInput: Boolean = false) {
        if (text.isBlank() && _attachedImageBase64.value == null && _attachedFileUri.value == null) return

        stopSpeaking()
        _errorMessage.value = null

        val attachedImageB64 = _attachedImageBase64.value
        val attachedUri = _attachedImageUri.value
        val attachedFile = _attachedFileUri.value
        clearAttachedImage()
        clearAttachedFile()

        val userMessage = ChatMessage(
            id = "msg_${System.currentTimeMillis()}",
            role = "user",
            text = text.trim().ifEmpty { if (attachedFile != null) "Analyze this file." else "Analyze this image." },
            timestamp = System.currentTimeMillis(),
            isVoiceInput = isVoiceInput,
            imageUrl = attachedUri?.toString()
        )

        val currentSessions = sessions.value.toMutableList()
        var currentSession = currentSessions.find { it.id == _activeSessionId.value }

        if (currentSession == null) {
            currentSession = ConversationSession(
                id = "sess_${System.currentTimeMillis()}",
                title = if (text.length > 28) text.take(28) + "..." else if (text.isNotBlank()) text else "Agent Task",
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis(),
                messages = listOf(userMessage)
            )
            currentSessions.add(0, currentSession)
            _activeSessionId.value = currentSession.id
        } else {
            val updatedMessages = currentSession.messages + userMessage
            val newTitle = if (currentSession.messages.isEmpty()) {
                if (text.length > 28) text.take(28) + "..." else if (text.isNotBlank()) text else "Agent Task"
            } else currentSession.title
            currentSession = currentSession.copy(
                messages = updatedMessages,
                title = newTitle,
                updatedAt = System.currentTimeMillis()
            )
            val index = currentSessions.indexOfFirst { it.id == currentSession.id }
            if (index >= 0) currentSessions[index] = currentSession
        }

        viewModelScope.launch {
            repository.saveSessions(currentSessions)
            repository.setActiveSessionId(currentSession.id)
        }

        // Run full AgentOrchestrator loop
        viewModelScope.launch {
            try {
                val recentHistory = currentSession.messages.takeLast(6).map {
                    HistoryItem(role = if (it.role == "user") "user" else "model", text = it.text)
                }

                val orchestrationResult = agentOrchestrator.orchestrate(
                    userPrompt = text.trim().ifEmpty { "Analyze attached input." },
                    history = recentHistory,
                    language = preferences.value.language.key,
                    userName = preferences.value.userName,
                    imageBase64 = attachedImageB64,
                    fileUri = attachedFile
                )

                _currentActiveTool.value = orchestrationResult.activeTool
                if (orchestrationResult.requiresConfirmation) {
                    _pendingConfirmationAction.value = orchestrationResult.executableAction
                }

                val assistantMessage = ChatMessage(
                    id = "msg_ai_${System.currentTimeMillis()}",
                    role = "assistant",
                    text = orchestrationResult.finalReply,
                    timestamp = System.currentTimeMillis(),
                    isFallback = orchestrationResult.isFallback,
                    sources = orchestrationResult.sources,
                    activeTool = orchestrationResult.activeTool,
                    pendingConfirmation = if (orchestrationResult.requiresConfirmation) orchestrationResult.confirmationPrompt else null
                )

                appendAssistantMessage(currentSession.id, assistantMessage)

                if (preferences.value.autoSpeak) {
                    speakText(orchestrationResult.finalReply, assistantMessage.id)
                } else {
                    _assistantState.value = AssistantState.IDLE
                }
            } catch (e: Exception) {
                _assistantState.value = AssistantState.IDLE
                _errorMessage.value = "Agent error: ${e.localizedMessage}"
            }
        }
    }

    private fun appendAssistantMessage(sessionId: String, message: ChatMessage) {
        val currentSessions = sessions.value.toMutableList()
        val index = currentSessions.indexOfFirst { it.id == sessionId }
        if (index >= 0) {
            val s = currentSessions[index]
            currentSessions[index] = s.copy(
                messages = s.messages + message,
                updatedAt = System.currentTimeMillis()
            )
            viewModelScope.launch {
                repository.saveSessions(currentSessions)
            }
        }
    }

    fun updatePreferences(newPrefs: UserPreferences) {
        viewModelScope.launch {
            repository.updatePreferences(newPrefs)
        }
    }

    fun addMemory(memory: String, category: String = "General") {
        viewModelScope.launch {
            repository.addMemory(memory, category)
        }
    }

    fun editMemory(id: String, newText: String, newCategory: String) {
        viewModelScope.launch {
            repository.editMemory(id, newText, newCategory)
        }
    }

    fun removeMemory(memory: String) {
        viewModelScope.launch {
            repository.removeMemory(memory)
        }
    }

    fun removeMemoryById(id: String) {
        viewModelScope.launch {
            repository.removeMemoryById(id)
        }
    }

    fun clearMemories() {
        viewModelScope.launch {
            repository.clearMemories()
        }
    }

    fun clearAllData() {
        stopSpeaking()
        stopListening()
        viewModelScope.launch {
            repository.clearAllData()
        }
    }

    fun clearError() {
        _errorMessage.value = null
    }

    fun confirmPendingAction() {
        _pendingConfirmationAction.value?.invoke()
        _pendingConfirmationAction.value = null
    }

    fun cancelPendingAction() {
        _pendingConfirmationAction.value = null
    }

    override fun onCleared() {
        super.onCleared()
        _voiceManager.destroy()
    }
}
