# projeto-pessoal-app-contabilizador

Dark, minimal habit & training tracker. Built with Vite + React + TypeScript + Capacitor. All data stays on your phone.

---

## Setup

```bash
npm install
```

---

## Test in browser (optional)

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Build the APK

### 1. Build the web app

```bash
npm run build
```

### 2. Add Android platform (first time only)

```bash
npx cap add android
```

### 3. Sync web build into Android project

```bash
npx cap sync
```

### 4. Build the APK

```bash
cd android
./gradlew assembleDebug
```

The APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. Install on your phone

Connect your phone via USB with USB debugging enabled, then:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Or just copy the APK file to your phone and open it.

---

## Requirements

- Node.js 18+
- Java 17+ (`java -version`)
- Android SDK with `ANDROID_HOME` set and `platform-tools` in PATH

---

## Project structure

```
src/
  App.tsx                  # Screen routing
  screens/
    HomeScreen.tsx         # Today view — log reps per task
    CalendarScreen.tsx     # Monthly heatmap per task
    StatsScreen.tsx        # Weekly & monthly bar charts
    AddTaskScreen.tsx      # Create / edit / delete tasks
  components/
    BottomNav.tsx          # Tab bar
  db/
    storage.ts             # All data logic via Capacitor Preferences
  types/index.ts
capacitor.config.ts
```
