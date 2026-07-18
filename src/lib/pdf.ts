import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export async function extractTextFromPdf(file: File): Promise<string> {
  console.log(`Iniciando lectura de PDF, tamaño: ${file.size} bytes`)

  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const pageTexts: string[] = []

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const content = await page.getTextContent()
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
      pageTexts.push(text)
    }

    return pageTexts.join('\n\n').replace(/\s+\n/g, '\n').trim()
  } catch (error) {
    console.error('Error de lectura PDF (Detalle):', error)
    throw error
  }
}
