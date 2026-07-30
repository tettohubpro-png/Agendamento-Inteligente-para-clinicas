import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GoogleAuthShell } from './components/GoogleAuthShell'
import { ErpProvider } from './context/ErpContext'
import { AuthProvider } from './context/AuthContext'
import { AppLayout } from './components/AppLayout'
import { RequireAuth } from './components/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { AgendaPage } from './pages/AgendaPage'
import { ClientesPage } from './pages/ClientesPage'
import { AgendamentosPage } from './pages/AgendamentosPage'
import { BarbeirosPage } from './pages/BarbeirosPage'
import { ServicosPage } from './pages/ServicosPage'
import { FinanceiroPage } from './pages/FinanceiroPage'
import { ComissoesPage } from './pages/ComissoesPage'
import { CaixaPage } from './pages/CaixaPage'
import { EstoquePage } from './pages/EstoquePage'
import { RelatoriosPage } from './pages/RelatoriosPage'
import { IaInternaPage } from './pages/IaInternaPage'
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
                <ErpProvider>
                  <AuthProvider>
                    <AppLayout />
                  </AuthProvider>
                </ErpProvider>
              </RequireAuth>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/agendamentos" element={<AgendamentosPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/barbeiros" element={<BarbeirosPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
            <Route path="/comissoes" element={<ComissoesPage />} />
            <Route path="/caixa" element={<CaixaPage />} />
            <Route path="/estoque" element={<EstoquePage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="/ia" element={<IaInternaPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GoogleAuthShell>
  )
}
