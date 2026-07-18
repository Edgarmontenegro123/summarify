import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'
import {reportPdfError} from '@/lib/pdfDebugBus'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

// Envuelve una llamada puntual a pdfjs-dist y le agrega, al error, en que
// paso especifico ocurrio — "undefined is not a function" solo no alcanza
// para saber si fallo cargando el documento, pidiendo una pagina, o
// extrayendo su contenido. El catch de extractTextFromPdf sigue siendo el
// unico lugar que loguea/reporta, esto solo enriquece el mensaje antes de
// que llegue ahi.
async function withPdfStep<T>(step: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    throw new Error(`[${step}] ${detail}`)
  }
}

export async function extractTextFromPdf(file: File): Promise<string> {
  console.log(`Iniciando lectura de PDF, tamaño: ${file.size} bytes`)

  try {
    const arrayBuffer = await file.arrayBuffer()

    const pdf = await withPdfStep('getDocument', () =>
      pdfjsLib.getDocument({
        data: arrayBuffer,
        // "Modo compatibilidad": pdfjs-dist v6 no expone un flag publico
        // para forzar "sin worker" — la propia libreria ya reintenta sola
        // con un worker "fake" en el hilo principal si el worker real
        // falla o no completa su handshake (PDFWorker#setupFakeWorker en
        // pdf.mjs; #isWorkerDisabled es un campo privado de la clase, no
        // configurable desde afuera), asi que chequear window.Worker no
        // cambiaria nada. Lo que si podemos apagar son rutas de codigo mas
        // nuevas — WASM, OffscreenCanvas, ImageDecoder — que un WebKit
        // especifico podria no soportar del todo. No las necesitamos para
        // extraer texto (son para decodificar/renderizar imagenes), asi
        // que desactivarlas no debería afectar la extraccion en ninguna
        // plataforma, y es la version real de "modo legacy" que esta
        // libreria permite configurar.
        useWasm: false,
        isOffscreenCanvasSupported: false,
        isImageDecoderSupported: false,
      }).promise
    )

    const pageTexts: string[] = []

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await withPdfStep(`getPage(${pageNum})`, () => pdf.getPage(pageNum))
      const content = await withPdfStep(`getTextContent(${pageNum})`, () =>
        page.getTextContent()
      )
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
      pageTexts.push(text)
    }

    return pageTexts.join('\n\n').replace(/\s+\n/g, '\n').trim()
  } catch (error) {
    console.error('Error de lectura PDF (Detalle):', error)
    reportPdfError(error)
    throw error
  }
}
