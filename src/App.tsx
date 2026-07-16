import {Routes, Route} from 'react-router-dom'
import {ProtectedRoute} from '@/components/ProtectedRoute'
import {PublicOnlyRoute} from '@/components/PublicOnlyRoute'
import {OfflineBanner} from '@/components/OfflineBanner'
import {LoginPage} from '@/pages/LoginPage'
import {RegisterPage} from '@/pages/RegisterPage'
import {SummarizePage} from '@/pages/SummarizePage'
import {HistoryPage} from '@/pages/HistoryPage'

export default function App() {
  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<SummarizePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </>
  )
}
