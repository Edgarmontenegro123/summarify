import {useCallback, useEffect, useRef} from 'react'
import {useAuth} from '@/contexts/AuthContext'
import {retryPendingWrite} from '@/lib/documents'
import {
  getPendingWrites,
  removePendingWrite,
  upsertCachedDocument,
} from '@/lib/offlineCache'

// Se renderiza una sola vez a nivel de App (mismo patron que
// useOnlineStatus/usePwaUpdate). isSyncingRef evita que dos disparos del
// evento "online" (o un remount) procesen la cola en simultaneo; la
// idempotencia entre pestañas distintas la resuelve retryPendingWrite en
// documents.ts (primary key de "documents" como clave de idempotencia).
export function useSync() {
  const { user } = useAuth()
  const isSyncingRef = useRef(false)

  const syncPendingWrites = useCallback(async () => {
    if (isSyncingRef.current || !user) return
    isSyncingRef.current = true

    try {
      const pending = await getPendingWrites()
      for (const write of pending) {
        try {
          const saved = await retryPendingWrite(write)
          await removePendingWrite(write.id)
          await upsertCachedDocument(saved)
        } catch (err) {
          // Sigue sin red, o es un error real (RLS, validacion) — en
          // cualquier caso se deja en la cola para el proximo intento en
          // vez de perder el resumen del usuario.
          console.error(err)
        }
      }
    } finally {
      isSyncingRef.current = false
    }
  }, [user])

  useEffect(() => {
    window.addEventListener('online', syncPendingWrites)
    // Tambien se intenta al montar: cubre el caso de abrir la app ya
    // online con escrituras pendientes de una sesion offline anterior (el
    // evento "online" del browser no se dispara de nuevo si ya estaba
    // online desde antes de cargar la pagina).
    syncPendingWrites()

    return () => window.removeEventListener('online', syncPendingWrites)
  }, [syncPendingWrites])
}
