package com.salestracker.data

import kotlinx.coroutines.flow.Flow

class EntryRepository(private val dao: EntryDao) {
    fun observeEntries(): Flow<List<EntryEntity>> = dao.observeAll()
    suspend fun insert(entry: EntryEntity) = dao.insert(entry)
    suspend fun entriesForExport(): List<EntryEntity> = dao.getAllForExport()
}
