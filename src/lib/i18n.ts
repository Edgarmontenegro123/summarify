import type {SummaryLanguage} from '@/types'

interface Translations {
  'header.viewHistory': string
  'header.signOut': string
  'header.themeToLight': string
  'header.themeToDark': string
  'header.languageLabel': string

  'hero.title1': string
  'hero.titleHighlight': string
  'hero.subtitle': string

  'buttons.brief': string
  'buttons.detailed': string

  'upload.onlyPdfError': string
  'upload.scannedError': string
  'upload.readError': string
  'upload.extracting': string
  'upload.replaceHint': string
  'upload.dragHint': string
  'upload.pasteHint': string
  'upload.pasteLabel': string
  'upload.clear': string
  'upload.placeholder': string
  'upload.charCount': string

  'summaryPanel.titleBrief': string
  'summaryPanel.titleDetailed': string
  'summaryPanel.titleGeneric': string
  'summaryPanel.copyAria': string
  'summaryPanel.readAloud': string
  'summaryPanel.pause': string
  'summaryPanel.resume': string
  'summaryPanel.stopAria': string
  'summaryPanel.save': string
  'summaryPanel.saved': string

  'export.button': string
  'export.asPdf': string
  'export.asMarkdown': string
  'export.asText': string
  'export.dateLabel': string
  'export.languageLabel': string
  'export.languageEs': string
  'export.languageEn': string
  'export.summaryHeading': string
  'export.fileBaseName': string

  'summarize.emptyResultError': string
  'summarize.genericError': string
  'summarize.saveError': string
  'summarize.notEnglishWarning': string
  'summarize.footer': string

  'history.back': string
  'history.title': string
  'history.subtitle': string
  'history.loadError': string
  'history.empty': string
  'history.reload': string
  'history.tagBrief': string
  'history.tagDetailed': string

  'offline.banner': string
}

export const translations: Record<SummaryLanguage, Translations> = {
  es: {
    'header.viewHistory': 'Ver historial',
    'header.signOut': 'Cerrar sesión',
    'header.themeToLight': 'Cambiar a modo claro',
    'header.themeToDark': 'Cambiar a modo oscuro',
    'header.languageLabel': 'Idioma',

    'hero.title1': 'Resúmenes claros,',
    'hero.titleHighlight': 'al instante.',
    'hero.subtitle':
      'Sube un PDF o pega tu texto. Summarify lo resume al instante y te lo lee en voz alta, en español.',

    'buttons.brief': 'Resumen Breve',
    'buttons.detailed': 'Resumen Detallado',

    'upload.onlyPdfError': 'Solo se admiten archivos PDF.',
    'upload.scannedError':
      'No se pudo extraer texto de este PDF (¿quizás es una imagen escaneada?).',
    'upload.readError':
      'Ocurrió un error al leer el PDF. Intenta con otro archivo.',
    'upload.extracting': 'Extrayendo texto del PDF…',
    'upload.replaceHint': 'Haz clic para reemplazar el archivo',
    'upload.dragHint': 'Arrastra tu PDF aquí o haz clic para buscarlo',
    'upload.pasteHint': 'También puedes pegar el texto directamente abajo',
    'upload.pasteLabel': 'O pega tu texto',
    'upload.clear': 'Limpiar',
    'upload.placeholder': 'Pega aquí el texto largo que quieres resumir…',
    'upload.charCount': '{count} caracteres',

    'summaryPanel.titleBrief': 'Resumen breve',
    'summaryPanel.titleDetailed': 'Resumen detallado',
    'summaryPanel.titleGeneric': 'Resumen',
    'summaryPanel.copyAria': 'Copiar resumen',
    'summaryPanel.readAloud': 'Leer en voz alta',
    'summaryPanel.pause': 'Pausar',
    'summaryPanel.resume': 'Reanudar',
    'summaryPanel.stopAria': 'Detener lectura',
    'summaryPanel.save': '💾 Guardar en mi historial',
    'summaryPanel.saved': 'Guardado en tu historial',

    'export.button': 'Exportar',
    'export.asPdf': 'Exportar como PDF',
    'export.asMarkdown': 'Exportar como Markdown (.md)',
    'export.asText': 'Exportar como texto plano (.txt)',
    'export.dateLabel': 'Fecha de creación',
    'export.languageLabel': 'Idioma del resumen',
    'export.languageEs': 'Español',
    'export.languageEn': 'Inglés',
    'export.summaryHeading': 'Resumen',
    'export.fileBaseName': 'resumen_exportado',

    'summarize.emptyResultError':
      'No se pudo generar el resumen. Intenta con otro texto.',
    'summarize.genericError': 'Ocurrió un error al generar el resumen.',
    'summarize.saveError': 'No se pudo guardar el resumen en tu historial.',
    'summarize.notEnglishWarning':
      'Para generar resúmenes en inglés, por favor introduce un texto originalmente en inglés (el motor local no traduce de forma automática).',
    'summarize.footer':
      'Summarify — hecho con React, TypeScript y un motor de resumen 100% local (sin APIs externas).',

    'history.back': 'Volver a Summarify',
    'history.title': 'Tu historial',
    'history.subtitle': 'Tus últimos 5 resúmenes guardados.',
    'history.loadError': 'No se pudo cargar tu historial de resúmenes.',
    'history.empty':
      'Todavía no guardaste ningún resumen. Generá uno y tocá "💾 Guardar en mi historial".',
    'history.reload': 'Recargar',
    'history.tagBrief': 'Resumen breve',
    'history.tagDetailed': 'Resumen detallado',

    'offline.banner':
      'Estás sin conexión. Podés seguir resumiendo, leyendo y exportando — se guardará cuando vuelva internet.',
  },
  en: {
    'header.viewHistory': 'View history',
    'header.signOut': 'Sign out',
    'header.themeToLight': 'Switch to light mode',
    'header.themeToDark': 'Switch to dark mode',
    'header.languageLabel': 'Language',

    'hero.title1': 'Clear summaries,',
    'hero.titleHighlight': 'instantly.',
    'hero.subtitle':
      'Upload a PDF or paste your text. Summarify summarises it instantly and reads it aloud, in English.',

    'buttons.brief': 'Brief Summary',
    'buttons.detailed': 'Detailed Summary',

    'upload.onlyPdfError': 'Only PDF files are supported.',
    'upload.scannedError':
      "Couldn't extract text from this PDF (maybe it's a scanned image?).",
    'upload.readError':
      'Something went wrong reading the PDF. Try another file.',
    'upload.extracting': 'Extracting text from the PDF…',
    'upload.replaceHint': 'Click to replace the file',
    'upload.dragHint': 'Drag your PDF here or click to browse',
    'upload.pasteHint': 'You can also paste the text directly below',
    'upload.pasteLabel': 'Or paste your text',
    'upload.clear': 'Clear',
    'upload.placeholder': 'Paste the long text you want to summarise here…',
    'upload.charCount': '{count} characters',

    'summaryPanel.titleBrief': 'Brief summary',
    'summaryPanel.titleDetailed': 'Detailed summary',
    'summaryPanel.titleGeneric': 'Summary',
    'summaryPanel.copyAria': 'Copy summary',
    'summaryPanel.readAloud': 'Read aloud',
    'summaryPanel.pause': 'Pause',
    'summaryPanel.resume': 'Resume',
    'summaryPanel.stopAria': 'Stop reading',
    'summaryPanel.save': '💾 Save to my history',
    'summaryPanel.saved': 'Saved to your history',

    'export.button': 'Export',
    'export.asPdf': 'Export as PDF',
    'export.asMarkdown': 'Export as Markdown (.md)',
    'export.asText': 'Export as Plain Text (.txt)',
    'export.dateLabel': 'Date created',
    'export.languageLabel': 'Summary language',
    'export.languageEs': 'Spanish',
    'export.languageEn': 'English',
    'export.summaryHeading': 'Summary',
    'export.fileBaseName': 'summary_export',

    'summarize.emptyResultError':
      "Couldn't generate the summary. Try a different text.",
    'summarize.genericError': 'Something went wrong generating the summary.',
    'summarize.saveError': "Couldn't save the summary to your history.",
    'summarize.notEnglishWarning':
      "To generate summaries in English, please provide text that's originally in English (the local engine doesn't translate automatically).",
    'summarize.footer':
      'Summarify — built with React, TypeScript and a 100% local summarisation engine (no external APIs).',

    'history.back': 'Back to Summarify',
    'history.title': 'Your history',
    'history.subtitle': 'Your last 5 saved summaries.',
    'history.loadError': "Couldn't load your summary history.",
    'history.empty':
      'You haven\'t saved any summaries yet. Generate one and tap "💾 Save to my history".',
    'history.reload': 'Reload',
    'history.tagBrief': 'Brief summary',
    'history.tagDetailed': 'Detailed summary',

    'offline.banner':
      "You're offline. You can keep summarising, reading, and exporting — saving will resume once you're back online.",
  },
}

export type TranslationKey = keyof Translations
