import { useState, useEffect, useCallback } from 'react';
import {
  Scale, Users, FileText, TrendingUp, DollarSign, Calendar, RefreshCw,
  Plus, ArrowRight, AlertTriangle, CheckSquare, Square,
  MessageSquare, Bot, Bell, CreditCard, ClipboardList, Gavel,
  Phone, Mail, Loader2, Sparkles, FileSearch, Clock, UserX,
  Ban, FileSignature, CalendarCheck, X
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

interface Alert {
  id: string;
  type: 'deadline' | 'lead' | 'payment' | 'contract' | 'hearing';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
}

const MOCK_RECENT_CASES: RecentCase[] = [
  { id: '1', number: '0012345-67.2024.8.26.0100', clientName: 'Maria Silva', type: 'Cível', status: 'ACTIVE', updatedAt: new Date().toISOString() },
  { id: '2', number: '0012346-67.2024.8.26.0100', clientName: 'João Santos', type: 'Trabalhista', status: 'ACTIVE', updatedAt: new Date().toISOString() },
  { id: '3', number: '0012347-67.2024.8.26.0100', clientName: 'Ana Oliveira', type: 'Tributário', status: 'SUSPENDED', updatedAt: new Date().toISOString() },
  { id: '4', number: '0012348-67.2024.8.26.0100', clientName: 'Carlos Lima', type: 'Cível', status: 'ACTIVE', updatedAt: new Date().toISOString() },
  { id: '5', number: '0012349-67.2024.8.26.0100', clientName: 'Fernanda Costa', type: 'Família', status: 'CLOSED', updatedAt: new Date().toISOString() },
];

const MOCK_DEADLINES: UpcomingDeadline[] = [
  { id: 'd1', caseNumber: '0012345-67.2024', caseId: '1', description: 'Contestação - Prazo final', dueDate: new Date(Date.now() + 1 * 86400000).toISOString(), daysLeft: 1, completed: false },
  { id: 'd2', caseNumber: '0012346-67.2024', caseId: '2', description: 'Recurso Ordinário', dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), daysLeft: 3, completed: false },
  { id: 'd3', caseNumber: '0012347-67.2024', caseId: '3', description: 'Embargos Declaratórios', dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), daysLeft: 5, completed: false },
  { id: 'd4', caseNumber: '0012348-67.2024', caseId: '4', description: 'Audiência de Conciliação', dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), daysLeft: 7, completed: false },
  { id: 'd5', caseNumber: '0012349-67.2024', caseId: '5', description: 'Petição de esclarecimentos', dueDate: new Date(Date.now() + 14 * 86400000).toISOString(), daysLeft: 14, completed: false },
];

const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Elaborar petição inicial', dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), status: 'TODO', priority: 'HIGH', assignedTo: 'Dr. Paulo' },
  { id: 't2', title: 'Analisar documentos do cliente', dueDate: new Date(Date.now() + 4 * 86400000).toISOString(), status: 'TODO', priority: 'MEDIUM', assignedTo: 'Dra. Carla' },
  { id: 't3', title: 'Revisar contrato de honorários', dueDate: new Date(Date.now() + 1 * 86400000).toISOString(), status: 'IN_PROGRESS', priority: 'HIGH', assignedTo: 'Dr. Paulo' },
  { id: 't4', title: 'Agendar audiência', dueDate: new Date(Date.now() + 6 * 86400000).toISOString(), status: 'TODO', priority: 'LOW', assignedTo: 'Dra. Carla' },
  { id: 't5', title: 'Atualizar planilha de prazos', dueDate: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'TODO', priority: 'URGENT', assignedTo: 'Dr. Paulo' },
  { id: 't6', title: 'Preparar defesa preventiva', dueDate: new Date(Date.now() + 10 * 86400000).toISOString(), status: 'TODO', priority: 'MEDIUM', assignedTo: 'Dra. Carla' },
];

const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'Roberto Almeida', phone: '(11) 99999-0001', email: 'roberto@email.com', type: 'Pessoa Física', status: 'NEW', createdAt: new Date().toISOString() },
  { id: 'l2', name: 'Empresa ABC Ltda', phone: '(11) 99999-0002', email: 'contato@abc.com', type: 'Pessoa Jurídica', status: 'CONTACTED', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'l3', name: 'Juliana Mendes', phone: '(11) 99999-0003', email: 'juliana@email.com', type: 'Pessoa Física', status: 'NEW', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'l4', name: 'Construtora Nova Era', phone: '(11) 99999-0004', email: 'adm@novaera.com', type: 'Pessoa Jurídica', status: 'QUALIFIED', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'l5', name: 'Pedro Souza', phone: '(11) 99999-0005', email: 'pedro@email.com', type: 'Pessoa Física', status: 'NEW', createdAt: new Date().toISOString() },
];

const MOCK_WHATSAPP: WhatsAppMessage[] = [
  { id: 'w1', phone: '(11) 98888-0001', name: 'Maria Silva', message: 'Bom dia, gostaria de saber sobre o andamento do meu processo...', direction: 'INCOMING', createdAt: new Date().toISOString() },
  { id: 'w2', phone: '(11) 98888-0002', name: 'João Santos', message: 'Ok, vou enviar os documentos solicitados ainda hoje.', direction: 'OUTGOING', createdAt: new Date().toISOString() },
  { id: 'w3', phone: '(11) 98888-0003', name: 'Ana Oliveira', message: 'Recebi a notificação. Quando podemos agendar uma reunião?', direction: 'INCOMING', createdAt: new Date().toISOString() },
  { id: 'w4', phone: '(11) 98888-0004', name: 'Carlos Lima', message: 'Preciso de ajuda com a petição inicial.', direction: 'INCOMING', createdAt: new Date().toISOString() },
];

const MOCK_ALERTS: Alert[] = [
  { id: 'a1', type: 'deadline', title: 'Prazo Crítico', description: 'Contestação do processo 0012345-67.2024 vence em 1 dia', severity: 'critical' },
  { id: 'a2', type: 'lead', title: 'Lead Urgente sem Resposta', description: 'Roberto Almeida aguarda contato há mais de 48h', severity: 'warning' },
  { id: 'a3', type: 'payment', title: 'Cliente Inadimplente', description: 'João Santos possui 2 faturas em aberto (R$ 3.500,00)', severity: 'critical' },
  { id: 'a4', type: 'contract', title: 'Contrato Pendente', description: 'Contrato de honorários com Ana Oliveira aguarda assinatura', severity: 'warning' },
  { id: 'a5', type: 'hearing', title: 'Audiência Próxima', description: 'Audiência de conciliação do processo 0012348-67.2024 em 7 dias', severity: 'info' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCases: 5, activeCases: 3, closedCases: 1,
    totalClients: 12, totalLeads: 20, newLeadsThisWeek: 3,
    pendingTasks: 5, upcomingDeadlines: 3,
    monthlyRevenue: 45000, pendingRevenue: 12500,
  });

  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [selectedCaseForAnalysis, setSelectedCaseForAnalysis] = useState('');

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`
  });

  const generateAIInsights = (
    deadlines: UpcomingDeadline[],
    leadsList: Lead[],
    pendingTasksCount: number,
    statsData: Stats
  ): AIInsight[] => {
    const insights: AIInsight[] = [];
    const criticalDeadlines = deadlines.filter(d => d.daysLeft <= 3);
    if (criticalDeadlines.length > 0) {
      insights.push({
        type: 'deadline',
        title: 'Prazos Críticos Detectados',
        description: `${criticalDeadlines.length} prazo(s) com menos de 3 dias. Priorize imediatamente.`,
        priority: 'high'
      });
    }
    const newLeads = leadsList.filter(l => l.status === 'NEW');
    if (newLeads.length > 2) {
      insights.push({
        type: 'opportunity',
        title: 'Leads Aguardando Contato',
        description: `${newLeads.length} leads novos precisam de atendimento.`,
        priority: 'medium'
      });
    }
    if (pendingTasksCount > 5) {
      insights.push({
        type: 'recommendation',
        title: 'Acúmulo de Tarefas',
        description: `${pendingTasksCount} tarefas pendentes. Considere redistribuir para a equipe.`,
        priority: 'medium'
      });
    }
    const pendingRatio = statsData.pendingRevenue / statsData.monthlyRevenue;
    if (pendingRatio > 0.3) {
      insights.push({
        type: 'risk',
        title: 'Risco Financeiro',
        description: `${formatCurrency(statsData.pendingRevenue)} em receita pendente (${(pendingRatio * 100).toFixed(0)}% do mês).`,
        priority: 'high'
      });
    }
    insights.push({
      type: 'recommendation',
      title: 'Sugestão de Petição',
      description: 'Baseado nos processos ativos, há oportunidade de gerar petições para movimentações recentes.',
      priority: 'low'
    });
    return insights;
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [casesRes, clientsRes, leadsRes, tasksRes, deadlinesRes] = await Promise.all([
        fetch('/api/cases', { headers: getAuthHeaders() }),
        fetch('/api/clients', { headers: getAuthHeaders() }),
        fetch('/api/leads?status=NEW', { headers: getAuthHeaders() }),
        fetch('/api/tasks', { headers: getAuthHeaders() }),
        fetch('/api/deadlines', { headers: getAuthHeaders() })
      ]);

      const [casesData, clientsData, leadsData, tasksData, deadlinesData] = await Promise.all([
        casesRes.json().catch(() => ({ success: false })),
        clientsRes.json().catch(() => ({ success: false })),
        leadsRes.json().catch(() => ({ success: false })),
        tasksRes.json().catch(() => ({ success: false })),
        deadlinesRes.json().catch(() => ({ success: false })),
      ]);

      let whatsappData = { success: false, messages: [] };
      try {
        const waRes = await fetch('/api/whatsapp/messages?limit=5', { headers: getAuthHeaders() });
        whatsappData = await waRes.json();
      } catch { /* wa unavailable */ }

      const cases = casesData.success ? casesData.cases || [] : MOCK_RECENT_CASES;
      const clients = clientsData.success ? clientsData.clients || [] : [];
      const leadsList = leadsData.success ? leadsData.leads || [] : MOCK_LEADS;
      const tasksList = tasksData.success ? tasksData.tasks || [] : MOCK_TASKS;
      const deadlinesList = deadlinesData.success ? deadlinesData.deadlines || [] : MOCK_DEADLINES;
      const waMessages = whatsappData.success ? whatsappData.messages || [] : MOCK_WHATSAPP;

      const activeCases = cases.filter((c: any) => c.status === 'ACTIVE').length;
      const closedCasesCount = cases.filter((c: any) => c.status === 'CLOSED' || c.status === 'ARCHIVED').length;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newLeads = leadsList.filter((l: any) => new Date(l.createdAt) > oneWeekAgo).length;

      const pendingTasksCount = tasksList.filter((t: any) => t.status !== 'DONE' && t.status !== 'CANCELLED').length;

      const today = new Date();
      const deadlines = deadlinesList
        .filter((d: any) => !d.completed)
        .map((d: any) => {
          const due = new Date(d.dueDate);
          const diffTime = due.getTime() - today.getTime();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            id: d.id,
            caseNumber: d.case?.number || d.caseNumber || 'N/A',
            caseId: d.caseId || d.case?.id || '',
            description: d.description,
            dueDate: d.dueDate,
            daysLeft,
            completed: d.completed,
          };
        })
        .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
        .slice(0, 8);

      const newStats: Stats = {
        totalCases: cases.length,
        activeCases,
        closedCases: closedCasesCount,
        totalClients: clients.length,
        totalLeads: leadsList.length,
        newLeadsThisWeek: newLeads,
        pendingTasks: pendingTasksCount,
        upcomingDeadlines: deadlines.length,
        monthlyRevenue: 45000,
        pendingRevenue: 12500,
      };

      setStats(newStats);
      setRecentCases(cases.slice(0, 5).map((c: any) => ({
        id: c.id,
        number: c.number,
        clientName: c.client?.name || c.clientName || 'N/A',
        type: c.type,
        status: c.status,
        updatedAt: c.updatedAt,
      })));
      setUpcomingDeadlines(deadlines);
      setTasks(tasksList.filter((t: any) => t.status !== 'DONE').slice(0, 6));
      setLeads(leadsList.slice(0, 5));
      setWhatsappMessages(waMessages.slice(0, 4));
      setAlerts(MOCK_ALERTS);
      setAiInsights(generateAIInsights(deadlines, leadsList, pendingTasksCount, newStats));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Não foi possível carregar os dados. Exibindo dados locais.');
      setRecentCases(MOCK_RECENT_CASES);
      setUpcomingDeadlines(MOCK_DEADLINES);
      setTasks(MOCK_TASKS);
      setLeads(MOCK_LEADS);
      setWhatsappMessages(MOCK_WHATSAPP);
      setAlerts(MOCK_ALERTS);
      setAiInsights(generateAIInsights(MOCK_DEADLINES, MOCK_LEADS, 5, {
        totalCases: 5, activeCases: 3, closedCases: 1,
        totalClients: 12, totalLeads: 20, newLeadsThisWeek: 3,
        pendingTasks: 5, upcomingDeadlines: 3,
        monthlyRevenue: 45000, pendingRevenue: 12500,
      }));
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
        const caseData = recentCases.find(c => c.id === selectedCaseForAnalysis);
        setAnalysisResult(
          `ANÁLISE DO PROCESSO ${caseData?.number || ''}\n\n` +
          `Status: ${caseData?.status || 'N/A'}\n` +
          `Tipo: ${caseData?.type || 'N/A'}\n` +
          `Cliente: ${caseData?.clientName || 'N/A'}\n\n` +
          `RECOMENDAÇÕES:\n` +
          `- Verificar prazos processuais pendentes\n` +
          `- Analisar movimentações recentes no DataJud\n` +
          `- Preparar defesa preventiva se aplicável\n` +
          `- Agendar audiências com antecedência\n`
        );
      }
    } catch {
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
    } catch { /* optimistic */ }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const convertLead = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    try {
      await fetch(`/api/leads/${leadId}/convert`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch { /* optimistic */ }
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const dismissAlert = (id: string) => {
    setDismissedAlerts(prev => new Set(prev).add(id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR');
    } catch {
      return date;
    }
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
    return <span className={`deadline-indicator ${p.class}`} style={{ padding: '2px 8px', fontSize: '11px' }}>{p.label}</span>;
  };

  const getDeadlineIndicator = (daysLeft: number) => {
    if (daysLeft <= 3) return 'urgent';
    if (daysLeft <= 7) return 'warning';
    return 'success';
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'deadline': return <Clock size={16} />;
      case 'lead': return <UserX size={16} />;
      case 'payment': return <Ban size={16} />;
      case 'contract': return <FileSignature size={16} />;
      case 'hearing': return <CalendarCheck size={16} />;
    }
  };

  const getAlertColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
    }
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

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.has(a.id));

  return (
    <div className="dashboard-360">
      {/* Error Banner */}
      {error && (
        <div className="dashboard-error-banner">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Alert Cards */}
      {visibleAlerts.length > 0 && (
        <div className="dashboard-alerts">
          {visibleAlerts.map(alert => (
            <div key={alert.id} className={`dashboard-alert-card alert-${alert.severity}`}>
              <div className="alert-icon" style={{ color: getAlertColor(alert.severity) }}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="alert-content">
                <p className="alert-title">{alert.title}</p>
                <p className="alert-desc">{alert.description}</p>
              </div>
              <button className="alert-dismiss" onClick={() => dismissAlert(alert.id)} title="Dispensar">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

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
              <h3><Scale size={18} /> Processos Recentes</h3>
              <a href="/painel/processos">Ver todos <ArrowRight size={14} /></a>
            </div>
            <div className="dashboard-card-body compact">
              {recentCases.length === 0 ? (
                <p className="empty-text">Nenhum processo encontrado</p>
              ) : recentCases.map(c => (
                <div
                  key={c.id}
                  className={`case-row ${selectedCaseForAnalysis === c.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCaseForAnalysis(c.id)}
                >
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
              <h3><Bell size={18} /> Prazos Críticos</h3>
              <a href="/painel/prazos">Ver todos <ArrowRight size={14} /></a>
            </div>
            <div className="dashboard-card-body compact">
              {upcomingDeadlines.length === 0 ? (
                <p className="empty-text">Nenhum prazo próximo</p>
              ) : upcomingDeadlines.slice(0, 5).map(d => (
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
              <h3><CheckSquare size={18} /> Tarefas Pendentes</h3>
              <a href="/painel/tarefas">Ver todas <ArrowRight size={14} /></a>
            </div>
            <div className="dashboard-card-body compact">
              {tasks.length === 0 ? (
                <p className="empty-text">Nenhuma tarefa pendente</p>
              ) : tasks.map(t => (
                <div key={t.id} className="task-row">
                  <div className="task-check" onClick={() => toggleTask(t.id, t.status)}>
                    {t.status === 'DONE' ? <CheckSquare size={16} className="checked" /> : <Square size={16} />}
                  </div>
                  <div className="task-info">
                    <p className={`task-title ${t.status === 'DONE' ? 'done' : ''}`}>{t.title}</p>
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
              <h3><TrendingUp size={18} /> Leads Recentes</h3>
              <a href="/painel/leads">Ver todos <ArrowRight size={14} /></a>
            </div>
            <div className="dashboard-card-body compact">
              {leads.length === 0 ? (
                <p className="empty-text">Nenhum lead recente</p>
              ) : leads.map(l => (
                <div key={l.id} className="lead-row">
                  <div className="lead-info">
                    <p className="lead-name">{l.name}</p>
                    <p className="lead-contact"><Phone size={12} /> {l.phone} • <Mail size={12} /> {l.email}</p>
                  </div>
                  <button className="btn-mini" onClick={() => convertLead(l.id)}>Converter</button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis Panel */}
          <div className="dashboard-card ai-card">
            <div className="dashboard-card-header">
              <h3><Bot size={18} /> Agente IA - Análise de Processos</h3>
              <button
                className="btn-mini primary"
                onClick={analyzeCaseWithAI}
                disabled={!selectedCaseForAnalysis || analyzing}
              >
                {analyzing ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} Analisar
              </button>
            </div>
            <div className="dashboard-card-body">
              {selectedCaseForAnalysis ? (
                <p className="ai-selected">
                  Analisando: {recentCases.find(c => c.id === selectedCaseForAnalysis)?.number}
                </p>
              ) : (
                <p className="ai-hint">Clique em um processo à esquerda para analisar com IA</p>
              )}
              {analysisResult && (
                <pre className="ai-result">{analysisResult}</pre>
              )}
              {!selectedCaseForAnalysis && !analysisResult && (
                <div className="ai-empty-state">
                  <Bot size={32} />
                  <p>Selecione um processo e clique em "Analisar" para obter insights gerados por IA</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: AI Insights + WhatsApp + Financial + Quick Actions */}
        <div className="dashboard-360-col">
          {/* AI Insights */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><Sparkles size={18} /> Insights da IA</h3>
            </div>
            <div className="dashboard-card-body compact">
              {aiInsights.length === 0 ? (
                <p className="empty-text">Nenhum insight disponível</p>
              ) : aiInsights.map((insight, idx) => (
                <div key={idx} className={`insight-row insight-${insight.priority}`}>
                  <div className="insight-icon">
                    {insight.type === 'risk' && <AlertTriangle size={16} />}
                    {insight.type === 'opportunity' && <TrendingUp size={16} />}
                    {insight.type === 'deadline' && <Bell size={16} />}
                    {insight.type === 'recommendation' && <Sparkles size={16} />}
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
              <h3><MessageSquare size={18} /> WhatsApp Recente</h3>
              <a href="/painel/whatsapp">Abrir <ArrowRight size={14} /></a>
            </div>
            <div className="dashboard-card-body compact">
              {whatsappMessages.length === 0 ? (
                <p className="empty-text">Nenhuma mensagem recente</p>
              ) : whatsappMessages.map(msg => (
                <div key={msg.id} className="wa-row">
                  <div className={`wa-direction ${msg.direction}`}>
                    {msg.direction === 'INCOMING' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="wa-phone">{msg.name || msg.phone}</p>
                    <p className="wa-msg">{msg.message.substring(0, 60)}{msg.message.length > 60 ? '...' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><CreditCard size={18} /> Resumo Financeiro</h3>
              <a href="/painel/financeiro">Ver todos <ArrowRight size={14} /></a>
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
                <span>Inadimplência</span>
                <span className="fin-value danger">{formatCurrency(stats.pendingRevenue * 0.4)}</span>
              </div>
              <div className="fin-row">
                <span>Processos Ativos</span>
                <span>{stats.activeCases}</span>
              </div>
              <button className="btn-block" onClick={() => window.location.href = '/painel/financeiro'}>
                <DollarSign size={16} /> Gerar Cobrança
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><Plus size={18} /> Ações Rápidas</h3>
            </div>
            <div className="dashboard-card-body quick-actions-grid">
              <button className="quick-btn" onClick={() => window.location.href = '/painel/peticoes'}>
                <FileText size={18} /> Nova Petição
              </button>
              <button className="quick-btn" onClick={() => window.location.href = '/painel/clientes'}>
                <Users size={18} /> Novo Cliente
              </button>
              <button className="quick-btn" onClick={() => window.location.href = '/painel/processos'}>
                <Gavel size={18} /> Novo Processo
              </button>
              <button className="quick-btn" onClick={() => window.location.href = '/painel/jurisprudencia'}>
                <FileSearch size={18} /> Jurisprudência
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
