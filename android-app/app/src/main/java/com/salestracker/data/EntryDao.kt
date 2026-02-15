package com.salestracker.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface EntryDao {
    @Insert
    suspend fun insert(entry: EntryEntity)

    @Query("SELECT * FROM entries ORDER BY timestampIso DESC")
    fun observeAll(): Flow<List<EntryEntity>>

    @Query("SELECT * FROM entries ORDER BY timestampIso ASC")
    suspend fun getAllForExport(): List<EntryEntity>
}
