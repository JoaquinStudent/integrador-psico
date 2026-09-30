import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PatientsPage } from './pages/PatientsPage'
import { PatientDetailPage } from './pages/PatientDetailPage'
import { TestCatalogPage } from './pages/TestCatalogPage'
import { NewSessionPage } from './pages/NewSessionPage'
import { PatientWelcomePage } from './pages/PatientWelcomePage'
import { PatientDrawingPage } from './pages/PatientDrawingPage'
import { PatientClosePage } from './pages/PatientClosePage'
import { ExaminerSessionPage } from './pages/ExaminerSessionPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { AnalysisPage } from './pages/AnalysisPage'
import { PostSessionPage } from './pages/PostSessionPage'
import { SessionsPage } from './pages/SessionsPage'
import { ReportsPage } from './pages/ReportsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Patient views — full screen, no sidebar */}
          <Route path="sesion/:id/paciente/bienvenida" element={<ProtectedRoute><PatientWelcomePage /></ProtectedRoute>} />
          <Route path="sesion/:id/paciente/dibujo" element={<ProtectedRoute><PatientDrawingPage /></ProtectedRoute>} />
          <Route path="sesion/:id/paciente/cierre" element={<ProtectedRoute><PatientClosePage /></ProtectedRoute>} />

          {/* Examiner session — with sidebar */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="pacientes" element={<PatientsPage />} />
            <Route path="pacientes/:id" element={<PatientDetailPage />} />
            <Route path="tests" element={<TestCatalogPage />} />
            <Route path="sesiones" element={<SessionsPage />} />
            <Route path="sesiones/nueva" element={<NewSessionPage />} />
            <Route path="sesion/:id" element={<ExaminerSessionPage />} />
            <Route path="sesion/:id/observaciones" element={<PostSessionPage />} />
            <Route path="sesion/:id/analisis" element={<AnalysisPage />} />
            <Route path="informes" element={<ReportsPage />} />
            <Route path="informes/:id" element={<ReportsPage />} />
            <Route path="ajustes" element={<PlaceholderPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
