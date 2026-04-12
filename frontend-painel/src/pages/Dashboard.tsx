import { useState, useEffect } from 'react';
import { 
  Scale, 
  Users, 
  FileText, 
  TrendingUp,
  DollarSign, 
  Calendar, 
  RefreshCw, 
  Plus,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { STORAGE_KEYS } from '../constants';
import './Dashboard.css';

interface Stats {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  totalClients: number;
  totalLeads: number;
  newLeadsThisWeek: number;
  pendingTasks: number;
  upcomingDeadlines: number;
  monthlyRevenue: number;
  pendingRevenue: number;
}

interface RecentCase {
  id: string;
  number: string;
  clientName: string;
  type: string;
  status: string;
  updatedAt: string;
}

interface UpcomingDeadline {
  id: string;
  caseNumber: string;
  description: string;
  dueDate: string | Date;
  daysLeft: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    totalClients: 0,
    totalLeads: 0,
    newLeadsThisWeek: 0,
    pendingTasks: 0,
    upcomingDeadlines: 0,
    monthlyRevenue: 0,
    pendingRevenue: 0,
  });
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [casesRes, clientsRes, leadsRes] = await Promise.all([
        fetch('/api/cases', { headers: getAuthHeaders() }),
        fetch('/api/clients', { headers: getAuthHeaders() }),
        fetch('/api/leads', { headers: getAuthHeaders() })
      ]);

      const [casesData, clientsData, leadsData] = await Promise.all([
        casesRes.json(),
        clientsRes.json(),
        leadsRes.json()
      ]);

      const cases = casesData.success ? casesData.cases || [] : [];
      const clients = clientsData.success ? clientsData.clients || [] : [];
      const leads = leadsData.success ? leadsData.leads || [] : [];

      const activeCases = cases.filter((c: any) => c.status === 'ACTIVE').length;
      const closedCases = cases.filter((c: any) => c.status === 'CLOSED' || c.status === 'ARCHIVED').length;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newLeads = leads.filter((l: any) => new Date(l.createdAt) > oneWeekAgo).length;

      setStats({
        totalCases: cases.length,
        activeCases,
        closedCases,
        totalClients: clients.length,
        totalLeads: leads.length,
        newLeadsThisWeek: newLeads,
        pendingTasks: 5,
        upcomingDeadlines: 3,
        monthlyRevenue: 45000,
        pendingRevenue: 12500,
      });

      setRecentCases(cases.slice(0, 5).map((c: any) => ({
        id: c.id,
        number: c.number,
        clientName: c.client?.name || 'N/A',
        type: c.type,
        status: c.status,
        updatedAt: c.updatedAt,
      })));

      const today = new Date();
      setUpcomingDeadlines([
        { id: '1', caseNumber: '0012345-67.2024', description: 'Alegações finais', dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), daysLeft: 3 },
        { id: '2', caseNumber: '0023456-78.2024', description: 'Audiência de Conciliação', dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), daysLeft: 5 },
        { id: '3', caseNumber: '0034567-89.2024', description: 'Recurso ao TRT', dueDate: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000), daysLeft: 8 },
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { class: string; label: string }> = {
      ACTIVE: { class: 'active', label: 'Ativo' },
      SUSPENDED: { class: 'suspended', label: 'Suspenso' },
      CLOSED: { class: 'closed', label: 'Encerrado' },
      ARCHIVED: { class: 'closed', label: 'Arquivado' },
    };
    const s = statusMap[status] || { class: '', label: status };
    return <span className={`status-badge ${s.class}`}>{s.label}</span>;
  };

  const getDeadlineIndicator = (daysLeft: number) => {
    if (daysLeft <= 3) return 'urgent';
    if (daysLeft <= 7) return 'warning';
    return 'success';
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="dashboard-loading">
        <RefreshCw size={32} />
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-header">
          <div className="welcome-text">
            <h1>Bem-vindo ao <span>Barsa</span></h1>
            <p>Acompanhe o desempenho do seu escritório em tempo real</p>
          </div>
          <div className="welcome-date">
            <Calendar size={16} />
            <span>{today}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Scale size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Processos Ativos</p>
            <p className="stat-value">{stats.totalCases}</p>
            <div className="stat-meta">
              <span className="stat-badge success">{stats.activeCases} ativos</span>
              <span className="stat-badge">{stats.closedCases} encerrados</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Clientes</p>
            <p className="stat-value">{stats.totalClients}</p>
            <div className="stat-meta">
              <span className="stat-badge warning">{stats.totalLeads} leads</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Novos Leads</p>
            <p className="stat-value">{stats.newLeadsThisWeek}</p>
            <div className="stat-meta">
              <span className="stat-badge info">esta semana</span>
            </div>
          </div>
        </div>

        <div className="stat-card primary">
          <div className="stat-icon primary">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Receita do Mês</p>
            <p className="stat-value">{formatCurrency(stats.monthlyRevenue)}</p>
            <div className="stat-meta">
              <span className="stat-badge warning">{formatCurrency(stats.pendingRevenue)} pendente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <a href="/painel/peticoes" className="quick-action">
          <div className="quick-action-icon">
            <FileText size={20} />
          </div>
          <div className="quick-action-content">
            <p className="quick-action-title">Nova Petição</p>
            <p className="quick-action-desc">Criar documento</p>
          </div>
          <ChevronRight size={18} />
        </a>

        <a href="/painel/clientes" className="quick-action">
          <div className="quick-action-icon">
            <Users size={20} />
          </div>
          <div className="quick-action-content">
            <p className="quick-action-title">Novo Cliente</p>
            <p className="quick-action-desc">Cadastrar pessoa</p>
          </div>
          <ChevronRight size={18} />
        </a>

        <a href="/painel/processos" className="quick-action">
          <div className="quick-action-icon">
            <Scale size={20} />
          </div>
          <div className="quick-action-content">
            <p className="quick-action-title">Novo Processo</p>
            <p className="quick-action-desc">Abrir caso</p>
          </div>
          <ChevronRight size={18} />
        </a>

        <a href="/painel/leads" className="quick-action">
          <div className="quick-action-icon">
            <TrendingUp size={20} />
          </div>
          <div className="quick-action-content">
            <p className="quick-action-title">Ver Leads</p>
            <p className="quick-action-desc">Oportunidades</p>
          </div>
          <ChevronRight size={18} />
        </a>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Recent Cases */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">
                <Scale size={20} />
                Processos Recentes
              </h3>
              <a href="/painel/processos" className="dashboard-card-link">
                Ver todos <ArrowRight size={14} />
              </a>
            </div>
            <div className="dashboard-card-body">
              {recentCases.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Scale size={32} />
                  </div>
                  <h4>Nenhum processo</h4>
                  <p>Comece adicionando seu primeiro processo</p>
                  <a href="/painel/processos" className="btn btn-primary">
                    <Plus size={16} /> Cadastrar Processo
                  </a>
                </div>
              ) : (
                <div className="cases-list">
                  {recentCases.map((processCase) => (
                    <div key={processCase.id} className="case-item">
                      <div className="case-info">
                        <p className="case-number">{processCase.number}</p>
                        <p className="case-client">{processCase.clientName}</p>
                      </div>
                      <div className="case-meta">
                        {getStatusBadge(processCase.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">
                <Calendar size={20} />
                Prazos Próximos
              </h3>
              <a href="/painel/prazos" className="dashboard-card-link">
                Ver todos <ArrowRight size={14} />
              </a>
            </div>
            <div className="dashboard-card-body">
              <div className="deadlines-list">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="deadline-item">
                    <div className={`deadline-indicator ${getDeadlineIndicator(deadline.daysLeft)}`}>
                      <span className="deadline-days">{deadline.daysLeft}</span>
                      <span className="deadline-label">dias</span>
                    </div>
                    <div className="deadline-info">
                      <p className="deadline-case">{deadline.caseNumber}</p>
                      <p className="deadline-desc">{deadline.description}</p>
                      <p className="deadline-date">{formatDate(deadline.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Alerts */}
          <div className="dashboard-alerts" style={{ flexDirection: 'column' }}>
            <div className="alert-card warning">
              <div className="alert-icon">
                <Clock size={20} />
              </div>
              <div className="alert-content">
                <p className="alert-title">{stats.pendingTasks} tarefas pendentes</p>
                <p className="alert-desc">Verifique suas tarefas para hoje</p>
              </div>
            </div>

            <div className="alert-card danger">
              <div className="alert-icon">
                <AlertCircle size={20} />
              </div>
              <div className="alert-content">
                <p className="alert-title">{stats.upcomingDeadlines} prazos urgentes</p>
                <p className="alert-desc">Atenção aos prazos desta semana</p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">
                <CheckCircle size={20} />
                Status do Sistema
              </h3>
            </div>
            <div className="dashboard-card-body">
              <div className="system-status">
                <div className="system-item">
                  <span className="system-dot online"></span>
                  <span className="system-name">API Backend</span>
                  <span className="system-status-text">Online</span>
                </div>
                <div className="system-item">
                  <span className="system-dot online"></span>
                  <span className="system-name">Database</span>
                  <span className="system-status-text">Conectado</span>
                </div>
                <div className="system-item">
                  <span className="system-dot warning"></span>
                  <span className="system-name">DataJud</span>
                  <span className="system-status-text">Parcial</span>
                </div>
                <div className="system-item">
                  <span className="system-dot offline"></span>
                  <span className="system-name">WhatsApp</span>
                  <span className="system-status-text">Pendente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
