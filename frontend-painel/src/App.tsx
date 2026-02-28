import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MobileMenuProvider } from './contexts/MobileMenuContext';
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
import './App.css';

function App() {
  // TODO: Implementar autenticação real
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
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
            <Route path="configuracoes" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MobileMenuProvider>
  );
}

export default App;

