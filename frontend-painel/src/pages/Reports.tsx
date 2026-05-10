import { useState } from 'react';
import {
  Download, BarChart3, TrendingUp, TrendingDown, DollarSign,
  Users, Briefcase, Clock, CheckCircle2, AlertTriangle,
  FileText, Percent, Target, Activity, PieChart
} from 'lucide-react';

type ReportTab = 'comercial' | 'juridico' | 'financeiro' | 'operacional';

interface MetricCard {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: typeof TrendingUp;
  color: string;
}

interface BarData {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

const COMERCIAL_METRICS: MetricCard[] = [
  { label: 'Leads no Mês', value: '127', delta: '+18%', positive: true, icon: Users, color: '#3B82F6' },
  { label: 'Taxa de Conversão', value: '32%', delta: '+5%', positive: true, icon: Target, color: '#10B981' },
  { label: 'Ticket Médio', value: 'R$ 18.500', delta: '+12%', positive: true, icon: DollarSign, color: 'var(--gold-primary)' },
  { label: 'Custo por Lead', value: 'R$ 42,00', delta: '-8%', positive: true, icon: TrendingDown, color: '#10B981' },
  { label: 'Propostas Enviadas', value: '43', delta: '+22%', positive: true, icon: FileText, color: '#8B5CF6' },
  { label: 'Leads Perdidos', value: '18', delta: '+8%', positive: false, icon: AlertTriangle, color: '#EF4444' },
];

const COMERCIAL_BARS: BarData[] = [
  { label: 'Site', value: 42, maxValue: 50, color: '#3B82F6' },
  { label: 'Google Ads', value: 35, maxValue: 50, color: '#F59E0B' },
  { label: 'Instagram', value: 28, maxValue: 50, color: '#E4405F' },
  { label: 'Facebook', value: 15, maxValue: 50, color: '#1877F2' },
  { label: 'LinkedIn', value: 22, maxValue: 50, color: '#0A66C2' },
  { label: 'Indicação', value: 30, maxValue: 50, color: '#10B981' },
];

const JURIDICO_METRICS: MetricCard[] = [
  { label: 'Processos Ativos', value: '234', delta: '+8%', positive: true, icon: Briefcase, color: '#3B82F6' },
  { label: 'Taxa de Êxito', value: '78%', delta: '+3%', positive: true, icon: CheckCircle2, color: '#10B981' },
  { label: 'Prazos Vencendo (7d)', value: '12', delta: '-5', positive: false, icon: Clock, color: '#F59E0B' },
  { label: 'Prazos Atrasados', value: '3', delta: '-2', positive: true, icon: AlertTriangle, color: '#EF4444' },
  { label: 'Petições Protocoladas Mês', value: '67', delta: '+15%', positive: true, icon: FileText, color: 'var(--gold-primary)' },
  { label: 'Audiências Realizadas', value: '28', delta: '+40%', positive: true, icon: Users, color: '#8B5CF6' },
];

const JURIDICO_BARS: BarData[] = [
  { label: 'Trabalhista', value: 78, maxValue: 100, color: '#3B82F6' },
  { label: 'Cível', value: 52, maxValue: 100, color: '#10B981' },
  { label: 'Família', value: 45, maxValue: 100, color: '#F59E0B' },
  { label: 'Empresarial', value: 38, maxValue: 100, color: '#8B5CF6' },
  { label: 'Tributário', value: 21, maxValue: 100, color: '#EF4444' },
  { label: 'Consumidor', value: 35, maxValue: 100, color: '#EC4899' },
];

const FINANCEIRO_METRICS: MetricCard[] = [
  { label: 'Faturamento Mês', value: 'R$ 487.500', delta: '+15%', positive: true, icon: DollarSign, color: '#10B981' },
  { label: 'Recebido Mês', value: 'R$ 352.800', delta: '+12%', positive: true, icon: TrendingUp, color: '#3B82F6' },
  { label: 'Inadimplência', value: '8,5%', delta: '+2%', positive: false, icon: AlertTriangle, color: '#EF4444' },
  { label: 'Ticket Médio Mensal', value: 'R$ 4.200', delta: '+7%', positive: true, icon: Target, color: 'var(--gold-primary)' },
  { label: 'Contratos Novos', value: '15', delta: '+25%', positive: true, icon: FileText, color: '#8B5CF6' },
  { label: 'Contratos Renovados', value: '8', delta: '+14%', positive: true, icon: CheckCircle2, color: '#10B981' },
];

const FINANCEIRO_BARS: BarData[] = [
  { label: 'Honorários Fixos', value: 180, maxValue: 200, color: '#3B82F6' },
  { label: 'Êxito', value: 120, maxValue: 200, color: '#10B981' },
  { label: 'Recorrência', value: 95, maxValue: 200, color: '#8B5CF6' },
  { label: 'Consulta', value: 45, maxValue: 200, color: '#F59E0B' },
  { label: 'Misto', value: 32, maxValue: 200, color: '#EC4899' },
];

const OPERACIONAL_METRICS: MetricCard[] = [
  { label: 'Tarefas Concluídas', value: '142', delta: '+18%', positive: true, icon: CheckCircle2, color: '#10B981' },
  { label: 'Tarefas Pendentes', value: '38', delta: '-5', positive: true, icon: Clock, color: '#F59E0B' },
  { label: 'Tempo Médio Resposta', value: '4,2h', delta: '-30min', positive: true, icon: Activity, color: '#3B82F6' },
  { label: 'Satisfação do Cliente', value: '4,8/5', delta: '+0,3', positive: true, icon: Users, color: 'var(--gold-primary)' },
  { label: 'Documentos Processados', value: '89', delta: '+12%', positive: true, icon: FileText, color: '#8B5CF6' },
  { label: 'Reuniões Realizadas', value: '34', delta: '+20%', positive: true, icon: Users, color: '#10B981' },
];

const OPERACIONAL_BARS: BarData[] = [
  { label: 'Segunda', value: 18, maxValue: 25, color: '#3B82F6' },
  { label: 'Terça', value: 22, maxValue: 25, color: '#10B981' },
  { label: 'Quarta', value: 20, maxValue: 25, color: '#F59E0B' },
  { label: 'Quinta', value: 24, maxValue: 25, color: '#8B5CF6' },
  { label: 'Sexta', value: 15, maxValue: 25, color: '#EC4899' },
];

const TAB_CONFIG: { key: ReportTab; label: string; icon: typeof BarChart3 }[] = [
  { key: 'comercial', label: 'Comercial', icon: TrendingUp },
  { key: 'juridico', label: 'Jurídico', icon: Briefcase },
  { key: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { key: 'operacional', label: 'Operacional', icon: Activity },
];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function MetricCardComponent({ metric }: { metric: MetricCard }) {
  const Icon = metric.icon;
  return (
    <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="stat-label">{metric.label}</div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${metric.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: metric.color }}>
          <Icon size={18} />
        </div>
      </div>
      <div className="stat-value" style={{ fontSize: 24 }}>{metric.value}</div>
      <div className={`stat-delta ${metric.positive ? 'positive' : 'negative'}`}>
        {metric.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {metric.delta}
      </div>
    </div>
  );
}

function BarChart({ data, title, format }: { data: BarData[]; title: string; format?: (v: number) => string }) {
  return (
    <div className="card">
      <div className="card-header"><h4>{title}</h4></div>
      <div className="card-body">
        {data.map((bar, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ width: 90, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>{bar.label}</span>
            <div style={{ flex: 1, height: 24, background: 'var(--bg-hover)', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: `${(bar.value / bar.maxValue) * 100}%`, height: '100%', background: bar.color, borderRadius: 6, transition: 'width 0.6s ease', opacity: 0.8 }} />
            </div>
            <span style={{ width: 60, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', flexShrink: 0 }}>
              {format ? format(bar.value) : bar.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalStatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ fontSize: 20, color: color || 'var(--text-primary)' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('comercial');

  const renderMetrics = (metrics: MetricCard[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
      {metrics.map((m, i) => <MetricCardComponent key={i} metric={m} />)}
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>BI / Relatórios</h1>
          <p className="page-subtitle">Indicadores e métricas do escritório</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Download size={16} /> Exportar PDF</button>
          <button className="btn btn-secondary"><Download size={16} /> Exportar Excel</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-elevated)', borderRadius: 8, padding: 3, border: '1px solid var(--border-default)', width: 'fit-content' }}>
        {TAB_CONFIG.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '10px 20px', borderRadius: 6, background: isActive ? 'var(--gold-primary)' : 'transparent', color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'comercial' && (
        <div>
          {renderMetrics(COMERCIAL_METRICS)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <BarChart data={COMERCIAL_BARS} title="Leads por Origem" />
            <div className="card">
              <div className="card-header"><h4>Funil de Vendas</h4></div>
              <div className="card-body">
                {[
                  { label: 'Leads Totais', value: 127, color: '#3B82F6' },
                  { label: 'Em Contato', value: 82, color: '#F59E0B' },
                  { label: 'Propostas Enviadas', value: 43, color: '#8B5CF6' },
                  { label: 'Negociação', value: 25, color: '#EC4899' },
                  { label: 'Convertidos', value: 15, color: '#10B981' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'juridico' && (
        <div>
          {renderMetrics(JURIDICO_METRICS)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <BarChart data={JURIDICO_BARS} title="Processos por Área" />
            <div className="card">
              <div className="card-header"><h4>Produtividade Jurídica</h4></div>
              <div className="card-body">
                {[
                  { label: 'Petições Protocoladas', value: '67', sub: 'Este mês' },
                  { label: 'Contestações', value: '12', sub: 'Em andamento' },
                  { label: 'Recursos', value: '8', sub: 'Protocolados' },
                  { label: 'Audiências', value: '28', sub: 'Realizadas no mês' },
                  { label: 'Decisões Favoráveis', value: '18', sub: 'No período' },
                  { label: 'Sentenças Publicadas', value: '22', sub: 'Este mês' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-default)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financeiro' && (
        <div>
          {renderMetrics(FINANCEIRO_METRICS)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <BarChart data={FINANCEIRO_BARS} title="Receita por Tipo de Contrato" format={v => formatCurrency(v * 1000)} />
            <div className="card">
              <div className="card-header"><h4>Fluxo de Caixa</h4></div>
              <div className="card-body">
                <div style={{ marginBottom: 16 }}>
                  <div className="form-label" style={{ marginBottom: 4 }}>A Receber</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#10B981' }}>R$ 245.800</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Próximos 30 dias</div>
                </div>
                <div style={{ height: 1, background: 'var(--border-default)', marginBottom: 16 }} />
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Inadimplência (30d)</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>R$ 12.450</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--bg-hover)', borderRadius: 3 }}>
                    <div style={{ width: '8.5%', height: '100%', background: '#EF4444', borderRadius: 3 }} />
                  </div>
                </div>
                {[
                  { label: 'Janeiro', value: 320, color: '#3B82F6' },
                  { label: 'Fevereiro', value: 280, color: '#3B82F6' },
                  { label: 'Março', value: 350, color: '#3B82F6' },
                  { label: 'Abril', value: 410, color: '#3B82F6' },
                  { label: 'Maio', value: 487, color: '#10B981' },
                ].map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ width: 60, fontSize: 12, color: 'var(--text-secondary)' }}>{m.label}</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg-hover)', borderRadius: 4 }}>
                      <div style={{ width: `${(m.value / 500) * 100}%`, height: '100%', background: m.color, borderRadius: 4, opacity: 0.7 }} />
                    </div>
                    <span style={{ width: 60, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>{formatCurrency(m.value * 1000)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'operacional' && (
        <div>
          {renderMetrics(OPERACIONAL_METRICS)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <BarChart data={OPERACIONAL_BARS} title="Tarefas por Dia da Semana" />
            <div className="card">
              <div className="card-header"><h4>Eficiência Operacional</h4></div>
              <div className="card-body">
                <div style={{ marginBottom: 16 }}>
                  <div className="form-label" style={{ marginBottom: 6 }}>Tempo Médio por Tarefa</div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[{ label: 'Jurídica', value: '2,5h' }, { label: 'Administrativa', value: '1,2h' }, { label: 'Atendimento', value: '0,8h' }].map((item, idx) => (
                      <div key={idx} style={{ textAlign: 'center', flex: 1, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{item.value}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--border-default)', marginBottom: 16 }} />
                <div>
                  <div className="form-label" style={{ marginBottom: 8 }}>NPS - Satisfação do Cliente</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--gold-primary)' }}>78</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                        <span>Detratores</span>
                        <span>Neutros</span>
                        <span>Promotores</span>
                      </div>
                      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: '15%', background: '#EF4444' }} />
                        <div style={{ width: '25%', background: '#F59E0B' }} />
                        <div style={{ width: '60%', background: '#10B981' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Excelente (acima da média do mercado)</div>
                </div>
                <div style={{ height: 1, background: 'var(--border-default)', margin: '16px 0' }} />
                <div>
                  <div className="form-label" style={{ marginBottom: 8 }}>Distribuição de Carga</div>
                  {[
                    { label: 'Dra. Fernanda', value: 42, max: 60 },
                    { label: 'Dr. Ricardo', value: 35, max: 60 },
                    { label: 'Dra. Juliana', value: 48, max: 60 },
                    { label: 'Dr. Paulo', value: 28, max: 60 },
                    { label: 'Secretaria', value: 55, max: 60 },
                  ].map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ width: 90, fontSize: 12, color: 'var(--text-secondary)' }}>{p.label}</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-hover)', borderRadius: 3 }}>
                        <div style={{ width: `${(p.value / p.max) * 100}%`, height: '100%', background: p.value > 45 ? '#EF4444' : p.value > 35 ? '#F59E0B' : '#10B981', borderRadius: 3 }} />
                      </div>
                      <span style={{ width: 30, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
