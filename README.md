# Sales-Tracker

A lightweight voice-first map logger for travel notes.

## What it does

- Uses your current GPS location (like Google Maps "my location").
- Supports true hands-free capture for travel use.
- Saves spoken context directly to that location.
- Stores when each note was recorded (date + time).
- Exports data for Excel with date, time, coordinates, and comments.
- Persists entries in browser local storage.

## Voice flow (hands-free)

1. Tap **Enable Hands-Free** once.
2. Talk naturally at each stop (no trigger phrase required).
3. Each finalized speech segment is saved as a location note with timestamp.

## Export to Excel

Tap **Export Excel (CSV)** to download a `.csv` file that opens in Excel.
Columns included:

- `date`
- `time`
- `timestamp_iso`
- `latitude`
- `longitude`
- `project`
- `comments`

## Important mobile limitation (screen off / phone locked)

Browser speech recognition/WebView speech recognition generally **does not keep running reliably in the background when the phone screen is off or the phone is locked**. This is an OS/browser restriction.

For true locked-screen/background recording, you would need a fully native Android/iOS app with a foreground service and background audio/location permissions.

## Build APK locally

```bash
cd android-app
export JAVA_HOME=$HOME/.local/share/mise/installs/java/17.0.2
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_SDK_ROOT=/workspace/android-sdk
gradle :app:assembleDebug
```

APK output:

- `android-app/app/build/outputs/apk/debug/app-debug.apk`

## Run the web app locally

Because this app uses browser speech + location APIs, serve it over HTTP:

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Then open:

- On the **same machine**: `http://127.0.0.1:4173`
- From **another device on your network**: `http://<your-computer-ip>:4173`

Allow both microphone and location permissions when prompted.
