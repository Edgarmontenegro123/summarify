// TEMPORAL — soporte de depuración para el bug de subida de PDF en iOS
// (no se puede inspeccionar vía USB en Windows). Remover junto con
// ErrorDebugOverlay.tsx una vez resuelto.
//
// pub/sub minimo: extractTextFromPdf (lib/pdf.ts) publica el error crudo
// apenas ocurre; ErrorDebugOverlay.tsx, montado en App.tsx, esta en otro
// punto del arbol (UploadZone vive dentro de SummarizePage) asi que no
// puede recibirlo por props sin perforar varios componentes de por medio.

type PdfErrorListener = (error: unknown) => void

const listeners = new Set<PdfErrorListener>()

export function reportPdfError(error: unknown): void {
  listeners.forEach((listener) => listener(error))
}

export function subscribeToPdfErrors(listener: PdfErrorListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
