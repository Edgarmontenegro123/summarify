import {useCallback, useEffect, useState} from 'react'
import {useAuth} from '@/contexts/AuthContext'
import {
  fetchRecentDocuments,
  saveDocument as saveDocumentRequest,
  type DocumentRecord,
  type SaveDocumentInput,
} from '@/lib/documents'
import {
  getCachedDocuments,
  setCachedDocuments,
  upsertCachedDocument,
} from '@/lib/offlineCache'

export function useDocuments() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isFromCache, setIsFromCache] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) {
      setDocuments([])
      setIsFromCache(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setHasError(false)
    try {
      const docs = await fetchRecentDocuments(user.id)
      setDocuments(docs)
      setIsFromCache(false)
      // Fire-and-forget: la cache local es un espejo del ultimo fetch
      // exitoso, no debe bloquear la actualizacion de la UI.
      setCachedDocuments(user.id, docs)
    } catch (err) {
      console.error(err)
      // Sin red (u otro fallo de fetch), caemos a lo ultimo que vimos en
      // IndexedDB en vez de mostrar un error directo — solo se muestra
      // hasError si tampoco hay nada en cache.
      const cached = await getCachedDocuments(user.id)
      if (cached.length > 0) {
        setDocuments(cached)
        setIsFromCache(true)
      } else {
        setHasError(true)
      }
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const saveDocument = useCallback(
    async (input: Omit<SaveDocumentInput, 'userId'>) => {
      if (!user) throw new Error('No hay sesión activa.')
      const result = await saveDocumentRequest({ ...input, userId: user.id })
      setDocuments((prev) => [result.document, ...prev].slice(0, 5))
      // La cache principal de IndexedDB solo refleja guardados confirmados
      // en Supabase. Si quedo 'pending', useSync la agrega recien cuando
      // el reintento tenga exito — asi el fallback offline de refresh()
      // nunca muestra un documento que en realidad todavia no llego al
      // servidor.
      if (result.status === 'saved') upsertCachedDocument(result.document)
      return result
    },
    [user]
  )

  return { documents, isLoading, hasError, isFromCache, saveDocument, refresh }
}
