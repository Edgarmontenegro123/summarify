import {useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  History,
  Loader2,
  RotateCcw,
  Trash2,
  WifiOff,
} from 'lucide-react'
import {Header} from '@/components/Header'
import {Card, CardContent} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {cn} from '@/lib/utils'
import {useTheme} from '@/contexts/ThemeContext'
import {useDocuments} from '@/hooks/useDocuments'
import {useLanguage} from '@/contexts/LanguageContext'
import type {DocumentRecord} from '@/lib/documents'
import type {SummaryLanguage} from '@/types'

type LanguageFilter = SummaryLanguage | 'all'

const FILTER_OPTIONS: { value: LanguageFilter; labelKey: 'history.filterAll' | 'history.filterEs' | 'history.filterEn' }[] = [
  { value: 'all', labelKey: 'history.filterAll' },
  { value: 'es', labelKey: 'history.filterEs' },
  { value: 'en', labelKey: 'history.filterEn' },
]

export function HistoryPage() {
  const { theme, toggleTheme } = useTheme()
  const { documents, isLoading, hasError, isFromCache, deleteDocument } =
    useDocuments()
  const { language, t } = useLanguage()
  const navigate = useNavigate()

  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('all')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState(false)

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

  // Filtro puramente client-side sobre lo que ya esta cargado (ultimos 5) —
  // summary_language ya existe en el schema (migracion 0002), no hace
  // falta un campo/migracion nueva para esto.
  const filteredDocuments = useMemo(
    () =>
      languageFilter === 'all'
        ? documents
        : documents.filter((doc) => doc.summary_language === languageFilter),
    [documents, languageFilter]
  )

  const handleReload = (doc: DocumentRecord) => {
    navigate('/', { state: { document: doc } })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return
    const id = confirmDeleteId
    setConfirmDeleteId(null)
    setDeletingId(id)
    setDeleteError(false)
    try {
      await deleteDocument(id)
    } catch (err) {
      console.error(err)
      setDeleteError(true)
    } finally {
      setDeletingId(null)
    }
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

        {!isLoading && !hasError && documents.length > 0 && (
          <div
            role="group"
            aria-label={t('history.filterLabel')}
            className="mb-6 flex w-fit items-center gap-0.5 rounded-full border border-border bg-muted/50 p-0.5"
          >
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLanguageFilter(option.value)}
                aria-pressed={languageFilter === option.value}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors',
                  languageFilter === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        )}

        {deleteError && (
          <Card className="mb-4 animate-fade-in">
            <CardContent className="p-4 text-sm text-destructive">
              {t('history.deleteError')}
            </CardContent>
          </Card>
        )}

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
          <>
            {filteredDocuments.length === 0 ? (
              <Card className="animate-fade-in">
                <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                  <History className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('history.filterEmpty')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="animate-fade-in">
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium">
                              {doc.title}
                            </p>
                            {isFromCache && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                <WifiOff className="h-3 w-3" />
                                {t('history.offlineBadge')}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {dateFormatter.format(new Date(doc.created_at))} ·{' '}
                            {doc.detailed_summary
                              ? t('history.tagDetailed')
                              : t('history.tagBrief')}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleReload(doc)}
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {t('history.reload')}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t('history.deleteAria')}
                          disabled={deletingId === doc.id}
                          onClick={() => setConfirmDeleteId(doc.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          {deletingId === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('history.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('history.deleteConfirmBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('history.deleteCancel')}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteConfirm}>
              {t('history.deleteConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
