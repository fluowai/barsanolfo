import { useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Landmark, Clock, AlertTriangle,
  Plus, Search, Download, Send, FileText, Printer, X, Check,
  Filter, ChevronDown, MoreVertical, Eye, CreditCard, Ban,
  FileSpreadsheet, PieChart, BarChart3, Receipt, Wallet,
  Calendar, CheckCircle2, AlertCircle, HelpCircle, Loader2,
  Upload, ArrowUpRight, ArrowDownRight, Percent, FileSignature,
  Building2, User, Briefcase, ClipboardList, ArrowLeft, GripVertical
} from 'lucide-react';
import './Financial.css';

type TransactionType = 'RECEITA' | 'DESPESA';
type TransactionStatus = 'PAGO' | 'PENDENTE' | 'VENCIDO' | 'PREVISTO' | 'CANCELADO';
type PaymentMethod = 'PIX' | 'BOLETO' | 'CARTAO' | 'TRANSFERENCIA' | 'DINHEIRO' | 'DEPOSITO';
type TabView = 'RECEBER' | 'PAGAR' | 'RELATORIOS';

interface FinancialEntry {
  id: string;
  type: TransactionType;
  category: string;
  client: string;
  description: string;
  value: number;
  dueDate: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  notes: string;
  process?: string;
  contract?: string;
  paymentDate?: string;
  proofFile?: string;
  createdAt: string;
}

interface PeriodPreset {
  label: string;
  days: number;
}

const CLIENTS = [
  'João Silva', 'Maria Oliveira', 'Carlos Mendes', 'Empresa Alfa Ltda',
  'Fernanda Costa', 'Roberto Alves', 'Ana Beatriz', 'Construtora Nova Era'
];

const PROCESSES = [
  '0012345-67.2024.8.26.0100', '0012346-67.2024.8.26.0100',
  '0012347-67.2024.8.26.0100', '0012348-67.2024.8.26.0100',
  '0012349-67.2024.8.26.0100', '0012350-67.2024.8.26.0100'
];

const CONTRACTS = ['CT-2024/001', 'CT-2024/002', 'CT-2024/003', 'CT-2024/004', 'CT-2024/005'];

const RECEITA_CATEGORIES = [
  'Honorários Advocatícios', 'Consultoria Jurídica', 'Êxito Processual',
  'Parecer Jurídico', 'Audiência Extraordinária', 'Assinatura Mensal'
];

const DESPESA_CATEGORIES = [
  'Custas Processuais', 'Diligência', 'Correspondente', 'Software',
  'Marketing', 'Impostos', 'Folha de Pagamento', 'Aluguel',
  'Deslocamento', 'Cartório', 'Outros'
];

const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'PIX', label: 'Pix' },
  { key: 'BOLETO', label: 'Boleto' },
  { key: 'CARTAO', label: 'Cartão' },
  { key: 'TRANSFERENCIA', label: 'Transferência' },
  { key: 'DINHEIRO', label: 'Dinheiro' },
  { key: 'DEPOSITO', label: 'Depósito' },
];

const MOCK_TRANSACTIONS: FinancialEntry[] = [
  { id: 't1', type: 'RECEITA', category: 'Honorários Advocatícios', client: 'João Silva', description: 'Honorários advocatícios - Ação Cível', value: 8000, dueDate: '2026-04-15', paymentMethod: 'PIX', status: 'PAGO', notes: 'Pagamento referente ao mês de abril', process: '0012345-67.2024.8.26.0100', contract: 'CT-2024/001', paymentDate: '2026-04-10', createdAt: '2026-04-01' },
  { id: 't2', type: 'RECEITA', category: 'Honorários Advocatícios', client: 'Maria Oliveira', description: 'Entrada - Ação Trabalhista', value: 2500, dueDate: '2026-04-05', paymentMethod: 'BOLETO', status: 'PAGO', notes: '', process: '0012346-67.2024.8.26.0100', paymentDate: '2026-04-03', createdAt: '2026-03-20' },
  { id: 't3', type: 'RECEITA', category: 'Honorários Advocatícios', client: 'Carlos Mendes', description: 'Parcela mensal - contrato de honorários', value: 1200, dueDate: '2026-03-28', paymentMethod: 'TRANSFERENCIA', status: 'VENCIDO', notes: 'Cliente foi notificado. Aguardando pagamento.', process: '0012347-67.2024.8.26.0100', contract: 'CT-2024/003', createdAt: '2026-03-01' },
  { id: 't4', type: 'RECEITA', category: 'Consultoria Jurídica', client: 'Empresa Alfa Ltda', description: 'Consultoria tributária mensal', value: 5000, dueDate: '2026-05-10', paymentMethod: 'BOLETO', status: 'PENDENTE', notes: 'Contrato de consultoria recorrente', contract: 'CT-2024/002', createdAt: '2026-04-01' },
  { id: 't5', type: 'RECEITA', category: 'Consultoria Jurídica', client: 'Fernanda Costa', description: 'Consultoria jurídica - Direito de Família', value: 3000, dueDate: '2026-04-30', paymentMethod: 'PIX', status: 'PENDENTE', notes: '', process: '0012349-67.2024.8.26.0100', createdAt: '2026-04-15' },
  { id: 't6', type: 'RECEITA', category: 'Êxito Processual', client: 'João Silva', description: 'Êxito processual - Ação Cível (30% do valor)', value: 15000, dueDate: '2026-06-15', paymentMethod: 'TRANSFERENCIA', status: 'PREVISTO', notes: 'Previsão de recebimento após trânsito em julgado', process: '0012345-67.2024.8.26.0100', createdAt: '2026-04-20' },
  { id: 't7', type: 'RECEITA', category: 'Parecer Jurídico', client: 'Construtora Nova Era', description: 'Parecer jurídico - Licitação Pública', value: 4500, dueDate: '2026-05-20', paymentMethod: 'DEPOSITO', status: 'PREVISTO', notes: 'Aguardando aprovação do parecer', createdAt: '2026-04-22' },
  { id: 't8', type: 'DESPESA', category: 'Custas Processuais', client: '-', description: 'Custas processuais - Ação Cível', value: 450, dueDate: '2026-04-08', paymentMethod: 'BOLETO', status: 'PAGO', notes: '', process: '0012345-67.2024.8.26.0100', paymentDate: '2026-04-05', createdAt: '2026-04-01' },
  { id: 't9', type: 'DESPESA', category: 'Software', client: '-', description: 'Assinatura mensal - Pacote Jurídico', value: 200, dueDate: '2026-04-10', paymentMethod: 'CARTAO', status: 'PAGO', notes: 'Renovação automática', paymentDate: '2026-04-10', createdAt: '2026-04-01' },
  { id: 't10', type: 'DESPESA', category: 'Marketing', client: '-', description: 'Campanha Google Ads - Especialização Trabalhista', value: 1500, dueDate: '2026-05-01', paymentMethod: 'CARTAO', status: 'PENDENTE', notes: 'Contrato mensal com agência', createdAt: '2026-04-15' },
  { id: 't11', type: 'DESPESA', category: 'Diligência', client: '-', description: 'Diligência - Oficial de Justiça', value: 150, dueDate: '2026-04-12', paymentMethod: 'DINHEIRO', status: 'PAGO', notes: '', process: '0012346-67.2024.8.26.0100', paymentDate: '2026-04-11', createdAt: '2026-04-05' },
  { id: 't12', type: 'DESPESA', category: 'Aluguel', client: '-', description: 'Aluguel sala comercial - maio', value: 3000, dueDate: '2026-05-05', paymentMethod: 'TRANSFERENCIA', status: 'PENDENTE', notes: '', createdAt: '2026-04-20' },
  { id: 't13', type: 'DESPESA', category: 'Folha de Pagamento', client: '-', description: 'Folha de pagamento - maio/2026', value: 12000, dueDate: '2026-05-05', paymentMethod: 'TRANSFERENCIA', status: 'PENDENTE', notes: 'Inclui salários + encargos', createdAt: '2026-04-25' },
  { id: 't14', type: 'DESPESA', category: 'Impostos', client: '-', description: 'ISS - Escritório', value: 850, dueDate: '2026-05-15', paymentMethod: 'BOLETO', status: 'PENDENTE', notes: '', createdAt: '2026-04-28' },
  { id: 't15', type: 'DESPESA', category: 'Correspondente', client: '-', description: 'Correspondente jurídico - interior', value: 320, dueDate: '2026-04-20', paymentMethod: 'PIX', status: 'PAGO', notes: '', process: '0012348-67.2024.8.26.0100', paymentDate: '2026-04-18', createdAt: '2026-04-10' },
  { id: 't16', type: 'DESPESA', category: 'Cartório', client: '-', description: 'Registro de protesto - cartório', value: 95, dueDate: '2026-04-25', paymentMethod: 'DINHEIRO', status: 'PAGO', notes: '', paymentDate: '2026-04-24', createdAt: '2026-04-15' },
  { id: 't17', type: 'DESPESA', category: 'Deslocamento', client: '-', description: 'Deslocamento - Audiência em São Paulo', value: 280, dueDate: '2026-04-22', paymentMethod: 'PIX', status: 'PAGO', notes: 'Pedágio + combustível', process: '0012350-67.2024.8.26.0100', paymentDate: '2026-04-21', createdAt: '2026-04-18' },
  { id: 't18', type: 'RECEITA', category: 'Assinatura Mensal', client: 'Ana Beatriz', description: 'Assinatura mensal - Pacote Preventivo', value: 800, dueDate: '2026-05-01', paymentMethod: 'CARTAO', status: 'PENDENTE', notes: 'Cliente nova - pacote básico', createdAt: '2026-04-26' },
  { id: 't19', type: 'RECEITA', category: 'Honorários Advocatícios', client: 'Roberto Alves', description: 'Ação de Cobrança - Honorários', value: 3500, dueDate: '2026-04-25', paymentMethod: 'PIX', status: 'PENDENTE', notes: '', process: '0012350-67.2024.8.26.0100', createdAt: '2026-04-10' },
  { id: 't20', type: 'DESPESA', category: 'Marketing', client: '-', description: 'Manutenção site escritório', value: 600, dueDate: '2026-05-10', paymentMethod: 'CARTAO', status: 'PREVISTO', notes: 'Renovação domínio + hospedagem', createdAt: '2026-04-28' },
];

const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

function getStatusBadge(status: TransactionStatus) {
  const config: Record<TransactionStatus, { color: string; bg: string; label: string }> = {
    PAGO: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Pago' },
    PENDENTE: { color: '#e4c23a', bg: 'rgba(228,194,58,0.12)', label: 'Pendente' },
    VENCIDO: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Vencido' },
    PREVISTO: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Previsto' },
    CANCELADO: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: 'Cancelado' },
  };
  const c = config[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      color: c.color, background: c.bg, border: `1px solid ${c.color}20`,
      whiteSpace: 'nowrap',
    }}>
      {status === 'PAGO' && <Check size={10} />}
      {status === 'PENDENTE' && <Clock size={10} />}
      {status === 'VENCIDO' && <AlertTriangle size={10} />}
      {status === 'PREVISTO' && <Calendar size={10} />}
      {status === 'CANCELADO' && <X size={10} />}
      {c.label}
    </span>
  );
}

function getPaymentMethodLabel(method: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    PIX: 'Pix', BOLETO: 'Boleto', CARTAO: 'Cartão',
    TRANSFERENCIA: 'Transferência', DINHEIRO: 'Dinheiro', DEPOSITO: 'Depósito',
  };
  return map[method];
}

function getTypeIcon(type: TransactionType) {
  if (type === 'RECEITA') return <TrendingUp size={14} color="#10b981" />;
  return <TrendingDown size={14} color="#ef4444" />;
}

// ─── SVG Bar Chart ─────────────────────────────────────────────
function BarChart({ data, height = 160, color = '#e4c23a', label }: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  label?: string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  const cols = data.length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>}
      <svg width="100%" height={height} viewBox={`0 0 ${cols * 60} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * (height - 20);
          const x = i * 60 + 10;
          const w = 40;
          return (
            <g key={i}>
              <rect x={x} y={height - barH - 10} width={w} height={barH} rx={4}
                fill={color} opacity={0.8}>
                <animate attributeName="height" from="0" to={barH} dur="0.5s" fill="freeze" />
              </rect>
              <text x={x + w / 2} y={height - 2} textAnchor="middle"
                fill="var(--text-tertiary)" fontSize="7">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── SVG Pie Chart (simple) ─────────────────────────────────────
function PieChartSVG({ segments, size = 140 }: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size / 2 - 10;
  let cumPct = 0;
  const slices = segments.map(s => {
    const pct = s.value / total;
    const start = cumPct * 360;
    const end = (cumPct + pct) * 360;
    cumPct += pct;
    const sAngle = (start - 90) * Math.PI / 180;
    const eAngle = (end - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(sAngle);
    const y1 = cy + r * Math.sin(sAngle);
    const x2 = cx + r * Math.cos(eAngle);
    const y2 = cy + r * Math.sin(eAngle);
    const large = pct > 0.5 ? 1 : 0;
    const path = pct >= 1
      ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { path, color: s.color, label: s.label, pct: (pct * 100).toFixed(1) };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="#181818" strokeWidth="1" />)}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fill="var(--text-primary)" fontSize="14" fontWeight="700">
          {total > 0 ? '100%' : '0'}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {segments.filter(s => s.value > 0).map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{s.label}</span>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>
              {((s.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function Financial() {
  // Tabs
  const [activeTab, setActiveTab] = useState<TabView>('RECEBER');
  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<FinancialEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<FinancialEntry | null>(null);
  const [periodPreset, setPeriodPreset] = useState<string>('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');

  // New transaction form
  const emptyForm = () => ({
    type: 'RECEITA' as TransactionType,
    category: '',
    client: '',
    process: '',
    contract: '',
    description: '',
    value: 0 as number,
    dueDate: '',
    paymentMethod: 'PIX' as PaymentMethod,
    status: 'PENDENTE' as TransactionStatus,
    notes: '',
    proofFileName: '',
  });
  const [form, setForm] = useState(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Payment form
  const [payForm, setPayForm] = useState({
    paymentDate: '',
    paymentMethod: 'PIX' as PaymentMethod,
    notes: '',
    proofFileName: '',
  });

  // Invoice modal
  const [showInvoiceModal, setShowInvoiceModal] = useState<FinancialEntry | null>(null);

  // ── derived data ────────────────────────────────────────────
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const filteredTransactions = useMemo(() => {
    let list = MOCK_TRANSACTIONS.filter(t =>
      activeTab === 'RECEBER' ? t.type === 'RECEITA' : t.type === 'DESPESA'
    );
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(t =>
        t.client.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        t.category.toLowerCase().includes(s) ||
        t.id.toLowerCase().includes(s)
      );
    }
    if (filterStatus !== 'all') list = list.filter(t => t.status === filterStatus);
    if (filterCategory !== 'all') list = list.filter(t => t.category === filterCategory);
    if (filterClient !== 'all') list = list.filter(t => t.client === filterClient);
    return list;
  }, [activeTab, searchTerm, filterStatus, filterCategory, filterClient]);

  const stats = useMemo(() => {
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const monthTransactions = MOCK_TRANSACTIONS.filter(t => t.dueDate.startsWith(monthStr));
    const receitas = monthTransactions.filter(t => t.type === 'RECEITA');
    const despesas = monthTransactions.filter(t => t.type === 'DESPESA');
    const receitaTotal = receitas.reduce((a, t) => a + (t.status === 'PAGO' ? t.value : 0), 0);
    const despesaTotal = despesas.reduce((a, t) => a + (t.status === 'PAGO' ? t.value : 0), 0);
    const aReceber = receitas.filter(t => t.status === 'PENDENTE' || t.status === 'VENCIDO').reduce((a, t) => a + t.value, 0);
    const inadimplencia = receitas.filter(t => t.status === 'VENCIDO').reduce((a, t) => a + t.value, 0);
    const previsto = receitas.filter(t => t.status === 'PREVISTO').reduce((a, t) => a + t.value, 0);
    return { receitaTotal, despesaTotal, saldo: receitaTotal - despesaTotal, aReceber, inadimplencia, previsto };
  }, []);

  const revenueByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_TRANSACTIONS.filter(t => t.type === 'RECEITA' && t.status === 'PAGO').forEach(t => {
      const m = t.dueDate.substring(0, 7);
      map[m] = (map[m] || 0) + t.value;
    });
    const result: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({ label: monthNames[d.getMonth()].substring(0, 3), value: map[key] || 0 });
    }
    return result;
  }, []);

  const incomeVsExpenses = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    MOCK_TRANSACTIONS.filter(t => t.status === 'PAGO' || t.status === 'PENDENTE').forEach(t => {
      const m = t.dueDate.substring(0, 7);
      if (!map[m]) map[m] = { income: 0, expense: 0 };
      if (t.type === 'RECEITA') map[m].income += t.value;
      else map[m].expense += t.value;
    });
    const result: { label: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const v = map[key] || { income: 0, expense: 0 };
      result.push({ label: monthNames[d.getMonth()].substring(0, 3), income: v.income, expense: v.expense });
    }
    return result;
  }, []);

  const categoryRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_TRANSACTIONS.filter(t => t.type === 'RECEITA' && (t.status === 'PAGO' || t.status === 'PENDENTE')).forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.value;
    });
    const colors = ['#10b981', '#3b82f6', '#e4c23a', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6'];
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([k, v], i) => ({
      label: k, value: v, color: colors[i % colors.length],
    }));
  }, []);

  const customerRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_TRANSACTIONS.filter(t => t.type === 'RECEITA' && (t.status === 'PAGO' || t.status === 'PENDENTE')).forEach(t => {
      if (t.client !== '-') map[t.client] = (map[t.client] || 0) + t.value;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ client: k, value: v }));
  }, []);

  const inadimplenciaByClient = useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_TRANSACTIONS.filter(t => t.type === 'RECEITA' && t.status === 'VENCIDO').forEach(t => {
      if (t.client !== '-') map[t.client] = (map[t.client] || 0) + t.value;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ client: k, value: v }));
  }, []);

  const categories = activeTab === 'RECEBER' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;

  // ── handlers ─────────────────────────────────────────────────
  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.category) errs.category = 'Selecione uma categoria';
    if (!form.description) errs.description = 'Informe a descrição';
    if (!form.value || form.value <= 0) errs.value = 'Informe um valor válido';
    if (!form.dueDate) errs.dueDate = 'Informe a data de vencimento';
    if (form.type === 'RECEITA' && !form.client) errs.client = 'Selecione um cliente';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNewTransaction = () => {
    if (!validateForm()) return;
    setShowNewModal(false);
    setForm(emptyForm());
    setFormErrors({});
  };

  const handlePayTransaction = () => {
    if (!showPayModal) return;
    if (!payForm.paymentDate) return;
    setShowPayModal(null);
    setPayForm({ paymentDate: '', paymentMethod: 'PIX', notes: '', proofFileName: '' });
  };

  // ── styles ───────────────────────────────────────────────────
  const s = {
    page: { padding: '1.5rem', maxWidth: 1400, margin: '0 auto', width: '100%' as const },
    card: (p?: { border?: string; pad?: string }) => ({
      background: 'var(--bg-card)', border: `1px solid ${p?.border || 'var(--border-default)'}`,
      borderRadius: 12, padding: p?.pad || '1.25rem', transition: 'all 0.25s ease',
    }),
    flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' as const },
    flexCenter: { display: 'flex', alignItems: 'center' as const, gap: 8 },
    grid: (cols: string) => ({ display: 'grid', gridTemplateColumns: cols, gap: '1rem' }),
    input: {
      width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-input)',
      border: '1px solid var(--border-default)', borderRadius: 6, color: 'var(--text-primary)',
      fontSize: '0.875rem', outline: 'none',
    },
    select: {
      width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-input)',
      border: '1px solid var(--border-default)', borderRadius: 6, color: 'var(--text-primary)',
      fontSize: '0.875rem', outline: 'none',
    },
    label: { fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' },
    goldBtn: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '0.5rem 1rem', background: 'var(--gold-primary)', color: '#080808',
      border: 'none', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
    },
    ghostBtn: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text-secondary)',
      border: '1px solid var(--border-default)', borderRadius: 6, fontSize: '0.875rem', cursor: 'pointer',
    },
    tab: (active: boolean) => ({
      padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 600,
      color: active ? 'var(--gold-primary)' : 'var(--text-secondary)',
      borderBottom: active ? '2px solid var(--gold-primary)' : '2px solid transparent',
      cursor: 'pointer', transition: 'all 0.2s ease', background: 'none',
    }),
    cell: { padding: '12px 16px', fontSize: '0.875rem', color: 'var(--text)' },
    cellMuted: { padding: '12px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)' },
  };

  // ─── RENDER: Relatórios Tab ─────────────────────────────────
  const renderRelatorios = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Resumo do mês + DRE */}
      <div style={s.grid('1fr 1fr')}>
        <div style={s.card()}>
          <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>
            <FileText size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Resumo do Mês
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Receita do Mês', value: formatCurrency(stats.receitaTotal), color: '#10b981' },
              { label: 'Despesas do Mês', value: formatCurrency(stats.despesaTotal), color: '#ef4444' },
              { label: 'Saldo', value: formatCurrency(stats.saldo), color: stats.saldo >= 0 ? '#10b981' : '#ef4444' },
              { label: 'A Receber', value: formatCurrency(stats.aReceber), color: '#e4c23a' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border-default)' : 'none' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.label}</span>
                <span style={{ color: r.color, fontWeight: 700, fontSize: 15 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={s.card()}>
          <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>
            <BarChart3 size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            DRE Simplificada
          </h3>
          {(() => {
            const resultado = stats.receitaTotal - stats.despesaTotal;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-default)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Receitas</span>
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: 18 }}>{formatCurrency(stats.receitaTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-default)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Despesas</span>
                  <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 18 }}>-{formatCurrency(stats.despesaTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Resultado</span>
                  <span style={{ color: resultado >= 0 ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: 22 }}>
                    {formatCurrency(resultado)}
                  </span>
                </div>
                <div style={{
                  marginTop: 8, padding: 12, borderRadius: 8,
                  background: resultado >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${resultado >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  <span style={{ fontSize: 12, color: resultado >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                    {resultado >= 0
                      ? `✅ Resultado positivo. Margem líquida de ${((resultado / (stats.receitaTotal || 1)) * 100).toFixed(1)}%`
                      : `⚠️ Resultado negativo. Custos representam ${((stats.despesaTotal / (stats.receitaTotal || 1)) * 100).toFixed(1)}% da receita.`
                    }
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Receita por Cliente */}
      <div style={s.card()}>
        <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>
          <User size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Receita por Cliente
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cliente</th>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Receita Total</th>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {customerRevenue.map((c, i) => {
                const totalRevenue = customerRevenue.reduce((a, r) => a + r.value, 0) || 1;
                return (
                  <tr key={i} style={{ borderTop: '1px solid var(--border-default)' }}>
                    <td style={{ ...s.cell, fontWeight: 600 }}>{c.client}</td>
                    <td style={{ ...s.cell, color: '#10b981', fontWeight: 700 }}>{formatCurrency(c.value)}</td>
                    <td style={s.cell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                          <div style={{ width: `${(c.value / totalRevenue) * 100}%`, height: 6, background: 'var(--gold-primary)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {((c.value / totalRevenue) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {customerRevenue.length === 0 && (
                <tr><td colSpan={3} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma receita registrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inadimplência por Cliente */}
      <div style={s.card()}>
        <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>
          <AlertTriangle size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Inadimplência por Cliente
        </h3>
        {inadimplenciaByClient.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 24 }}>
            Nenhum cliente inadimplente no período
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Cliente</th>
                  <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Valor em Aberto</th>
                  <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {inadimplenciaByClient.map((c, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border-default)' }}>
                    <td style={{ ...s.cell, fontWeight: 600 }}>{c.client}</td>
                    <td style={{ ...s.cell, color: '#ef4444', fontWeight: 700 }}>{formatCurrency(c.value)}</td>
                    <td style={s.cell}>
                      <button style={s.ghostBtn}>
                        <Send size={12} /> Cobrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fluxo de Caixa Projetado */}
      <div style={s.card()}>
        <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>
          <BarChart3 size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Fluxo de Caixa Projetado (Próximos 6 meses)
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Mês</th>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Receitas</th>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Despesas</th>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Saldo Projetado</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const rows: { label: string; income: number; expense: number }[] = [];
                for (let i = 0; i < 6; i++) {
                  const d = new Date(currentYear, currentMonth + i, 1);
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  const inc = MOCK_TRANSACTIONS.filter(t => t.type === 'RECEITA' && t.dueDate.startsWith(key) && t.status !== 'CANCELADO').reduce((a, t) => a + t.value, 0);
                  const exp = MOCK_TRANSACTIONS.filter(t => t.type === 'DESPESA' && t.dueDate.startsWith(key) && t.status !== 'CANCELADO').reduce((a, t) => a + t.value, 0);
                  rows.push({ label: monthNames[d.getMonth()], income: inc, expense: exp });
                }
                let runningBalance = stats.saldo;
                return rows.map((r, i) => {
                  runningBalance += r.income - r.expense;
                  return (
                    <tr key={i} style={{ borderTop: '1px solid var(--border-default)' }}>
                      <td style={{ ...s.cell, fontWeight: 600 }}>{r.label}</td>
                      <td style={{ ...s.cell, color: '#10b981', fontWeight: 600 }}>{formatCurrency(r.income)}</td>
                      <td style={{ ...s.cell, color: '#ef4444', fontWeight: 600 }}>{formatCurrency(r.expense)}</td>
                      <td style={{ ...s.cell, color: runningBalance >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                        {formatCurrency(runningBalance)}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── RENDER: Transaction Table ──────────────────────────────
  const renderTransactionTable = () => (
    <>
      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text" placeholder="Buscar por cliente, descrição..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ ...s.input, paddingLeft: 32, fontSize: 13 }}
          />
        </div>
        <div style={s.flexCenter}>
          <Filter size={14} color="var(--text-tertiary)" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...s.select, width: 'auto', fontSize: 12, padding: '0.375rem 1.5rem 0.375rem 0.5rem' }}>
            <option value="all">Status</option>
            <option value="PAGO">Pago</option>
            <option value="PENDENTE">Pendente</option>
            <option value="VENCIDO">Vencido</option>
            <option value="PREVISTO">Previsto</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...s.select, width: 'auto', fontSize: 12, padding: '0.375rem 1.5rem 0.375rem 0.5rem' }}>
          <option value="all">Categoria</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)} style={{ ...s.select, width: 'auto', fontSize: 12, padding: '0.375rem 1.5rem 0.375rem 0.5rem' }}>
          <option value="all">Cliente</option>
          {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={s.card({ pad: '0' })}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Cliente</th>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Descrição</th>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Valor</th>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Vencimento</th>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Forma Pagto.</th>
                <th style={{ ...s.cell, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ) : filteredTransactions.map(tx => (
                <tr key={tx.id} style={{ borderTop: '1px solid var(--border-default)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ ...s.cell, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <div style={s.flexCenter}>
                      {getTypeIcon(tx.type)}
                      {tx.client === '-' ? <span style={{ color: 'var(--text-muted)' }}>—</span> : tx.client}
                    </div>
                  </td>
                  <td style={{ ...s.cellMuted, whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'var(--text)' }}>{tx.description}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 8 }}>({tx.category})</span>
                  </td>
                  <td style={{ ...s.cell, fontWeight: 700, whiteSpace: 'nowrap', color: tx.type === 'RECEITA' ? '#10b981' : '#ef4444' }}>
                    {tx.type === 'DESPESA' && '-'}{formatCurrency(tx.value)}
                  </td>
                  <td style={{ ...s.cellMuted, whiteSpace: 'nowrap' }}>{formatDate(tx.dueDate)}</td>
                  <td style={{ ...s.cell, whiteSpace: 'nowrap' }}>{getStatusBadge(tx.status)}</td>
                  <td style={{ ...s.cellMuted, whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 4, fontSize: 11,
                      background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)',
                    }}>
                      {tx.paymentMethod === 'PIX' && <CreditCard size={10} />}
                      {tx.paymentMethod === 'BOLETO' && <Receipt size={10} />}
                      {tx.paymentMethod === 'CARTAO' && <CreditCard size={10} />}
                      {tx.paymentMethod === 'TRANSFERENCIA' && <ArrowUpRight size={10} />}
                      {tx.paymentMethod === 'DINHEIRO' && <Wallet size={10} />}
                      {tx.paymentMethod === 'DEPOSITO' && <Landmark size={10} />}
                      {getPaymentMethodLabel(tx.paymentMethod)}
                    </span>
                  </td>
                  <td style={{ ...s.cell, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setShowDetailModal(tx)}
                        style={{ ...s.ghostBtn, padding: '0.375rem', fontSize: 11 }}
                        title="Ver detalhes"
                      >
                        <Eye size={14} />
                      </button>
                      {(tx.status === 'PENDENTE' || tx.status === 'VENCIDO') && (
                        <button
                          onClick={() => {
                            setShowPayModal(tx);
                            setPayForm({
                              paymentDate: new Date().toISOString().split('T')[0],
                              paymentMethod: tx.paymentMethod,
                              notes: '',
                              proofFileName: '',
                            });
                          }}
                          style={{ ...s.goldBtn, padding: '0.375rem', fontSize: 11 }}
                          title="Marcar como Pago"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      {tx.type === 'RECEITA' && (
                        <button
                          onClick={() => setShowInvoiceModal(tx)}
                          style={{ ...s.ghostBtn, padding: '0.375rem', fontSize: 11 }}
                          title="Gerar boleto/fatura"
                        >
                          <FileText size={14} />
                        </button>
                      )}
                      <button style={{ ...s.ghostBtn, padding: '0.375rem', fontSize: 11 }}>
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // ─── RENDER: Charts Section ─────────────────────────────────
  const renderCharts = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
      <div style={s.card()}>
        <BarChart data={revenueByMonth} height={150} color="#10b981" label="Receita por Mês" />
      </div>
      <div style={s.card()}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Receita vs Despesas</span>
          <svg width="100%" height={150} viewBox="0 0 360 150" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            {incomeVsExpenses.map((d, i) => {
              const allVals = [...incomeVsExpenses.map(x => x.income), ...incomeVsExpenses.map(x => x.expense)];
              const max = Math.max(...allVals, 1);
              const x = i * 60 + 10;
              const w = 17;
              const ih = (d.income / max) * 130;
              const eh = (d.expense / max) * 130;
              return (
                <g key={i}>
                  <rect x={x} y={140 - ih} width={w} height={ih} rx={3} fill="#10b981" opacity={0.85} />
                  <rect x={x + w + 2} y={140 - eh} width={w} height={eh} rx={3} fill="#ef4444" opacity={0.85} />
                  <text x={x + w} y={148} textAnchor="middle" fill="var(--text-tertiary)" fontSize="7">{d.label}</text>
                </g>
              );
            })}
          </svg>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4 }}>
            <div style={s.flexCenter}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} /><span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Receitas</span></div>
            <div style={s.flexCenter}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444' }} /><span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Despesas</span></div>
          </div>
        </div>
      </div>
      <div style={s.card()}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8, display: 'block' }}>
          <PieChart size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Receita por Categoria
        </span>
        <PieChartSVG segments={categoryRevenue} size={130} />
      </div>
      <div style={s.card()}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8, display: 'block' }}>
          <Percent size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Inadimplência
        </span>
        {(() => {
          const totalToReceive = stats.aReceber + stats.receitaTotal;
          const rate = totalToReceive > 0 ? (stats.inadimplencia / totalToReceive) * 100 : 0;
          const angle = (rate / 100) * 360;
          const r = 50, cx = 60, cy = 60;
          const rad = (angle - 90) * Math.PI / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          const largeArc = rate > 50 ? 1 : 0;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <svg width={120} height={120} viewBox="0 0 120 120">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                {rate > 0 && (
                  <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y} L ${cx} ${cy} Z`}
                    fill="#ef4444" opacity={0.3} />
                )}
                {rate > 0 && (
                  <path d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y} Z`}
                    fill="none" stroke="#ef4444" strokeWidth="2" />
                )}
                <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="16" fontWeight="700">
                  {rate.toFixed(1)}%
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-muted)" fontSize="8">
                  inadimplência
                </text>
              </svg>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Total vencido
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>
                  {formatCurrency(stats.inadimplencia)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  de {formatCurrency(totalToReceive)} a receber
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );

  // ─── RENDER: STATS CARDS ────────────────────────────────────
  const renderStatsCards = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
      {[
        { title: 'Receita do Mês', value: formatCurrency(stats.receitaTotal), icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
        { title: 'Despesas do Mês', value: formatCurrency(stats.despesaTotal), icon: TrendingDown, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
        { title: 'Saldo', value: formatCurrency(stats.saldo), icon: DollarSign, color: stats.saldo >= 0 ? '#10b981' : '#ef4444', bg: stats.saldo >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' },
        { title: 'A Receber', value: formatCurrency(stats.aReceber), icon: Clock, color: '#e4c23a', bg: 'rgba(228,194,58,0.08)' },
        { title: 'Inadimplência', value: formatCurrency(stats.inadimplencia), icon: AlertTriangle, color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
        { title: 'Receita Prevista', value: formatCurrency(stats.previsto), icon: Landmark, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
      ].map((item, i) => (
        <div key={i} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: 12, padding: '1.25rem', transition: 'all 0.25s ease',
          position: 'relative', overflow: 'hidden',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = ''; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              {item.title}
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <item.icon size={18} color={item.color} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );

  // ─── MODAL: Create Transaction ──────────────────────────────
  const renderNewTransactionModal = () => {
    if (!showNewModal) return null;
    return (
      <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
        <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 style={{ color: 'var(--text-primary)' }}>
              <Plus size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Novo Lançamento
            </h3>
            <button className="modal-close" onClick={() => setShowNewModal(false)}><X size={18} /></button>
          </div>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Tipo */}
              <div>
                <label style={s.label}>Tipo</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => handleFormChange('type', 'RECEITA')}
                    style={{
                      flex: 1, padding: '0.5rem', borderRadius: 6, fontSize: 13, fontWeight: 600,
                      border: `1px solid ${form.type === 'RECEITA' ? '#10b981' : 'var(--border-default)'}`,
                      background: form.type === 'RECEITA' ? 'rgba(16,185,129,0.1)' : 'var(--bg-input)',
                      color: form.type === 'RECEITA' ? '#10b981' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <TrendingUp size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Receita
                  </button>
                  <button
                    onClick={() => handleFormChange('type', 'DESPESA')}
                    style={{
                      flex: 1, padding: '0.5rem', borderRadius: 6, fontSize: 13, fontWeight: 600,
                      border: `1px solid ${form.type === 'DESPESA' ? '#ef4444' : 'var(--border-default)'}`,
                      background: form.type === 'DESPESA' ? 'rgba(239,68,68,0.1)' : 'var(--bg-input)',
                      color: form.type === 'DESPESA' ? '#ef4444' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <TrendingDown size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Despesa
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={s.label}>Categoria</label>
                <select
                  value={form.category}
                  onChange={e => handleFormChange('category', e.target.value)}
                  style={{ ...s.select, marginTop: 4 }}
                >
                  <option value="">Selecione...</option>
                  {(form.type === 'RECEITA' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {formErrors.category && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{formErrors.category}</span>}
              </div>

              {/* Client */}
              <div>
                <label style={s.label}>Cliente</label>
                <select
                  value={form.client}
                  onChange={e => handleFormChange('client', e.target.value)}
                  style={{ ...s.select, marginTop: 4 }}
                >
                  <option value="">Selecione...</option>
                  {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {formErrors.client && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{formErrors.client}</span>}
              </div>

              {/* Processo + Contrato */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={s.label}>Processo (opcional)</label>
                  <select
                    value={form.process}
                    onChange={e => handleFormChange('process', e.target.value)}
                    style={{ ...s.select, marginTop: 4 }}
                  >
                    <option value="">Selecione...</option>
                    {PROCESSES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Contrato (opcional)</label>
                  <select
                    value={form.contract}
                    onChange={e => handleFormChange('contract', e.target.value)}
                    style={{ ...s.select, marginTop: 4 }}
                  >
                    <option value="">Selecione...</option>
                    {CONTRACTS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={s.label}>Descrição</label>
                <input
                  type="text" placeholder="Ex: Honorários advocatícios - Ação Cível"
                  value={form.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  style={{ ...s.input, marginTop: 4 }}
                />
                {formErrors.description && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{formErrors.description}</span>}
              </div>

              {/* Valor + Vencimento */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={s.label}>Valor (R$)</label>
                  <input
                    type="number" step="0.01" min="0"
                    placeholder="0,00"
                    value={form.value || ''}
                    onChange={e => handleFormChange('value', parseFloat(e.target.value) || 0)}
                    style={{ ...s.input, marginTop: 4 }}
                  />
                  {formErrors.value && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{formErrors.value}</span>}
                </div>
                <div>
                  <label style={s.label}>Vencimento</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => handleFormChange('dueDate', e.target.value)}
                    style={{ ...s.input, marginTop: 4, colorScheme: 'dark' }}
                  />
                  {formErrors.dueDate && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{formErrors.dueDate}</span>}
                </div>
              </div>

              {/* Payment Method + Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={s.label}>Forma de Pagamento</label>
                  <select
                    value={form.paymentMethod}
                    onChange={e => handleFormChange('paymentMethod', e.target.value as PaymentMethod)}
                    style={{ ...s.select, marginTop: 4 }}
                  >
                    {PAYMENT_METHODS.map(pm => <option key={pm.key} value={pm.key}>{pm.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Status</label>
                  <select
                    value={form.status}
                    onChange={e => handleFormChange('status', e.target.value as TransactionStatus)}
                    style={{ ...s.select, marginTop: 4 }}
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Pago</option>
                    <option value="PREVISTO">Previsto</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={s.label}>Observações</label>
                <textarea
                  placeholder="Informações adicionais..."
                  value={form.notes}
                  onChange={e => handleFormChange('notes', e.target.value)}
                  style={{ ...s.input, minHeight: 60, resize: 'vertical', marginTop: 4, fontFamily: 'inherit' }}
                />
              </div>

              {/* File upload */}
              <div>
                <label style={s.label}>Comprovante (opcional)</label>
                <div style={{
                  marginTop: 4, border: '1px dashed var(--border-default)', borderRadius: 6,
                  padding: '1rem', textAlign: 'center', cursor: 'pointer',
                  background: 'var(--bg-input)',
                }}>
                  <Upload size={20} style={{ color: 'var(--text-tertiary)', marginBottom: 4 }} />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {form.proofFileName || 'Clique para fazer upload do comprovante'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowNewModal(false)}>Cancelar</button>
            <button className="btn btn-gold" onClick={handleNewTransaction}>
              <Plus size={16} /> Salvar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── MODAL: Payment Confirmation ─────────────────────────────
  const renderPayModal = () => {
    if (!showPayModal) return null;
    return (
      <div className="modal-overlay" onClick={() => setShowPayModal(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 style={{ color: 'var(--text-primary)' }}>
              <CheckCircle2 size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#10b981' }} />
              Confirmar Pagamento
            </h3>
            <button className="modal-close" onClick={() => setShowPayModal(null)}><X size={18} /></button>
          </div>
          <div className="modal-body">
            <div style={{ marginBottom: 16, padding: '12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Cliente</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{showPayModal.client}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Descrição</span>
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{showPayModal.description}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Valor</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{formatCurrency(showPayModal.value)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={s.label}>Data do Pagamento</label>
                <input
                  type="date"
                  value={payForm.paymentDate}
                  onChange={e => setPayForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                  style={{ ...s.input, marginTop: 4, colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label style={s.label}>Forma de Pagamento</label>
                <select
                  value={payForm.paymentMethod}
                  onChange={e => setPayForm(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                  style={{ ...s.select, marginTop: 4 }}
                >
                  {PAYMENT_METHODS.map(pm => <option key={pm.key} value={pm.key}>{pm.label}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Comprovante (opcional)</label>
                <div style={{
                  marginTop: 4, border: '1px dashed var(--border-default)', borderRadius: 6,
                  padding: '0.75rem', textAlign: 'center', cursor: 'pointer',
                  background: 'var(--bg-input)',
                }}>
                  <Upload size={16} style={{ color: 'var(--text-tertiary)', marginBottom: 2 }} />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {payForm.proofFileName || 'Selecionar arquivo'}
                  </div>
                </div>
              </div>
              <div>
                <label style={s.label}>Observações do pagamento</label>
                <textarea
                  placeholder="Informações adicionais..."
                  value={payForm.notes}
                  onChange={e => setPayForm(prev => ({ ...prev, notes: e.target.value }))}
                  style={{ ...s.input, minHeight: 50, resize: 'vertical', marginTop: 4, fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowPayModal(null)}>Cancelar</button>
            <button
              className="btn btn-primary"
              onClick={handlePayTransaction}
              disabled={!payForm.paymentDate}
              style={{ background: !payForm.paymentDate ? 'var(--border-default)' : '' }}
            >
              <Check size={16} /> Confirmar Pagamento
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── MODAL: Detail View ─────────────────────────────────────
  const renderDetailModal = () => {
    if (!showDetailModal) return null;
    const tx = showDetailModal;
    return (
      <div className="modal-overlay" onClick={() => setShowDetailModal(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 style={{ color: 'var(--text-primary)' }}>
              <Eye size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Detalhes da Transação
            </h3>
            <button className="modal-close" onClick={() => setShowDetailModal(null)}><X size={18} /></button>
          </div>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {getTypeIcon(tx.type)}
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {tx.type === 'RECEITA' ? 'Receita' : 'Despesa'}
                </span>
                {getStatusBadge(tx.status)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Cliente', value: tx.client === '-' ? '—' : tx.client },
                  { label: 'Categoria', value: tx.category },
                  { label: 'Descrição', value: tx.description, span: 2 },
                  { label: 'Valor', value: formatCurrency(tx.value), color: tx.type === 'RECEITA' ? '#10b981' : '#ef4444', bold: true },
                  { label: 'Vencimento', value: formatDate(tx.dueDate) },
                  { label: 'Forma Pagto.', value: getPaymentMethodLabel(tx.paymentMethod) },
                  { label: 'Data Pagto.', value: tx.paymentDate ? formatDate(tx.paymentDate) : '—' },
                  { label: 'Processo', value: tx.process || '—' },
                  { label: 'Contrato', value: tx.contract || '—' },
                ].map((f, i) => (
                  <div key={i} style={{ gridColumn: f.span ? `span ${f.span}` : 'auto', padding: '8px 0', borderBottom: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{f.label}</div>
                    <div style={{
                      fontSize: 13, fontWeight: f.bold ? 700 : 500,
                      color: f.color || 'var(--text-primary)',
                    }}>
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
              {tx.notes && (
                <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Observações</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{tx.notes}</div>
                </div>
              )}
              {tx.proofFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <FileText size={14} color="#3b82f6" />
                  <span style={{ fontSize: 13, color: 'var(--text)' }}>{tx.proofFile}</span>
                </div>
              )}
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowDetailModal(null)}>Fechar</button>
          </div>
        </div>
      </div>
    );
  };

  // ─── MODAL: Invoice/Boleto ──────────────────────────────────
  const renderInvoiceModal = () => {
    if (!showInvoiceModal) return null;
    const tx = showInvoiceModal;
    return (
      <div className="modal-overlay" onClick={() => setShowInvoiceModal(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 style={{ color: 'var(--text-primary)' }}>
              <FileSignature size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Gerar Fatura / Boleto
            </h3>
            <button className="modal-close" onClick={() => setShowInvoiceModal(null)}><X size={18} /></button>
          </div>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-default)' }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cliente</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{tx.client}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Descrição</span>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{tx.description}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Valor</span>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#e4c23a' }}>{formatCurrency(tx.value)}</div>
                </div>
              </div>

              <div>
                <label style={s.label}>E-mail do Cliente</label>
                <input type="email" defaultValue={`cliente@email.com`} style={{ ...s.input, marginTop: 4 }} />
              </div>
              <div>
                <label style={s.label}>Vencimento da Fatura</label>
                <input type="date" defaultValue={tx.dueDate} style={{ ...s.input, marginTop: 4, colorScheme: 'dark' }} />
              </div>
              <div>
                <label style={s.label}>Mensagem ao Cliente</label>
                <textarea
                  defaultValue={`Prezado(a) ${tx.client},\n\nSegue fatura referente a: ${tx.description}\nValor: ${formatCurrency(tx.value)}\nVencimento: ${formatDate(tx.dueDate)}`}
                  style={{ ...s.input, minHeight: 80, resize: 'vertical', marginTop: 4, fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ ...s.ghostBtn, flex: 1, justifyContent: 'center' }}>
                  <Download size={14} /> Baixar PDF
                </button>
                <button style={{ ...s.ghostBtn, flex: 1, justifyContent: 'center' }}>
                  <Printer size={14} /> Imprimir
                </button>
                <button style={{ ...s.goldBtn, flex: 1, justifyContent: 'center' }}>
                  <Send size={14} /> Enviar
                </button>
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowInvoiceModal(null)}>Fechar</button>
          </div>
        </div>
      </div>
    );
  };

  // ─── MAIN RENDER ─────────────────────────────────────────────
  return (
    <div className="financial-page" style={s.page}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, background: 'linear-gradient(135deg, var(--gold-primary), #f2d24b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 }}>
            Gestão Financeira
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Gerencie receitas, despesas e relatórios do escritório
          </p>
        </div>
        <button onClick={() => setShowNewModal(true)} style={{ ...s.goldBtn, padding: '0.625rem 1.25rem' }}>
          <Plus size={18} /> Novo Lançamento
        </button>
      </div>

      {/* Period Selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'current', label: 'Mês Atual' },
          { key: 'prev', label: 'Mês Anterior' },
          { key: 'custom', label: 'Personalizado' },
        ].map(p => (
          <button
            key={p.key}
            onClick={() => setPeriodPreset(p.key)}
            style={{
              padding: '0.375rem 1rem', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1px solid ${periodPreset === p.key ? 'var(--gold-primary)' : 'var(--border-default)'}`,
              background: periodPreset === p.key ? 'rgba(228,194,58,0.1)' : 'transparent',
              color: periodPreset === p.key ? 'var(--gold-primary)' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {p.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {monthNames[currentMonth]} {currentYear}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Charts */}
      {renderCharts()}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', marginBottom: 20, gap: 0 }}>
        {[
          { key: 'RECEBER', label: 'Contas a Receber', icon: TrendingUp },
          { key: 'PAGAR', label: 'Contas a Pagar', icon: TrendingDown },
          { key: 'RELATORIOS', label: 'Relatórios', icon: FileSpreadsheet },
        ].map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key as TabView); setSearchTerm(''); setFilterStatus('all'); setFilterCategory('all'); setFilterClient('all'); }}
            style={s.tab(activeTab === t.key)}>
            <t.icon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'RELATORIOS' ? renderRelatorios() : renderTransactionTable()}

      {/* Modals */}
      {renderNewTransactionModal()}
      {renderPayModal()}
      {renderDetailModal()}
      {renderInvoiceModal()}
    </div>
  );
}
