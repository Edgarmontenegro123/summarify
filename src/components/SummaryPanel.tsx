import {useState} from 'react'
import {
  Volume2,
  Pause,
  Play,
  Square,
  Copy,
  Check,
  FileWarning,
  Save,
  Loader2,
  Download,
  Printer,
  FileCode,
  FileType,
} from 'lucide-react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {useLanguage} from '@/contexts/LanguageContext'
import type {SummaryMode} from '@/types'

export type ExportFormat = 'pdf' | 'markdown' | 'text'

interface SummaryPanelProps {
  summary: string
  mode: SummaryMode | null
  isLoading: boolean
  error: string | null
  isSpeechSupported: boolean
  isSpeaking: boolean
  isPaused: boolean
  onSpeak: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onSave?: () => void
  isSaving?: boolean
  isSaved?: boolean
  onExport?: (format: ExportFormat) => void
}

export function SummaryPanel({
  summary,
  mode,
  isLoading,
  error,
  isSpeechSupported,
  isSpeaking,
  isPaused,
  onSpeak,
  onPause,
  onResume,
  onStop,
  onSave,
  isSaving,
  isSaved,
  onExport,
}: SummaryPanelProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  if (!isLoading && !summary && !error) return null

  return (
    <Card className="print-summary animate-fade-in">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          {mode === 'breve'
            ? t('summaryPanel.titleBrief')
            : mode === 'detallado'
              ? t('summaryPanel.titleDetailed')
              : t('summaryPanel.titleGeneric')}
        </CardTitle>

        {summary && !isLoading && (
          <div className="no-print flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              aria-label={t('summaryPanel.copyAria')}
            >
              {copied ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            {isSpeechSupported && (
              <>
                {!isSpeaking && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onSpeak}
                    className="gap-1.5"
                  >
                    <Volume2 className="h-4 w-4" />
                    {t('summaryPanel.readAloud')}
                  </Button>
                )}
                {isSpeaking && !isPaused && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onPause}
                    className="gap-1.5"
                  >
                    <Pause className="h-4 w-4" />
                    {t('summaryPanel.pause')}
                  </Button>
                )}
                {isSpeaking && isPaused && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onResume}
                    className="gap-1.5"
                  >
                    <Play className="h-4 w-4" />
                    {t('summaryPanel.resume')}
                  </Button>
                )}
                {isSpeaking && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onStop}
                    aria-label={t('summaryPanel.stopAria')}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}

            {onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <Download className="h-4 w-4" />
                    {t('export.button')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onExport('pdf')}>
                    <Printer className="h-4 w-4" />
                    {t('export.asPdf')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('markdown')}>
                    <FileCode className="h-4 w-4" />
                    {t('export.asMarkdown')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('text')}>
                    <FileType className="h-4 w-4" />
                    {t('export.asText')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse-soft rounded bg-muted" />
            <div className="h-4 w-11/12 animate-pulse-soft rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse-soft rounded bg-muted" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-start gap-3 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            <FileWarning className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && summary && (
          <>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
              {summary}
            </p>

            {onSave && (
              <div className="no-print mt-5 border-t border-border/60 pt-4">
                <Button
                  variant={isSaved ? 'ghost' : 'secondary'}
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving || isSaved}
                  className="gap-1.5"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSaved ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaved ? t('summaryPanel.saved') : t('summaryPanel.save')}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
