import {type ReactNode} from 'react'
import {Sparkles} from 'lucide-react'
import {ThemeToggle} from '@/components/ThemeToggle'
import {useTheme} from '@/contexts/ThemeContext'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-[17px] font-semibold tracking-tight">
            Summarify
          </span>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8 text-center">
            <h1 className="text-balance text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-balance text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
