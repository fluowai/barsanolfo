import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Scale,
  Briefcase, Clock, CheckCircle2, AlertTriangle, Target, Activity,
  PieChart, Sparkles, Bot, Bell, Download, FileText, MessageSquare,
  UserPlus, Gavel, Percent, Zap, ChevronRight, ChevronDown, X,
  Search, Lightbulb, Award, RefreshCw, Loader2, Calendar, ArrowUp,
  ArrowDown, ExternalLink, Landmark, CreditCard, UserCheck, UserX,
  Ban, FileSignature, CalendarCheck, Flag,
} from 'lucide-react';
import './IntelligenceCenter.css';

type DashboardTab = 'executive' | 'commercial' | 'procedural' | 'financial' | 'productivity' | 'clients' | 'alerts' | 'copilot';

interface TabConfig {
  key: DashboardTab;
  label: string;
  icon: any;
  subtitle: string;
}

const TABS: TabConfig[] = [
  { key: 'executive', label: 'Executivo', icon: BarChart3, subtitle: 'Visão geral do escritório' },
  { key: 'commercial', label: 'Comercial', icon: TrendingUp, subtitle: 'Leads, conversão e funil' },
  { key: 'procedural', label: 'Processual', icon: Scale, subtitle: 'Processos por área e status' },
  { key: 'financial', label: 'Financeiro', icon: DollarSign, subtitle: 'Fluxo de caixa e projeções' },
  { key: 'productivity', label: 'Produtividade', icon: Activity, subtitle: 'Performance da equipe' },
  { key: 'clients', label: 'Clientes', icon: Users, subtitle: 'Métricas de relacionamento' },
  { key: 'alerts', label: 'Alertas', icon: Bell, subtitle: 'Notificações inteligentes' },
  { key: 'copilot', label: 'Copiloto IA', icon: Bot, subtitle: 'Inteligência artificial executiva' },
];

const STORAGE_KEYS = { AUTH_TOKEN: 'woojuris_auth_token' };
const getHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}` });

const api = {
  get: async (url: string) => {
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },
  post: async (url: string, body: any) => {
    const res = await fetch(url, { method: 'POST', headers: { ...getHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.json();
  }
};

const fmt = {
  currency: (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  number: (v: number) => v.toLocaleString('pt-BR'),
  percent: (v: number) => `${v.toFixed(1)}%`,
  date: (d: string) => new Date(d).toLocaleDateString('pt-BR'),
};

function StatCard({ label, value, delta, icon: Icon, color, sub, positive }: { label: string; value: string; delta?: string; icon: any; color: string; sub?: string; positive?: boolean }) {
  return (
    <div className="ic-stat-card" style={{ borderTopColor: color }}>
      <div className="ic-stat-header">
        <div className="ic-stat-icon" style={{ background: `${color}15`, color }}>
          <Icon size={20} />
        </div>
        {delta !== undefined && (
          <span className={`ic-stat-delta ${positive ? 'up' : 'down'}`}>
            {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {delta}
          </span>
        )}
      </div>
      <div className="ic-stat-value">{value}</div>
      <div className="ic-stat-label">{label}</div>
      {sub && <div className="ic-stat-sub">{sub}</div>}
    </div>
  );
}

function ProgressBar({ value, max, color, label }: { value: number; max: number; color: string; label?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="ic-progress">
      {label && <div className="ic-progress-label">{label}</div>}
      <div className="ic-progress-track">
        <div className="ic-progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="ic-progress-value">{fmt.number(value)}</div>
    </div>
  );
}

function SimpleBarChart({ data, color, format }: { data: { label: string; value: number }[]; color: string; format?: (v: number) => string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="ic-chart-bars">
      {data.map((d, i) => (
        <div key={i} className="ic-bar-item">
          <span className="ic-bar-label">{d.label}</span>
          <div className="ic-bar-track">
            <div className="ic-bar-fill" style={{ width: `${(d.value / max) * 100}%`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }} />
          </div>
          <span className="ic-bar-value">{format ? format(d.value) : fmt.number(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

function FunnelChart({ stages, color }: { stages: { stage: string; count: number }[]; color: string }) {
  const max = Math.max(...stages.map(s => s.count), 1);
  return (
    <div className="ic-funnel">
      {stages.map((s, i) => (
        <div key={i} className="ic-funnel-item" style={{ width: `${(s.count / max) * 85 + 15}%` }}>
          <span className="ic-funnel-stage">{s.stage}</span>
          <span className="ic-funnel-count">{fmt.number(s.count)}</span>
          <div className="ic-funnel-bar" style={{ background: color, opacity: 0.5 + (i / stages.length) * 0.5, height: 28 }} />
        </div>
      ))}
    </div>
  );
}

function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="ic-metric-row">
      <span className="ic-metric-label">{label}</span>
      <span className="ic-metric-value" style={{ color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function RankCard({ rank, name, score, cases, tasks, deadlines, isUser }: { rank: number; name: string; score: number; cases: number; tasks: number; deadlines: number; isUser?: boolean }) {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className={`ic-rank-card ${isUser ? 'current' : ''}`}>
      <div className="ic-rank-position">{rank <= 3 ? medals[rank - 1] : `#${rank}`}</div>
      <div className="ic-rank-avatar" style={{ background: `var(--gold-primary)` }}>
        {name.charAt(0)}
      </div>
      <div className="ic-rank-info">
        <div className="ic-rank-name">{name}</div>
        <div className="ic-rank-stats">{fmt.number(cases)} casos • {fmt.number(tasks)} tarefas • {fmt.number(deadlines)} prazos</div>
      </div>
      <div className="ic-rank-score">
        <div className="ic-rank-score-value">{score}%</div>
        <div className="ic-rank-score-label">Score</div>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: any }) {
  const icons: Record<string, any> = { case_inactive: Gavel, client_inactive: UserX, overdue_invoice: Ban, contract_expiring: FileSignature, critical_deadline: CalendarCheck };
  const Icon = icons[alert.type] || Bell;
  const colors: Record<string, string> = { critical: 'var(--red)', warning: 'var(--orange)', info: 'var(--blue)' };
  return (
    <div className="ic-alert-card" style={{ borderLeftColor: colors[alert.severity] || 'var(--gold-primary)' }}>
      <div className="ic-alert-icon" style={{ color: colors[alert.severity] || 'var(--gold-primary)' }}>
        <Icon size={18} />
      </div>
      <div className="ic-alert-content">
        <div className="ic-alert-title">{alert.title}</div>
        <div className="ic-alert-desc">{alert.description}</div>
      </div>
      <span className={`ic-alert-badge ${alert.severity}`}>{alert.severity}</span>
    </div>
  );
}

function ExportMenu({ onExport }: { onExport: (format: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ic-export-menu" style={{ position: 'relative' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => setOpen(!open)}>
        <Download size={14} /> Exportar
      </button>
      {open && (
        <div className="ic-export-dropdown" onClick={() => setOpen(false)}>
          <button onClick={() => onExport('pdf')}><FileText size={14} /> PDF Executivo</button>
          <button onClick={() => onExport('excel')}><BarChart3 size={14} /> Excel</button>
          <button onClick={() => onExport('powerpoint')}><PieChart size={14} /> PowerPoint</button>
        </div>
      )}
    </div>
  );
}

function ExecutiveDashboard({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="ic-dashboard">
      <div className="ic-metrics-grid">
        <StatCard label="Faturamento do Mês" value={fmt.currency(data.revenueThisMonth)} delta={`${data.revenueThisMonth > data.revenueLastMonth ? '+' : ''}${data.revenueThisMonth > 0 ? ((data.revenueThisMonth - data.revenueYesterday) / data.revenueYesterday * 100).toFixed(1) : '0'}%`} icon={DollarSign} color="#10B981" positive={data.revenueThisMonth >= data.revenueYesterday} />
        <StatCard label="Faturamento Anual" value={fmt.currency(data.revenueThisYear)} icon={TrendingUp} color="#3B82F6" />
        <StatCard label="Honorários Previstos" value={fmt.currency(data.forecastFees)} icon={Target} color="#8B5CF6" />
        <StatCard label="Honorários Recebidos" value={fmt.currency(data.receivedFees)} icon={CheckCircle2} color="#10B981" />
        <StatCard label="Honorários em Atraso" value={fmt.currency(data.overdueFees)} icon={AlertTriangle} color="#EF4444" positive={false} />
        <StatCard label="Ticket Médio" value={fmt.currency(data.avgTicket)} icon={Percent} color="#F59E0B" />
        <StatCard label="Lucro Estimado" value={fmt.currency(data.estimatedProfit)} icon={Activity} color="#10B981" positive={data.estimatedProfit > 0} />
        <StatCard label="Receita Recorrente" value={fmt.currency(data.recurringRevenue)} icon={RefreshCw} color="#06B6D4" />
      </div>
      <div className="ic-compare-row">
        <span className="ic-compare-title">Comparativo</span>
        <div className="ic-compare-grid">
          <div className="ic-compare-item"><span className="ic-compare-label">Hoje</span><span className="ic-compare-value">{fmt.currency(data.revenueToday)}</span></div>
          <div className="ic-compare-item"><span className="ic-compare-label">Ontem</span><span className="ic-compare-value">{fmt.currency(data.revenueYesterday)}</span></div>
          <div className="ic-compare-item"><span className="ic-compare-label">Últimos 7 dias</span><span className="ic-compare-value">{fmt.currency(data.revenueLast7)}</span></div>
          <div className="ic-compare-item"><span className="ic-compare-label">Últimos 30 dias</span><span className="ic-compare-value">{fmt.currency(data.revenueLast30)}</span></div>
          <div className="ic-compare-item"><span className="ic-compare-label">Últimos 12 meses</span><span className="ic-compare-value">{fmt.currency(data.revenueLast12m)}</span></div>
        </div>
      </div>
      <div className="ic-card">
        <div className="ic-card-header"><h4><TrendingUp size={16} /> Receita vs Despesas (6 meses)</h4></div>
        <div className="ic-card-body">
          <div className="ic-chart-line">
            {data.monthlyData?.map((m: any, i: number) => (
              <div key={i} className="ic-chart-column">
                <div className="ic-chart-bars-stacked">
                  <div className="ic-chart-bar-expense" style={{ height: `${(m.expenses / Math.max(...data.monthlyData.map((x: any) => x.revenue + x.expenses), 1)) * 120}px`, background: '#EF4444' }} />
                  <div className="ic-chart-bar-income" style={{ height: `${(m.revenue / Math.max(...data.monthlyData.map((x: any) => x.revenue + x.expenses), 1)) * 120}px`, background: '#10B981' }} />
                </div>
                <span className="ic-chart-label">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="ic-legend">
            <span><span style={{ background: '#10B981' }} /> Receita</span>
            <span><span style={{ background: '#EF4444' }} /> Despesas</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommercialDashboard({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="ic-dashboard">
      <div className="ic-metrics-grid">
        <StatCard label="Leads Captados" value={fmt.number(data.totalLeads)} icon={UserPlus} color="#3B82F6" />
        <StatCard label="Leads Qualificados" value={fmt.number(data.qualifiedLeads)} icon={Target} color="#8B5CF6" />
        <StatCard label="Contratos Enviados" value={fmt.number(data.contractsSent)} icon={FileText} color="#F59E0B" />
        <StatCard label="Contratos Assinados" value={fmt.number(data.contractsSigned)} icon={CheckCircle2} color="#10B981" />
        <StatCard label="Taxa de Conversão" value={fmt.percent(data.conversionRate)} icon={Percent} color="#10B981" positive={data.conversionRate > 20} />
        <StatCard label="Valor Potencial" value={fmt.currency(data.potentialValue)} icon={DollarSign} color="#06B6D4" />
      </div>
      <div className="ic-grid-2">
        <div className="ic-card">
          <div className="ic-card-header"><h4><PieChart size={16} /> Leads por Origem</h4></div>
          <div className="ic-card-body">
            <SimpleBarChart data={(data.leadsBySource || []).map((s: any) => ({ label: s.source, value: s.count }))} color="#3B82F6" />
          </div>
        </div>
        <div className="ic-card">
          <div className="ic-card-header"><h4><BarChart3 size={16} /> Funil de Vendas</h4></div>
          <div className="ic-card-body">
            <FunnelChart stages={(data.funnelStages || []).filter((s: any) => s.count > 0)} color="#8B5CF6" />
          </div>
        </div>
      </div>
      <div className="ic-card">
        <div className="ic-card-header"><h4><Scale size={16} /> Leads por Área Jurídica</h4></div>
        <div className="ic-card-body">
          <div className="ic-areas-grid">
            {(data.leadsByArea || []).map((a: any, i: number) => (
              <div key={i} className="ic-area-item">
                <span className="ic-area-name">{a.area}</span>
                <div className="ic-area-bar-track">
                  <div className="ic-area-bar-fill" style={{ width: `${Math.min((a.count / Math.max(...data.leadsByArea.map((x: any) => x.count), 1)) * 100, 100)}%`, background: `hsl(${i * 45}, 70%, 55%)` }} />
                </div>
                <span className="ic-area-count">{fmt.number(a.count)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProceduralDashboard({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="ic-dashboard">
      <div className="ic-metrics-grid">
        <StatCard label="Processos Ativos" value={fmt.number(data.activeCases)} icon={Scale} color="#3B82F6" />
        <StatCard label="Processos Finalizados" value={fmt.number(data.closedCases)} icon={CheckCircle2} color="#10B981" />
        <StatCard label="Taxa de Êxito" value={fmt.percent(data.successRate)} icon={Target} color="#10B981" positive={data.successRate > 50} />
        <StatCard label="Processos Parados" value={fmt.number(data.inactiveCases)} icon={AlertTriangle} color="#EF4444" positive={false} />
        <StatCard label="Valor Total em Causas" value={fmt.currency(data.totalCaseValue)} icon={DollarSign} color="#F59E0B" />
        <StatCard label="Valor Médio por Caso" value={fmt.currency(data.avgCaseValue)} icon={TrendingUp} color="#06B6D4" />
      </div>
      <div className="ic-grid-2">
        <div className="ic-card">
          <div className="ic-card-header"><h4><PieChart size={16} /> Processos por Área</h4></div>
          <div className="ic-card-body">
            <SimpleBarChart data={(data.casesByArea || []).map((a: any) => ({ label: a.area, value: a.count }))} color="#8B5CF6" />
          </div>
        </div>
        <div className="ic-card">
          <div className="ic-card-header"><h4><Activity size={16} /> Processos por Status</h4></div>
          <div className="ic-card-body">
            <SimpleBarChart data={(data.statusCounts || []).map((s: any) => ({ label: s.status, value: s.count }))} color="#3B82F6" />
          </div>
        </div>
      </div>
      <div className="ic-card">
        <div className="ic-card-header"><h4><Activity size={16} /> Mapa de Calor Processual</h4></div>
        <div className="ic-card-body">
          <div className="ic-heatmap">
            {(data.casesByArea || []).map((a: any, i: number) => {
              const pct = Math.max(...data.casesByArea.map((x: any) => x.count), 1);
              const intensity = (a.count / pct) * 100;
              return (
                <div key={i} className="ic-heatmap-cell" style={{ background: `rgba(59, 130, 246, ${intensity / 100})`, border: '1px solid var(--border)' }}>
                  <div className="ic-heatmap-value">{fmt.number(a.count)}</div>
                  <div className="ic-heatmap-label">{a.area}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialDashboard({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="ic-dashboard">
      <div className="ic-metrics-grid">
        <StatCard label="Total Recebido" value={fmt.currency(data.totalIncome)} icon={TrendingUp} color="#10B981" positive={true} />
        <StatCard label="Total de Despesas" value={fmt.currency(data.totalExpenses)} icon={TrendingDown} color="#EF4444" positive={false} />
        <StatCard label="Fluxo de Caixa" value={fmt.currency(data.cashFlow)} icon={Activity} color={data.cashFlow > 0 ? '#10B981' : '#EF4444'} positive={data.cashFlow > 0} />
        <StatCard label="A Receber" value={fmt.currency(data.toReceive)} icon={DollarSign} color="#3B82F6" />
        <StatCard label="A Pagar" value={fmt.currency(data.toPay)} icon={CreditCard} color="#F59E0B" />
        <StatCard label="Inadimplência" value={fmt.percent(data.defaultRate)} icon={AlertTriangle} color="#EF4444" positive={data.defaultRate < 10} />
      </div>
      <div className="ic-card">
        <div className="ic-card-header"><h4><Calendar size={16} /> Projeção de Receita</h4></div>
        <div className="ic-card-body">
          <div className="ic-projection">
            <div className="ic-projection-item"><span>Próximos 30 dias</span><span className="ic-projection-value">{fmt.currency(data.future30)}</span></div>
            <div className="ic-projection-item"><span>Próximos 60 dias</span><span className="ic-projection-value">{fmt.currency(data.future60)}</span></div>
            <div className="ic-projection-item"><span>Próximos 90 dias</span><span className="ic-projection-value">{fmt.currency(data.future90)}</span></div>
          </div>
        </div>
      </div>
      <div className="ic-grid-2">
        <div className="ic-card">
          <div className="ic-card-header"><h4><PieChart size={16} /> Receita por Categoria</h4></div>
          <div className="ic-card-body">
            <SimpleBarChart data={(data.revenueByCategory || []).map((c: any) => ({ label: c.category, value: c.value }))} color="#10B981" format={(v) => fmt.currency(v)} />
          </div>
        </div>
        <div className="ic-card">
          <div className="ic-card-header"><h4><Activity size={16} /> Fluxo Mensal</h4></div>
          <div className="ic-card-body">
            <div className="ic-chart-line">
              {(data.monthlyData || []).map((m: any, i: number) => (
                <div key={i} className="ic-chart-column">
                  <div className="ic-chart-bars-stacked">
                    <div className="ic-chart-bar-expense" style={{ height: `${Math.min((m.expense / Math.max(...data.monthlyData.map((x: any) => Math.max(x.income, x.expense)), 1)) * 120, 120)}px`, background: '#EF4444' }} />
                    <div className="ic-chart-bar-income" style={{ height: `${Math.min((m.income / Math.max(...data.monthlyData.map((x: any) => Math.max(x.income, x.expense)), 1)) * 120, 120)}px`, background: '#10B981' }} />
                  </div>
                  <span className="ic-chart-label">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="ic-legend">
              <span><span style={{ background: '#10B981' }} /> Receita</span>
              <span><span style={{ background: '#EF4444' }} /> Despesa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductivityDashboard({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="ic-dashboard">
      <div className="ic-metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard label="Produtividade Média" value={fmt.percent(data.avgProductivity)} icon={Activity} color="#8B5CF6" />
        <StatCard label="Total de Profissionais" value={fmt.number(data.totalLawyers)} icon={Users} color="#3B82F6" />
        <StatCard label="Top Performer" value={(data.ranking && data.ranking[0]?.name) || '-'} icon={Award} color="#F59E0B" />
      </div>
      <div className="ic-card">
        <div className="ic-card-header"><h4><Award size={16} /> Ranking de Produtividade</h4></div>
        <div className="ic-card-body">
          {(data.ranking || []).map((p: any, i: number) => (
            <RankCard key={i} rank={p.rank} name={p.name} score={p.productivityScore} cases={p.casesCount} tasks={p.tasksDone} deadlines={p.deadlinesDone} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClientsDashboard({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="ic-dashboard">
      <div className="ic-metrics-grid">
        <StatCard label="Clientes Ativos" value={fmt.number(data.activeClients)} icon={Users} color="#10B981" />
        <StatCard label="Novos Clientes (mês)" value={fmt.number(data.newClients)} icon={UserPlus} color="#3B82F6" />
        <StatCard label="Churn" value={fmt.percent(data.churnRate)} icon={UserX} color="#EF4444" positive={data.churnRate < 10} />
        <StatCard label="NPS" value={fmt.number(data.nps)} icon={Target} color="#8B5CF6" sub="/100" />
        <StatCard label="Satisfação" value={`${data.satisfaction}/5`} icon={Award} color="#F59E0B" />
        <StatCard label="Tempo Médio Atendimento" value={`${data.avgResponseTime}h`} icon={Clock} color="#06B6D4" />
      </div>
      <div className="ic-grid-2">
        <div className="ic-card">
          <div className="ic-card-header"><h4><TrendingUp size={16} /> Crescimento de Clientes</h4></div>
          <div className="ic-card-body">
            <SimpleBarChart data={(data.clientGrowth || []).map((c: any) => ({ label: c.month, value: c.count }))} color="#10B981" />
          </div>
        </div>
        <div className="ic-card">
          <div className="ic-card-header"><h4><Activity size={16} /> Métricas de Relacionamento</h4></div>
          <div className="ic-card-body">
            <div className="ic-metrics-list">
              <MetricRow label="Clientes Ativos" value={fmt.number(data.activeClients)} color="#10B981" />
              <MetricRow label="Novos Clientes (mês)" value={fmt.number(data.newClients)} color="#3B82F6" />
              <MetricRow label="Clientes Recorrentes" value={fmt.number(data.recurringClients)} color="#8B5CF6" />
              <MetricRow label="Churn (total)" value={fmt.number(data.churned)} color="#EF4444" />
              <MetricRow label="Dias desde Criação (médio)" value={fmt.number(data.avgDaysSinceCreation)} color="#F59E0B" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertsDashboard({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="ic-dashboard">
      <div className="ic-metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard label="Total de Alertas" value={fmt.number(data.totalAlerts)} icon={Bell} color="#3B82F6" />
        <StatCard label="Críticos" value={fmt.number(data.criticalCount)} icon={AlertTriangle} color="#EF4444" />
        <StatCard label="Atenção" value={fmt.number(data.warningCount)} icon={Flag} color="#F59E0B" />
      </div>
      <div className="ic-card">
        <div className="ic-card-header"><h4><Bell size={16} /> Central de Alertas Inteligentes</h4></div>
        <div className="ic-card-body">
          {(data.alerts || []).length === 0 ? (
            <div className="ic-empty">Nenhum alerta no momento</div>
          ) : (
            (data.alerts || []).map((a: any, i: number) => <AlertCard key={i} alert={a} />)
          )}
        </div>
      </div>
    </div>
  );
}

function CopilotDashboard() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<{ q: string; a: string }[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [execData, setExecData] = useState<any>(null);

  useEffect(() => {
    api.get('/api/intelligence/executive').then(r => { if (r.success) setExecData(r.data); });
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);

  const ask = async (q?: string) => {
    const query = q || question;
    if (!query.trim() || loading) return;
    setLoading(true);
    setAnswer('');
    try {
      const res = await api.post('/api/intelligence/ai-copilot', { question: query });
      if (res.success) {
        setAnswer(res.answer);
        setChat(prev => [...prev, { q: query, a: res.answer }]);
      }
    } catch { } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  const suggestions = [
    'Por que meu faturamento caiu?',
    'Qual advogado está sobrecarregado?',
    'Quais clientes têm maior potencial?',
    'Qual área jurídica é mais lucrativa?',
  ];

  return (
    <div className="ic-dashboard">
      <div className="ic-grid-2">
        <div className="ic-card" style={{ gridColumn: '1 / -1' }}>
          <div className="ic-card-header">
            <h4><Bot size={16} /> Copiloto Jurídico - IA Executiva</h4>
          </div>
          <div className="ic-card-body">
            <div className="ic-copilot-chat" ref={chatRef}>
              {chat.length === 0 ? (
                <div className="ic-copilot-empty">
                  <Bot size={48} />
                  <h3>O que você quer saber?</h3>
                  <p>Faça perguntas sobre seu escritório em linguagem natural</p>
                  <div className="ic-suggestions">
                    {suggestions.map((s, i) => (
                      <button key={i} className="ic-suggestion-btn" onClick={() => { setQuestion(s); ask(s); }}>
                        <Lightbulb size={12} /> {s}
                      </button>
                    ))}
                  </div>
                  {execData && (
                    <div className="ic-copilot-summary">
                      <div className="ic-copilot-summary-title">Resumo Executivo</div>
                      <div className="ic-copilot-summary-grid">
                        <div><span>Faturamento</span><strong>{fmt.currency(execData.revenueThisMonth)}</strong></div>
                        <div><span>Processos</span><strong>{fmt.number(execData.activeCases || 0)} ativos</strong></div>
                        <div><span>Inadimplência</span><strong>{fmt.currency(execData.overdueFees)}</strong></div>
                        <div><span>Lucro</span><strong>{fmt.currency(execData.estimatedProfit)}</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                chat.map((c, i) => (
                  <div key={i} className="ic-copilot-message">
                    <div className="ic-copilot-question"><Bot size={16} /> {c.q}</div>
                    <div className="ic-copilot-answer"><Sparkles size={14} /> {c.a.split('\n').map((l, j) => <span key={j}>{l}<br /></span>)}</div>
                  </div>
                ))
              )}
              {loading && (
                <div className="ic-copilot-loading">
                  <Loader2 size={20} className="spin" /> Analisando dados do escritório...
                </div>
              )}
            </div>
            <div className="ic-copilot-input">
              <input type="text" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="Faça uma pergunta sobre o escritório..." />
              <button onClick={() => ask()} disabled={loading || !question.trim()} className="btn btn-primary btn-sm">
                {loading ? <Loader2 size={14} className="spin" /> : <Send size={14} />} Perguntar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Send(props: any) { return <MessageSquare {...props} />; }

export default function IntelligenceCenter() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('executive');
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [exec, comm, proc, fin, prod, cli, alerts] = await Promise.all([
        api.get('/api/intelligence/executive'),
        api.get('/api/intelligence/commercial'),
        api.get('/api/intelligence/procedural'),
        api.get('/api/intelligence/financial'),
        api.get('/api/intelligence/productivity'),
        api.get('/api/intelligence/clients'),
        api.get('/api/intelligence/alerts'),
      ]);
      setData({
        executive: exec.data,
        commercial: comm.data,
        procedural: proc.data,
        financial: fin.data,
        productivity: prod.data,
        clients: cli.data,
        alerts: alerts.data,
      });
    } catch (err) {
      setError('Erro ao carregar dados. Verifique o servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); const i = setInterval(fetchAll, 60000); return () => clearInterval(i); }, [fetchAll]);

  const exportReport = (format: string) => {
    const tabData = data[activeTab];
    if (!tabData) return;
    if (format === 'pdf') {
      window.print();
    } else {
      const jsonStr = JSON.stringify(tabData, null, 2);
      const blob = new Blob([jsonStr], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `woojuris-${activeTab}.${format === 'excel' ? 'csv' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const renderDashboard = () => {
    switch (activeTab) {
      case 'executive': return <ExecutiveDashboard data={data.executive} />;
      case 'commercial': return <CommercialDashboard data={data.commercial} />;
      case 'procedural': return <ProceduralDashboard data={data.procedural} />;
      case 'financial': return <FinancialDashboard data={data.financial} />;
      case 'productivity': return <ProductivityDashboard data={data.productivity} />;
      case 'clients': return <ClientsDashboard data={data.clients} />;
      case 'alerts': return <AlertsDashboard data={data.alerts} />;
      case 'copilot': return <CopilotDashboard />;
      default: return null;
    }
  };

  const currentTab = TABS.find(t => t.key === activeTab);

  if (loading && !data.executive) {
    return (
      <div className="ic-loading">
        <div className="loading-spinner lg" />
        <p>Carregando Centro de Inteligência...</p>
      </div>
    );
  }

  return (
    <div className="ic-container">
      <div className="ic-header">
        <div className="ic-header-left">
          <div className="ic-header-icon"><Sparkles size={24} /></div>
          <div>
            <h1>Centro de Inteligência</h1>
            <p className="ic-header-sub">{currentTab?.subtitle}</p>
          </div>
        </div>
        <div className="ic-header-actions">
          <ExportMenu onExport={exportReport} />
          <button className="btn btn-ghost btn-sm" onClick={fetchAll} title="Atualizar">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="ic-tabs">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} className={`ic-tab ${isActive ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.key === 'alerts' && data.alerts?.criticalCount > 0 && (
                <span className="ic-tab-badge">{data.alerts.criticalCount}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="ic-content">{renderDashboard()}</div>
    </div>
  );
}
