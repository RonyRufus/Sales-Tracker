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

## About beeps

Some browsers/phones play a system tone whenever speech recognition starts listening again. This tone is browser/OS-controlled and cannot be fully disabled from JavaScript. The app uses a short restart delay to reduce frequent beeps.

## Important mobile limitation (screen off / phone locked)

Browser speech recognition generally **does not keep running reliably in the background when the phone screen is off or the phone is locked**. This is an OS/browser restriction for web apps.

For true locked-screen/background recording, you would need a native mobile app (Android/iOS) with background audio/location permissions.


## Native app migration

If you want this as a true mobile app (not browser runtime behavior), use the Android blueprint in `ANDROID_APP_BLUEPRINT.md`.


## Native Android app (real app)

A native Android implementation now lives in `android-app/`.

### Open in Android Studio

1. Open Android Studio.
2. Choose **Open** and select `android-app/`.
3. Let Gradle sync.
4. Run on a device (Android 8+ recommended).

### Features included in the Android app

- Compose UI for start/stop capture, manual entry, and entry history.
- Room database persistence.
- Foreground `CaptureService` for hands-free speech loop.
- Fused Location integration for entry geotagging.
- CSV export via Android share sheet.

## Run locally

Because this app uses browser speech + location APIs, serve it over HTTP:

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Then open:

- On the **same machine**: `http://127.0.0.1:4173`
- From **another device on your network**: `http://<your-computer-ip>:4173`

Allow both microphone and location permissions when prompted.
