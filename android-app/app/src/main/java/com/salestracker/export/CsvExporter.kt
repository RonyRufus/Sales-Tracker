package com.salestracker.export

import android.content.Context
import android.net.Uri
import androidx.core.content.FileProvider
import com.salestracker.data.EntryEntity
import java.io.File

class CsvExporter(private val context: Context) {
    fun export(entries: List<EntryEntity>): Uri {
        val dir = File(context.cacheDir, "exports").apply { mkdirs() }
        val file = File(dir, "sales-tracker-${System.currentTimeMillis()}.csv")
        file.bufferedWriter().use { out ->
            out.appendLine("date,time,timestamp_iso,latitude,longitude,project,comments")
            entries.forEach { e ->
                out.appendLine(
                    listOf(
                        e.date,
                        e.time,
                        e.timestampIso,
                        e.latitude.toString(),
                        e.longitude.toString(),
                        e.project,
                        e.comments
                    ).joinToString(",") { escape(it) }
                )
            }
        }
        return FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
    }

    private fun escape(value: String): String {
        val escaped = value.replace("\"", "\"\"")
        return "\"$escaped\""
    }
}
