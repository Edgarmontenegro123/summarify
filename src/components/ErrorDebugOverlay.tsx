import {useEffect, useState} from 'react'
import {subscribeToPdfErrors} from '@/lib/pdfDebugBus'

// TEMPORAL — ver pdfDebugBus.ts. Remover ambos archivos (y la linea que
// monta esto en App.tsx) una vez resuelto el bug de subida de PDF en iOS.
// No usa i18n a proposito: es texto de error crudo para depurar, no copy
// de producto.

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`
  }
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

export function ErrorDebugOverlay() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    return subscribeToPdfErrors((error) => {
      setMessage(formatError(error))
    })
  }, [])

  if (!message) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] max-h-[40vh] overflow-y-auto bg-red-600 px-4 py-3 text-white shadow-lg">
      <div className="mx-auto flex max-w-3xl items-start gap-3">
        <p className="flex-1 break-words font-mono text-xs">
          PDF DEBUG: {message}
        </p>
        <button
          type="button"
          onClick={() => setMessage(null)}
          aria-label="Cerrar aviso de error de PDF"
          className="shrink-0 text-lg leading-none text-white/80 hover:text-white"
        >
          ×
        </button>
      </div>
    </div>
  )
}
