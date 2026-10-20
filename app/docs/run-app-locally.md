# How to Start the App (Android + Local Backend)

## 1. Start the backend (Flask)

- Open a terminal in `backend/`
- Run: `python wsgi.py`
- Keep this terminal open (it runs on `http://127.0.0.1:5000`)

## 2. Start Metro (JS server)

- Open a terminal in `app/`
- First time only: `npm install`
- Run: `npm start`
- Keep this terminal open

## 3. Phone setup (one time, Xiaomi/MIUI)

- Settings → About phone → tap **MIUI version / Build number** 7 times (enables Developer options)
- Settings → Additional settings → Developer options:
  - Turn **ON USB debugging**
  - Turn **ON Install via USB** (needs Mi account logged in + SIM in phone)

## 4. Connect and run

- Connect phone to PC with **USB cable** → accept the debugging popup on the phone
- Open **Android Studio** → Open → select `app/android` → wait for Gradle sync
- Press green **Run ▶**

## 5. Connect app to servers (USB forwards)

Run in a terminal (adb is not on PATH, use full path):

```
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:5000 tcp:5000
```

- 8081 = Metro, 5000 = Flask backend

## 6. Point the app to the local backend

- Nothing to change: dev builds automatically use `apiBaseUrlDev` (`http://localhost:5000/api`) from `app/config.json`
- Release APKs automatically use `apiBaseUrlRelease` (the Render URL)

## 7. Reload the app

- Shake the phone → **Reload**
- If the dev server setting was changed: shake → Settings → **Debug server host & port for device** → `localhost:8081`

## Quick fixes

- Red "Unable to load script" → check step 5 commands, then reload
- Metro acting strange after code/branch changes → restart with `npm start -- --reset-cache`
- App closes suddenly → check the Metro terminal for the error; logs also in Android Studio → Logcat → filter `package:com.apexsalescall`

## White screen / stuck on "downloading" (most common problem)

This happens when the USB forwards die (unplugging the phone, PC sleep, cable reconnect).
The fix is to re-create the forwards and restart the app. Run these in PowerShell:

```
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse --remove-all
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:5000 tcp:5000
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell am force-stop com.apexsalescall
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell am start -n com.apexsalescall/.MainActivity
```

Rule to remember: **unplugged the phone = run the two `adb reverse` commands again** before the app will load.
