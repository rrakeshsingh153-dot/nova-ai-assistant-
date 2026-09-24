package com.nova.ai.assistant.agent

import android.content.Context
import com.nova.ai.assistant.data.PreferencesRepository
import com.nova.ai.assistant.network.ApiClient
import com.nova.ai.assistant.network.ChatRequest
import com.nova.ai.assistant.network.HistoryItem
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull

enum class AgentExecutionState {
    IDLE,
    UNDERSTANDING,
    SEARCHING,
    THINKING,
    EXECUTING_TOOL,
    WAITING_CONFIRMATION,
    COMPLETED,
    ERROR
}

data class AgentTaskStatus(
    val taskId: String = "task_${System.currentTimeMillis()}",
    val taskTitle: String = "Processing request",
    val activeToolName: String? = null,
    val state: AgentExecutionState = AgentExecutionState.IDLE,
    val progress: Float = 0.0f,
    val statusMessage: String = "Ready",
    val confirmationPrompt: String? = null,
    val resultSummary: String? = null,
    val pendingAction: (() -> Unit)? = null
)

/**
 * AgentOrchestrator:
 * USER REQUEST
 * → understand intent
 * → check conversation context
 * → check personal memory
 * → decide whether a tool is required
 * → execute the appropriate tool
 * → inspect the result
 * → generate a natural response
 * → save useful non-sensitive context to memory
 */
class AgentOrchestrator(
    private val context: Context,
    private val repository: PreferencesRepository
) {
    // Registry of tools
    val webSearchTool = WebSearchTool()
    val calculatorTool = EngineCalculatorTool()
    val contentCreatorTool = ContentCreatorTool()
    val imageAnalysisTool = ImageAnalysisTool()
    val fileAnalysisTool = FileAnalysisTool()
    val androidActionTool = AndroidActionTool()
    val memoryTool = MemoryTool()

    private val _taskStatus = MutableStateFlow(AgentTaskStatus())
    val taskStatus: StateFlow<AgentTaskStatus> = _taskStatus.asStateFlow()

    private var activeJob: Job? = null

    fun cancelCurrentTask() {
        activeJob?.cancel()
        activeJob = null
        _taskStatus.value = _taskStatus.value.copy(
            state = AgentExecutionState.IDLE,
            progress = 0f,
            statusMessage = "Task cancelled by user",
            pendingAction = null
        )
    }

    suspend fun orchestrate(
        userPrompt: String,
        history: List<HistoryItem> = emptyList(),
        language: String = "auto",
        userName: String = "User",
        imageBase64: String? = null,
        fileUri: android.net.Uri? = null
    ): OrchestrationResult = withContext(Dispatchers.Default) {
        val taskId = "task_${System.currentTimeMillis()}"
        activeJob = coroutineContext[Job]

        // 1. Understand Intent & check memory
        _taskStatus.value = AgentTaskStatus(
            taskId = taskId,
            taskTitle = userPrompt.take(30),
            state = AgentExecutionState.UNDERSTANDING,
            progress = 0.15f,
            statusMessage = "Understanding intent and context..."
        )

        // Retrieve local personal memories
        val preferences = repository.userPreferencesFlow.firstOrNull()
        val memories = preferences?.structuredMemories ?: emptyList()
        val memoryStrings = memories.map { "[${it.category}] ${it.text}" }

        // 2. Decide tool requirement
        val toolContext = ToolExecutionContext(
            androidContext = context,
            repository = repository,
            query = userPrompt,
            params = buildMap {
                if (imageBase64 != null) put("imageBase64", imageBase64)
                if (fileUri != null) put("fileUri", fileUri)
            },
            language = language,
            userName = userName
        )

        val selectedTool = selectTool(userPrompt, imageBase64, fileUri)

        // 3. Execute tool if decided
        var toolOutput: ToolOutput? = null
        if (selectedTool != null) {
            val toolStatusMsg = when (selectedTool) {
                is WebSearchTool -> "Searching live web..."
                is EngineCalculatorTool -> "Calculating expression..."
                is ContentCreatorTool -> "Creating YouTube content package..."
                is ImageAnalysisTool -> "Analyzing image..."
                is FileAnalysisTool -> "Reading and parsing file..."
                is AndroidActionTool -> "Preparing device action..."
                is MemoryTool -> "Accessing personal memory vault..."
                else -> "Executing tool: ${selectedTool.name}"
            }

            val state = if (selectedTool is WebSearchTool) AgentExecutionState.SEARCHING else AgentExecutionState.EXECUTING_TOOL

            _taskStatus.value = _taskStatus.value.copy(
                activeToolName = selectedTool.name,
                state = state,
                progress = 0.45f,
                statusMessage = toolStatusMsg
            )

            // Safe loop iteration with timeout (15s per tool execution)
            try {
                withTimeout(15000L) {
                    toolOutput = selectedTool.execute(toolContext)
                }
            } catch (te: TimeoutCancellationException) {
                toolOutput = ToolOutput(
                    toolName = selectedTool.name,
                    success = false,
                    summary = "Tool execution timed out. Falling back to conversational response."
                )
            } catch (e: Exception) {
                toolOutput = ToolOutput(
                    toolName = selectedTool.name,
                    success = false,
                    summary = "Tool execution error: ${e.localizedMessage}"
                )
            }

            // Check if confirmation is required
            if (toolOutput?.requiresConfirmation == true) {
                _taskStatus.value = _taskStatus.value.copy(
                    state = AgentExecutionState.WAITING_CONFIRMATION,
                    progress = 0.6f,
                    statusMessage = "Waiting for your confirmation",
                    confirmationPrompt = toolOutput?.confirmationPrompt ?: "क्या मैं यह काम कर दूँ?",
                    pendingAction = toolOutput?.executableAction
                )

                return@withContext OrchestrationResult(
                    finalReply = toolOutput?.confirmationPrompt ?: "क्या मैं यह काम कर दूँ?",
                    activeTool = selectedTool.name,
                    requiresConfirmation = true,
                    confirmationPrompt = toolOutput?.confirmationPrompt ?: "क्या मैं यह काम कर दूँ?",
                    executableAction = toolOutput?.executableAction
                )
            }

            // If action is immediately executable and safe
            toolOutput?.executableAction?.invoke()

            // If it was a direct Memory or Math tool and succeeded, return direct response
            if ((selectedTool is MemoryTool || selectedTool is EngineCalculatorTool) && toolOutput?.success == true) {
                _taskStatus.value = _taskStatus.value.copy(
                    state = AgentExecutionState.COMPLETED,
                    progress = 1.0f,
                    statusMessage = "Completed",
                    resultSummary = toolOutput?.summary
                )
                return@withContext OrchestrationResult(
                    finalReply = toolOutput!!.summary,
                    activeTool = selectedTool.name,
                    toolOutput = toolOutput
                )
            }
        }

        // 4. Generate Natural Grounded Response
        _taskStatus.value = _taskStatus.value.copy(
            state = AgentExecutionState.THINKING,
            progress = 0.75f,
            statusMessage = "Generating natural response..."
        )

        val promptForModel = if (toolOutput != null && toolOutput?.success == true) {
            "User asked: '$userPrompt'. Tool [${toolOutput?.toolName}] returned:\n${toolOutput?.summary}\nRespond naturally to user."
        } else {
            userPrompt
        }

        try {
            val response = withTimeout(20000L) {
                ApiClient.apiService.sendChatMessage(
                    ChatRequest(
                        message = promptForModel,
                        history = history.takeLast(6),
                        language = language,
                        personality = preferences?.personality?.key ?: "agent",
                        memory = memoryStrings,
                        userName = userName,
                        imageBase64 = imageBase64,
                        imageMimeType = if (imageBase64 != null) "image/jpeg" else null,
                        toolContext = selectedTool?.name
                    )
                )
            }

            val reply = if (response.isSuccessful && response.body()?.reply != null) {
                response.body()!!.reply!!
            } else {
                toolOutput?.summary ?: "मुझे इस बारे में निश्चित जानकारी नहीं मिली। कृपया दोबारा पूछें।"
            }

            // 5. Save useful non-sensitive context to memory automatically if intent detected
            if (response.body()?.memoryItem != null) {
                repository.addMemory(response.body()!!.memoryItem!!, response.body()!!.memoryCategory ?: "Personal")
            }

            _taskStatus.value = _taskStatus.value.copy(
                state = AgentExecutionState.COMPLETED,
                progress = 1.0f,
                statusMessage = "Task completed successfully",
                resultSummary = reply.take(80) + if (reply.length > 80) "..." else ""
            )

            OrchestrationResult(
                finalReply = reply,
                activeTool = selectedTool?.name ?: response.body()?.activeTool,
                sources = response.body()?.sources,
                toolOutput = toolOutput
            )
        } catch (e: Exception) {
            val fallbackReply = toolOutput?.summary ?: "नेटवर्क या सर्वर कनेक्शन में समस्या आई है। कृपया पुनः प्रयास करें।"
            _taskStatus.value = _taskStatus.value.copy(
                state = AgentExecutionState.COMPLETED,
                progress = 1.0f,
                statusMessage = "Completed with offline fallback",
                resultSummary = fallbackReply
            )
            OrchestrationResult(
                finalReply = fallbackReply,
                activeTool = selectedTool?.name ?: "Agent Engine",
                isFallback = true
            )
        }
    }

    private fun selectTool(query: String, imageBase64: String?, fileUri: android.net.Uri?): AgentTool? {
        if (!imageBase64.isNullOrBlank()) return imageAnalysisTool
        if (fileUri != null) return fileAnalysisTool

        val lower = query.lowercase().trim()

        // Memory Tool
        if (lower.contains("याद रखो") || lower.contains("remember") || lower.contains("याद है") || lower.contains("forget") || lower.contains("भूल जाओ")) {
            return memoryTool
        }

        // Calculator Tool
        if (lower.startsWith("calculate") || lower.startsWith("what is") || lower.startsWith("compute") || lower.startsWith("solve") || lower.contains("हिसाब करो") || lower.contains("कितना हुआ")) {
            return calculatorTool
        }
        if (lower.matches(Regex("^[0-9\\s+\\-*/xX÷%.()]+$")) && lower.any { it in "+-*/xX÷%" }) {
            return calculatorTool
        }

        // Content Creator Tool
        if (lower.contains("shorts") || lower.contains("title") || lower.contains("टाइटल") || lower.contains("description") || lower.contains("hashtag") || lower.contains("ideas") || lower.contains("script")) {
            return contentCreatorTool
        }

        // Android Action Tool
        if (lower.contains("खोलो") || lower.contains("open") || lower.contains("call") || lower.contains("फोन") || lower.contains("whatsapp") || lower.contains("whatsapp kholo") || lower.contains("setting")) {
            return androidActionTool
        }

        // Web Search Tool (current events, weather, news, today, latest)
        if (lower.contains("search") || lower.contains("latest") || lower.contains("news") || lower.contains("weather") || lower.contains("आज की") || lower.contains("खोजो") || lower.contains("ताज़ा")) {
            return webSearchTool
        }

        return null
    }
}

data class OrchestrationResult(
    val finalReply: String,
    val activeTool: String? = null,
    val sources: List<com.nova.ai.assistant.data.GroundingSource>? = null,
    val toolOutput: ToolOutput? = null,
    val isFallback: Boolean = false,
    val requiresConfirmation: Boolean = false,
    val confirmationPrompt: String? = null,
    val executableAction: (() -> Unit)? = null
)
