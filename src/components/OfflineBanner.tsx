import {WifiOff} from 'lucide-react'
import {useLanguage} from '@/contexts/LanguageContext'
import {useOnlineStatus} from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const { t } = useLanguage()
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500/15 px-4 py-2 text-center text-sm text-amber-600 dark:text-amber-400">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>{t('offline.banner')}</span>
    </div>
  )
}
