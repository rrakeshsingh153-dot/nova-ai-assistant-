package com.nova.ai.assistant.data

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "nova_preferences")

class PreferencesRepository(private val context: Context) {

    private val gson = Gson()

    companion object {
        val KEY_USER_NAME = stringPreferencesKey("user_name")
        val KEY_LANGUAGE = stringPreferencesKey("language")
        val KEY_PERSONALITY = stringPreferencesKey("personality")
        val KEY_AUTO_SPEAK = booleanPreferencesKey("auto_speak")
        val KEY_SPEECH_RATE = floatPreferencesKey("speech_rate")
        val KEY_SPEECH_PITCH = floatPreferencesKey("speech_pitch")
        val KEY_SOUND_EFFECTS = booleanPreferencesKey("sound_effects")
        val KEY_HAPTIC = booleanPreferencesKey("haptic")
        val KEY_MEMORIES = stringSetPreferencesKey("memories")
        val KEY_STRUCTURED_MEMORIES = stringPreferencesKey("structured_memories_json")
        val KEY_ORB_THEME = stringPreferencesKey("orb_theme")
        val KEY_CUSTOM_BACKEND_URL = stringPreferencesKey("custom_backend_url")
        val KEY_SESSIONS_JSON = stringPreferencesKey("sessions_json")
        val KEY_ACTIVE_SESSION_ID = stringPreferencesKey("active_session_id")
    }

    val userPreferencesFlow: Flow<UserPreferences> = context.dataStore.data.map { prefs ->
        val defaultMemories = setOf(
            "Language: Speaks Hindi, Hinglish and English fluently",
            "Role: Creator & developer exploring smart AI voice assistants",
            "Format Preference: Direct, structured and conversational"
        )

        val structuredJson = prefs[KEY_STRUCTURED_MEMORIES]
        val structuredList: List<PersonalMemory> = if (!structuredJson.isNullOrBlank()) {
            try {
                val type = object : TypeToken<List<PersonalMemory>>() {}.type
                gson.fromJson(structuredJson, type) ?: emptyList()
            } catch (_: Exception) {
                emptyList()
            }
        } else {
            // Seed from strings if empty
            defaultMemories.map {
                PersonalMemory(
                    text = it,
                    category = if (it.startsWith("Language")) "Language" else "General"
                )
            }
        }

        UserPreferences(
            userName = prefs[KEY_USER_NAME] ?: "Rakesh",
            language = LanguageMode.fromKey(prefs[KEY_LANGUAGE] ?: "auto"),
            personality = AssistantPersonality.fromKey(prefs[KEY_PERSONALITY] ?: "agent"),
            autoSpeak = prefs[KEY_AUTO_SPEAK] ?: true,
            speechRate = prefs[KEY_SPEECH_RATE] ?: 1.0f,
            speechPitch = prefs[KEY_SPEECH_PITCH] ?: 1.0f,
            soundEffects = prefs[KEY_SOUND_EFFECTS] ?: true,
            hapticFeedback = prefs[KEY_HAPTIC] ?: true,
            memories = structuredList.map { it.text },
            structuredMemories = structuredList,
            orbTheme = prefs[KEY_ORB_THEME] ?: "neon-emerald",
            customBackendUrl = prefs[KEY_CUSTOM_BACKEND_URL] ?: ""
        )
    }

    suspend fun updatePreferences(newPrefs: UserPreferences) {
        context.dataStore.edit { prefs ->
            prefs[KEY_USER_NAME] = newPrefs.userName
            prefs[KEY_LANGUAGE] = newPrefs.language.key
            prefs[KEY_PERSONALITY] = newPrefs.personality.key
            prefs[KEY_AUTO_SPEAK] = newPrefs.autoSpeak
            prefs[KEY_SPEECH_RATE] = newPrefs.speechRate
            prefs[KEY_SPEECH_PITCH] = newPrefs.speechPitch
            prefs[KEY_SOUND_EFFECTS] = newPrefs.soundEffects
            prefs[KEY_HAPTIC] = newPrefs.hapticFeedback
            prefs[KEY_MEMORIES] = newPrefs.memories.toSet()
            prefs[KEY_STRUCTURED_MEMORIES] = gson.toJson(newPrefs.structuredMemories)
            prefs[KEY_ORB_THEME] = newPrefs.orbTheme
            prefs[KEY_CUSTOM_BACKEND_URL] = newPrefs.customBackendUrl
        }
    }

    suspend fun updateUserName(name: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_USER_NAME] = name
        }
    }

    suspend fun addMemory(memoryText: String, category: String = "General") {
        if (memoryText.isBlank()) return
        context.dataStore.edit { prefs ->
            val structuredJson = prefs[KEY_STRUCTURED_MEMORIES]
            val type = object : TypeToken<List<PersonalMemory>>() {}.type
            val currentList: MutableList<PersonalMemory> = try {
                if (!structuredJson.isNullOrBlank()) gson.fromJson(structuredJson, type) ?: mutableListOf()
                else mutableListOf()
            } catch (_: Exception) {
                mutableListOf()
            }

            // Avoid duplicate text
            if (currentList.none { it.text.equals(memoryText.trim(), ignoreCase = true) }) {
                currentList.add(0, PersonalMemory(text = memoryText.trim(), category = category))
                prefs[KEY_STRUCTURED_MEMORIES] = gson.toJson(currentList)
                prefs[KEY_MEMORIES] = currentList.map { it.text }.toSet()
            }
        }
    }

    suspend fun editMemory(id: String, newText: String, newCategory: String) {
        context.dataStore.edit { prefs ->
            val structuredJson = prefs[KEY_STRUCTURED_MEMORIES]
            val type = object : TypeToken<List<PersonalMemory>>() {}.type
            val currentList: MutableList<PersonalMemory> = try {
                if (!structuredJson.isNullOrBlank()) gson.fromJson(structuredJson, type) ?: mutableListOf()
                else mutableListOf()
            } catch (_: Exception) {
                mutableListOf()
            }

            val index = currentList.indexOfFirst { it.id == id }
            if (index >= 0) {
                currentList[index] = currentList[index].copy(
                    text = newText.trim(),
                    category = newCategory.trim(),
                    timestamp = System.currentTimeMillis()
                )
                prefs[KEY_STRUCTURED_MEMORIES] = gson.toJson(currentList)
                prefs[KEY_MEMORIES] = currentList.map { it.text }.toSet()
            }
        }
    }

    suspend fun removeMemoryById(id: String) {
        context.dataStore.edit { prefs ->
            val structuredJson = prefs[KEY_STRUCTURED_MEMORIES]
            val type = object : TypeToken<List<PersonalMemory>>() {}.type
            val currentList: MutableList<PersonalMemory> = try {
                if (!structuredJson.isNullOrBlank()) gson.fromJson(structuredJson, type) ?: mutableListOf()
                else mutableListOf()
            } catch (_: Exception) {
                mutableListOf()
            }

            val updated = currentList.filter { it.id != id }
            prefs[KEY_STRUCTURED_MEMORIES] = gson.toJson(updated)
            prefs[KEY_MEMORIES] = updated.map { it.text }.toSet()
        }
    }

    suspend fun removeMemory(memory: String) {
        context.dataStore.edit { prefs ->
            val structuredJson = prefs[KEY_STRUCTURED_MEMORIES]
            val type = object : TypeToken<List<PersonalMemory>>() {}.type
            val currentList: MutableList<PersonalMemory> = try {
                if (!structuredJson.isNullOrBlank()) gson.fromJson(structuredJson, type) ?: mutableListOf()
                else mutableListOf()
            } catch (_: Exception) {
                mutableListOf()
            }

            val updated = currentList.filter { it.text != memory }
            prefs[KEY_STRUCTURED_MEMORIES] = gson.toJson(updated)
            prefs[KEY_MEMORIES] = updated.map { it.text }.toSet()
        }
    }

    suspend fun clearMemories() {
        context.dataStore.edit { prefs ->
            prefs[KEY_MEMORIES] = emptySet()
            prefs[KEY_STRUCTURED_MEMORIES] = gson.toJson(emptyList<PersonalMemory>())
        }
    }

    // Chat sessions persistence
    val sessionsFlow: Flow<List<ConversationSession>> = context.dataStore.data.map { prefs ->
        val json = prefs[KEY_SESSIONS_JSON]
        if (json.isNullOrBlank()) {
            emptyList()
        } else {
            try {
                val type = object : TypeToken<List<ConversationSession>>() {}.type
                gson.fromJson(json, type) ?: emptyList()
            } catch (_: Exception) {
                emptyList()
            }
        }
    }

    val activeSessionIdFlow: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_ACTIVE_SESSION_ID]
    }

    suspend fun saveSessions(sessions: List<ConversationSession>) {
        context.dataStore.edit { prefs ->
            prefs[KEY_SESSIONS_JSON] = gson.toJson(sessions)
        }
    }

    suspend fun setActiveSessionId(sessionId: String?) {
        context.dataStore.edit { prefs ->
            if (sessionId != null) {
                prefs[KEY_ACTIVE_SESSION_ID] = sessionId
            } else {
                prefs.remove(KEY_ACTIVE_SESSION_ID)
            }
        }
    }

    suspend fun clearAllData() {
        context.dataStore.edit { prefs ->
            prefs.clear()
        }
    }
}
