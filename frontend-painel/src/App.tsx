import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MobileMenuProvider } from './contexts/MobileMenuContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import Cases from './pages/Cases';
import Financial from './pages/Financial';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Deadlines from './pages/Deadlines';
import Tasks from './pages/Tasks';
import Petitions from './pages/Petitions';
import PetitionSettings from './pages/PetitionSettings';
import Jurisprudence from './pages/Jurisprudence';
import WhatsApp from './pages/WhatsApp';
import Triage from './pages/Triage';
import Hearings from './pages/Hearings';
import Documents from './pages/Documents';
import Contracts from './pages/Contracts';
import Reports from './pages/Reports';
import Marketing from './pages/Marketing';
import Service from './pages/Service';
import Team from './pages/Team';
import Automations from './pages/Automations';
import './App.css';
import { STORAGE_KEYS } from './constants';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          setIsAuthenticated(false);
        });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1a1a1a',
        color: '#d4af37',
        fontFamily: 'system-ui, sans-serif'
      }}>
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <MobileMenuProvider>
        <BrowserRouter basename="/painel">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="clientes" element={<Clients />} />
              <Route path="processos" element={<Cases />} />
              <Route path="prazos" element={<Deadlines />} />
              <Route path="tarefas" element={<Tasks />} />
              <Route path="financeiro" element={<Financial />} />
              <Route path="triagem" element={<Triage />} />
              <Route path="audiencias" element={<Hearings />} />
              <Route path="documentos" element={<Documents />} />
              <Route path="contratos" element={<Contracts />} />
              <Route path="relatorios" element={<Reports />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="atendimento" element={<Service />} />
              <Route path="equipe" element={<Team />} />
              <Route path="automacoes" element={<Automations />} />
              <Route path="peticoes" element={<Petitions />} />
              <Route path="peticoes/configuracoes" element={<PetitionSettings />} />
              <Route path="jurisprudencia" element={<Jurisprudence />} />
              <Route path="whatsapp" element={<WhatsApp />} />
              <Route path="configuracoes" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MobileMenuProvider>
    </ErrorBoundary>
  );
}

export default App;
