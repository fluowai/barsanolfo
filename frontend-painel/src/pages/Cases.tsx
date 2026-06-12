import { useState, useEffect } from 'react';
import {
  Search, Plus, Eye, Edit, Trash2, X, FileText, Calendar, Database, AlertCircle,
  Scale, Users, UserCheck, TrendingUp, DollarSign, CheckCircle, Clock,
  XCircle, Activity, ClipboardList, Briefcase, Shield, Target,
  MessageSquare, BookOpen, BarChart, Filter, MoreVertical,
  ChevronDown, ChevronRight, Tag, MapPin, Building, User,
  Gavel, Percent, AlertTriangle, Star, ArrowUpRight, Download,
  Loader, Phone, Mail, Paperclip, FolderOpen, FileSignature,
  Landmark, Bookmark, RefreshCw, EyeOff, Eye as EyeIcon
} from 'lucide-react';
import './Cases.css';
import { CASE_STATUS } from '../constants';
import { casesApi, clientsApi } from '../services/api';

/* ───────────── INTERFACES ───────────── */

interface ProcessMove {
  dataHora: string;
  nome: string;
  complementosTabelados?: { nome: string; valor: string | number }[];
}

interface ProcessData {
  numeroProcesso: string;
  classe: { nome: string };
  sistema: { nome: string };
  tribunal: string;
  dataHoraUltimaAtualizacao: string;
  movimentos: ProcessMove[];
}

interface SearchResult {
  alias: string;
  tribunal: string;
  total: number;
  processes: ProcessData[];
}

interface CaseMovement {
  id: string;
  date: string;
  description: string;
  type: 'despacho' | 'decisao' | 'sentenca' | 'intimacao' | 'peticao' | 'outro';
  visibleToClient: boolean;
}

interface CaseDeadline {
  id: string;
  title: string;
  date: string;
  type: string;
  status: 'pending' | 'completed' | 'expired';
}

interface CaseHearing {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  local: string;
  status: 'scheduled' | 'realized' | 'cancelled';
}

interface CaseTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  assignee: string;
}

interface CaseDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  size: string;
}

interface CaseFinance {
  id: string;
  description: string;
  type: 'income' | 'expense';
  value: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

interface CaseHistory {
  id: string;
  action: string;
  user: string;
  date: string;
  description: string;
}

interface LegalCase {
  id: string;
  cnjNumber: string;
  internalTitle: string;
  clientId: string;
  clientName: string;
  court: string;
  courtBranch: string;
  district: string;
  state: string;
  proceduralClass: string;
  legalArea: string;
  subject: string;
  activePole: string;
  passivePole: string;
  opposingParty: string;
  responsibleLawyer: string;
  internName: string;
  phase: string;
  status: string;
  causeValue: number;
  successProbability: number;
  riskLevel: 'baixo' | 'medio' | 'alto';
  caseStrategy: string;
  nextAction: string;
  distributionDate: string;
  visibleToClient: boolean;
  lastMovement: string;
  lastMovementDate: string;
  createdAt: string;
  updatedAt: string;
  movements: CaseMovement[];
  deadlines: CaseDeadline[];
  hearings: CaseHearing[];
  tasks: CaseTask[];
  documents: CaseDocument[];
  finances: CaseFinance[];
  history: CaseHistory[];
}

/* ───────────── FORM CONFIG ───────────── */

const TEAM_MEMBERS = [
  { id: 't1', name: 'Dra. Fernanda Lima' },
  { id: 't2', name: 'Dr. Ricardo Santos' },
  { id: 't3', name: 'Dra. Juliana Costa' },
  { id: 't4', name: 'Dr. Paulo Oliveira' },
];

const LEGAL_AREAS = [
  'Direito do Trabalho', 'Direito Civil', 'Direito de Família',
  'Direito Empresarial', 'Direito Tributário', 'Direito Previdenciário',
  'Direito do Consumidor', 'Direito Penal', 'Direito Administrativo',
];

const PHASES = [
  'Pré-Processual', 'Conhecimento', 'Instrução', 'Sentença',
  'Recursal', 'Execução', 'Arquivado',
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo', color: '#10B981' },
  { value: 'SUSPENDED', label: 'Suspenso', color: '#F59E0B' },
  { value: 'ARCHIVED', label: 'Arquivado', color: '#6B7280' },
  { value: 'CLOSED', label: 'Encerrado', color: '#EF4444' },
];

const COURTS = [
  'TJSP', 'TJMG', 'TJRJ', 'TJRS', 'TJPR', 'TJBA', 'TJDFT',
  'TRT-1', 'TRT-2', 'TRF-1', 'TRF-3', 'STJ', 'TST',
];

const COURTS_BRANCH: Record<string, string[]> = {
  'TJSP': ['Foro Central', 'Foro Regional I', 'Foro Regional II', 'Foro Regional III', 'Foro Regional IV'],
  'TJMG': ['Foro de Belo Horizonte', 'Foro de Contagem', 'Foro de Uberlândia'],
  'TJRJ': ['Foro Central', 'Foro Regional da Barra', 'Foro Regional de Nova Iguaçu'],
  'TRT-2': ['1ª Vara do Trabalho', '2ª Vara do Trabalho', '3ª Vara do Trabalho'],
};

/* ───────────── HELPERS ───────────── */

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    ACTIVE: { label: 'Ativo', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
    SUSPENDED: { label: 'Suspenso', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
    ARCHIVED: { label: 'Arquivado', color: '#6B7280', bg: 'rgba(107,114,128,0.15)' },
    CLOSED: { label: 'Encerrado', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  };
  return map[status] || { label: status, color: '#6B7280', bg: 'rgba(107,114,128,0.15)' };
};

const getPhaseBadge = (phase: string) => {
  const colors: Record<string, string> = {
    'Pré-Processual': '#8B5CF6', 'Conhecimento': '#3B82F6', 'Instrução': '#F59E0B',
    'Sentença': '#EC4899', 'Recursal': '#06B6D4', 'Execução': '#F97316', 'Arquivado': '#6B7280',
  };
  return colors[phase] || '#6B7280';
};

const getRiskColor = (risk: string) => {
  const map: Record<string, string> = { baixo: '#10B981', medio: '#F59E0B', alto: '#EF4444' };
  return map[risk] || '#6B7280';
};

/* ───────────── MAIN COMPONENT ───────────── */

export default function Cases() {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clientOptions, setClientOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [casesRes, clientsRes] = await Promise.all([
          casesApi.list(),
          clientsApi.list(),
        ]);
        const caseList = (casesRes as any).cases || (casesRes as any).data || [];
        setCases(Array.isArray(caseList) ? caseList : []);
        const clientList = (clientsRes as any).clients || (clientsRes as any).data || [];
        if (Array.isArray(clientList)) {
          setClientOptions(clientList.map((c: any) => ({ id: c.id, name: c.name })));
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    status: 'ALL', phase: 'ALL', legalArea: 'ALL',
    responsible: 'ALL', court: 'ALL',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [viewingCase, setViewingCase] = useState<LegalCase | null>(null);
  const [detailTab, setDetailTab] = useState('resumo');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<string | null>(null);

  const [datajudSearch, setDatajudSearch] = useState('');
  const [datajudLoading, setDatajudLoading] = useState(false);
  const [datajudResult, setDatajudResult] = useState<SearchResult | null>(null);
  const [datajudError, setDatajudError] = useState<string | null>(null);

  /* ── Form State ── */
  const emptyForm = {
    cnjNumber: '', internalTitle: '', clientId: '', court: '', courtBranch: '', district: '', state: '',
    proceduralClass: '', legalArea: '', subject: '', activePole: '', passivePole: '', opposingParty: '',
    responsibleLawyer: '', internName: '', phase: '', status: 'ACTIVE', causeValue: 0,
    successProbability: 0, riskLevel: 'medio' as 'baixo' | 'medio' | 'alto',
    caseStrategy: '', nextAction: '', distributionDate: '', visibleToClient: true,
  };
  const [formData, setFormData] = useState(emptyForm);

  /* ── Derived data ── */
  const filteredCases = cases.filter(c => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !searchTerm ||
      c.cnjNumber.toLowerCase().includes(s) ||
      c.internalTitle.toLowerCase().includes(s) ||
      c.clientName.toLowerCase().includes(s) ||
      c.opposingParty.toLowerCase().includes(s);
    const matchStatus = activeFilters.status === 'ALL' || c.status === activeFilters.status;
    const matchPhase = activeFilters.phase === 'ALL' || c.phase === activeFilters.phase;
    const matchArea = activeFilters.legalArea === 'ALL' || c.legalArea === activeFilters.legalArea;
    const matchResponsible = activeFilters.responsible === 'ALL' || c.responsibleLawyer === activeFilters.responsible;
    const matchCourt = activeFilters.court === 'ALL' || c.court === activeFilters.court;
    return matchSearch && matchStatus && matchPhase && matchArea && matchResponsible && matchCourt;
  });

  const stats = {
    total: cases.length,
    active: cases.filter(c => c.status === 'ACTIVE').length,
    closed: cases.filter(c => c.status === 'CLOSED').length,
    totalValue: cases.reduce((acc, c) => acc + c.causeValue, 0),
  };

  /* ── CRUD Ops ── */
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCase) {
        const res = await casesApi.update(editingCase.id, formData);
        const updated = (res as any).case || (res as any).data || res;
        if (updated) {
          setCases(cases.map(c => c.id === editingCase.id ? { ...c, ...updated } : c));
        }
      } else {
        const res = await casesApi.create(formData);
        const newCase = (res as any).case || (res as any).data || res;
        if (newCase) {
          setCases([newCase, ...cases]);
        }
      }
      setShowFormModal(false);
      setEditingCase(null);
      setFormData(emptyForm);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar processo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (c: LegalCase) => {
    setEditingCase(c);
    setFormData({
      cnjNumber: c.cnjNumber,
      internalTitle: c.internalTitle,
      clientId: c.clientId,
      court: c.court,
      courtBranch: c.courtBranch,
      district: c.district,
      state: c.state,
      proceduralClass: c.proceduralClass,
      legalArea: c.legalArea,
      subject: c.subject,
      activePole: c.activePole,
      passivePole: c.passivePole,
      opposingParty: c.opposingParty,
      responsibleLawyer: c.responsibleLawyer,
      internName: c.internName,
      phase: c.phase,
      status: c.status,
      causeValue: c.causeValue,
      successProbability: c.successProbability,
      riskLevel: c.riskLevel,
      caseStrategy: c.caseStrategy,
      nextAction: c.nextAction,
      distributionDate: c.distributionDate,
      visibleToClient: c.visibleToClient,
    });
    setShowFormModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await casesApi.delete(id);
      setCases(cases.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir processo');
    }
    setShowDeleteConfirm(null);
  };

  const openFormForNew = () => {
    setEditingCase(null);
    setFormData(emptyForm);
    setShowFormModal(true);
  };

  /* ── DataJud Search ── */
  const handleDatajudSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datajudSearch.trim()) return;
    setDatajudLoading(true);
    setDatajudError(null);
    setDatajudResult(null);
    try {
      const response = await fetch('/api/datajud/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processNumber: datajudSearch }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao buscar');
      if (data.data.total === 0) {
        setDatajudError('Nenhum processo encontrado.');
      } else {
        setDatajudResult(data.data);
      }
    } catch (err: any) {
      setDatajudError(err.message || 'Erro ao buscar no DataJud');
    } finally {
      setDatajudLoading(false);
    }
  };

  const importFromDatajud = async (proc: ProcessData) => {
    const newCase: LegalCase = {
      id: String(Date.now()),
      cnjNumber: proc.numeroProcesso,
      internalTitle: proc.classe?.nome || `Processo ${proc.numeroProcesso}`,
      clientId: '', clientName: 'Selecione um cliente',
      court: proc.tribunal, courtBranch: '', district: '', state: '',
      proceduralClass: proc.classe?.nome || '', legalArea: '', subject: '',
      activePole: '', passivePole: '', opposingParty: '',
      responsibleLawyer: '', internName: '',
      phase: 'Conhecimento', status: 'ACTIVE', causeValue: 0,
      successProbability: 50, riskLevel: 'medio',
      caseStrategy: '', nextAction: '', distributionDate: '',
      visibleToClient: true,
      lastMovement: proc.movimentos?.[0]?.nome || 'Importado do DataJud',
      lastMovementDate: proc.dataHoraUltimaAtualizacao,
      createdAt: proc.dataHoraUltimaAtualizacao,
      updatedAt: proc.dataHoraUltimaAtualizacao,
      movements: (proc.movimentos || []).map((m, i) => ({
        id: `imp-${i}`, date: m.dataHora, description: m.nome,
        type: 'outro' as const, visibleToClient: true,
      })),
      deadlines: [], hearings: [], tasks: [], documents: [], finances: [],
      history: [{ id: `hi-imp-${Date.now()}`, action: 'Importado', user: 'Sistema', date: new Date().toISOString(), description: 'Importado do DataJud' }],
    };
    setCases([newCase, ...cases]);
    setDatajudResult(null);
    setDatajudSearch('');
  };

  /* ── Render ── */
  return (
    <div className="page">
      <style>{`
        .cases-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .cases-drawer { position: fixed; top: 0; right: 0; height: 100vh; width: 680px; max-width: 100vw; z-index: 500; transform: translateX(100%); transition: transform 0.3s ease; }
        .cases-drawer.open { transform: translateX(0); }
        .cases-drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 499; backdrop-filter: blur(2px); }
        .detail-tabs { display: flex; gap: 2px; overflow-x: auto; padding: 0 24px; border-bottom: 1px solid var(--border); background: var(--bg-elevated); }
        .detail-tab { padding: 12px 14px; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .detail-tab:hover { color: var(--text-primary); background: var(--bg-hover); }
        .detail-tab.active { color: var(--gold-primary); border-bottom-color: var(--gold-primary); }
        .info-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        .info-field { display: flex; flex-direction: column; gap: 4px; }
        .info-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .info-value { font-size: 14px; color: var(--text-primary); font-weight: 500; word-break: break-word; }
        .info-value.muted { color: var(--text-secondary); }
        .section-title { font-size: 13px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .movement-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 10px; padding: 14px; transition: all 0.2s; }
        .movement-card:hover { border-color: var(--border-light); }
        .table-actions { display: flex; gap: 4px; align-items: center; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-grid .full { grid-column: 1 / -1; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px; }
        .field-control { background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; color: var(--text-primary); font-size: 14px; outline: none; transition: all 0.2s; font-family: inherit; width: 100%; }
        .field-control:focus { border-color: var(--gold-primary); box-shadow: 0 0 0 3px var(--gold-glow); }
        .field-control::placeholder { color: var(--text-tertiary); }
        select.field-control { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23A1A1AA' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
        textarea.field-control { min-height: 90px; resize: vertical; }
        .toggle-switch { position: relative; width: 44px; height: 24px; background: var(--border); border-radius: 12px; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
        .toggle-switch.active { background: var(--gold-primary); }
        .toggle-switch .toggle-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: all 0.2s; }
        .toggle-switch.active .toggle-knob { left: 22px; }
        .drawer-content { height: 100%; display: flex; flex-direction: column; background: var(--bg-card); border-left: 1px solid var(--border); }
        .drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
        .drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
        .drawer-section { padding: 20px 0; }
        .drawer-section + .drawer-section { border-top: 1px solid var(--border); }
        .filter-expanded { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 24px; }
        .filter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
        .search-wrapper { flex: 1; min-width: 250px; display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 0 14px; color: var(--text-tertiary); transition: all 0.2s; }
        .search-wrapper:focus-within { border-color: var(--gold-primary); box-shadow: 0 0 0 3px var(--gold-glow); }
        .search-wrapper input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-size: 14px; outline: none; padding: 12px 0; }
        .search-wrapper input::placeholder { color: var(--text-tertiary); }
        .dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 4px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; min-width: 200px; z-index: 100; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden; }
        .dropdown-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; background: transparent; border: none; color: var(--text-primary); font-size: 13px; text-align: left; cursor: pointer; transition: all 0.15s; }
        .dropdown-item:hover { background: var(--bg-hover); }
        .dropdown-item.danger { color: var(--red); }
        .dropdown-item.danger:hover { background: var(--red-bg); }
        .relative { position: relative; }
        .progress-bar { width: 100%; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
      `}</style>

      {/* ─── PAGE HEADER ─── */}
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Scale size={28} />
            Processos
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {filteredCases.length} processo{filteredCases.length !== 1 ? 's' : ''} encontrado{filteredCases.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filtros
          </button>
          <button className="btn btn-primary" onClick={openFormForNew}>
            <Plus size={18} />
            Novo Processo
          </button>
        </div>
      </div>

      {/* ─── STATS CARDS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-label">Total Processos</div>
          <div className="stat-value" style={{ color: 'var(--gold-primary)' }}>{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Processos Ativos</div>
          <div className="stat-value" style={{ color: '#10B981' }}>{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Processos Encerrados</div>
          <div className="stat-value" style={{ color: '#EF4444' }}>{stats.closed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Valor Total da Causa</div>
          <div className="stat-value" style={{ color: '#3B82F6', fontSize: '1.25rem' }}>{formatCurrency(stats.totalValue)}</div>
        </div>
      </div>

      {/* ─── SEARCH BAR ─── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por número CNJ, título, cliente, parte contrária..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="search-wrapper" style={{ maxWidth: '360px', flex: '0 0 auto' }}>
          <Database size={16} style={{ color: 'var(--gold-primary)' }} />
          <input
            type="text"
            placeholder="Número CNJ (DataJud)..."
            value={datajudSearch}
            onChange={e => setDatajudSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDatajudSearch(e)}
          />
          <button
            className="btn btn-sm btn-gold"
            onClick={handleDatajudSearch}
            disabled={datajudLoading}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            {datajudLoading ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
          </button>
        </div>
      </div>

      {/* ─── FILTERS ─── */}
      {showFilters && (
        <div className="filter-expanded">
          <div className="filter-grid">
            <div className="field-group">
              <label>Status</label>
              <select className="field-control" value={activeFilters.status} onChange={e => setActiveFilters({ ...activeFilters, status: e.target.value })}>
                <option value="ALL">Todos</option>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Fase</label>
              <select className="field-control" value={activeFilters.phase} onChange={e => setActiveFilters({ ...activeFilters, phase: e.target.value })}>
                <option value="ALL">Todas</option>
                {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Área Jurídica</label>
              <select className="field-control" value={activeFilters.legalArea} onChange={e => setActiveFilters({ ...activeFilters, legalArea: e.target.value })}>
                <option value="ALL">Todas</option>
                {LEGAL_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Responsável</label>
              <select className="field-control" value={activeFilters.responsible} onChange={e => setActiveFilters({ ...activeFilters, responsible: e.target.value })}>
                <option value="ALL">Todos</option>
                {TEAM_MEMBERS.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Tribunal</label>
              <select className="field-control" value={activeFilters.court} onChange={e => setActiveFilters({ ...activeFilters, court: e.target.value })}>
                <option value="ALL">Todos</option>
                {COURTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setActiveFilters({ status: 'ALL', phase: 'ALL', legalArea: 'ALL', responsible: 'ALL', court: 'ALL' })}>
                Limpar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DATAJUD ERROR ─── */}
      {datajudError && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          <AlertCircle size={18} />
          <span>{datajudError}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setDatajudError(null)} style={{ marginLeft: 'auto' }}><X size={14} /></button>
        </div>
      )}

      {/* ─── DATAJUD RESULT ─── */}
      {datajudResult && datajudResult.processes.map((proc, idx) => (
        <div key={idx} className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header">
            <div>
              <span className="badge badge-gold">{proc.tribunal}</span>
              <h3 style={{ marginTop: '4px' }}>{proc.numeroProcesso}</h3>
              <small style={{ color: 'var(--text-tertiary)' }}>{proc.classe?.nome} - {proc.sistema?.nome}</small>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => importFromDatajud(proc)}>
              <Database size={14} />
              Importar
            </button>
          </div>
          <div className="card-body" style={{ maxHeight: '200px', overflow: 'auto' }}>
            {proc.movimentos?.slice(0, 3).map((mov, i) => (
              <div key={i} className="timeline-item" style={{ paddingBottom: '12px', marginLeft: '16px' }}>
                <div className="timeline-time">{formatDateTime(mov.dataHora)}</div>
                <div className="timeline-title" style={{ fontSize: '13px' }}>{mov.nome}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ─── TABLE ─── */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Número CNJ / Título</th>
              <th>Cliente</th>
              <th>Área / Tribunal / Vara</th>
              <th>Fase / Status</th>
              <th>Responsável</th>
              <th>Valor da Causa</th>
              <th>Última Mov.</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{c.cnjNumber}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => { setViewingCase(c); setDetailTab('resumo'); }}>
                      {c.internalTitle}
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={12} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                    {c.clientName}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="badge badge-blue" style={{ fontSize: '10px', width: 'fit-content' }}>{c.legalArea}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{c.court} / {c.courtBranch}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="badge" style={{ background: `${getPhaseBadge(c.phase)}20`, color: getPhaseBadge(c.phase), fontSize: '11px', width: 'fit-content' }}>{c.phase}</span>
                    <span className="badge" style={{ background: getStatusBadge(c.status).bg, color: getStatusBadge(c.status).color, fontSize: '11px', width: 'fit-content' }}>{getStatusBadge(c.status).label}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '13px' }}>{c.responsibleLawyer || <span style={{ color: 'var(--text-tertiary)' }}>-</span>}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--gold-primary)', fontSize: '13px' }}>
                    {c.causeValue > 0 ? formatCurrency(c.causeValue) : '-'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {c.lastMovementDate ? formatDate(c.lastMovementDate) : '-'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-icon btn-sm" title="Visualizar" onClick={() => { setViewingCase(c); setDetailTab('resumo'); }}>
                      <Eye size={14} />
                    </button>
                    <button className="btn btn-icon btn-sm" title="Editar" onClick={() => handleEdit(c)}>
                      <Edit size={14} />
                    </button>
                    <div className="relative">
                      <button className="btn btn-icon btn-sm" title="Mais" onClick={() => setContextMenu(contextMenu === c.id ? null : c.id)}>
                        <MoreVertical size={14} />
                      </button>
                      {contextMenu === c.id && (
                        <>
                          <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={() => { setViewingCase(c); setDetailTab('resumo'); setContextMenu(null); }}>
                              <Eye size={14} /> Ver detalhes
                            </button>
                            <button className="dropdown-item" onClick={() => { handleEdit(c); setContextMenu(null); }}>
                              <Edit size={14} /> Editar
                            </button>
                            <div className="divider" style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                            <button className="dropdown-item danger" onClick={() => { setShowDeleteConfirm(c.id); setContextMenu(null); }}>
                              <Trash2 size={14} /> Excluir
                            </button>
                          </div>
                          <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setContextMenu(null)} />
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCases.length === 0 && (
          <div className="empty-state">
            <Scale size={40} />
            <h4>Nenhum processo encontrado</h4>
            <p>Não há processos correspondentes aos filtros selecionados. Tente ajustar os filtros ou crie um novo processo.</p>
            <button className="btn btn-primary" onClick={openFormForNew}>
              <Plus size={16} /> Novo Processo
            </button>
          </div>
        )}
      </div>

      {/* ─── FORM MODAL ─── */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => { setShowFormModal(false); setEditingCase(null); }}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: '860px' }}>
            <div className="modal-header">
              <h2>{editingCase ? 'Editar Processo' : 'Novo Processo'}</h2>
              <button className="modal-close" onClick={() => { setShowFormModal(false); setEditingCase(null); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitForm}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="form-grid">
                  <div className="field-group full">
                    <label>Número CNJ</label>
                    <input className="field-control" placeholder="NNNNNNN-DD.AAAA.J.TR.OOOO" value={formData.cnjNumber} onChange={e => setFormData({ ...formData, cnjNumber: e.target.value })} />
                  </div>
                  <div className="field-group full">
                    <label>Título Interno</label>
                    <input className="field-control" placeholder="Ex: Reclamação Trabalhista - João" value={formData.internalTitle} onChange={e => setFormData({ ...formData, internalTitle: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Cliente</label>
                    <select className="field-control" value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })}>
                      <option value="">Selecione...</option>
                      {clientOptions.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Área Jurídica</label>
                    <select className="field-control" value={formData.legalArea} onChange={e => setFormData({ ...formData, legalArea: e.target.value })}>
                      <option value="">Selecione...</option>
                      {LEGAL_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Tribunal</label>
                    <select className="field-control" value={formData.court} onChange={e => setFormData({ ...formData, court: e.target.value, courtBranch: '' })}>
                      <option value="">Selecione...</option>
                      {COURTS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Vara</label>
                    <input className="field-control" value={formData.courtBranch} onChange={e => setFormData({ ...formData, courtBranch: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Comarca</label>
                    <input className="field-control" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Estado</label>
                    <select className="field-control" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })}>
                      <option value="">Selecione...</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Classe Processual</label>
                    <input className="field-control" value={formData.proceduralClass} onChange={e => setFormData({ ...formData, proceduralClass: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Assunto</label>
                    <input className="field-control" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Polo Ativo</label>
                    <input className="field-control" value={formData.activePole} onChange={e => setFormData({ ...formData, activePole: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Polo Passivo</label>
                    <input className="field-control" value={formData.passivePole} onChange={e => setFormData({ ...formData, passivePole: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Parte Contrária</label>
                    <input className="field-control" value={formData.opposingParty} onChange={e => setFormData({ ...formData, opposingParty: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Advogado Responsável</label>
                    <select className="field-control" value={formData.responsibleLawyer} onChange={e => setFormData({ ...formData, responsibleLawyer: e.target.value })}>
                      <option value="">Selecione...</option>
                      {TEAM_MEMBERS.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Estagiário</label>
                    <select className="field-control" value={formData.internName} onChange={e => setFormData({ ...formData, internName: e.target.value })}>
                      <option value="">Selecione...</option>
                      <option value="João Oliveira">João Oliveira</option>
                      <option value="Marina Lima">Marina Lima</option>
                      <option value="Lucas Santos">Lucas Santos</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Fase Processual</label>
                    <select className="field-control" value={formData.phase} onChange={e => setFormData({ ...formData, phase: e.target.value })}>
                      <option value="">Selecione...</option>
                      {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Status</label>
                    <select className="field-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Valor da Causa (R$)</label>
                    <input className="field-control" type="number" min="0" step="0.01" value={formData.causeValue} onChange={e => setFormData({ ...formData, causeValue: Number(e.target.value) })} />
                  </div>
                  <div className="field-group">
                    <label>Probabilidade de Êxito (%)</label>
                    <input className="field-control" type="number" min="0" max="100" value={formData.successProbability} onChange={e => setFormData({ ...formData, successProbability: Number(e.target.value) })} />
                  </div>
                  <div className="field-group">
                    <label>Grau de Risco</label>
                    <select className="field-control" value={formData.riskLevel} onChange={e => setFormData({ ...formData, riskLevel: e.target.value as any })}>
                      <option value="baixo">Baixo</option>
                      <option value="medio">Médio</option>
                      <option value="alto">Alto</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Data de Distribuição</label>
                    <input className="field-control" type="date" value={formData.distributionDate} onChange={e => setFormData({ ...formData, distributionDate: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Próxima Ação</label>
                    <input className="field-control" value={formData.nextAction} onChange={e => setFormData({ ...formData, nextAction: e.target.value })} />
                  </div>
                  <div className="field-group full">
                    <label>Estratégia do Caso</label>
                    <textarea className="field-control" rows={3} value={formData.caseStrategy} onChange={e => setFormData({ ...formData, caseStrategy: e.target.value })} />
                  </div>
                  <div className="field-group full">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Visível para Cliente</span>
                      <div className={`toggle-switch ${formData.visibleToClient ? 'active' : ''}`} onClick={() => setFormData({ ...formData, visibleToClient: !formData.visibleToClient })}>
                        <div className="toggle-knob" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowFormModal(false); setEditingCase(null); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingCase ? 'Salvar' : 'Criar Processo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRM ─── */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Exclusão</h2>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DETAIL DRAWER ─── */}
      {viewingCase && (
        <>
          <div className="cases-drawer-overlay" onClick={() => setViewingCase(null)} />
          <div className={`cases-drawer open`}>
            <div className="drawer-content">
              <div className="drawer-header">
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{viewingCase.internalTitle}</h2>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{viewingCase.cnjNumber}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="btn btn-icon btn-sm" title="Editar" onClick={() => { handleEdit(viewingCase); setViewingCase(null); }}>
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-icon btn-sm" title="Fechar" onClick={() => setViewingCase(null)}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="detail-tabs">
                {['resumo', 'partes', 'movimentacoes', 'prazos', 'audiencias', 'tarefas', 'documentos', 'financeiro', 'estrategia', 'historico'].map(tab => (
                  <button
                    key={tab}
                    className={`detail-tab ${detailTab === tab ? 'active' : ''}`}
                    onClick={() => setDetailTab(tab)}
                  >
                    {tab === 'resumo' && <><Activity size={12} /> Resumo</>}
                    {tab === 'partes' && <><Users size={12} /> Partes</>}
                    {tab === 'movimentacoes' && <><Clock size={12} /> Mov.</>}
                    {tab === 'prazos' && <><Calendar size={12} /> Prazos</>}
                    {tab === 'audiencias' && <><Gavel size={12} /> Audiências</>}
                    {tab === 'tarefas' && <><ClipboardList size={12} /> Tarefas</>}
                    {tab === 'documentos' && <><FileText size={12} /> Docs.</>}
                    {tab === 'financeiro' && <><DollarSign size={12} /> Fin.</>}
                    {tab === 'estrategia' && <><Target size={12} /> Estratégia</>}
                    {tab === 'historico' && <><BookOpen size={12} /> Hist.</>}
                  </button>
                ))}
              </div>

              <div className="drawer-body">
                {/* ── TAB: RESUMO ── */}
                {detailTab === 'resumo' && (
                  <div>
                    <div className="drawer-section">
                      <div className="section-title"><FileText size={16} /> Informações do Processo</div>
                      <div className="info-row">
                        <div className="info-field"><span className="info-label">CNJ</span><span className="info-value">{viewingCase.cnjNumber}</span></div>
                        <div className="info-field"><span className="info-label">Cliente</span><span className="info-value">{viewingCase.clientName}</span></div>
                        <div className="info-field"><span className="info-label">Área Jurídica</span><span className="info-value">{viewingCase.legalArea}</span></div>
                        <div className="info-field"><span className="info-label">Tribunal / Vara</span><span className="info-value">{viewingCase.court} - {viewingCase.courtBranch}</span></div>
                        <div className="info-field"><span className="info-label">Fase</span><span className="info-value">{viewingCase.phase}</span></div>
                        <div className="info-field"><span className="info-label">Status</span>
                          <span className="badge" style={{ background: getStatusBadge(viewingCase.status).bg, color: getStatusBadge(viewingCase.status).color, width: 'fit-content' }}>
                            {getStatusBadge(viewingCase.status).label}
                          </span>
                        </div>
                        <div className="info-field"><span className="info-label">Valor da Causa</span><span className="info-value" style={{ color: 'var(--gold-primary)' }}>{formatCurrency(viewingCase.causeValue)}</span></div>
                        <div className="info-field"><span className="info-label">Distribuição</span><span className="info-value">{formatDate(viewingCase.distributionDate)}</span></div>
                        <div className="info-field"><span className="info-label">Responsável</span><span className="info-value">{viewingCase.responsibleLawyer}</span></div>
                        <div className="info-field"><span className="info-label">Visível ao Cliente</span>
                          <span className={`badge ${viewingCase.visibleToClient ? 'badge-green' : 'badge-default'}`}>
                            {viewingCase.visibleToClient ? 'Sim' : 'Não'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="drawer-section">
                      <div className="section-title"><Clock size={16} /> Últimas Movimentações</div>
                      {viewingCase.movements.slice(0, 5).map(m => (
                        <div key={m.id} className="movement-card" style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div>
                              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{m.description}</p>
                              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', marginBottom: 0 }}>
                                {formatDateTime(m.date)}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                              <span className="badge badge-default" style={{ fontSize: '10px' }}>{m.type}</span>
                              {!m.visibleToClient && <span title="Oculto do cliente"><EyeOff size={12} style={{ color: 'var(--text-tertiary)' }} /></span>}
                            </div>
                          </div>
                        </div>
                      ))}
                      {viewingCase.movements.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Nenhuma movimentação registrada.</p>}
                    </div>
                  </div>
                )}

                {/* ── TAB: PARTES ── */}
                {detailTab === 'partes' && (
                  <div>
                    <div className="drawer-section">
                      <div className="section-title"><User size={16} /> Polo Ativo</div>
                      <div className="info-field"><span className="info-value" style={{ fontSize: '15px' }}>{viewingCase.activePole}</span></div>
                    </div>
                    <div className="drawer-section">
                      <div className="section-title"><UserCheck size={16} /> Polo Passivo</div>
                      <div className="info-field"><span className="info-value" style={{ fontSize: '15px' }}>{viewingCase.passivePole}</span></div>
                    </div>
                    <div className="drawer-section">
                      <div className="section-title"><AlertTriangle size={16} /> Parte Contrária</div>
                      <div className="info-field"><span className="info-value" style={{ fontSize: '15px' }}>{viewingCase.opposingParty}</span></div>
                    </div>
                    <div className="drawer-section">
                      <div className="section-title"><Briefcase size={16} /> Equipe do Escritório</div>
                      <div className="info-row">
                        <div className="info-field"><span className="info-label">Cliente</span><span className="info-value">{viewingCase.clientName}</span></div>
                        <div className="info-field"><span className="info-label">Advogado Responsável</span><span className="info-value">{viewingCase.responsibleLawyer || '-'}</span></div>
                        <div className="info-field"><span className="info-label">Estagiário</span><span className="info-value">{viewingCase.internName || '-'}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB: MOVIMENTAÇÕES ── */}
                {detailTab === 'movimentacoes' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Todas as Movimentações</h4>
                      <button className="btn btn-sm btn-primary" onClick={() => {
                        const newMov: CaseMovement = {
                          id: String(Date.now()),
                          date: new Date().toISOString(),
                          description: 'Nova movimentação',
                          type: 'outro',
                          visibleToClient: true,
                        };
                        setCases(cases.map(c => c.id === viewingCase.id ? { ...c, movements: [newMov, ...c.movements] } : c));
                        setViewingCase({ ...viewingCase, movements: [newMov, ...viewingCase.movements] });
                      }}>
                        <Plus size={14} /> Adicionar Movimentação
                      </button>
                    </div>
                    {viewingCase.movements.map(m => (
                      <div key={m.id} className="movement-card" style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{m.description}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', marginBottom: 0 }}>{formatDateTime(m.date)}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                            <span className="badge badge-default" style={{ fontSize: '10px' }}>{m.type}</span>
                            <span className={`badge ${m.visibleToClient ? 'badge-green' : 'badge-default'}`} style={{ fontSize: '10px' }}>
                              {m.visibleToClient ? 'Visível' : 'Oculto'}
                            </span>
                            <button className="btn btn-icon btn-sm" style={{ color: 'var(--text-tertiary)' }}
                              onClick={() => {
                                const updated = cases.map(c => c.id === viewingCase.id ? {
                                  ...c,
                                  movements: c.movements.map(mv => mv.id === m.id ? { ...mv, visibleToClient: !mv.visibleToClient } : mv)
                                } : c);
                                setCases(updated);
                                setViewingCase(updated.find(c => c.id === viewingCase.id)!);
                              }}>
                              {m.visibleToClient ? <Eye size={12} /> : <EyeOff size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {viewingCase.movements.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>Nenhuma movimentação.</p>}
                  </div>
                )}

                {/* ── TAB: PRAZOS ── */}
                {detailTab === 'prazos' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Prazos ({viewingCase.deadlines.length})</h4>
                      <button className="btn btn-sm btn-secondary" onClick={() => {
                        const newD: CaseDeadline = { id: String(Date.now()), title: 'Novo Prazo', date: new Date().toISOString().split('T')[0], type: 'Outro', status: 'pending' };
                        setCases(cases.map(c => c.id === viewingCase.id ? { ...c, deadlines: [...c.deadlines, newD] } : c));
                        setViewingCase({ ...viewingCase, deadlines: [...viewingCase.deadlines, newD] });
                      }}><Plus size={14} /> Adicionar Prazo</button>
                    </div>
                    {viewingCase.deadlines.map(d => (
                      <div key={d.id} className="movement-card" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{d.title}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', marginBottom: 0 }}>{d.type} - {formatDate(d.date)}</p>
                        </div>
                        <span className={`badge ${d.status === 'completed' ? 'badge-green' : d.status === 'expired' ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: '11px' }}>
                          {d.status === 'completed' ? 'Concluído' : d.status === 'expired' ? 'Vencido' : 'Pendente'}
                        </span>
                      </div>
                    ))}
                    {viewingCase.deadlines.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>Nenhum prazo cadastrado.</p>}
                  </div>
                )}

                {/* ── TAB: AUDIÊNCIAS ── */}
                {detailTab === 'audiencias' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Audiências ({viewingCase.hearings.length})</h4>
                      <button className="btn btn-sm btn-secondary" onClick={() => {
                        const newH: CaseHearing = { id: String(Date.now()), title: 'Nova Audiência', date: new Date().toISOString().split('T')[0], time: '14:00', type: 'Outra', local: 'Fórum', status: 'scheduled' };
                        setCases(cases.map(c => c.id === viewingCase.id ? { ...c, hearings: [...c.hearings, newH] } : c));
                        setViewingCase({ ...viewingCase, hearings: [...viewingCase.hearings, newH] });
                      }}><Plus size={14} /> Adicionar Audiência</button>
                    </div>
                    {viewingCase.hearings.map(h => (
                      <div key={h.id} className="movement-card" style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{h.title}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', marginBottom: 0 }}>
                              {formatDate(h.date)} às {h.time} - {h.type}
                            </p>
                            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                              <MapPin size={10} /> {h.local}
                            </p>
                          </div>
                          <span className={`badge ${h.status === 'realized' ? 'badge-green' : h.status === 'cancelled' ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: '11px' }}>
                            {h.status === 'realized' ? 'Realizada' : h.status === 'cancelled' ? 'Cancelada' : 'Agendada'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {viewingCase.hearings.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>Nenhuma audiência cadastrada.</p>}
                  </div>
                )}

                {/* ── TAB: TAREFAS ── */}
                {detailTab === 'tarefas' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Tarefas ({viewingCase.tasks.length})</h4>
                      <button className="btn btn-sm btn-primary" onClick={() => {
                        const newT: CaseTask = { id: String(Date.now()), title: 'Nova tarefa', description: '', dueDate: new Date().toISOString().split('T')[0], priority: 'medium', status: 'pending', assignee: '' };
                        setCases(cases.map(c => c.id === viewingCase.id ? { ...c, tasks: [...c.tasks, newT] } : c));
                        setViewingCase({ ...viewingCase, tasks: [...viewingCase.tasks, newT] });
                      }}><Plus size={14} /> Nova Tarefa</button>
                    </div>
                    {viewingCase.tasks.map(t => (
                      <div key={t.id} className="movement-card" style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input type="checkbox" checked={t.status === 'completed'} onChange={() => {
                                const updated: LegalCase[] = cases.map(c => c.id === viewingCase.id ? ({
                                  ...c, tasks: c.tasks.map(tk => tk.id === t.id ? { ...tk, status: tk.status === 'completed' ? 'pending' as const : 'completed' as const } : tk)
                                } as LegalCase) : c);
                                setCases(updated);
                                setViewingCase(updated.find(c => c.id === viewingCase.id)!);
                              }} />
                              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', textDecoration: t.status === 'completed' ? 'line-through' : 'none' }}>{t.title}</span>
                            </div>
                            {t.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 24px' }}>{t.description}</p>}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', marginLeft: '24px' }}>
                              <span className="badge" style={{ fontSize: '10px', background: t.priority === 'high' ? 'rgba(239,68,68,0.15)' : t.priority === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)', color: t.priority === 'high' ? '#EF4444' : t.priority === 'medium' ? '#F59E0B' : '#6B7280' }}>
                                {t.priority === 'high' ? 'Alta' : t.priority === 'medium' ? 'Média' : 'Baixa'}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Vence: {formatDate(t.dueDate)}</span>
                              {t.assignee && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>• {t.assignee}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {viewingCase.tasks.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>Nenhuma tarefa vinculada.</p>}
                  </div>
                )}

                {/* ── TAB: DOCUMENTOS ── */}
                {detailTab === 'documentos' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Documentos ({viewingCase.documents.length})</h4>
                      <button className="btn btn-sm btn-secondary"><Plus size={14} /> Upload</button>
                    </div>
                    {viewingCase.documents.map(d => (
                      <div key={d.id} className="movement-card" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FileText size={20} style={{ color: 'var(--gold-primary)' }} />
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{d.name}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', marginBottom: 0 }}>{d.type} - {d.size} • {formatDate(d.uploadedAt)}</p>
                          </div>
                        </div>
                        <button className="btn btn-icon btn-sm" title="Download"><Download size={14} /></button>
                      </div>
                    ))}
                    {viewingCase.documents.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>Nenhum documento anexado.</p>}
                  </div>
                )}

                {/* ── TAB: FINANCEIRO ── */}
                {detailTab === 'financeiro' && (
                  <div>
                    <div className="info-row" style={{ marginBottom: '16px' }}>
                      <div className="stat-card" style={{ padding: '12px' }}>
                        <div className="stat-label">Total Receitas</div>
                        <div className="stat-value" style={{ fontSize: '20px', color: '#10B981' }}>
                          {formatCurrency(viewingCase.finances.filter(f => f.type === 'income').reduce((a, f) => a + (f.status === 'paid' ? f.value : 0), 0))}
                        </div>
                      </div>
                      <div className="stat-card" style={{ padding: '12px' }}>
                        <div className="stat-label">Total Despesas</div>
                        <div className="stat-value" style={{ fontSize: '20px', color: '#EF4444' }}>
                          {formatCurrency(viewingCase.finances.filter(f => f.type === 'expense').reduce((a, f) => a + f.value, 0))}
                        </div>
                      </div>
                    </div>
                    {viewingCase.finances.map(f => (
                      <div key={f.id} className="movement-card" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{f.description}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', marginBottom: 0 }}>{formatDate(f.date)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 600, color: f.type === 'income' ? '#10B981' : '#EF4444', fontSize: '14px' }}>
                            {f.type === 'income' ? '+' : '-'}{formatCurrency(f.value)}
                          </span>
                          <span className={`badge ${f.status === 'paid' ? 'badge-green' : f.status === 'overdue' ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: '10px' }}>
                            {f.status === 'paid' ? 'Pago' : f.status === 'overdue' ? 'Vencido' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {viewingCase.finances.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>Nenhum registro financeiro.</p>}
                  </div>
                )}

                {/* ── TAB: ESTRATÉGIA ── */}
                {detailTab === 'estrategia' && (
                  <div>
                    <div className="drawer-section" style={{ paddingTop: 0 }}>
                      <div className="section-title"><Target size={16} /> Estratégia do Caso</div>
                      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
                        <p style={{ fontSize: '13px', lineHeight: 1.7, margin: 0, color: 'var(--text-secondary)' }}>
                          {viewingCase.caseStrategy || 'Nenhuma estratégia definida.'}
                        </p>
                      </div>
                    </div>
                    <div className="drawer-section">
                      <div className="section-title"><BarChart size={16} /> Indicadores</div>
                      <div className="info-row">
                        <div className="info-field">
                          <span className="info-label">Probabilidade de Êxito</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="progress-bar" style={{ flex: 1 }}>
                              <div className="progress-fill" style={{
                                width: `${viewingCase.successProbability}%`,
                                background: viewingCase.successProbability >= 70 ? '#10B981' : viewingCase.successProbability >= 40 ? '#F59E0B' : '#EF4444'
                              }} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{viewingCase.successProbability}%</span>
                          </div>
                        </div>
                        <div className="info-field">
                          <span className="info-label">Grau de Risco</span>
                          <span className="badge" style={{ background: `${getRiskColor(viewingCase.riskLevel)}20`, color: getRiskColor(viewingCase.riskLevel), fontSize: '13px', fontWeight: 600 }}>
                            {viewingCase.riskLevel === 'baixo' ? 'Baixo' : viewingCase.riskLevel === 'medio' ? 'Médio' : 'Alto'}
                          </span>
                        </div>
                        <div className="info-field">
                          <span className="info-label">Valor da Causa</span>
                          <span className="info-value" style={{ color: 'var(--gold-primary)', fontSize: '18px' }}>{formatCurrency(viewingCase.causeValue)}</span>
                        </div>
                        <div className="info-field">
                          <span className="info-label">Próxima Ação</span>
                          <span className="info-value" style={{ color: 'var(--blue)' }}>{viewingCase.nextAction || 'Nenhuma'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB: HISTÓRICO ── */}
                {detailTab === 'historico' && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Histórico de Atividades</h4>
                    {viewingCase.history.map(h => (
                      <div key={h.id} className="movement-card" style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{h.action}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{h.description}</p>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>{formatDateTime(h.date)}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>{h.user}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {viewingCase.history.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>Nenhum registro de atividade.</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
