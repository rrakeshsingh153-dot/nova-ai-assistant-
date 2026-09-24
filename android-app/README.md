# NOVA AI – Voice Assistant (Native Android Edition)

## Architecture Overview
- **Language & Framework:** Kotlin, Jetpack Compose, AndroidX, Material 3
- **Network & Architecture:** Retrofit2, OkHttp, Coroutines, StateFlow, MVVM
- **Speech Engine:** Native Android `SpeechRecognizer` (Speech-to-Text) and `TextToSpeech` (TTS) with bilingual Hindi/English synthesis
- **Storage:** Jetpack DataStore Preferences for user settings, memory bank, and chat session history
- **Security:** Zero hardcoded API keys. All Gemini calls are proxied securely to the backend via HTTPS.

---

## 1. How to Test on an Android Phone or Emulator

### Prerequisites
1. Install **Android Studio** (Ladybug / Iguana or later).
2. Android SDK 35 (Android 15) with `minSdk = 26` (Android 8.0+).
3. Java JDK 17+.

### Steps to Run
1. Open Android Studio.
2. Select **File > Open...** and choose the `/android-app` directory.
3. Allow Gradle to sync dependencies (`gradle sync`).
4. Connect your Android phone via USB with **USB Debugging** enabled (or start an Android Emulator).
5. Press **Run (Shift + F10)** or the green Play icon in Android Studio.
6. When prompted, grant **Microphone Permission** to enable speech recognition in Hindi and English.

---

## 2. How to Generate a Signed APK (For Direct Installation)

1. In Android Studio, go to the top menu:
   **Build > Generate Signed Bundle / APK...**
2. Choose **APK** and click **Next**.
3. Create a new Keystore or choose an existing one:
   - **Key store path:** e.g., `/Users/yourname/keystores/nova-release-key.jks`
   - Set password, alias (`nova-key`), and validity (25+ years).
4. Select build variant: **release**.
5. Check **V1 (Jar Signature)** and **V2 (Full APK Signature)**.
6. Click **Finish**. The output signed APK will be located in:
   `android-app/app/release/app-release.apk`
7. Transfer to any Android phone and tap to install.

---

## 3. How to Generate an AAB (Android App Bundle) for Google Play Store

1. In Android Studio, go to:
   **Build > Generate Signed Bundle / APK...**
2. Select **Android App Bundle** and click **Next**.
3. Choose your release keystore credentials.
4. Select build variant: **release**.
5. Click **Finish**.
6. The generated `.aab` file will be in:
   `android-app/app/release/app-release.aab`
7. Upload this `.aab` file to **Google Play Console** under **Release > Production / Internal Testing**.
