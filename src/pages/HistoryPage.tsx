import {useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {ArrowLeft, FileText, History, Loader2, RotateCcw} from 'lucide-react'
import {Header} from '@/components/Header'
import {Card, CardContent} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {useTheme} from '@/contexts/ThemeContext'
import {useDocuments} from '@/hooks/useDocuments'
import {useLanguage} from '@/contexts/LanguageContext'
import type {DocumentRecord} from '@/lib/documents'

export function HistoryPage() {
  const { theme, toggleTheme } = useTheme()
  const { documents, isLoading, hasError } = useDocuments()
  const { language, t } = useLanguage()
  const navigate = useNavigate()

  // Formatea cada fecha con el locale del idioma de la UI (no del idioma
  // del resumen guardado), consistente con el resto de las etiquetas.
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [language]
  )

  const handleReload = (doc: DocumentRecord) => {
    navigate('/', { state: { document: doc } })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16 sm:pt-24">
        <section className="mb-10 animate-fade-in">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 gap-1.5 px-2 text-muted-foreground"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('history.back')}
          </Button>

          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {t('history.title')}
          </h1>
          <p className="mt-2 text-balance text-muted-foreground">
            {t('history.subtitle')}
          </p>
        </section>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && hasError && (
          <Card>
            <CardContent className="p-6 text-sm text-destructive">
              {t('history.loadError')}
            </CardContent>
          </Card>
        )}

        {!isLoading && !hasError && documents.length === 0 && (
          <Card className="animate-fade-in">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <History className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t('history.empty')}
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !hasError && documents.length > 0 && (
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="animate-fade-in">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {doc.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {dateFormatter.format(new Date(doc.created_at))} ·{' '}
                        {doc.detailed_summary
                          ? t('history.tagDetailed')
                          : t('history.tagBrief')}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="shrink-0 gap-1.5"
                    onClick={() => handleReload(doc)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t('history.reload')}
                    </span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
