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

On this Windows machine, build only the phone ABIs. Reanimated's 32-bit (`armeabi-v7a`) CMake build fails here with a Ninja "manifest still dirty" loop (long paths are disabled). Use:

```sh
gradlew.bat assembleDebug "-PreactNativeArchitectures=arm64-v8a"
```

That produces an APK for 64-bit phones (every phone from the last ~8 years). For a 32-bit-only phone, run the same command with `armeabi-v7a` on a machine where long paths or antivirus exclusions are set up.

The APK lands at `app/android/app/build/outputs/apk/debug/app-debug.apk`.

## Install on a phone

Enable USB debugging or transfer the APK, then:

```sh
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

## API base URL

The backend URL lives in `app/config.json` under `apiBaseUrl`. Update it there if the backend URL changes. Never hard-code it in source files.
