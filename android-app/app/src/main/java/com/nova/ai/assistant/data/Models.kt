package com.nova.ai.assistant.data

import com.google.gson.annotations.SerializedName

enum class LanguageMode(val key: String, val displayName: String) {
    AUTO("auto", "Auto Detect (Hindi / Hinglish / English)"),
    HINDI("hi", "हिन्दी (Hindi)"),
    HINGLISH("hinglish", "Hinglish (Natural Conversational)"),
    ENGLISH("en", "English");

    companion object {
        fun fromKey(key: String): LanguageMode =
            values().find { it.key == key } ?: AUTO
    }
}

enum class AssistantPersonality(val key: String, val displayName: String, val description: String) {
    SMART_AGENT("agent", "Personal AI Agent", "Proactive, multi-tool capable, helpful & context-aware"),
    CREATIVE("creative", "Creative Strategist", "Specialized in YouTube titles, scripts, content ideas & copy"),
    COMPANION("companion", "Friendly Companion", "Warm, conversational, empathetic in Hindi & English"),
    CONCISE("concise", "Concise & Fast", "Short, ultra-direct answers optimized for instant listening");

    companion object {
        fun fromKey(key: String): AssistantPersonality =
            values().find { it.key == key } ?: SMART_AGENT
    }
}

enum class AssistantState {
    IDLE,
    LISTENING,
    THINKING,
    SPEAKING
}

data class GroundingSource(
    @SerializedName("web") val web: WebSource? = null
)

data class WebSource(
    @SerializedName("uri") val uri: String? = null,
    @SerializedName("title") val title: String? = null
)

data class YouTubeData(
    @SerializedName("videoId") val videoId: String? = null,
    @SerializedName("query") val query: String = "",
    @SerializedName("title") val title: String = ""
)

data class AppLauncherData(
    @SerializedName("appId") val appId: String = "",
    @SerializedName("appName") val appName: String = "",
    @SerializedName("actionUrl") val actionUrl: String? = null
)

data class PersonalMemory(
    val id: String = "mem_${System.currentTimeMillis()}_${(1000..9999).random()}",
    val text: String,
    val category: String = "General", // "Preference", "Project", "Personal", "Instruction"
    val timestamp: Long = System.currentTimeMillis()
)

data class ChatMessage(
    val id: String = "msg_${System.currentTimeMillis()}",
    val role: String, // "user" or "assistant"
    val text: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isVoiceInput: Boolean = false,
    val isFallback: Boolean = false,
    val sources: List<GroundingSource>? = null,
    val youtube: YouTubeData? = null,
    val appLauncher: AppLauncherData? = null,
    val activeTool: String? = null,
    val imageUrl: String? = null, // base64 or preview uri for analyzed images
    val pendingConfirmation: String? = null
)

data class ConversationSession(
    val id: String = "sess_${System.currentTimeMillis()}",
    val title: String = "New Conversation",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val messages: List<ChatMessage> = emptyList()
)

data class UserPreferences(
    val userName: String = "Rakesh",
    val language: LanguageMode = LanguageMode.AUTO,
    val personality: AssistantPersonality = AssistantPersonality.SMART_AGENT,
    val autoSpeak: Boolean = true,
    val speechRate: Float = 1.0f,
    val speechPitch: Float = 1.0f,
    val soundEffects: Boolean = true,
    val hapticFeedback: Boolean = true,
    val memories: List<String> = listOf(
        "Language: Speaks Hindi, Hinglish and English fluently",
        "Role: Creator & developer exploring smart AI voice assistants",
        "Format Preference: Direct, structured and conversational"
    ),
    val structuredMemories: List<PersonalMemory> = emptyList(),
    val orbTheme: String = "neon-emerald",
    val customBackendUrl: String = ""
)
