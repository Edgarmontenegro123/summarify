import {useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {AlignLeft, AlignJustify, Loader2} from 'lucide-react'
import {Header} from '@/components/Header'
import {UploadZone} from '@/components/UploadZone'
import {SummaryPanel} from '@/components/SummaryPanel'
import type {ExportFormat} from '@/components/SummaryPanel'
import {Button} from '@/components/ui/button'
import {useTheme} from '@/contexts/ThemeContext'
import {useSpeech} from '@/hooks/useSpeech'
import {useDocuments} from '@/hooks/useDocuments'
import {useLanguage} from '@/contexts/LanguageContext'
import {detectLikelyLanguage, generateSummary} from '@/lib/summarize'
import {deriveTitle} from '@/lib/documents'
import {exportSummaryAsMarkdown, exportSummaryAsText} from '@/lib/export'
import type {DocumentRecord} from '@/lib/documents'
import type {SummaryLanguage, SummaryMode} from '@/types'

// Pequeña espera artificial para que la generación se sienta como un
// proceso real en vez de un parpadeo instantáneo.
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function SummarizePage() {
  const { theme, toggleTheme } = useTheme()
  const speech = useSpeech()
  const { saveDocument } = useDocuments()
  const { language, t } = useLanguage()
  const location = useLocation()

  const [text, setText] = useState('')
  const [summary, setSummary] = useState('')
  const [mode, setMode] = useState<SummaryMode | null>(null)
  const [summaryLanguage, setSummaryLanguage] = useState<SummaryLanguage>('es')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)

  // Cuando venimos de "Recargar resumen" en /history, precargamos el
  // documento elegido en vez de arrancar de una pantalla vacía.
  useEffect(() => {
    const doc = (location.state as { document?: DocumentRecord } | null)
      ?.document
    if (!doc) return

    setText(doc.original_text)
    if (doc.detailed_summary) {
      setSummary(doc.detailed_summary)
      setMode('detallado')
    } else if (doc.brief_summary) {
      setSummary(doc.brief_summary)
      setMode('breve')
    }
    setSummaryLanguage(doc.summary_language)
    setIsSaved(true)
  }, [location.state])

  const handleTextChange = (value: string) => {
    setText(value)
    setIsSaved(false)
    setSaveNotice(null)
  }

  const handleSummarize = async (selectedMode: SummaryMode) => {
    if (!text.trim() || isLoading) return

    speech.stop()
    setIsLoading(true)
    setError(null)
    setMode(selectedMode)
    setSummary('')
    setIsSaved(false)
    setSaveNotice(null)

    // El motor es 100% local y no traduce: si el usuario pide inglés sobre
    // un texto que claramente no lo es, avisamos en vez de "resumir" en el
    // idioma equivocado.
    if (language === 'en' && detectLikelyLanguage(text) === 'es') {
      setError(t('summarize.notEnglishWarning'))
      setIsLoading(false)
      return
    }

    try {
      await delay(500 + Math.random() * 400)
      const result = generateSummary(text, selectedMode, language)

      if (!result.trim()) {
        setError(t('summarize.emptyResultError'))
      } else {
        setSummary(result)
        setSummaryLanguage(language)
      }
    } catch (err) {
      console.error(err)
      setError(t('summarize.genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!summary || isSaving || isSaved) return

    setIsSaving(true)
    setSaveNotice(null)
    try {
      const result = await saveDocument({
        title: deriveTitle(text),
        originalText: text,
        briefSummary: mode === 'breve' ? summary : null,
        detailedSummary: mode === 'detallado' ? summary : null,
        summaryLanguage,
      })
      setIsSaved(true)

      // Ya quedo guardado localmente (useSync lo sincroniza solo cuando
      // vuelva la conexion) — se avisa sin bloquear el flujo, mismo
      // criterio que el resto de la app ante falta de red.
      if (result.status === 'pending') {
        setSaveNotice(t('summarize.savePending'))
        setTimeout(() => setSaveNotice(null), 8000)
      }
    } catch (err) {
      console.error(err)
      setError(t('summarize.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = (format: ExportFormat) => {
    if (!summary) return

    if (format === 'pdf') {
      window.print()
      return
    }

    const input = {
      title: deriveTitle(text),
      summary,
      createdAt: new Date(),
      dateLabel: t('export.dateLabel'),
      languageLabel: t('export.languageLabel'),
      languageName: t(
        summaryLanguage === 'en' ? 'export.languageEn' : 'export.languageEs'
      ),
      summaryHeading: t('export.summaryHeading'),
      fileBaseName: t('export.fileBaseName'),
    }

    if (format === 'markdown') exportSummaryAsMarkdown(input)
    else exportSummaryAsText(input)
  }

  const hasText = text.trim().length > 0

  return (
    <div className="min-h-screen bg-background">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16 sm:pt-24">
        <section className="no-print mb-12 text-center animate-fade-in">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            {t('hero.title1')}
            <br />
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              {t('hero.titleHighlight')}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
            {t('hero.subtitle')}
          </p>
        </section>

        <div className="space-y-6">
          <div className="no-print">
            <UploadZone
              text={text}
              onTextChange={handleTextChange}
              disabled={isLoading}
            />
          </div>

          <div className="no-print flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 gap-2"
              disabled={!hasText || isLoading}
              onClick={() => handleSummarize('breve')}
            >
              {isLoading && mode === 'breve' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlignLeft className="h-4 w-4" />
              )}
              {t('buttons.brief')}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1 gap-2"
              disabled={!hasText || isLoading}
              onClick={() => handleSummarize('detallado')}
            >
              {isLoading && mode === 'detallado' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlignJustify className="h-4 w-4" />
              )}
              {t('buttons.detailed')}
            </Button>
          </div>

          <SummaryPanel
            summary={summary}
            mode={mode}
            isLoading={isLoading}
            error={error}
            isSpeechSupported={speech.isSupported}
            isSpeaking={speech.isSpeaking}
            isPaused={speech.isPaused}
            onSpeak={() => speech.speak(summary, summaryLanguage)}
            onPause={speech.pause}
            onResume={speech.resume}
            onStop={speech.stop}
            onSave={handleSave}
            isSaving={isSaving}
            isSaved={isSaved}
            saveNotice={saveNotice}
            onExport={handleExport}
          />
        </div>
      </main>

      <footer className="no-print border-t border-border/60 py-8">
        <p className="text-center text-xs text-muted-foreground">
          {t('summarize.footer')}
        </p>
      </footer>
    </div>
  )
}
