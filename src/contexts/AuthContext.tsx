import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type {Session, User} from '@supabase/supabase-js'
import {supabase} from '@/lib/supabase'
import {translateAuthError} from '@/lib/authErrors'
import {clearCachedDocuments} from '@/lib/offlineCache'
import {useLanguage} from '@/contexts/LanguageContext'

interface AuthResult {
  error: string | null
  needsEmailConfirmation?: boolean
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  resetPasswordForEmail: (email: string) => Promise<AuthResult>
  updatePassword: (newPassword: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error: error ? translateAuthError(error.message, language) : null }
  }

  const signUp = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: translateAuthError(error.message, language) }

    // Si el proyecto de Supabase requiere confirmar el correo, signUp no
    // devuelve sesion todavia: hay que avisarle al usuario en vez de
    // asumir que ya quedo logueado.
    const needsEmailConfirmation = !data.session
    return { error: null, needsEmailConfirmation }
  }

  const signOut = async () => {
    // Se limpia antes de cerrar sesion para que, si otro usuario inicia
    // sesion despues en el mismo dispositivo, no pueda leer offline los
    // resumenes cacheados de esta cuenta.
    if (session?.user) await clearCachedDocuments(session.user.id)
    await supabase.auth.signOut()
  }

  const resetPasswordForEmail = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error ? translateAuthError(error.message, language) : null }
  }

  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error: error ? translateAuthError(error.message, language) : null }
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPasswordForEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
