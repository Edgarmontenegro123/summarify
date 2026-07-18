import {openDB, type DBSchema, type IDBPDatabase} from 'idb'
import type {DocumentRecord, PendingWrite} from '@/lib/documents'

interface OfflineCacheSchema extends DBSchema {
  documents: {
    key: string
    value: DocumentRecord
    indexes: { 'by-user': string }
  }
  pending_writes: {
    key: string
    value: PendingWrite
  }
}

const DB_NAME = 'summarify-offline-cache'
const DB_VERSION = 2
const STORE_NAME = 'documents'
const PENDING_STORE = 'pending_writes'

let dbPromise: Promise<IDBPDatabase<OfflineCacheSchema>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<OfflineCacheSchema>(DB_NAME, DB_VERSION, {
      // db.objectStoreNames.contains(...) evita recrear "documents" al
      // subir de la v1 (solo tenia ese store) a la v2 — el callback de
      // upgrade corre tanto para una base nueva (oldVersion 0) como para
      // una que ya existia.
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('by-user', 'user_id')
        }
        if (!db.objectStoreNames.contains(PENDING_STORE)) {
          db.createObjectStore(PENDING_STORE, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

// IndexedDB puede no estar disponible (modo privado, cuota agotada) o la
// apertura puede fallar por otras razones del navegador. Todas las
// funciones de este modulo degradan en silencio (log + valor neutro) para
// que el llamador siga funcionando como si no hubiera cache, en vez de
// romper el flujo online/offline normal.

export async function getCachedDocuments(
  userId: string
): Promise<DocumentRecord[]> {
  try {
    const db = await getDb()
    const docs = await db.getAllFromIndex(STORE_NAME, 'by-user', userId)
    return docs.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function setCachedDocuments(
  userId: string,
  docs: DocumentRecord[]
): Promise<void> {
  try {
    const db = await getDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const existingKeys = await tx.store.index('by-user').getAllKeys(userId)
    await Promise.all(existingKeys.map((key) => tx.store.delete(key)))
    await Promise.all(docs.map((doc) => tx.store.put(doc)))
    await tx.done
  } catch (err) {
    console.error(err)
  }
}

export async function upsertCachedDocument(doc: DocumentRecord): Promise<void> {
  try {
    const db = await getDb()
    await db.put(STORE_NAME, doc)
  } catch (err) {
    console.error(err)
  }
}

export async function deleteCachedDocument(id: string): Promise<void> {
  try {
    const db = await getDb()
    await db.delete(STORE_NAME, id)
  } catch (err) {
    console.error(err)
  }
}

export async function clearCachedDocuments(userId: string): Promise<void> {
  try {
    const db = await getDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const keys = await tx.store.index('by-user').getAllKeys(userId)
    await Promise.all(keys.map((key) => tx.store.delete(key)))
    await tx.done
  } catch (err) {
    console.error(err)
  }
}

export async function addPendingWrite(write: PendingWrite): Promise<void> {
  try {
    const db = await getDb()
    await db.put(PENDING_STORE, write)
  } catch (err) {
    console.error(err)
  }
}

// Orden ascendente por createdAt: los guardados offline se sincronizan en
// el mismo orden en que se generaron.
export async function getPendingWrites(): Promise<PendingWrite[]> {
  try {
    const db = await getDb()
    const writes = await db.getAll(PENDING_STORE)
    return writes.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function removePendingWrite(id: string): Promise<void> {
  try {
    const db = await getDb()
    await db.delete(PENDING_STORE, id)
  } catch (err) {
    console.error(err)
  }
}
