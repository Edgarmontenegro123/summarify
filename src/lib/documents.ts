import {supabase} from '@/lib/supabase'
import {addPendingWrite} from '@/lib/offlineCache'
import type {SummaryLanguage} from '@/types'

export interface DocumentRecord {
  id: string
  user_id: string
  title: string
  original_text: string
  brief_summary: string | null
  detailed_summary: string | null
  summary_language: SummaryLanguage
  created_at: string
}

export interface SaveDocumentInput {
  userId: string
  title: string
  originalText: string
  briefSummary?: string | null
  detailedSummary?: string | null
  summaryLanguage: SummaryLanguage
}

// Lo que se guarda en la cola de escritura offline: los mismos datos que
// SaveDocumentInput, mas el id/fecha ya decididos en el momento del
// guardado original (ver saveDocument mas abajo — el motivo de fijarlos
// aca, en vez de generarlos de nuevo al sincronizar, es la idempotencia).
export interface PendingWrite extends SaveDocumentInput {
  id: string
  createdAt: string
}

export type SaveDocumentResult =
  | { status: 'saved'; document: DocumentRecord }
  | { status: 'pending'; document: DocumentRecord }

const RECENT_DOCUMENTS_LIMIT = 5

export async function fetchRecentDocuments(
  userId: string
): Promise<DocumentRecord[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(RECENT_DOCUMENTS_LIMIT)

  if (error) throw error
  return data ?? []
}

function buildDocumentRecord(
  input: SaveDocumentInput,
  id: string,
  createdAt: string
): DocumentRecord {
  return {
    id,
    user_id: input.userId,
    title: input.title,
    original_text: input.originalText,
    brief_summary: input.briefSummary ?? null,
    detailed_summary: input.detailedSummary ?? null,
    summary_language: input.summaryLanguage,
    created_at: createdAt,
  }
}

function insertDocumentRow(record: DocumentRecord) {
  return supabase.from('documents').insert(record).select().single()
}

// postgrest-js nunca rechaza esta promesa por un fallo de red: si el fetch
// no llega al servidor, resuelve con { error, status: 0 } en vez de tirar
// una excepcion (a menos que se encadene .throwOnError(), que no usamos
// aca). status === 0 es entonces la señal confiable de "no hay conexion",
// distinta de un error real de Postgres/PostgREST (que siempre trae un
// status HTTP > 0).
function isNetworkFailure(status: number): boolean {
  return status === 0
}

export async function saveDocument(
  input: SaveDocumentInput
): Promise<SaveDocumentResult> {
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const record = buildDocumentRecord(input, id, createdAt)

  const { data, error, status } = await insertDocumentRow(record)

  if (!error) return { status: 'saved', document: data }
  if (!isNetworkFailure(status)) throw error

  // Se guarda con el mismo id que se intento insertar: si useSync
  // reintenta este mismo pending write mas de una vez (evento "online"
  // repetido, o dos pestañas sincronizando en simultaneo), la primary key
  // de "documents" rechaza el duplicado en vez de crear una fila repetida
  // (ver retryPendingWrite).
  await addPendingWrite({ ...input, id, createdAt })
  return { status: 'pending', document: record }
}

// Usado por useSync para reintentar un guardado que quedo pendiente.
// Reconstruye la fila con el id/fecha originales (no genera uno nuevo) para
// que el reintento sea idempotente.
export async function retryPendingWrite(
  write: PendingWrite
): Promise<DocumentRecord> {
  const record = buildDocumentRecord(write, write.id, write.createdAt)
  const { data, error } = await insertDocumentRow(record)

  if (!error) return data

  // 23505 = unique_violation de Postgres: ya existe una fila con este id,
  // asi que un intento anterior si llego a guardarse en el servidor aunque
  // el cliente no se entero (ej. la respuesta se perdio por la red antes de
  // llegar). Se trata como exito en vez de reintentar para siempre.
  if (error.code === '23505') return record

  // Sigue sin red (status 0) o es un error real de Postgres/PostgREST — en
  // ambos casos se propaga para que useSync deje este write en la cola y
  // lo reintente en el proximo evento "online".
  throw error
}

// Requiere red: a diferencia de saveDocument, un borrado offline no se
// encola. Encolar un delete abriria una segunda cola con su propia logica
// de conflicto (que pasa si el mismo id tiene a la vez un pending write y
// un pending delete, o si el usuario borra algo que el cache offline
// todavia muestra) — se dejo fuera de alcance a proposito; sin red, el
// boton de borrar simplemente falla y HistoryPage lo informa.
export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw error
}

// Primeras ~60 chars del texto original como titulo automatico, cortado en
// un espacio para no partir una palabra a la mitad.
export function deriveTitle(text: string, maxLen = 60): string {
  const normalized = text.trim().replace(/\s+/g, ' ')
  if (normalized.length <= maxLen) return normalized

  const cut = normalized.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 20 ? lastSpace : maxLen)}…`
}
