package com.salestracker.ui.screens

import android.content.Intent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.salestracker.ui.AppViewModel
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(viewModel: AppViewModel) {
    val entries by viewModel.entries.collectAsState()
    var project by remember { mutableStateOf("") }
    var comments by remember { mutableStateOf("") }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("Sales Tracker", style = MaterialTheme.typography.headlineSmall)

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = viewModel::startCapture) { Text("Start Hands-Free") }
            Button(onClick = viewModel::stopCapture) { Text("Stop") }
        }

        OutlinedTextField(
            value = project,
            onValueChange = { project = it },
            label = { Text("Project") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = comments,
            onValueChange = { comments = it },
            label = { Text("Comments") },
            modifier = Modifier.fillMaxWidth()
        )

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = {
                viewModel.addManualEntry(project, comments)
                comments = ""
            }) { Text("Save Manual Entry") }

            Button(onClick = {
                scope.launch {
                    val uri = viewModel.exportCsvUri()
                    val sendIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/csv"
                        putExtra(Intent.EXTRA_STREAM, uri)
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    ContextCompat.startActivity(
                        context,
                        Intent.createChooser(sendIntent, "Share CSV"),
                        null
                    )
                }
            }) { Text("Export CSV") }
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(entries) { entry ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text("${entry.date} ${entry.time}")
                        Text("${entry.latitude}, ${entry.longitude}")
                        Text("${entry.project}: ${entry.comments}")
                    }
                }
            }
        }
    }
}
