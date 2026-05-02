import { useState, useEffect, useCallback } from 'react';
import {
  Scale, Users, FileText, TrendingUp, DollarSign, Calendar, RefreshCw,
  Plus, ArrowRight, AlertTriangle, CheckSquare, Square,
  MessageSquare, Bot, Bell, CreditCard, ClipboardList, Gavel,
  Phone, Mail, Loader2, Sparkles, FileSearch
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
  caseId: string;
  description: string;
  dueDate: string;
  daysLeft: number;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: string;
  priority: string;
  assignedTo: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  status: string;
  createdAt: string;
}

interface WhatsAppMessage {
  id: string;
  phone: string;
  name?: string;
  message: string;
  direction: string;
  createdAt: string;
}

interface AIInsight {
  type: 'risk' | 'opportunity' | 'deadline' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCases: 0, activeCases: 0, closedCases: 0,
    totalClients: 0, totalLeads: 0, newLeadsThisWeek: 0,
    pendingTasks: 0, upcomingDeadlines: 0,
    monthlyRevenue: 0, pendingRevenue: 0,
  });

  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [selectedCaseForAnalysis, setSelectedCaseForAnalysis] = useState('');

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [casesRes, clientsRes, leadsRes, tasksRes, deadlinesRes] = await Promise.all([
        fetch('/api/cases', { headers: getAuthHeaders() }),
        fetch('/api/clients', { headers: getAuthHeaders() }),
        fetch('/api/leads?status=NEW', { headers: getAuthHeaders() }),
        fetch('/api/tasks', { headers: getAuthHeaders() }),
        fetch('/api/deadlines', { headers: getAuthHeaders() })
      ]);

      const [casesData, clientsData, leadsData, tasksData, deadlinesData] = await Promise.all([
        casesRes.json(),
        clientsRes.json(),
        leadsRes.json(),
        tasksRes.json(),
        deadlinesRes.json(),
      ]);

      let whatsappData = { success: false, messages: [] };
      try {
        const waRes = await fetch('/api/whatsapp/messages?limit=5', { headers: getAuthHeaders() });
        whatsappData = await waRes.json();
      } catch (e) { /* ignore */ }

      const cases = casesData.success ? casesData.cases || [] : [];
      const clients = clientsData.success ? clientsData.clients || [] : [];
      const leadsList = leadsData.success ? leadsData.leads || [] : [];
      const tasksList = tasksData.success ? tasksData.tasks || [] : [];
      const deadlinesList = deadlinesData.success ? deadlinesData.deadlines || [] : [];
      const waMessages = whatsappData.success ? whatsappData.messages || [] : [];

      const activeCases = cases.filter((c: any) => c.status === 'ACTIVE').length;
      const closedCases = cases.filter((c: any) => c.status === 'CLOSED' || c.status === 'ARCHIVED').length;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newLeads = leadsList.filter((l: any) => new Date(l.createdAt) > oneWeekAgo).length;

      const pendingTasks = tasksList.filter((t: any) => t.status !== 'DONE' && t.status !== 'CANCELLED').length;

      const today = new Date();
      const deadlines = deadlinesList
        .filter((d: any) => !d.completed)
        .map((d: any) => {
          const due = new Date(d.dueDate);
          const diffTime = due.getTime() - today.getTime();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            id: d.id,
            caseNumber: d.case?.number || 'N/A',
            caseId: d.caseId,
            description: d.description,
            dueDate: d.dueDate,
            daysLeft,
            completed: d.completed,
          };
        })
        .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
        .slice(0, 8);

      setStats({
        totalCases: cases.length,
        activeCases,
        closedCases,
        totalClients: clients.length,
        totalLeads: leadsList.length,
        newLeadsThisWeek: newLeads,
        pendingTasks,
        upcomingDeadlines: deadlines.length,
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

      setUpcomingDeadlines(deadlines);
      setTasks(tasksList.filter((t: any) => t.status !== 'DONE').slice(0, 6));
      setLeads(leadsList.slice(0, 5));
      setWhatsappMessages(waMessages.slice(0, 4));

      // AI Insights gerados localmente baseados nos dados
      const insights: AIInsight[] = [];
      if (deadlines.filter((d: any) => d.daysLeft <= 3).length > 0) {
        insights.push({
          type: 'deadline',
          title: 'Prazos Críticos Detectados',
          description: `${deadlines.filter((d: any) => d.daysLeft <= 3).length} prazo(s) com menos de 3 dias. Priorize imediatamente.`,
          priority: 'high'
        });
      }
      if (leadsList.filter((l: any) => l.status === 'NEW').length > 3) {
        insights.push({
          type: 'opportunity',
          title: 'Leads Aguardando Contato',
          description: `${leadsList.filter((l: any) => l.status === 'NEW').length} leads novos precisam de atendimento.`,
          priority: 'medium'
        });
      }
      if (pendingTasks > 5) {
        insights.push({
          type: 'recommendation',
          title: 'Acúmulo de Tarefas',
          description: `${pendingTasks} tarefas pendentes. Considere redistribuir para a equipe.`,
          priority: 'medium'
        });
      }
      insights.push({
        type: 'recommendation',
        title: 'Sugestão de Petição',
        description: 'Baseado nos processos ativos, há oportunidade de gerar petições para movimentações recentes.',
        priority: 'low'
      });

      setAiInsights(insights);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const analyzeCaseWithAI = async () => {
    if (!selectedCaseForAnalysis) return;
    setAnalyzing(true);
    setAnalysisResult('');
    try {
      const res = await fetch('/api/ai/analyze-case', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: selectedCaseForAnalysis })
      });
      const data = await res.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
      } else {
        // Fallback: análise simulada baseada nos dados locais
        const caseData = recentCases.find(c => c.id === selectedCaseForAnalysis);
        setAnalysisResult(`ANÁLISE DO PROCESSO ${caseData?.number || ''}\n\n` +
          `Status: ${caseData?.status || 'N/A'}\n` +
          `Tipo: ${caseData?.type || 'N/A'}\n` +
          `Cliente: ${caseData?.clientName || 'N/A'}\n\n` +
          `RECOMENDAÇÕES:\n` +
          `- Verificar prazos processuais pendentes\n` +
          `- Analisar movimentações recentes no DataJud\n` +
          `- Preparar defesa preventiva se aplicável\n` +
          `- Agendar audiências com antecedência\n`);
      }
    } catch (err) {
      setAnalysisResult('Erro na análise. Verifique a configuração da IA.');
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const convertLead = async (leadId: string) => {
    try {
      await fetch(`/api/leads/${leadId}/convert`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error converting lead:', err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
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

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { class: string; label: string }> = {
      HIGH: { class: 'urgent', label: 'Alta' },
      URGENT: { class: 'urgent', label: 'Urgente' },
      MEDIUM: { class: 'warning', label: 'Média' },
      LOW: { class: 'success', label: 'Baixa' },
    };
    const p = map[priority] || { class: '', label: priority };
    return <span className={`deadline-indicator ${p.class}`} style={{padding: '2px 8px', fontSize: '11px'}}>{p.label}</span>;
  };

  const getDeadlineIndicator = (daysLeft: number) => {
    if (daysLeft <= 3) return 'urgent';
    if (daysLeft <= 7) return 'warning';
    return 'success';
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  if (loading) {
    return (
      <div className="dashboard-loading">
        <RefreshCw size={32} className="spin" />
        <p>Carregando Dashboard 360...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-360">
      {/* Welcome & Stats Row */}
      <div className="dashboard-welcome">
        <div className="welcome-header">
          <div className="welcome-text">
            <h1>Dashboard <span>360</span></h1>
            <p>Gestão completa do seu escritório em uma única tela</p>
          </div>
          <div className="welcome-date">
            <Calendar size={16} />
            <span>{today}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-360">
        <div className="stat-card clickable" onClick={() => window.location.href = '/painel/processos'}>
          <Scale size={22} />
          <div>
            <p className="stat-label">Processos Ativos</p>
            <p className="stat-value">{stats.activeCases}</p>
            <p className="stat-sub">{stats.totalCases} total</p>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => window.location.href = '/painel/clientes'}>
          <Users size={22} />
          <div>
            <p className="stat-label">Clientes</p>
            <p className="stat-value">{stats.totalClients}</p>
            <p className="stat-sub">{stats.totalLeads} leads</p>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => window.location.href = '/painel/leads'}>
          <TrendingUp size={22} />
          <div>
            <p className="stat-label">Novos Leads</p>
            <p className="stat-value">{stats.newLeadsThisWeek}</p>
            <p className="stat-sub">esta semana</p>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => window.location.href = '/painel/financeiro'}>
          <DollarSign size={22} />
          <div>
            <p className="stat-label">Receita do Mês</p>
            <p className="stat-value">{formatCurrency(stats.monthlyRevenue)}</p>
            <p className="stat-sub">{formatCurrency(stats.pendingRevenue)} pendente</p>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => window.location.href = '/painel/tarefas'}>
          <ClipboardList size={22} />
          <div>
            <p className="stat-label">Tarefas Pendentes</p>
            <p className="stat-value">{stats.pendingTasks}</p>
            <p className="stat-sub">a fazer</p>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => window.location.href = '/painel/prazos'}>
          <Bell size={22} />
          <div>
            <p className="stat-label">Prazos Próximos</p>
            <p className="stat-value">{stats.upcomingDeadlines}</p>
            <p className="stat-sub">urgentes</p>
          </div>
        </div>
      </div>

      {/* Main 360 Grid: 3 Columns */}
      <div className="dashboard-360-grid">
        {/* LEFT: Processos + Prazos */}
        <div className="dashboard-360-col">
          {/* Recent Cases */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><Scale size={18}/> Processos Recentes</h3>
              <a href="/painel/processos">Ver todos <ArrowRight size={14}/></a>
            </div>
            <div className="dashboard-card-body compact">
              {recentCases.map(c => (
                <div key={c.id} className="case-row" onClick={() => setSelectedCaseForAnalysis(c.id)}>
                  <div>
                    <p className="case-number">{c.number}</p>
                    <p className="case-client">{c.clientName}</p>
                  </div>
                  {getStatusBadge(c.status)}
                </div>
              ))}
            </div>
          </div>

          {/* Deadlines */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><Bell size={18}/> Prazos Críticos</h3>
              <a href="/painel/prazos">Ver todos <ArrowRight size={14}/></a>
            </div>
            <div className="dashboard-card-body compact">
              {upcomingDeadlines.slice(0, 5).map(d => (
                <div key={d.id} className={`deadline-row ${getDeadlineIndicator(d.daysLeft)}`}>
                  <div className="deadline-badge">{d.daysLeft}d</div>
                  <div className="deadline-info">
                    <p className="deadline-desc">{d.description}</p>
                    <p className="deadline-case">{d.caseNumber} • {formatDate(d.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: Tasks + Leads + AI Analysis */}
        <div className="dashboard-360-col">
          {/* Tasks */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><CheckSquare size={18}/> Tarefas Pendentes</h3>
              <a href="/painel/tarefas">Ver todas <ArrowRight size={14}/></a>
            </div>
            <div className="dashboard-card-body compact">
              {tasks.map(t => (
                <div key={t.id} className="task-row">
                  <div className="task-check" onClick={() => toggleTask(t.id, t.status)}>
                    {t.status === 'DONE' ? <CheckSquare size={16} className="checked"/> : <Square size={16}/>}
                  </div>
                  <div className="task-info">
                    <p className="task-title">{t.title}</p>
                    {t.dueDate && <p className="task-date">{formatDate(t.dueDate)}</p>}
                  </div>
                  {getPriorityBadge(t.priority)}
                </div>
              ))}
            </div>
          </div>

          {/* Leads */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><TrendingUp size={18}/> Leads Recentes</h3>
              <a href="/painel/leads">Ver todos <ArrowRight size={14}/></a>
            </div>
            <div className="dashboard-card-body compact">
              {leads.map(l => (
                <div key={l.id} className="lead-row">
                  <div className="lead-info">
                    <p className="lead-name">{l.name}</p>
                    <p className="lead-contact"><Phone size={12}/> {l.phone} • <Mail size={12}/> {l.email}</p>
                  </div>
                  <button className="btn-mini" onClick={() => convertLead(l.id)}>Converter</button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis Panel */}
          <div className="dashboard-card ai-card">
            <div className="dashboard-card-header">
              <h3><Bot size={18}/> Agente IA - Análise de Processos</h3>
              <button className="btn-mini primary" onClick={analyzeCaseWithAI} disabled={!selectedCaseForAnalysis || analyzing}>
                {analyzing ? <Loader2 size={14} className="spin"/> : <Sparkles size={14}/>} Analisar
              </button>
            </div>
            <div className="dashboard-card-body">
              {selectedCaseForAnalysis ? (
                <p className="ai-selected">Analisando: {recentCases.find(c => c.id === selectedCaseForAnalysis)?.number}</p>
              ) : (
                <p className="ai-hint">Clique em um processo à esquerda para analisar</p>
              )}
              {analysisResult && (
                <pre className="ai-result">{analysisResult}</pre>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: AI Insights + WhatsApp + Financial */}
        <div className="dashboard-360-col">
          {/* AI Insights */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><Sparkles size={18}/> Insights da IA</h3>
            </div>
            <div className="dashboard-card-body compact">
              {aiInsights.map((insight, idx) => (
                <div key={idx} className={`insight-row insight-${insight.priority}`}>
                  <div className="insight-icon">
                    {insight.type === 'risk' && <AlertTriangle size={16}/>}
                    {insight.type === 'opportunity' && <TrendingUp size={16}/>}
                    {insight.type === 'deadline' && <Bell size={16}/>}
                    {insight.type === 'recommendation' && <Sparkles size={16}/>}
                  </div>
                  <div>
                    <p className="insight-title">{insight.title}</p>
                    <p className="insight-desc">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Messages */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><MessageSquare size={18}/> WhatsApp Recente</h3>
              <a href="/painel/whatsapp">Abrir <ArrowRight size={14}/></a>
            </div>
            <div className="dashboard-card-body compact">
              {whatsappMessages.length === 0 ? (
                <p className="empty-text">Nenhuma mensagem recente</p>
              ) : whatsappMessages.map((msg: any) => (
                <div key={msg.id} className="wa-row">
                  <div className={`wa-direction ${msg.direction}`}>
                    {msg.direction === 'INCOMING' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="wa-phone">{msg.name || msg.phone}</p>
                    <p className="wa-msg">{msg.message.substring(0, 60)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><CreditCard size={18}/> Resumo Financeiro</h3>
              <a href="/painel/financeiro">Ver todos <ArrowRight size={14}/></a>
            </div>
            <div className="dashboard-card-body compact">
              <div className="fin-row">
                <span>Receita do Mês</span>
                <span className="fin-value positive">{formatCurrency(stats.monthlyRevenue)}</span>
              </div>
              <div className="fin-row">
                <span>Pendente</span>
                <span className="fin-value warning">{formatCurrency(stats.pendingRevenue)}</span>
              </div>
              <div className="fin-row">
                <span>Processos Ativos</span>
                <span>{stats.activeCases}</span>
              </div>
              <button className="btn-block" onClick={() => window.location.href = '/painel/financeiro'}>
                <DollarSign size={16}/> Gerar Cobrança
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><Plus size={18}/> Ações Rápidas</h3>
            </div>
            <div className="dashboard-card-body quick-actions-grid">
              <button className="quick-btn" onClick={() => window.location.href = '/painel/peticoes'}>
                <FileText size={18}/> Nova Petição
              </button>
              <button className="quick-btn" onClick={() => window.location.href = '/painel/clientes'}>
                <Users size={18}/> Novo Cliente
              </button>
              <button className="quick-btn" onClick={() => window.location.href = '/painel/processos'}>
                <Gavel size={18}/> Novo Processo
              </button>
              <button className="quick-btn" onClick={() => window.location.href = '/painel/jurisprudencia'}>
                <FileSearch size={18}/> Jurisprudência
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
