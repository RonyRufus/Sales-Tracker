package com.salestracker.data

import androidx.room.Entity
import androidx.room.PrimaryKey

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
