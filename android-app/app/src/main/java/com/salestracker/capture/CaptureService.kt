package com.salestracker.capture

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.salestracker.R
import com.salestracker.data.AppDatabase
import com.salestracker.data.EntryEntity
import com.salestracker.data.EntryRepository
import com.salestracker.location.LocationProvider
import com.salestracker.speech.SpeechEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

class CaptureService : Service() {
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var repo: EntryRepository
    private lateinit var locationProvider: LocationProvider
    private lateinit var speechEngine: SpeechEngine

    override fun onCreate() {
        super.onCreate()
        repo = EntryRepository(AppDatabase.get(this).entryDao())
        locationProvider = LocationProvider(this)
        createChannel()
        speechEngine = SpeechEngine(
            context = this,
            onFinal = { text -> persistEntry(text) },
            onError = { restartListeningWithDelay() }
        )
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                startForeground(NOTIFICATION_ID, buildNotification("Hands-free capture running"))
                speechEngine.startListening()
            }
            ACTION_STOP -> stopSelf()
        }
        return START_STICKY
    }

    private fun persistEntry(text: String) {
        serviceScope.launch {
            val now = ZonedDateTime.now(ZoneId.systemDefault())
            val location = locationProvider.getLatest()
            repo.insert(
                EntryEntity(
                    timestampIso = now.toInstant().toString(),
                    date = now.toLocalDate().toString(),
                    time = now.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm:ss")),
                    latitude = location?.latitude ?: 0.0,
                    longitude = location?.longitude ?: 0.0,
                    project = "",
                    comments = text
                )
            )
            restartListeningWithDelay()
        }
    }

    private fun restartListeningWithDelay() {
        serviceScope.launch {
            delay(1200)
            speechEngine.startListening()
        }
    }

    override fun onDestroy() {
        speechEngine.destroy()
        serviceScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Capture",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    private fun buildNotification(text: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Sales Tracker")
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_notification)
            .setOngoing(true)
            .build()
    }

    companion object {
        const val ACTION_START = "com.salestracker.action.START"
        const val ACTION_STOP = "com.salestracker.action.STOP"
        private const val CHANNEL_ID = "capture"
        private const val NOTIFICATION_ID = 42
    }
}
