# How to Build the APK

App: `com.apexsalescall` (React Native, `app/` folder)

Run every command from the project root:

```
D:\company_projects\sales-call-tracker
```

No separate Java is needed — we use the JDK that comes with Android Studio.

---

## 1. Build the release APK (default — arm64 only, ~32 MB)

This is the one we use. arm64 covers every real phone made after ~2016.

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
& "app\android\gradlew.bat" -p "app\android" assembleRelease -PreactNativeArchitectures=arm64-v8a --console=plain
```

APK comes out here:

```
app\android\app\build\outputs\apk\release\app-release.apk
```

---

## 2. Build the universal APK (optional, ~86 MB)

Only needed for old 32-bit phones or PC emulators. Overwrites the same output file as above.

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
& "app\android\gradlew.bat" -p "app\android" assembleRelease --console=plain
```

---

## 3. Build the debug APK (for developer testing)

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
& "app\android\gradlew.bat" -p "app\android" assembleDebug --console=plain
```

Output:

```
app\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 4. Install on a connected phone

Turn on USB debugging on the phone, plug it in, then:

```powershell
adb install app\android\app\build\outputs\apk\release\app-release.apk
```

(Or just copy the APK to the phone and tap it.)

---

## Notes

- **First build took ~1.5 hours** (compiled all native libraries). Next builds are only a few minutes — Gradle caches everything.
- **Signing:** release APKs are signed with the permanent key `app\android\app\release.keystore`. Its passwords live in `app\android\app\keystore.properties` (passwords typed during `keytool` setup). Both files are git-ignored — back them up somewhere private. Every future version must be signed with this same key, or Android blocks the update.
- The "hard link failed, doing a slower copy" lines during the build are harmless warnings.
