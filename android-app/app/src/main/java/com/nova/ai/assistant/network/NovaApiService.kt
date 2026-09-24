package com.nova.ai.assistant.network

import com.google.gson.annotations.SerializedName
import com.nova.ai.assistant.data.AppLauncherData
import com.nova.ai.assistant.data.GroundingSource
import com.nova.ai.assistant.data.YouTubeData
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

data class HistoryItem(
    @SerializedName("role") val role: String,
    @SerializedName("text") val text: String
)

data class ChatRequest(
    @SerializedName("message") val message: String,
    @SerializedName("history") val history: List<HistoryItem>,
    @SerializedName("language") val language: String,
    @SerializedName("personality") val personality: String? = "agent",
    @SerializedName("memory") val memory: List<String>,
    @SerializedName("userName") val userName: String,
    @SerializedName("imageBase64") val imageBase64: String? = null,
    @SerializedName("imageMimeType") val imageMimeType: String? = null,
    @SerializedName("toolContext") val toolContext: String? = null
)

data class ToolExecutionInfo(
    @SerializedName("tool") val tool: String,
    @SerializedName("status") val status: String,
    @SerializedName("summary") val summary: String? = null
)

data class ChatResponse(
    @SerializedName("reply") val reply: String?,
    @SerializedName("isFallback") val isFallback: Boolean?,
    @SerializedName("suggestions") val suggestions: List<String>?,
    @SerializedName("sources") val sources: List<GroundingSource>?,
    @SerializedName("extractedName") val extractedName: String?,
    @SerializedName("memoryItem") val memoryItem: String?,
    @SerializedName("memoryCategory") val memoryCategory: String? = null,
    @SerializedName("youtube") val youtube: YouTubeData? = null,
    @SerializedName("appLauncher") val appLauncher: AppLauncherData? = null,
    @SerializedName("activeTool") val activeTool: String? = null,
    @SerializedName("toolInfo") val toolInfo: ToolExecutionInfo? = null,
    @SerializedName("requiresConfirmation") val requiresConfirmation: Boolean? = false,
    @SerializedName("confirmationPrompt") val confirmationPrompt: String? = null
)

data class RememberRequest(
    @SerializedName("text") val text: String,
    @SerializedName("category") val category: String? = "General"
)

data class RememberResponse(
    @SerializedName("memoryItem") val memoryItem: String?,
    @SerializedName("category") val category: String?
)

interface NovaApiService {
    @POST("api/chat")
    suspend fun sendChatMessage(@Body request: ChatRequest): Response<ChatResponse>

    @POST("api/remember")
    suspend fun extractMemory(@Body request: RememberRequest): Response<RememberResponse>
}

object ApiClient {
    // Note: Never hardcode API keys in APK client code! All credentials are kept safe on the backend.
    private const val DEFAULT_BASE_URL = "https://ais-dev-tlsbpjlzoefy6wuv7zr5wy-199144162353.asia-southeast1.run.app/"

    @Volatile
    private var customBaseUrl: String? = null

    fun setCustomBackendUrl(url: String?) {
        customBaseUrl = url?.trim()?.takeIf { it.isNotBlank() }
    }

    private val dynamicUrlInterceptor = Interceptor { chain ->
        var request = chain.request()
        val custom = customBaseUrl
        if (!custom.isNullOrBlank()) {
            try {
                val customHttpUrl = custom.toHttpUrlOrNull()
                if (customHttpUrl != null) {
                    val newUrl = request.url.newBuilder()
                        .scheme(customHttpUrl.scheme)
                        .host(customHttpUrl.host)
                        .port(customHttpUrl.port)
                        .build()
                    request = request.newBuilder().url(newUrl).build()
                }
            } catch (_: Exception) {
                // Fall back to default
            }
        }
        chain.proceed(request)
    }

    private val okHttpClient: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        }
        OkHttpClient.Builder()
            .addInterceptor(dynamicUrlInterceptor)
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(45, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }

    val apiService: NovaApiService by lazy {
        Retrofit.Builder()
            .baseUrl(DEFAULT_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(NovaApiService::class.java)
    }
}
