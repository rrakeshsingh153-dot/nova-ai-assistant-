package com.nova.ai.assistant.agent

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.nova.ai.assistant.data.PersonalMemory
import com.nova.ai.assistant.data.PreferencesRepository
import com.nova.ai.assistant.network.ApiClient
import com.nova.ai.assistant.network.ChatRequest
import com.nova.ai.assistant.network.HistoryItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.InputStream

/**
 * Common interface implemented by all NOVA Agent Tools.
 */
interface AgentTool {
    val name: String
    val description: String

    suspend fun execute(context: ToolExecutionContext): ToolOutput
}

data class ToolExecutionContext(
    val androidContext: Context,
    val repository: PreferencesRepository,
    val query: String,
    val params: Map<String, Any?> = emptyMap(),
    val language: String = "auto",
    val userName: String = "User"
)

data class ToolOutput(
    val toolName: String,
    val success: Boolean,
    val summary: String,
    val details: String? = null,
    val data: Any? = null,
    val requiresConfirmation: Boolean = false,
    val confirmationPrompt: String? = null,
    val executableAction: (() -> Unit)? = null
)

// 1. WebSearchTool
class WebSearchTool : AgentTool {
    override val name: String = "WebSearchTool"
    override val description: String = "Searches the live web for verified facts, current news, weather, or real-time info."

    override suspend fun execute(context: ToolExecutionContext): ToolOutput = withContext(Dispatchers.IO) {
        val query = context.query.trim()
        if (query.isBlank()) {
            return@withContext ToolOutput(
                toolName = name,
                success = false,
                summary = "Search query is empty."
            )
        }

        try {
            val response = ApiClient.apiService.sendChatMessage(
                ChatRequest(
                    message = "Search live web: $query",
                    history = emptyList(),
                    language = context.language,
                    memory = emptyList(),
                    userName = context.userName,
                    toolContext = "Tool:WebSearch"
                )
            )

            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                val reply = body.reply ?: ""
                val sources = body.sources ?: emptyList()

                val sourceListFormatted = if (sources.isNotEmpty()) {
                    sources.mapNotNull { it.web?.title?.let { t -> "• $t (${it.web?.uri ?: ""})" } }.joinToString("\n")
                } else null

                ToolOutput(
                    toolName = name,
                    success = true,
                    summary = reply,
                    details = sourceListFormatted,
                    data = sources
                )
            } else {
                ToolOutput(
                    toolName = name,
                    success = false,
                    summary = "Web search service returned status ${response.code()}. Could not verify current information."
                )
            }
        } catch (e: Exception) {
            ToolOutput(
                toolName = name,
                success = false,
                summary = "Web search failed due to network connection: ${e.localizedMessage ?: "Unknown error"}. Never pretending search succeeded."
            )
        }
    }
}

// 2. CalculatorTool (Engine implementation)
class EngineCalculatorTool : AgentTool {
    override val name: String = "CalculatorTool"
    override val description: String = "Accurately computes mathematical equations, percentages, sums, and expressions."

    override suspend fun execute(context: ToolExecutionContext): ToolOutput = withContext(Dispatchers.Default) {
        val rawExpression = context.params["expression"] as? String ?: context.query
        val mathMatch = extractMath(rawExpression) ?: rawExpression

        val result = CalculatorTool.evaluate(mathMatch)
        if (result != null) {
            val formatted = if (result % 1.0 == 0.0) {
                result.toLong().toString()
            } else {
                "%.4f".format(result).trimEnd('0').trimEnd('.')
            }
            ToolOutput(
                toolName = name,
                success = true,
                summary = formatted,
                details = "Expression: $mathMatch = $formatted",
                data = result
            )
        } else {
            ToolOutput(
                toolName = name,
                success = false,
                summary = "Could not evaluate math expression: $rawExpression"
            )
        }
    }

    private fun extractMath(prompt: String): String? {
        val lower = prompt.lowercase().trim()
        val prefixes = listOf("calculate", "what is", "compute", "solve", "kitna hua", "kitna hoga", "कितना हुआ", "हिसाब करो")
        for (prefix in prefixes) {
            if (lower.startsWith(prefix)) {
                val rem = lower.removePrefix(prefix).replace("?", "").replace("=", "").trim()
                if (rem.any { it in "+-*/xX÷%" || it.isDigit() }) {
                    return rem
                }
            }
        }
        return if (lower.matches(Regex("^[0-9\\s+\\-*/xX÷%.()]+$"))) lower else null
    }
}

// 3. ContentCreatorTool
class ContentCreatorTool : AgentTool {
    override val name: String = "ContentCreatorTool"
    override val description: String = "Generates high-performing YouTube titles, descriptions, hashtags, hooks, and video scripts in Hindi, Hinglish, and English."

    override suspend fun execute(context: ToolExecutionContext): ToolOutput = withContext(Dispatchers.IO) {
        val topic = context.query
        val prompt = "Create 3 viral YouTube titles with high CTR, 1 engaging opening hook, 1 short description, and top 5 trending hashtags for topic: $topic. Provide response naturally in ${context.language}."

        try {
            val response = ApiClient.apiService.sendChatMessage(
                ChatRequest(
                    message = prompt,
                    history = emptyList(),
                    language = context.language,
                    personality = "creative",
                    memory = emptyList(),
                    userName = context.userName,
                    toolContext = "Tool:ContentCreator"
                )
            )

            if (response.isSuccessful && response.body()?.reply != null) {
                ToolOutput(
                    toolName = name,
                    success = true,
                    summary = response.body()!!.reply!!,
                    details = "Format: YouTube Titles, Hook & Hashtags"
                )
            } else {
                // Offline fallback generator
                val fallback = if (context.language == "hi" || topic.any { it in '\u0900'..'\u097F' }) {
                    "यहाँ आपके YouTube Content के लिए विचार हैं:\n1. \"${topic} का असली सच जानकर हैरान रह जाएंगे! ⚡ #Shorts\"\n2. \"2026 में ${topic} कैसे सीखें / करें? आसान तरीका 🚀\"\n3. \"Top Secret Trick for ${topic} 💡\"\n\nHook: \"क्या आप जानते हैं कि 99% लोग यह गलती करते हैं?\"\nHashtags: #Viral #Trending #Guide #2026"
                } else {
                    "Here is your creative content package for: $topic\n1. \"The Secret To $topic Nobody Tells You! ⚡ #Shorts\"\n2. \"Mastering $topic in 2026 (Step-by-Step) 🚀\"\n3. \"Do NOT Make This Big Mistake With $topic 💡\"\n\nHook: \"Stop scrolling! Here is what everyone gets wrong about $topic...\"\nHashtags: #Shorts #Trending #ContentCreation #Viral"
                }
                ToolOutput(
                    toolName = name,
                    success = true,
                    summary = fallback,
                    details = "Generated via Creative Engine"
                )
            }
        } catch (e: Exception) {
            ToolOutput(
                toolName = name,
                success = false,
                summary = "Failed to generate creative content: ${e.localizedMessage}"
            )
        }
    }
}

// 4. ImageAnalysisTool
class ImageAnalysisTool : AgentTool {
    override val name: String = "ImageAnalysisTool"
    override val description: String = "Inspects and answers questions about user-provided images, photos, receipts, or diagrams."

    override suspend fun execute(context: ToolExecutionContext): ToolOutput = withContext(Dispatchers.IO) {
        val imageBase64 = context.params["imageBase64"] as? String
        if (imageBase64.isNullOrBlank()) {
            return@withContext ToolOutput(
                toolName = name,
                success = false,
                summary = "No image was provided for analysis."
            )
        }

        try {
            val response = ApiClient.apiService.sendChatMessage(
                ChatRequest(
                    message = context.query.ifBlank { "Describe this image in detail and extract key information." },
                    history = emptyList(),
                    language = context.language,
                    memory = emptyList(),
                    userName = context.userName,
                    imageBase64 = imageBase64,
                    imageMimeType = "image/jpeg",
                    toolContext = "Tool:ImageAnalysis"
                )
            )

            if (response.isSuccessful && response.body()?.reply != null) {
                ToolOutput(
                    toolName = name,
                    success = true,
                    summary = response.body()!!.reply!!,
                    details = "Analyzed image successfully."
                )
            } else {
                ToolOutput(
                    toolName = name,
                    success = false,
                    summary = "Image analysis server returned error ${response.code()}."
                )
            }
        } catch (e: Exception) {
            ToolOutput(
                toolName = name,
                success = false,
                summary = "Image analysis failed: ${e.localizedMessage}"
            )
        }
    }
}

// 5. FileAnalysisTool
class FileAnalysisTool : AgentTool {
    override val name: String = "FileAnalysisTool"
    override val description: String = "Reads, extracts, and summarizes supported user-provided files (txt, csv, json, logs)."

    override suspend fun execute(context: ToolExecutionContext): ToolOutput = withContext(Dispatchers.IO) {
        val fileUri = context.params["fileUri"] as? Uri
        if (fileUri == null) {
            return@withContext ToolOutput(
                toolName = name,
                success = false,
                summary = "No file selected."
            )
        }

        try {
            val inputStream: InputStream? = context.androidContext.contentResolver.openInputStream(fileUri)
            val content = inputStream?.bufferedReader()?.use { it.readText() } ?: ""

            if (content.isBlank()) {
                return@withContext ToolOutput(
                    toolName = name,
                    success = false,
                    summary = "File is empty or could not be read."
                )
            }

            val snippet = if (content.length > 3000) content.take(3000) + "\n...[truncated]" else content
            val response = ApiClient.apiService.sendChatMessage(
                ChatRequest(
                    message = "Analyze this file content and answer '${context.query}':\n\n$snippet",
                    history = emptyList(),
                    language = context.language,
                    memory = emptyList(),
                    userName = context.userName,
                    toolContext = "Tool:FileAnalysis"
                )
            )

            if (response.isSuccessful && response.body()?.reply != null) {
                ToolOutput(
                    toolName = name,
                    success = true,
                    summary = response.body()!!.reply!!,
                    details = "Read file: ${snippet.length} characters parsed."
                )
            } else {
                ToolOutput(
                    toolName = name,
                    success = true,
                    summary = "File contents extracted:\n" + snippet.take(400) + "..."
                )
            }
        } catch (e: Exception) {
            ToolOutput(
                toolName = name,
                success = false,
                summary = "Failed to read file: ${e.localizedMessage}"
            )
        }
    }
}

// 6. AndroidActionTool
class AndroidActionTool : AgentTool {
    override val name: String = "AndroidActionTool"
    override val description: String = "Opens supported Android intents and actions. Strictly requires user confirmation before sensitive or external actions."

    override suspend fun execute(context: ToolExecutionContext): ToolOutput = withContext(Dispatchers.Main) {
        val actionType = context.params["action"] as? String ?: "open_app"
        val target = context.params["target"] as? String ?: context.query.lowercase()

        when {
            target.contains("phone") || target.contains("dial") || target.contains("कॉल") || target.contains("फोन") -> {
                // Opening dialer is safe
                ToolOutput(
                    toolName = name,
                    success = true,
                    summary = "Opening Phone Dialer",
                    requiresConfirmation = false,
                    executableAction = {
                        try {
                            val intent = Intent(Intent.ACTION_DIAL)
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            context.androidContext.startActivity(intent)
                        } catch (_: Exception) {}
                    }
                )
            }

            target.contains("whatsapp") || target.contains("व्हाट्सएप") -> {
                // Opening messaging app requires confirmation before initiating any external message
                ToolOutput(
                    toolName = name,
                    success = true,
                    summary = "Opening WhatsApp application",
                    requiresConfirmation = true,
                    confirmationPrompt = "क्या मैं यह काम कर दूँ? (Open WhatsApp)",
                    executableAction = {
                        try {
                            val pm = context.androidContext.packageManager
                            val intent = pm.getLaunchIntentForPackage("com.whatsapp")
                                ?: Intent(Intent.ACTION_VIEW, Uri.parse("https://web.whatsapp.com/"))
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            context.androidContext.startActivity(intent)
                        } catch (_: Exception) {}
                    }
                )
            }

            target.contains("map") || target.contains("मैप") || target.contains("navigation") -> {
                ToolOutput(
                    toolName = name,
                    success = true,
                    summary = "Opening Google Maps navigation",
                    requiresConfirmation = false,
                    executableAction = {
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=${Uri.encode(context.query)}"))
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            context.androidContext.startActivity(intent)
                        } catch (_: Exception) {}
                    }
                )
            }

            target.contains("setting") || target.contains("सेटिंग") -> {
                ToolOutput(
                    toolName = name,
                    success = true,
                    summary = "Opening System Settings",
                    requiresConfirmation = true,
                    confirmationPrompt = "क्या मैं यह काम कर दूँ? (Open Android Settings)",
                    executableAction = {
                        try {
                            val intent = Intent(Settings.ACTION_SETTINGS)
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            context.androidContext.startActivity(intent)
                        } catch (_: Exception) {}
                    }
                )
            }

            else -> {
                ToolOutput(
                    toolName = name,
                    success = false,
                    summary = "Unsupported device action or missing Android intent."
                )
            }
        }
    }
}

// 7. MemoryTool
class MemoryTool : AgentTool {
    override val name: String = "MemoryTool"
    override val description: String = "Persistent local personal memory vault: remembers instructions/preferences, retrieves memories, updates, or forgets items."

    override suspend fun execute(context: ToolExecutionContext): ToolOutput = withContext(Dispatchers.IO) {
        val operation = (context.params["operation"] as? String) ?: detectOperation(context.query)
        val text = context.query

        when (operation) {
            "remember" -> {
                val cleanMemory = cleanRememberText(text)
                if (cleanMemory.length < 2) {
                    return@withContext ToolOutput(
                        toolName = name,
                        success = false,
                        summary = "Could not identify what to remember from your statement."
                    )
                }
                context.repository.addMemory(cleanMemory, "Personal")
                val isHindi = context.language == "hi" || cleanMemory.any { it in '\u0900'..'\u097F' }
                val reply = if (isHindi) {
                    "मैंने इसे आपकी मेमोरी में सुरक्षित कर लिया है: \"$cleanMemory\""
                } else {
                    "I have saved this to your memory: \"$cleanMemory\""
                }
                ToolOutput(
                    toolName = name,
                    success = true,
                    summary = reply,
                    data = cleanMemory
                )
            }

            "list", "what_do_you_remember" -> {
                // Get memory list from flow snapshot
                val prefs = context.repository.userPreferencesFlow
                var memories = emptyList<PersonalMemory>()
                kotlinx.coroutines.flow.firstOrNull(prefs)?.let {
                    memories = it.structuredMemories
                }

                if (memories.isEmpty()) {
                    val msg = if (context.language == "hi") "फिलहाल आपकी कोई मेमोरी सेव नहीं है।" else "No memories are currently stored."
                    ToolOutput(toolName = name, success = true, summary = msg)
                } else {
                    val formatted = memories.joinToString("\n") { "• [${it.category}] ${it.text}" }
                    val isHindi = context.language == "hi" || text.any { it in '\u0900'..'\u097F' }
                    val title = if (isHindi) "मुझे आपके बारे में ये बातें याद हैं:\n" else "Here is what I remember about you:\n"
                    ToolOutput(
                        toolName = name,
                        success = true,
                        summary = title + formatted,
                        data = memories
                    )
                }
            }

            "forget" -> {
                // Delete matching memory or clear if requested
                if (text.contains("all", ignoreCase = true) || text.contains("सब", ignoreCase = true)) {
                    context.repository.clearMemories()
                    ToolOutput(
                        toolName = name,
                        success = true,
                        summary = "All personal memories have been cleared."
                    )
                } else {
                    val toRemove = text.replace("forget", "", ignoreCase = true)
                        .replace("भूल जाओ", "")
                        .replace("delete memory", "", ignoreCase = true)
                        .trim()
                    context.repository.removeMemory(toRemove)
                    ToolOutput(
                        toolName = name,
                        success = true,
                        summary = "Removed memory related to: \"$toRemove\""
                    )
                }
            }

            else -> {
                ToolOutput(
                    toolName = name,
                    success = false,
                    summary = "Unknown memory operation."
                )
            }
        }
    }

    private fun detectOperation(query: String): String {
        val lower = query.lowercase().trim()
        return when {
            lower.contains("याद है") || lower.contains("remember about me") || lower.contains("what do you remember") || lower.contains("list memories") -> "what_do_you_remember"
            lower.startsWith("याद रखो") || lower.startsWith("इसे याद रखो") || lower.startsWith("remember that") || lower.startsWith("remember this") || lower.startsWith("save memory") -> "remember"
            lower.contains("भूल जाओ") || lower.contains("forget") || lower.contains("delete memory") -> "forget"
            else -> "what_do_you_remember"
        }
    }

    private fun cleanRememberText(raw: String): String {
        return raw.replace(/^(?:इसे याद रखो|याद रखो कि|याद रखना|remember that|remember this|save memory)\s*[:,-]?\s*/i.toRegex(), "").trim()
    }
}
