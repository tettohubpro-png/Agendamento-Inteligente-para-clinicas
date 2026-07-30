import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GoogleAuthShell } from './components/GoogleAuthShell'
import { ClinicProvider } from './context/ClinicContext'
import { AppLayout } from './components/AppLayout'
import { RequireAuth } from './components/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { AgendaPage } from './pages/AgendaPage'
import { PacientesPage } from './pages/PacientesPage'
import { AgendamentosPage } from './pages/AgendamentosPage'
import { ConfiguracoesPage } from './pages/ConfiguracoesPage'

export default function App() {
  return (
    <GoogleAuthShell>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <ClinicProvider>
                  <AppLayout />
                </ClinicProvider>
              </RequireAuth>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/pacientes" element={<PacientesPage />} />
            <Route path="/agendamentos" element={<AgendamentosPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GoogleAuthShell>
  )
}
