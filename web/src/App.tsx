import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GoogleAuthShell } from './components/GoogleAuthShell'
import { BarbeariaProvider } from './context/BarbeariaContext'
import { AppLayout } from './components/AppLayout'
import { RequireAuth } from './components/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { AgendaPage } from './pages/AgendaPage'
import { ClientesPage } from './pages/ClientesPage'
import { AgendamentosPage } from './pages/AgendamentosPage'
import { ServicosPage } from './pages/ServicosPage'
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
                <BarbeariaProvider>
                  <AppLayout />
                </BarbeariaProvider>
              </RequireAuth>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/agendamentos" element={<AgendamentosPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GoogleAuthShell>
  )
}
