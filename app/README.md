# Apex Sales Call (Android)

The salesperson app for Sales Call Tracker. Built with bare React Native CLI, TypeScript, NativeWind, and React Native Reusables. Distributed as a sideloaded debug APK.

## Requirements

- Node
- JDK 17+ (the Android Studio bundled JDK works)
- Android SDK with the `android-37` platform

## Build the APK

```sh
cd app/android
gradlew.bat assembleDebug
```

The APK lands at `app/android/app/build/outputs/apk/debug/app-debug.apk`.

## Install on a phone

Enable USB debugging or transfer the APK, then:

```sh
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

## API base URL

The backend URL lives in `app/config.json` under `apiBaseUrl`. Update it there if the backend URL changes. Never hard-code it in source files.
