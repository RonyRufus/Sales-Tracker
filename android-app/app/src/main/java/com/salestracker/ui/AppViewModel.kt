package com.salestracker.ui

import android.app.Application
import android.content.Intent
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.salestracker.capture.CaptureService
import com.salestracker.data.AppDatabase
import com.salestracker.data.EntryEntity
import com.salestracker.data.EntryRepository
import com.salestracker.export.CsvExporter
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

class AppViewModel(application: Application) : AndroidViewModel(application) {
    private val repo = EntryRepository(AppDatabase.get(application).entryDao())
    private val exporter = CsvExporter(application)

    val entries: StateFlow<List<EntryEntity>> = repo.observeEntries().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList()
    )

    fun addManualEntry(project: String, comments: String) {
        viewModelScope.launch {
            val now = ZonedDateTime.now(ZoneId.systemDefault())
            repo.insert(
                EntryEntity(
                    timestampIso = now.toInstant().toString(),
                    date = now.toLocalDate().toString(),
                    time = now.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm:ss")),
                    latitude = 0.0,
                    longitude = 0.0,
                    project = project,
                    comments = comments
                )
            )
        }
    }

    fun startCapture() {
        val ctx = getApplication<Application>()
        val intent = Intent(ctx, CaptureService::class.java).apply {
            action = CaptureService.ACTION_START
        }
        ctx.startForegroundService(intent)
    }

    fun stopCapture() {
        val ctx = getApplication<Application>()
        val intent = Intent(ctx, CaptureService::class.java).apply {
            action = CaptureService.ACTION_STOP
        }
        ctx.startService(intent)
    }

    suspend fun exportCsvUri() = exporter.export(repo.entriesForExport())
}
