import { useEffect, useState } from 'react';
import { Users, UserPlus, Scale, TrendingUp } from 'lucide-react';
import './Dashboard.css';

interface Stats {
  total: number;
  recent: number;
  byStatus: Array<{ status: string; _count: number }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/leads/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status: string) => {
    return stats?.byStatus.find(s => s.status === status)?._count || 0;
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral do escritório</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f6' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total de Leads</p>
            <p className="stat-value">{stats?.total || 0}</p>
            <p className="stat-change positive">+12% este mês</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b' }}>
            <UserPlus size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Novos (7 dias)</p>
            <p className="stat-value">{stats?.recent || 0}</p>
            <p className="stat-change positive">+{stats?.recent || 0} novos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b981' }}>
            <Scale size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Convertidos</p>
            <p className="stat-value">{getStatusCount('CONVERTED')}</p>
            <p className="stat-change positive">Taxa: {stats?.total ? Math.round((getStatusCount('CONVERTED') / stats.total) * 100) : 0}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#8b5cf6' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Em Andamento</p>
            <p className="stat-value">{getStatusCount('QUALIFIED')}</p>
            <p className="stat-change">Qualificados</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3 className="card-title">Atividades Recentes</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📩</div>
              <div className="activity-content">
                <p className="activity-text">Novo lead recebido</p>
                <p className="activity-time">Há 5 minutos</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-content">
                <p className="activity-text">Lead convertido em cliente</p>
                <p className="activity-time">Há 1 hora</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">⚖️</div>
              <div className="activity-content">
                <p className="activity-text">Novo processo cadastrado</p>
                <p className="activity-time">Há 2 horas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="card-title">Próximos Prazos</h3>
          <div className="deadline-list">
            <div className="deadline-item urgent">
              <div className="deadline-date">
                <span className="deadline-day">15</span>
                <span className="deadline-month">JAN</span>
              </div>
              <div className="deadline-content">
                <p className="deadline-title">Audiência - Processo #1234</p>
                <p className="deadline-time">Amanhã às 14:00</p>
              </div>
            </div>
            <div className="deadline-item">
              <div className="deadline-date">
                <span className="deadline-day">18</span>
                <span className="deadline-month">JAN</span>
              </div>
              <div className="deadline-content">
                <p className="deadline-title">Prazo de recurso - Processo #5678</p>
                <p className="deadline-time">Em 4 dias</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
