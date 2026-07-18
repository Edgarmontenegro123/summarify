import {Routes, Route} from 'react-router-dom'
import {ProtectedRoute} from '@/components/ProtectedRoute'
import {PublicOnlyRoute} from '@/components/PublicOnlyRoute'
import {OfflineBanner} from '@/components/OfflineBanner'
import {UpdateBanner} from '@/components/UpdateBanner'
import {ErrorDebugOverlay} from '@/components/ErrorDebugOverlay'
import {useSync} from '@/hooks/useSync'
import {LoginPage} from '@/pages/LoginPage'
import {RegisterPage} from '@/pages/RegisterPage'
import {ForgotPasswordPage} from '@/pages/ForgotPasswordPage'
import {ResetPasswordPage} from '@/pages/ResetPasswordPage'
import {SummarizePage} from '@/pages/SummarizePage'
import {HistoryPage} from '@/pages/HistoryPage'

export default function App() {
  useSync()

  return (
    <>
      <OfflineBanner />
      <UpdateBanner />
      <ErrorDebugOverlay />
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Sin guard: Supabase establece una sesion de recuperacion temporal
            al activar el token del email, y tanto ProtectedRoute (expulsa
            sin sesion) como PublicOnlyRoute (expulsa con sesion) la sacarian
            de esta pantalla en algun punto del flujo. ResetPasswordPage
            valida el estado de la sesion por su cuenta. */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<SummarizePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </>
  )
}
