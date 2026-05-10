import { useState, useMemo } from 'react';
import {
  Plus, Search, Calendar, List, Filter, X, Eye, Edit3, Trash2,
  CheckCircle2, AlertTriangle, AlertCircle, Clock, ArrowUpDown,
  ChevronLeft, ChevronRight, FileText, User, Users, Tag,
  CalendarDays, ClipboardList, Upload, Download, History,
  ArrowRight, Check, XCircle, Paperclip
} from 'lucide-react';
import './Deadlines.css';

type DeadlineType = 'Contestação' | 'Recurso' | 'Manifestação' | 'Embargos' | 'Agravo' | 'Apelação' | 'Contrarrazões' | 'Cumprimento' | 'Juntada' | 'Audiência' | 'Administrativo' | 'Outro';
type Priority = 'BAIXA' | 'NORMAL' | 'ALTA' | 'CRÍTICA';
type Status = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ATRASADO';
type ViewMode = 'list' | 'calendar';

interface DeadlineHistory {
  id: string;
  date: string;
  user: string;
  action: string;
  description: string;
}

interface Deadline {
  id: string;
  title: string;
  type: DeadlineType;
  caseNumber: string;
  client: string;
  notificationDate: string;
  startDate: string;
  endDate: string;
  daysTerm: number;
  businessDays: boolean;
  responsible: string;
  reviewer: string;
  priority: Priority;
  status: Status;
  description: string;
  observations: string;
  completedDate?: string;
  completionProof?: string;
  completionNotes?: string;
  history: DeadlineHistory[];
}

const TYPES: DeadlineType[] = ['Contestação', 'Recurso', 'Manifestação', 'Embargos', 'Agravo', 'Apelação', 'Contrarrazões', 'Cumprimento', 'Juntada', 'Audiência', 'Administrativo', 'Outro'];
const PRIORITIES: Priority[] = ['BAIXA', 'NORMAL', 'ALTA', 'CRÍTICA'];
const STATUS_LIST: Status[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'ATRASADO'];
const RESPONSIBLES = ['Dr. Paulo', 'Dra. Maria', 'Dr. Carlos', 'Dra. Ana', 'Secretaria'];
const REVIEWERS = ['Dr. Paulo', 'Dra. Maria', 'Dr. Carlos', 'Dra. Ana'];

const now = new Date();
const today = now.toISOString().split('T')[0];
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString().split('T')[0];
const daysFromNow = (n: number) => new Date(now.getTime() + n * 86400000).toISOString().split('T')[0];

const MOCK_DEADLINES: Deadline[] = [
  {
    id: '1', title: 'Protocolar recurso especial', type: 'Recurso', caseNumber: '0000832-35.2018.4.01.3202', client: 'João Silva',
    notificationDate: daysAgo(3), startDate: daysAgo(3), endDate: daysFromNow(2), daysTerm: 5, businessDays: true,
    responsible: 'Dr. Paulo', reviewer: 'Dra. Maria', priority: 'CRÍTICA', status: 'PENDENTE',
    description: 'Protocolar recurso especial no STJ contra acórdão do TRF1', observations: 'Prazo exíguo, priorizar',
    history: [{ id: 'h1', date: daysAgo(3), user: 'Sistema', action: 'Criação', description: 'Prazo criado a partir de intimação' }]
  },
  {
    id: '2', title: 'Contestação - Ação Indenizatória', type: 'Contestação', caseNumber: '1234567-89.2023.8.26.0000', client: 'Maria Oliveira',
    notificationDate: daysAgo(10), startDate: daysAgo(10), endDate: daysFromNow(5), daysTerm: 15, businessDays: true,
    responsible: 'Dra. Maria', reviewer: 'Dr. Carlos', priority: 'ALTA', status: 'EM_ANDAMENTO',
    description: 'Elaborar contestação em ação indenizatória por danos morais', observations: 'Aguardando documentos do cliente',
    history: [
      { id: 'h2a', date: daysAgo(10), user: 'Sistema', action: 'Criação', description: 'Prazo criado' },
      { id: 'h2b', date: daysAgo(5), user: 'Dra. Maria', action: 'Atualização', description: 'Iniciou minuta' }
    ]
  },
  {
    id: '3', title: 'Manifestação sobre documentos', type: 'Manifestação', caseNumber: '9876543-21.2024.4.03.6100', client: 'Carlos Santos',
    notificationDate: daysAgo(12), startDate: daysAgo(12), endDate: today, daysTerm: 12, businessDays: false,
    responsible: 'Dr. Paulo', reviewer: 'Dra. Ana', priority: 'CRÍTICA', status: 'PENDENTE',
    description: 'Manifestar-se sobre documentos juntados pela parte adversa', observations: '',
    history: [{ id: 'h3', date: daysAgo(12), user: 'Sistema', action: 'Criação', description: 'Prazo criado' }]
  },
  {
    id: '4', title: 'Juntar documentos comprobatórios', type: 'Juntada', caseNumber: '4567890-12.2024.8.26.0100', client: 'Ana Beatriz',
    notificationDate: daysAgo(20), startDate: daysAgo(20), endDate: daysFromNow(10), daysTerm: 30, businessDays: true,
    responsible: 'Secretaria', reviewer: 'Dr. Paulo', priority: 'NORMAL', status: 'PENDENTE',
    description: 'Juntar procuração e documentos pessoais do cliente', observations: 'Documentos já estão digitalizados',
    history: [{ id: 'h4', date: daysAgo(20), user: 'Sistema', action: 'Criação', description: 'Prazo criado' }]
  },
  {
    id: '5', title: 'Embargos à execução', type: 'Embargos', caseNumber: '7890123-45.2023.8.26.0200', client: 'Empresa ABC Ltda',
    notificationDate: daysAgo(17), startDate: daysAgo(17), endDate: daysAgo(2), daysTerm: 15, businessDays: true,
    responsible: 'Dr. Carlos', reviewer: 'Dra. Maria', priority: 'CRÍTICA', status: 'ATRASADO',
    description: 'Interpor embargos à execução fiscal', observations: 'URGENTE - Prazo já ultrapassado',
    history: [
      { id: 'h5a', date: daysAgo(17), user: 'Sistema', action: 'Criação', description: 'Prazo criado' },
      { id: 'h5b', date: daysAgo(2), user: 'Sistema', action: 'Alerta', description: 'Prazo expirou' }
    ]
  },
  {
    id: '6', title: 'Contrarrazões de apelação', type: 'Contrarrazões', caseNumber: '2345678-90.2022.8.26.0300', client: 'João Silva',
    notificationDate: daysAgo(7), startDate: daysAgo(7), endDate: daysFromNow(3), daysTerm: 10, businessDays: true,
    responsible: 'Dra. Ana', reviewer: 'Dr. Paulo', priority: 'ALTA', status: 'EM_ANDAMENTO',
    description: 'Apresentar contrarrazões ao recurso de apelação interposto pelo autor', observations: '',
    history: [{ id: 'h6', date: daysAgo(7), user: 'Sistema', action: 'Criação', description: 'Prazo criado' }]
  },
  {
    id: '7', title: 'Recurso de apelação', type: 'Apelação', caseNumber: '3456789-01.2021.8.26.0400', client: 'Maria Oliveira',
    notificationDate: daysAgo(30), startDate: daysAgo(30), endDate: daysAgo(15), daysTerm: 15, businessDays: true,
    responsible: 'Dr. Paulo', reviewer: 'Dra. Maria', priority: 'ALTA', status: 'CONCLUIDO',
    description: 'Interpor recurso de apelação contra sentença desfavorável', observations: 'Recurso protocolado em 15 dias úteis',
    completedDate: daysAgo(15), completionProof: 'protocolo_apelacao.pdf', completionNotes: 'Protocolado via PJe',
    history: [
      { id: 'h7a', date: daysAgo(30), user: 'Sistema', action: 'Criação', description: 'Prazo criado' },
      { id: 'h7b', date: daysAgo(15), user: 'Dr. Paulo', action: 'Conclusão', description: 'Prazo concluído - Recurso protocolado' }
    ]
  },
  {
    id: '8', title: 'Agravo de instrumento', type: 'Agravo', caseNumber: '5678901-23.2024.4.01.0000', client: 'Carlos Santos',
    notificationDate: daysAgo(5), startDate: daysAgo(5), endDate: daysFromNow(15), daysTerm: 20, businessDays: true,
    responsible: 'Dra. Maria', reviewer: 'Dr. Carlos', priority: 'NORMAL', status: 'PENDENTE',
    description: 'Interpor agravo de instrumento contra decisão interlocutória', observations: 'Necessário juntar cópia integral do processo',
    history: [{ id: 'h8', date: daysAgo(5), user: 'Sistema', action: 'Criação', description: 'Prazo criado' }]
  },
  {
    id: '9', title: 'Cumprimento de sentença', type: 'Cumprimento', caseNumber: '6789012-34.2020.8.26.0500', client: 'Empresa ABC Ltda',
    notificationDate: daysAgo(4), startDate: daysAgo(4), endDate: daysFromNow(25), daysTerm: 30, businessDays: false,
    responsible: 'Dr. Carlos', reviewer: 'Dra. Ana', priority: 'NORMAL', status: 'PENDENTE',
    description: 'Iniciar cumprimento de sentença com cálculo de atualização', observations: 'Aguardando cálculo contábil',
    history: [{ id: 'h9', date: daysAgo(4), user: 'Sistema', action: 'Criação', description: 'Prazo criado' }]
  },
  {
    id: '10', title: 'Comparecer à audiência de conciliação', type: 'Audiência', caseNumber: '8901234-56.2024.8.26.0600', client: 'João Silva',
    notificationDate: daysAgo(15), startDate: daysAgo(15), endDate: daysFromNow(7), daysTerm: 0, businessDays: false,
    responsible: 'Dr. Paulo', reviewer: 'Dra. Maria', priority: 'ALTA', status: 'EM_ANDAMENTO',
    description: 'Audiência de conciliação designada pelo juízo da 3ª Vara Cível', observations: 'Preparar proposta de acordo',
    history: [{ id: 'h10', date: daysAgo(15), user: 'Sistema', action: 'Criação', description: 'Prazo criado' }]
  },
  {
    id: '11', title: 'Regularização de procuração', type: 'Administrativo', caseNumber: '9012345-67.2024.8.26.0700', client: 'Ana Beatriz',
    notificationDate: daysAgo(8), startDate: daysAgo(8), endDate: daysFromNow(1), daysTerm: 9, businessDays: true,
    responsible: 'Secretaria', reviewer: 'Dr. Paulo', priority: 'CRÍTICA', status: 'PENDENTE',
    description: 'Regularizar procuração nos autos conforme intimação', observations: 'Prazo está vencendo',
    history: [{ id: 'h11', date: daysAgo(8), user: 'Sistema', action: 'Criação', description: 'Prazo criado' }]
  },
  {
    id: '12', title: 'Petição de juntada de procuração', type: 'Juntada', caseNumber: '0123456-78.2024.8.26.0800', client: 'Empresa XYZ',
    notificationDate: daysAgo(2), startDate: daysAgo(2), endDate: daysFromNow(20), daysTerm: 22, businessDays: true,
    responsible: 'Dra. Ana', reviewer: 'Dr. Carlos', priority: 'NORMAL', status: 'PENDENTE',
    description: 'Juntar procuração e documentos societários da empresa', observations: '',
    history: [{ id: 'h12', date: daysAgo(2), user: 'Sistema', action: 'Criação', description: 'Prazo criado' }]
  },
  {
    id: '13', title: 'Recurso ordinário constitucional', type: 'Recurso', caseNumber: '1111111-11.2023.4.01.3202', client: 'Maria Oliveira',
    notificationDate: daysAgo(14), startDate: daysAgo(14), endDate: daysFromNow(8), daysTerm: 22, businessDays: true,
    responsible: 'Dra. Maria', reviewer: 'Dr. Paulo', priority: 'NORMAL', status: 'PENDENTE',
    description: 'Interpor recurso ordinário para o TRF1', observations: '',
    history: [{ id: 'h13', date: daysAgo(14), user: 'Sistema', action: 'Criação', description: 'Prazo criado' }]
  },
  {
    id: '14', title: 'Embargos de declaração', type: 'Embargos', caseNumber: '2222222-22.2022.8.26.0900', client: 'João Silva',
    notificationDate: daysAgo(40), startDate: daysAgo(40), endDate: daysAgo(10), daysTerm: 30, businessDays: true,
    responsible: 'Dr. Paulo', reviewer: 'Dra. Ana', priority: 'ALTA', status: 'CONCLUIDO',
    description: 'Embargos de declaração contra acórdão', observations: '',
    completedDate: daysAgo(10), completionProof: 'embargos_protocolados.pdf', completionNotes: 'Protocolado',
    history: [
      { id: 'h14a', date: daysAgo(40), user: 'Sistema', action: 'Criação', description: 'Prazo criado' },
      { id: 'h14b', date: daysAgo(10), user: 'Dr. Paulo', action: 'Conclusão', description: 'Prazo concluído' }
    ]
  },
  {
    id: '15', title: 'Manifestação sobre cálculos', type: 'Manifestação', caseNumber: '3333333-33.2024.8.26.1000', client: 'Empresa ABC Ltda',
    notificationDate: daysAgo(1), startDate: daysAgo(1), endDate: daysFromNow(4), daysTerm: 5, businessDays: true,
    responsible: 'Dra. Maria', reviewer: 'Dr. Carlos', priority: 'ALTA', status: 'PENDENTE',
    description: 'Manifestar-se sobre os cálculos apresentados pelo perito', observations: '',
    history: [{ id: 'h15', date: daysAgo(1), user: 'Sistema', action: 'Criação', description: 'Prazo criado' }]
  }
];

function calcDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const diff = end.getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function getDaysColor(days: number): { color: string; bg: string; label: string } {
  if (days < 0) return { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: `${Math.abs(days)} dia(s) atrasado` };
  if (days === 0) return { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'Vence hoje' };
  if (days <= 3) return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: `${days} dia(s)` };
  if (days <= 7) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: `${days} dia(s)` };
  return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: `${days} dia(s)` };
}

function getPriorityConfig(priority: Priority) {
  const map: Record<Priority, { color: string; bg: string }> = {
    BAIXA: { color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
    NORMAL: { color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    ALTA: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    CRÍTICA: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  };
  return map[priority];
}

function getStatusConfig(status: Status) {
  const map: Record<Status, { color: string; bg: string; label: string }> = {
    PENDENTE: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Pendente' },
    EM_ANDAMENTO: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Em Andamento' },
    CONCLUIDO: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Concluído' },
    ATRASADO: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Atrasado' },
  };
  return map[status];
}

const INITIAL_FORM: Omit<Deadline, 'id' | 'history' | 'status' | 'completedDate' | 'completionProof' | 'completionNotes'> = {
  title: '', type: 'Outro', caseNumber: '', client: '', notificationDate: '', startDate: '', endDate: '',
  daysTerm: 0, businessDays: true, responsible: '', reviewer: '', priority: 'NORMAL',
  description: '', observations: '',
};

export default function Deadlines() {
  const [deadlines, setDeadlines] = useState<Deadline[]>(MOCK_DEADLINES);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterResponsible, setFilterResponsible] = useState<string>('');
  const [filterPeriodStart, setFilterPeriodStart] = useState('');
  const [filterPeriodEnd, setFilterPeriodEnd] = useState('');
  const [sortField, setSortField] = useState<string>('endDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState<string | null>(null);
  const [completeDate, setCompleteDate] = useState(today);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeFile, setCompleteFile] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [quickFilter, setQuickFilter] = useState<string>('');

  const filtered = useMemo(() => {
    let list = [...deadlines];
    const q = search.toLowerCase();
    if (q) list = list.filter(d => d.title.toLowerCase().includes(q) || d.caseNumber.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.client.toLowerCase().includes(q));
    if (filterType) list = list.filter(d => d.type === filterType);
    if (filterStatus) list = list.filter(d => d.status === filterStatus);
    if (filterPriority) list = list.filter(d => d.priority === filterPriority);
    if (filterResponsible) list = list.filter(d => d.responsible === filterResponsible);
    if (filterPeriodStart) list = list.filter(d => d.endDate >= filterPeriodStart);
    if (filterPeriodEnd) list = list.filter(d => d.endDate <= filterPeriodEnd);
    if (quickFilter === 'vencendo_hoje') list = list.filter(d => calcDaysRemaining(d.endDate) === 0 && d.status !== 'CONCLUIDO');
    if (quickFilter === 'vencendo_3') list = list.filter(d => { const r = calcDaysRemaining(d.endDate); return r > 0 && r <= 3 && d.status !== 'CONCLUIDO'; });
    if (quickFilter === 'vencendo_7') list = list.filter(d => { const r = calcDaysRemaining(d.endDate); return r > 0 && r <= 7 && d.status !== 'CONCLUIDO'; });
    if (quickFilter === 'atrasados') list = list.filter(d => d.status === 'ATRASADO' || (calcDaysRemaining(d.endDate) < 0 && d.status !== 'CONCLUIDO'));
    if (quickFilter === 'concluidos') list = list.filter(d => d.status === 'CONCLUIDO');
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'endDate') cmp = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortField === 'priority') cmp = PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority);
      else if (sortField === 'status') cmp = STATUS_LIST.indexOf(a.status) - STATUS_LIST.indexOf(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [deadlines, search, filterType, filterStatus, filterPriority, filterResponsible, filterPeriodStart, filterPeriodEnd, sortField, sortDir, quickFilter]);

  const stats = useMemo(() => {
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();
    const monthDeadlines = deadlines.filter(d => {
      const d2 = new Date(d.endDate);
      return d2.getMonth() === nowMonth && d2.getFullYear() === nowYear;
    });
    const todayD = deadlines.filter(d => {
      const r = calcDaysRemaining(d.endDate);
      return r <= 0 && r > -1 && d.status !== 'CONCLUIDO';
    });
    const overdue = deadlines.filter(d => {
      const r = calcDaysRemaining(d.endDate);
      return r < 0 && d.status !== 'CONCLUIDO';
    });
    const completed = deadlines.filter(d => d.status === 'CONCLUIDO');
    return { monthDeadlines: monthDeadlines.length, todayDeadlines: todayD.length, overdue: overdue.length, completed: completed.length };
  }, [deadlines]);

  function toggleSort(field: string) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  }

  function openCreate() {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
  }

  function openEdit(d: Deadline) {
    setEditingId(d.id);
    setForm({
      title: d.title, type: d.type, caseNumber: d.caseNumber, client: d.client,
      notificationDate: d.notificationDate, startDate: d.startDate, endDate: d.endDate,
      daysTerm: d.daysTerm, businessDays: d.businessDays, responsible: d.responsible,
      reviewer: d.reviewer, priority: d.priority, description: d.description, observations: d.observations,
    });
    setShowForm(true);
  }

  function saveForm() {
    if (!form.title || !form.endDate) return;
    if (editingId) {
      setDeadlines(prev => prev.map(d => d.id === editingId ? {
        ...d, ...form, history: [...d.history, { id: `h${Date.now()}`, date: today, user: 'Dr. Paulo', action: 'Atualização', description: 'Prazo atualizado' }]
      } : d));
    } else {
      const newD: Deadline = {
        ...form, id: `${Date.now()}`, status: 'PENDENTE', history: [{ id: `h${Date.now()}`, date: today, user: 'Sistema', action: 'Criação', description: 'Prazo criado' }]
      };
      setDeadlines(prev => [...prev, newD]);
    }
    setShowForm(false);
    setEditingId(null);
  }

  function deleteDeadline(id: string) {
    setDeadlines(prev => prev.filter(d => d.id !== id));
    if (showDetail === id) setShowDetail(null);
  }

  function completeDeadline() {
    if (!showComplete) return;
    if (!completeFile && !completeNotes.trim()) return;
    setDeadlines(prev => prev.map(d => d.id === showComplete ? {
      ...d, status: 'CONCLUIDO', completedDate: completeDate, completionProof: completeFile || undefined,
      completionNotes: completeNotes || undefined,
      history: [...d.history, { id: `h${Date.now()}`, date: today, user: 'Dr. Paulo', action: 'Conclusão', description: 'Prazo concluído' }]
    } : d));
    setShowComplete(null);
    setCompleteNotes('');
    setCompleteFile('');
    setCompleteDate(today);
  }

  function reopenDeadline(id: string) {
    const d = deadlines.find(x => x.id === id);
    if (!d) return;
    const days = calcDaysRemaining(d.endDate);
    setDeadlines(prev => prev.map(x => x.id === id ? {
      ...x, status: days < 0 ? 'ATRASADO' : 'PENDENTE', completedDate: undefined, completionProof: undefined, completionNotes: undefined,
      history: [...x.history, { id: `h${Date.now()}`, date: today, user: 'Dr. Paulo', action: 'Reabertura', description: 'Prazo reaberto' }]
    } : x));
  }

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const monthDeadlines = deadlines.filter(d => {
    const dd = new Date(d.endDate);
    return dd.getMonth() === calendarMonth && dd.getFullYear() === calendarYear;
  });

  const deadlineDays = monthDeadlines.reduce<Record<number, Deadline[]>>((acc, d) => {
    const day = new Date(d.endDate).getDate();
    if (!acc[day]) acc[day] = [];
    acc[day].push(d);
    return acc;
  }, {});

  return (
    <div className="page deadlines-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '4px' }}>Prazos</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Controle de prazos processuais e compromissos</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-gold" onClick={openCreate}>
            <Plus size={18} /> Novo Prazo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Prazos do Mês', value: stats.monthDeadlines, color: 'var(--gold-primary)', bg: 'var(--gold-glow)', icon: CalendarDays },
          { label: 'Vencendo Hoje', value: stats.todayDeadlines, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertCircle },
          { label: 'Prazos Atrasados', value: stats.overdue, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: AlertTriangle },
          { label: 'Concluídos', value: stats.completed, color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { key: 'vencendo_hoje', label: 'Vencendo hoje' },
          { key: 'vencendo_3', label: 'Vencendo em 3 dias' },
          { key: 'vencendo_7', label: 'Vencendo em 7 dias' },
          { key: 'atrasados', label: 'Atrasados' },
          { key: 'concluidos', label: 'Concluídos' },
        ].map(qf => (
          <button
            key={qf.key}
            onClick={() => setQuickFilter(prev => prev === qf.key ? '' : qf.key)}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: `1px solid ${quickFilter === qf.key ? 'var(--gold-primary)' : 'var(--border-default)'}`,
              background: quickFilter === qf.key ? 'var(--gold-glow)' : 'var(--bg-input)',
              color: quickFilter === qf.key ? 'var(--gold-primary)' : 'var(--text-secondary)',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >{qf.label}</button>
        ))}
        {quickFilter && (
          <button onClick={() => setQuickFilter('')} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-tertiary)', fontSize: '13px', cursor: 'pointer' }}>
            <X size={14} style={{ display: 'inline' }} /> Limpar
          </button>
        )}
      </div>

      {/* View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, maxWidth: '400px' }}>
          <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', marginLeft: '12px', pointerEvents: 'none' }} />
          <input
            type="text" placeholder="Buscar por título, processo, cliente..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 36px', background: 'var(--bg-input)', border: '1px solid var(--border-default)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-default)', padding: '3px' }}>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: viewMode === 'list' ? 'var(--gold-primary)' : 'transparent',
              color: viewMode === 'list' ? 'var(--text-inverse)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s'
            }}
          ><List size={16} /> Lista</button>
          <button
            onClick={() => setViewMode('calendar')}
            style={{
              padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: viewMode === 'calendar' ? 'var(--gold-primary)' : 'transparent',
              color: viewMode === 'calendar' ? 'var(--text-inverse)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s'
            }}
          ><Calendar size={16} /> Calendário</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={16} color="var(--text-tertiary)" />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
          <option value="">Tipo</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
          <option value="">Status</option>
          {STATUS_LIST.map(s => <option key={s} value={s}>{getStatusConfig(s).label}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
          <option value="">Prioridade</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterResponsible} onChange={e => setFilterResponsible(e.target.value)} style={{ padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
          <option value="">Responsável</option>
          {RESPONSIBLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input type="date" value={filterPeriodStart} onChange={e => setFilterPeriodStart(e.target.value)} style={{ padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
        <span style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>até</span>
        <input type="date" value={filterPeriodEnd} onChange={e => setFilterPeriodEnd(e.target.value)} style={{ padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
        {(filterType || filterStatus || filterPriority || filterResponsible || filterPeriodStart || filterPeriodEnd) && (
          <button onClick={() => { setFilterType(''); setFilterStatus(''); setFilterPriority(''); setFilterResponsible(''); setFilterPeriodStart(''); setFilterPeriodEnd(''); }} style={{ padding: '6px 10px', background: 'transparent', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-tertiary)', fontSize: '13px', cursor: 'pointer' }}>
            <X size={14} style={{ display: 'inline' }} /> Limpar
          </button>
        )}
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="table-container" style={{ overflowX: 'auto', border: '1px solid var(--border-default)', borderRadius: '12px', background: 'var(--bg-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-default)', cursor: 'pointer' }} onClick={() => toggleSort('title')}>
                  Título / Tipo <ArrowUpDown size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-default)' }}>
                  Processo / Cliente
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-default)' }}>
                  Data Inicial / Final
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-default)' }}>
                  Dias Restantes
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-default)' }}>
                  Responsável
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-default)', cursor: 'pointer' }} onClick={() => toggleSort('priority')}>
                  Prioridade <ArrowUpDown size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-default)', cursor: 'pointer' }} onClick={() => toggleSort('status')}>
                  Status <ArrowUpDown size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-default)' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    <ClipboardList size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Nenhum prazo encontrado</div>
                    <div style={{ fontSize: '13px' }}>Tente ajustar os filtros ou crie um novo prazo</div>
                  </td>
                </tr>
              ) : filtered.map(d => {
                const days = calcDaysRemaining(d.endDate);
                const dc = getDaysColor(days);
                const pc = getPriorityConfig(d.priority);
                const sc = getStatusConfig(d.status);
                const isOverdue = d.status === 'ATRASADO' || (days < 0 && d.status !== 'CONCLUIDO');
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background 0.15s', cursor: 'pointer' }} onClick={() => setShowDetail(d.id)}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px', marginBottom: '2px' }}>{d.title}</div>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{d.type}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '2px', fontFamily: 'var(--font-mono)' }}>{d.caseNumber}</div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{d.client}</div>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Início: {new Date(d.startDate).toLocaleDateString('pt-BR')}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>Fim: {new Date(d.endDate).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {d.status === 'CONCLUIDO' ? (
                        <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>
                          <CheckCircle2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Concluído
                        </span>
                      ) : (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px',
                          background: dc.bg, color: dc.color, fontWeight: 700, fontSize: '14px',
                          animation: isOverdue ? 'pulse 2s ease-in-out infinite' : 'none'
                        }}>
                          {isOverdue && <AlertTriangle size={14} />}
                          {days < 0 ? `${Math.abs(days)}d atrasado` : `${days}d`}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="var(--text-tertiary)" /> {d.responsible}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                        background: pc.bg, color: pc.color, border: `1px solid ${pc.color}25`
                      }}>{d.priority}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: 600, background: sc.bg, color: sc.color
                      }}>
                        {d.status === 'CONCLUIDO' ? <Check size={12} /> : d.status === 'ATRASADO' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button onClick={() => setShowDetail(d.id)} className="btn btn-ghost btn-icon btn-sm" title="Visualizar"><Eye size={15} /></button>
                        <button onClick={() => openEdit(d)} className="btn btn-ghost btn-icon btn-sm" title="Editar"><Edit3 size={15} /></button>
                        {d.status !== 'CONCLUIDO' ? (
                          <button onClick={() => { setShowComplete(d.id); setCompleteDate(today); setCompleteNotes(''); setCompleteFile(''); }} className="btn btn-ghost btn-icon btn-sm" title="Concluir" style={{ color: '#10b981' }}><CheckCircle2 size={15} /></button>
                        ) : (
                          <button onClick={() => reopenDeadline(d.id)} className="btn btn-ghost btn-icon btn-sm" title="Reabrir" style={{ color: '#f59e0b' }}><RotateCcw size={15} /></button>
                        )}
                        <button onClick={() => deleteDeadline(d.id)} className="btn btn-ghost btn-icon btn-sm" title="Excluir" style={{ color: '#ef4444' }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Calendar Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
            <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); }} className="btn btn-ghost btn-icon" style={{ width: '36px', height: '36px' }}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {new Date(calendarYear, calendarMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </div>
            <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); }} className="btn btn-ghost btn-icon" style={{ width: '36px', height: '36px' }}>
              <ChevronRight size={18} />
            </button>
          </div>
          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-default)' }}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} style={{ padding: '10px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{day}</div>
            ))}
          </div>
          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: '100px', borderRight: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-secondary)' }} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dls = deadlineDays[day] || [];
              const isToday = day === now.getDate() && calendarMonth === now.getMonth() && calendarYear === now.getFullYear();
              const maxPriority = dls.reduce<Priority>((max, d) => {
                const idx = PRIORITIES.indexOf(d.priority);
                return idx > PRIORITIES.indexOf(max) ? d.priority : max;
              }, 'BAIXA');
              const pc = maxPriority ? getPriorityConfig(maxPriority) : null;
              return (
                <div
                  key={day}
                  style={{
                    minHeight: '100px', padding: '6px', borderRight: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)',
                    background: dls.length > 0 ? `${pc?.bg}15` : 'transparent',
                    cursor: dls.length > 0 ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                    position: 'relative'
                  }}
                  onClick={() => { if (dls.length > 0) setShowDetail(dls[0].id); }}
                  onMouseEnter={e => { if (dls.length > 0) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = dls.length > 0 ? `${pc?.bg}15` : 'transparent'; }}
                >
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%',
                    background: isToday ? 'var(--gold-primary)' : 'transparent',
                    color: isToday ? 'var(--text-inverse)' : 'var(--text-primary)',
                    fontSize: '13px', fontWeight: isToday ? 700 : 500, marginBottom: '4px'
                  }}>{day}</div>
                  {dls.slice(0, 3).map(d => {
                    const p = getPriorityConfig(d.priority);
                    return (
                      <div key={d.id} style={{
                        fontSize: '10px', padding: '2px 4px', marginBottom: '2px', borderRadius: '3px',
                        background: p.bg, color: p.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        borderLeft: `2px solid ${p.color}`
                      }}>
                        {d.title}
                      </div>
                    );
                  })}
                  {dls.length > 3 && (
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', paddingLeft: '4px' }}>+{dls.length - 3} mais</div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-default)', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500 }}>Legenda:</span>
            {PRIORITIES.map(p => {
              const pc = getPriorityConfig(p);
              return (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: pc.color }} />
                  {p}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar Prazo' : 'Novo Prazo'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Título *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Protocolar recurso especial" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DeadlineType }))}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Prioridade</label>
                  <select className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nº Processo</label>
                  <input className="form-input" value={form.caseNumber} onChange={e => setForm(f => ({ ...f, caseNumber: e.target.value }))} placeholder="0000000-00.0000.0.00.0000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cliente</label>
                  <input className="form-input" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} placeholder="Nome do cliente" />
                </div>
                <div className="form-group">
                  <label className="form-label">Data da Intimação</label>
                  <input className="form-input" type="date" value={form.notificationDate} onChange={e => setForm(f => ({ ...f, notificationDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Data Inicial</label>
                  <input className="form-input" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Data Final *</label>
                  <input className="form-input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Dias de Prazo</label>
                  <input className="form-input" type="number" min={0} value={form.daysTerm} onChange={e => setForm(f => ({ ...f, daysTerm: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                  <label className="form-checkbox" style={{ marginTop: '24px' }}>
                    <input type="checkbox" checked={form.businessDays} onChange={e => setForm(f => ({ ...f, businessDays: e.target.checked }))} />
                    Dias Úteis?
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Responsável</label>
                  <select className="form-select" value={form.responsible} onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}>
                    <option value="">Selecionar...</option>
                    {RESPONSIBLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Revisor</label>
                  <select className="form-select" value={form.reviewer} onChange={e => setForm(f => ({ ...f, reviewer: e.target.value }))}>
                    <option value="">Selecionar...</option>
                    {REVIEWERS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Descrição</label>
                  <textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descreva detalhes do prazo..." />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Observações</label>
                  <textarea className="form-textarea" rows={2} value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} placeholder="Observações internas..." />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveForm} disabled={!form.title || !form.endDate}>
                {editingId ? 'Atualizar' : 'Criar Prazo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL PANEL */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            {(() => {
              const d = deadlines.find(x => x.id === showDetail);
              if (!d) return null;
              const days = calcDaysRemaining(d.endDate);
              const dc = getDaysColor(days);
              const pc = getPriorityConfig(d.priority);
              const sc = getStatusConfig(d.status);
              return (
                <>
                  <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3>{d.title}</h3>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                        background: pc.bg, color: pc.color, border: `1px solid ${pc.color}25`
                      }}>{d.priority}</span>
                    </div>
                    <button className="modal-close" onClick={() => setShowDetail(null)}><X size={20} /></button>
                  </div>
                  <div className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Tipo</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Tag size={14} color="var(--text-tertiary)" /> {d.type}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Status</div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: sc.bg, color: sc.color }}>
                          {d.status === 'CONCLUIDO' ? <Check size={12} /> : d.status === 'ATRASADO' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                          {sc.label}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Processo</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{d.caseNumber || '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Cliente</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} color="var(--text-tertiary)" /> {d.client || '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Data Inicial</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{new Date(d.startDate).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Data Final</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{new Date(d.endDate).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Dias Restantes</div>
                        {d.status === 'CONCLUIDO' ? (
                          <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}><CheckCircle2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Concluído</span>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', background: dc.bg, color: dc.color, fontWeight: 700, fontSize: '14px' }}>
                            {days < 0 && <AlertTriangle size={14} />}
                            {days < 0 ? `${Math.abs(days)} dia(s) atrasado` : `${days} dia(s)`}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Prazo</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{d.daysTerm} {d.businessDays ? 'dias úteis' : 'dias corridos'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Responsável</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} color="var(--text-tertiary)" /> {d.responsible || '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Revisor</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{d.reviewer || '—'}</div>
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Descrição</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>{d.description || 'Sem descrição'}</div>
                    </div>
                    {d.observations && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Observações</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>{d.observations}</div>
                      </div>
                    )}
                    {d.completedDate && (
                      <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(16,185,129,0.05)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} /> Conclusão
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <div>Data: {new Date(d.completedDate).toLocaleDateString('pt-BR')}</div>
                          {d.completionProof && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Paperclip size={12} /> {d.completionProof}</div>}
                        </div>
                        {d.completionNotes && <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Obs: {d.completionNotes}</div>}
                      </div>
                    )}
                    {/* History */}
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <History size={14} /> Histórico
                      </div>
                      <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                        {d.history.slice().reverse().map(h => (
                          <div key={h.id} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border-default)', fontSize: '13px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', minWidth: '80px' }}>{new Date(h.date).toLocaleDateString('pt-BR')}</div>
                            <div>
                              <span style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '12px' }}>{h.user}</span>
                              <span style={{ color: 'var(--text-tertiary)', margin: '0 4px' }}>—</span>
                              <span style={{ color: 'var(--text-secondary)' }}>{h.action}</span>
                              <div style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '2px' }}>{h.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => { setShowDetail(null); openEdit(d); }}><Edit3 size={16} /> Editar</button>
                    {d.status !== 'CONCLUIDO' ? (
                      <button className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => { setShowDetail(null); setShowComplete(d.id); setCompleteDate(today); setCompleteNotes(''); setCompleteFile(''); }}>
                        <CheckCircle2 size={16} /> Concluir Prazo
                      </button>
                    ) : (
                      <button className="btn btn-secondary" style={{ color: '#f59e0b' }} onClick={() => { reopenDeadline(d.id); setShowDetail(null); }}>
                        <RotateCcw size={16} /> Reabrir
                      </button>
                    )}
                    <button className="btn btn-ghost" onClick={() => setShowDetail(null)}>Fechar</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* COMPLETE MODAL */}
      {showComplete && (
        <div className="modal-overlay" onClick={() => setShowComplete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><CheckCircle2 size={18} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#10b981' }} /> Concluir Prazo</h3>
              <button className="modal-close" onClick={() => setShowComplete(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Para concluir este prazo, informe a data de conclusão e anexe o comprovante ou descreva como foi cumprido.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Data de Conclusão *</label>
                  <input className="form-input" type="date" value={completeDate} onChange={e => setCompleteDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Comprovante (arquivo)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input className="form-input" value={completeFile} onChange={e => setCompleteFile(e.target.value)} placeholder="protocolo_recurso.pdf" style={{ flex: 1 }} />
                    <button className="btn btn-ghost btn-icon" title="Upload"><Upload size={18} /></button>
                  </div>
                  <div className="form-hint">Informe o nome do arquivo comprobatório</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Observações da Conclusão *</label>
                  <textarea
                    className="form-textarea" rows={3}
                    value={completeNotes}
                    onChange={e => setCompleteNotes(e.target.value)}
                    placeholder="Ex: Recurso protocolado via PJe sob nº 123456..."
                  />
                  <div className="form-hint">Descreva como o prazo foi cumprido (obrigatório se não houver comprovante)</div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowComplete(null)}>Cancelar</button>
              <button className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={completeDeadline} disabled={!completeFile && !completeNotes.trim()}>
                <CheckCircle2 size={16} /> Confirmar Conclusão
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .deadlines-page { animation: fadeIn 0.3s ease; }
      `}</style>
    </div>
  );
}

function RotateCcw({ size, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}
