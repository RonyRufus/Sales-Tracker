# Android App Blueprint (Native Kotlin)

This project is currently a browser app (`index.html`, `app.js`).
If you need a **real app** (not website-wrapper behavior), use a native Android implementation.

## Goals

- Hands-free speech capture
- Attach each finalized speech segment to device location + timestamp
- Continue capture as reliably as possible with screen off/lock (via foreground service)
- Export entries to Excel-compatible CSV

## Recommended stack

- **Language/UI**: Kotlin + Jetpack Compose
- **Speech**: `SpeechRecognizer`
- **Location**: Fused Location Provider (`play-services-location`)
- **Persistence**: Room
- **Background runtime**: Foreground Service + persistent notification
- **CSV export/share**: `FileProvider` + share intent

## Suggested project layout

```text
android-app/
  app/
    src/main/
      AndroidManifest.xml
      java/com/salestracker/
        MainActivity.kt
        capture/CaptureService.kt
        speech/SpeechEngine.kt
        location/LocationProvider.kt
        data/
          EntryEntity.kt
          EntryDao.kt
          AppDatabase.kt
          EntryRepository.kt
        export/CsvExporter.kt
        ui/
          AppViewModel.kt
          screens/HomeScreen.kt
```

## Data model

Keep parity with current CSV output so you can preserve your existing spreadsheet workflow.

```kotlin
@Entity(tableName = "entries")
data class EntryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestampIso: String,
    val date: String,
    val time: String,
    val latitude: Double,
    val longitude: Double,
    val project: String,
    val comments: String
)
```

## AndroidManifest essentials

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<!-- For newer Android versions, declare matching foreground service type(s). -->

<application ...>
    <service
        android:name=".capture.CaptureService"
        android:foregroundServiceType="location|microphone"
        android:exported="false" />

    <provider
        android:name="androidx.core.content.FileProvider"
        android:authorities="${applicationId}.fileprovider"
        android:exported="false"
        android:grantUriPermissions="true">
        <meta-data
            android:name="android.support.FILE_PROVIDER_PATHS"
            android:resource="@xml/file_paths" />
    </provider>
</application>
```

## CaptureService responsibilities

`CaptureService` should:

1. Start in foreground immediately (notification visible).
2. Initialize speech engine and begin listening loop.
3. On finalized speech segment:
   - read latest location
   - map to `EntryEntity`
   - persist via repository
4. Broadcast lightweight status updates to UI (or use a shared flow).
5. Handle recoverable errors by restarting listening with small delay.

## Speech engine design notes

Create a dedicated `SpeechEngine` wrapper around `SpeechRecognizer` with callbacks:

- `onPartial(text)`
- `onFinal(text)`
- `onError(code)`

Implement restart policy:

- short backoff for temporary audio/no-match errors
- stop + user prompt for missing permission or fatal init errors

## Location provider notes

Use `FusedLocationProviderClient` and keep a cached latest fix.

- Request balanced/high accuracy depending on battery target.
- If no fix yet, either queue speech result briefly or save with `null` sentinel and mark as pending geotag (your choice).

## CSV export parity

Maintain current columns:

- `date`
- `time`
- `timestamp_iso`
- `latitude`
- `longitude`
- `project`
- `comments`

Implementation approach:

1. Query all entries ordered by timestamp.
2. Escape CSV values safely.
3. Write to app cache/external files dir.
4. Share with chooser (`ACTION_SEND`).

## Build dependencies (starter)

```kotlin
implementation("androidx.core:core-ktx:<latest>")
implementation("androidx.activity:activity-compose:<latest>")
implementation("androidx.compose.ui:ui:<latest>")
implementation("androidx.compose.material3:material3:<latest>")
implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:<latest>")
implementation("androidx.lifecycle:lifecycle-runtime-ktx:<latest>")
implementation("androidx.room:room-runtime:<latest>")
ksp("androidx.room:room-compiler:<latest>")
implementation("androidx.room:room-ktx:<latest>")
implementation("com.google.android.gms:play-services-location:<latest>")
```

## MVP implementation order

1. Build local-only manual entry UI + Room.
2. Add location capture.
3. Add speech capture in foreground activity.
4. Move speech/location loop into foreground service.
5. Add CSV export/share.
6. Add reliability and battery tuning.

## Notes on iOS

If you later need iOS, keep the data model and CSV schema identical. Build iOS separately (Swift/SwiftUI) or use a cross-platform layer for non-audio/non-background logic only.
