-keepattributes *Annotation*
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.nova.ai.assistant.network.** { *; }
-dontwarn okio.**
-dontwarn javax.annotation.**
