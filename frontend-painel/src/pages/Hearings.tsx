import { useState, useMemo } from 'react';
import {
  Plus, Search, Calendar, List, Filter, X, Eye, Edit3, Trash2,
  CheckCircle2, AlertTriangle, Clock, ChevronLeft, ChevronRight,
  MapPin, Video, Users, User, FileText, MessageSquare,
  Bell, AlertCircle, CalendarDays, Tag, MoreVertical
} from 'lucide-react';

type HearingType = 'Audiência' | 'Reunião Cliente' | 'Reunião Interna' | 'Sessão Julgamento' | 'Sustentação Oral' | 'Diligência' | 'Despacho' | 'Protocolo' | 'Videoconferência';
type HearingStatus = 'AGENDADO' | 'CONFIRMADO' | 'REMARCADO' | 'REALIZADO' | 'CANCELADO' | 'NAO_COMPARECEU';
type ViewMode = 'list' | 'calendar';

interface Hearing {
  id: string;
  title: string;
  type: HearingType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  meetingLink: string;
  client: string;
  caseNumber: string;
  responsible: string;
  participants: string;
  description: string;
  notes: string;
  reminder: string;
  status: HearingStatus;
  createdAt: string;
}

const HEARING_TYPES: HearingType[] = ['Audiência', 'Reunião Cliente', 'Reunião Interna', 'Sessão Julgamento', 'Sustentação Oral', 'Diligência', 'Despacho', 'Protocolo', 'Videoconferência'];

const STATUS_CONFIG: Record<HearingStatus, { label: string; color: string; bg: string }> = {
  AGENDADO: { label: 'Agendado', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  CONFIRMADO: { label: 'Confirmado', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  REMARCADO: { label: 'Remarcado', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  REALIZADO: { label: 'Realizado', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  CANCELADO: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  NAO_COMPARECEU: { label: 'Não Compareceu', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

const RESPONSIBLE_LIST = ['Dra. Fernanda Lima', 'Dr. Ricardo Santos', 'Dra. Juliana Costa', 'Dr. Paulo Oliveira'];
const CLIENT_LIST = ['João Silva', 'Maria Oliveira', 'Carlos Santos', 'Ana Beatriz', 'Empresa ABC Ltda', 'Roberto Almeida', 'Fernanda Costa'];
const CASE_LIST = ['0000832-35.2018.4.01.3202', '1234567-89.2023.8.26.0000', '9876543-21.2024.4.03.6100', '4567890-12.2024.8.26.0100', '7890123-45.2023.8.26.0200'];

const now = new Date();
const today = now.toISOString().split('T')[0];
const daysFromNow = (n: number) => new Date(now.getTime() + n * 86400000).toISOString().split('T')[0];
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString().split('T')[0];

const MOCK_HEARINGS: Hearing[] = [
  { id: '1', title: 'Audiência de Conciliação - Silva', type: 'Audiência', date: daysFromNow(2), startTime: '09:00', endTime: '10:30', location: 'Fórum João Mendes - Sala 301', meetingLink: '', client: 'João Silva', caseNumber: '0000832-35.2018.4.01.3202', responsible: 'Dra. Fernanda Lima', participants: 'João Silva, Dr. Ricardo Santos (adv. parte contrária)', description: 'Audiência de conciliação referente a ação trabalhista.', notes: '', reminder: '30min antes', status: 'AGENDADO', createdAt: daysAgo(7) },
  { id: '2', title: 'Reunião com Cliente - Oliveira', type: 'Reunião Cliente', date: daysFromNow(1), startTime: '14:00', endTime: '15:00', location: 'Sala de Reuniões 1', meetingLink: 'https://meet.google.com/abc-defg-hij', client: 'Maria Oliveira', caseNumber: '1234567-89.2023.8.26.0000', responsible: 'Dr. Ricardo Santos', participants: 'Maria Oliveira, Dr. Ricardo Santos', description: 'Apresentar estratégia de defesa para ação indenizatória.', notes: '', reminder: '1h antes', status: 'CONFIRMADO', createdAt: daysAgo(5) },
  { id: '3', title: 'Sessão de Julgamento - TRF1', type: 'Sessão Julgamento', date: daysFromNow(5), startTime: '13:00', endTime: '18:00', location: 'TRF1 - Sala de Sessões', meetingLink: '', client: 'Carlos Santos', caseNumber: '9876543-21.2024.4.03.6100', responsible: 'Dra. Fernanda Lima', participants: 'Desembargadores da 3ª Turma', description: 'Julgamento de apelação cível.', notes: '', reminder: '1 dia antes', status: 'AGENDADO', createdAt: hoursAgo(48) },
  { id: '4', title: 'Sustentação Oral - Recurso Especial', type: 'Sustentação Oral', date: daysFromNow(10), startTime: '10:00', endTime: '10:30', location: 'STJ - Plenário Virtual', meetingLink: 'https://stj.jus.br/sala-virtual/12345', client: 'Empresa ABC Ltda', caseNumber: '7890123-45.2023.8.26.0200', responsible: 'Dr. Paulo Oliveira', participants: 'Ministro Relator', description: 'Sustentação oral em recurso especial.', notes: '', reminder: '1 dia antes', status: 'AGENDADO', createdAt: hoursAgo(24) },
  { id: '5', title: 'Reunião Interna - Estratégia', type: 'Reunião Interna', date: today, startTime: '11:00', endTime: '12:00', location: 'Sala de Reuniões 2', meetingLink: '', client: 'Interno', caseNumber: '', responsible: 'Dra. Juliana Costa', participants: 'Equipe trabalhista', description: 'Definir estratégia para casos trabalhistas do mês.', notes: '', reminder: '15min antes', status: 'CONFIRMADO', createdAt: daysAgo(3) },
  { id: '6', title: 'Diligência - Cartório 3º Ofício', type: 'Diligência', date: daysFromNow(1), startTime: '08:00', endTime: '17:00', location: 'Cartório 3º Ofício - Centro', meetingLink: '', client: 'Ana Beatriz', caseNumber: '4567890-12.2024.8.26.0100', responsible: 'Secretaria', participants: '', description: 'Protocolo de documentos e cópias.', notes: '', reminder: '30min antes', status: 'AGENDADO', createdAt: daysAgo(2) },
  { id: '7', title: 'Videoconferência com Cliente', type: 'Videoconferência', date: today, startTime: '15:30', endTime: '16:00', location: 'Online', meetingLink: 'https://zoom.us/j/123456789', client: 'Roberto Almeida', caseNumber: '', responsible: 'Dr. Ricardo Santos', participants: 'Roberto Almeida', description: 'Esclarecer dúvidas sobre o andamento processual.', notes: '', reminder: '15min antes', status: 'CONFIRMADO', createdAt: daysAgo(1) },
  { id: '8', title: 'Despacho com Juiz', type: 'Despacho', date: daysAgo(1), startTime: '14:00', endTime: '14:20', location: 'Fórum Central - Gabinete Juiz', meetingLink: '', client: 'João Silva', caseNumber: '0000832-35.2018.4.01.3202', responsible: 'Dra. Fernanda Lima', participants: 'Juiz Dr. Alberto, Dra. Fernanda Lima', description: 'Despachar sobre pedido de tutela de urgência.', notes: 'Juiz deferiu tutela. Anotar nos autos.', reminder: '1h antes', status: 'REALIZADO', createdAt: daysAgo(10) },
  { id: '9', title: 'Audiência de Instrução - Ação Civil', type: 'Audiência', date: daysFromNow(3), startTime: '13:00', endTime: '17:00', location: 'Fórum Regional - Vara Cível', meetingLink: '', client: 'Fernanda Costa', caseNumber: '', responsible: 'Dra. Juliana Costa', participants: 'Testemunhas: Pedro Alves, Maria Souza', description: 'Oitiva de testemunhas em ação civil.', notes: '', reminder: '1 dia antes', status: 'AGENDADO', createdAt: daysAgo(4) },
  { id: '10', title: 'Protocolo - Petição Inicial', type: 'Protocolo', date: daysAgo(2), startTime: '09:00', endTime: '09:30', location: 'Protocolo Eletrônico', meetingLink: '', client: 'Empresa ABC Ltda', caseNumber: '7890123-45.2023.8.26.0200', responsible: 'Secretaria', participants: '', description: 'Protocolo de petição inicial de ação de cobrança.', notes: 'Protocolado com sucesso. Número gerado: 7890123-45.2023.8.26.0200', reminder: '15min antes', status: 'REALIZADO', createdAt: daysAgo(14) },
  { id: '11', title: 'Audiência de Mediação', type: 'Audiência', date: daysFromNow(7), startTime: '10:00', endTime: '12:00', location: 'CEJUSC - Fórum Central', meetingLink: '', client: 'Ana Beatriz', caseNumber: '4567890-12.2024.8.26.0100', responsible: 'Dr. Paulo Oliveira', participants: 'Mediador: Dr. Carlos, partes envolvidas', description: 'Sessão de mediação pré-processual.', notes: '', reminder: '1 dia antes', status: 'REMARCADO', createdAt: daysAgo(6) },
  { id: '12', title: 'Reunião - Novo Cliente Corporativo', type: 'Reunião Cliente', date: daysFromNow(4), startTime: '16:00', endTime: '17:30', location: 'Sala VIP', meetingLink: '', client: 'Empresa ABC Ltda', caseNumber: '', responsible: 'Dr. Paulo Oliveira', participants: 'CEO, Diretor Jurídico, Dr. Paulo', description: 'Reunião de prospecção para contrato de assessoria empresarial.', notes: '', reminder: '1h antes', status: 'AGENDADO', createdAt: hoursAgo(12) },
  { id: '13', title: 'Audiência Trabalhista - Reclamatória', type: 'Audiência', date: daysFromNow(8), startTime: '09:30', endTime: '11:30', location: 'TRT - 2ª Vara do Trabalho', meetingLink: '', client: 'João Silva', caseNumber: '0000832-35.2018.4.01.3202', responsible: 'Dra. Fernanda Lima', participants: 'Reclamante, Testemunhas', description: 'Audiência de instrução em reclamatória trabalhista.', notes: '', reminder: '1 dia antes', status: 'AGENDADO', createdAt: daysAgo(3) },
  { id: '14', title: 'Sustentação Oral - Agravo', type: 'Sustentação Oral', date: daysAgo(3), startTime: '14:00', endTime: '14:20', location: 'Tribunal de Justiça', meetingLink: '', client: 'Maria Oliveira', caseNumber: '1234567-89.2023.8.26.0000', responsible: 'Dr. Ricardo Santos', participants: 'Relator Des. Mendes', description: 'Sustentação oral em agravo de instrumento.', notes: 'Realizada. Julgado favorável.', reminder: '1h antes', status: 'REALIZADO', createdAt: daysAgo(15) },
  { id: '15', title: 'Reunião de Alinhamento Semanal', type: 'Reunião Interna', date: daysFromNow(6), startTime: '09:00', endTime: '10:00', location: 'Auditório', meetingLink: '', client: 'Interno', caseNumber: '', responsible: 'Dra. Juliana Costa', participants: 'Todos os advogados e estagiários', description: 'Alinhamento semanal de casos e prazos.', notes: '', reminder: '15min antes', status: 'AGENDADO', createdAt: daysAgo(1) },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR');
}

function getTypeIcon(type: HearingType) {
  if (type === 'Audiência' || type === 'Sessão Julgamento') return FileText;
  if (type === 'Reunião Cliente' || type === 'Reunião Interna') return Users;
  if (type === 'Sustentação Oral') return MessageSquare;
  if (type === 'Videoconferência') return Video;
  if (type === 'Diligência' || type === 'Protocolo') return MapPin;
  return Calendar;
}

function StatusBadge({ status }: { status: HearingStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      {status === 'REALIZADO' ? <CheckCircle2 size={12} /> : status === 'CANCELADO' || status === 'NAO_COMPARECEU' ? <X size={12} /> : <Clock size={12} />}
      {cfg.label}
    </span>
  );
}

export default function Hearings() {
  const [hearings, setHearings] = useState<Hearing[]>(MOCK_HEARINGS);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterResponsible, setFilterResponsible] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedHearing, setSelectedHearing] = useState<Hearing | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());

  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<HearingType>('Audiência');
  const [formDate, setFormDate] = useState(today);
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formLocation, setFormLocation] = useState('');
  const [formMeetingLink, setFormMeetingLink] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formCaseNumber, setFormCaseNumber] = useState('');
  const [formResponsible, setFormResponsible] = useState('');
  const [formParticipants, setFormParticipants] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReminder, setFormReminder] = useState('30min antes');

  const filtered = useMemo(() => {
    let list = [...hearings];
    const q = search.toLowerCase();
    if (q) list = list.filter(h => h.title.toLowerCase().includes(q) || h.client.toLowerCase().includes(q) || h.caseNumber.toLowerCase().includes(q) || h.description.toLowerCase().includes(q));
    if (filterType) list = list.filter(h => h.type === filterType);
    if (filterStatus) list = list.filter(h => h.status === filterStatus);
    if (filterResponsible) list = list.filter(h => h.responsible === filterResponsible);
    list.sort((a, b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime());
    return list;
  }, [hearings, search, filterType, filterStatus, filterResponsible]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [calendarMonth, calendarYear]);

  const monthHearings = hearings.filter(h => {
    const d = new Date(h.date + 'T12:00:00');
    return d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
  });

  function getHearingsForDay(day: number) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthHearings.filter(h => h.date === dateStr);
  }

  function openCreate() {
    setEditingId(null);
    setFormTitle(''); setFormType('Audiência'); setFormDate(today); setFormStartTime('09:00'); setFormEndTime('10:00');
    setFormLocation(''); setFormMeetingLink(''); setFormClient(''); setFormCaseNumber(''); setFormResponsible('');
    setFormParticipants(''); setFormDescription(''); setFormReminder('30min antes');
    setShowForm(true);
  }

  function openEdit(h: Hearing) {
    setEditingId(h.id);
    setFormTitle(h.title); setFormType(h.type); setFormDate(h.date); setFormStartTime(h.startTime); setFormEndTime(h.endTime);
    setFormLocation(h.location); setFormMeetingLink(h.meetingLink); setFormClient(h.client); setFormCaseNumber(h.caseNumber);
    setFormResponsible(h.responsible); setFormParticipants(h.participants); setFormDescription(h.description); setFormReminder(h.reminder);
    setShowForm(true);
  }

  function saveForm() {
    if (!formTitle || !formDate || !formResponsible) return;
    const data: Hearing = {
      id: editingId || String(Date.now()),
      title: formTitle, type: formType, date: formDate, startTime: formStartTime, endTime: formEndTime,
      location: formLocation, meetingLink: formMeetingLink, client: formClient, caseNumber: formCaseNumber,
      responsible: formResponsible, participants: formParticipants, description: formDescription,
      reminder: formReminder, notes: '', status: 'AGENDADO', createdAt: editingId ? hearings.find(h => h.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
    };
    if (editingId) {
      data.status = hearings.find(h => h.id === editingId)?.status || 'AGENDADO';
      data.notes = hearings.find(h => h.id === editingId)?.notes || '';
      setHearings(hearings.map(h => h.id === editingId ? data : h));
    } else {
      setHearings([...hearings, data]);
    }
    setShowForm(false);
    setEditingId(null);
  }

  function deleteHearing(id: string) {
    setHearings(hearings.filter(h => h.id !== id));
    if (selectedHearing?.id === id) setSelectedHearing(null);
  }

  function updateStatus(id: string, status: HearingStatus) {
    setHearings(hearings.map(h => h.id === id ? { ...h, status } : h));
    if (selectedHearing?.id === id) setSelectedHearing({ ...selectedHearing, status });
  }

  function updateNotes(id: string, notes: string) {
    setHearings(hearings.map(h => h.id === id ? { ...h, notes } : h));
    if (selectedHearing?.id === id) setSelectedHearing({ ...selectedHearing, notes });
  }

  const stats = useMemo(() => {
    const total = hearings.length;
    const hoje = hearings.filter(h => h.date === today && h.status !== 'CANCELADO' && h.status !== 'REALIZADO' && h.status !== 'NAO_COMPARECEU').length;
    const pendentes = hearings.filter(h => (h.status === 'AGENDADO' || h.status === 'CONFIRMADO') && new Date(h.date + 'T12:00:00') >= new Date()).length;
    const realizados = hearings.filter(h => h.status === 'REALIZADO').length;
    return { total, hoje, pendentes, realizados };
  }, [hearings]);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Audiências</h1>
          <p className="page-subtitle">{filtered.length} audiência{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="page-actions">
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-elevated)', borderRadius: 8, padding: 3, border: '1px solid var(--border-default)' }}>
            <button onClick={() => setViewMode('list')} style={{ padding: '8px 16px', borderRadius: 6, background: viewMode === 'list' ? 'var(--gold-primary)' : 'transparent', color: viewMode === 'list' ? 'var(--text-inverse)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, transition: 'all 0.2s' }}>
              <List size={16} /> Lista
            </button>
            <button onClick={() => setViewMode('calendar')} style={{ padding: '8px 16px', borderRadius: 6, background: viewMode === 'calendar' ? 'var(--gold-primary)' : 'transparent', color: viewMode === 'calendar' ? 'var(--text-inverse)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, transition: 'all 0.2s' }}>
              <CalendarDays size={16} /> Calendário
            </button>
          </div>
          <button className="btn btn-gold" onClick={openCreate}><Plus size={18} /> Nova Audiência</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value" style={{ color: 'var(--gold-primary)' }}>{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hoje</div>
          <div className="stat-value" style={{ color: '#3B82F6' }}>{stats.hoje}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pendentes</div>
          <div className="stat-value" style={{ color: '#F59E0B' }}>{stats.pendentes}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Realizadas</div>
          <div className="stat-value" style={{ color: '#10B981' }}>{stats.realizados}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: '1 1 280px', maxWidth: 360 }}>
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Buscar audiências..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Tipo</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Todos</option>
            {HEARING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Responsável</label>
          <select value={filterResponsible} onChange={e => setFilterResponsible(e.target.value)}>
            <option value="">Todos</option>
            {RESPONSIBLE_LIST.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {(search || filterType || filterStatus || filterResponsible) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterType(''); setFilterStatus(''); setFilterResponsible(''); }} style={{ color: '#EF4444' }}>
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      {viewMode === 'list' ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Data / Horário</th>
                <th>Cliente / Processo</th>
                <th>Responsável</th>
                <th>Local</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => {
                const Icon = getTypeIcon(h.type);
                return (
                  <tr key={h.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedHearing(h)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)', flexShrink: 0 }}>
                          <Icon size={16} />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.title}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-gold">{h.type}</span></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(h.date)}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{h.startTime} - {h.endTime}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        <div style={{ color: 'var(--text-primary)' }}>{h.client}</div>
                        {h.caseNumber && <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{h.caseNumber}</div>}
                      </div>
                    </td>
                    <td><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{h.responsible}</span></td>
                    <td>
                      {h.location ? (
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} style={{ color: 'var(--gold-primary)' }} />
                          {h.location}
                        </span>
                      ) : h.meetingLink ? (
                        <span style={{ fontSize: 13, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Video size={12} /> Online
                        </span>
                      ) : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                    </td>
                    <td><StatusBadge status={h.status} /></td>
                    <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedHearing(h)} title="Detalhes"><Eye size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(h)} title="Editar"><Edit3 size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteHearing(h.id)} style={{ color: '#EF4444' }} title="Excluir"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>Nenhuma audiência encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button className="btn btn-ghost btn-icon" onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); } else setCalendarMonth(calendarMonth - 1); }}>
              <ChevronLeft size={20} />
            </button>
            <h3 style={{ fontSize: 18 }}>{monthNames[calendarMonth]} {calendarYear}</h3>
            <button className="btn btn-ghost btn-icon" onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); } else setCalendarMonth(calendarMonth + 1); }}>
              <ChevronRight size={20} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--border-default)' }}>
            {dayNames.map(d => (
              <div key={d} style={{ padding: '8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-card)', textTransform: 'uppercase' }}>{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`e${i}`} style={{ background: 'var(--bg-card)', minHeight: 100 }} />;
              const dayHearings = getHearingsForDay(day);
              const isToday = day === now.getDate() && calendarMonth === now.getMonth() && calendarYear === now.getFullYear();
              return (
                <div key={day} style={{ background: 'var(--bg-card)', minHeight: 100, padding: 6, border: isToday ? '1px solid var(--gold-primary)' : 'none', position: 'relative' }}>
                  <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--gold-primary)' : 'var(--text-primary)', display: 'inline-block', width: 24, height: 24, textAlign: 'center', lineHeight: '24px', borderRadius: '50%', background: isToday ? 'var(--gold-glow)' : 'transparent', marginBottom: 4 }}>{day}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayHearings.slice(0, 3).map(h => {
                      const cfg = STATUS_CONFIG[h.status];
                      return (
                        <div key={h.id} onClick={() => setSelectedHearing(h)} style={{ fontSize: 10, padding: '2px 4px', borderRadius: 4, background: cfg.bg, color: cfg.color, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {h.startTime} {h.title}
                        </div>
                      );
                    })}
                    {dayHearings.length > 3 && <span style={{ fontSize: 10, color: 'var(--text-tertiary)', paddingLeft: 4 }}>+{dayHearings.length - 3} mais</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedHearing && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedHearing(null)} />
          <div className="modal modal-lg" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3>{selectedHearing.title}</h3>
              <button className="modal-close" onClick={() => setSelectedHearing(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <StatusBadge status={selectedHearing.status} />
                <span className="badge badge-gold">{selectedHearing.type}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div><div className="form-label" style={{ marginBottom: 2 }}>Data</div><div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{formatDate(selectedHearing.date)}</div></div>
                <div><div className="form-label" style={{ marginBottom: 2 }}>Horário</div><div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{selectedHearing.startTime} - {selectedHearing.endTime}</div></div>
                <div><div className="form-label" style={{ marginBottom: 2 }}>Cliente</div><div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{selectedHearing.client}</div></div>
                <div><div className="form-label" style={{ marginBottom: 2 }}>Processo</div><div style={{ fontSize: 14, fontWeight: 500, color: selectedHearing.caseNumber ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{selectedHearing.caseNumber || '—'}</div></div>
                <div><div className="form-label" style={{ marginBottom: 2 }}>Responsável</div><div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{selectedHearing.responsible}</div></div>
                <div><div className="form-label" style={{ marginBottom: 2 }}>Lembrete</div><div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{selectedHearing.reminder}</div></div>
                {selectedHearing.location && (
                  <div className="full" style={{ gridColumn: '1 / -1' }}><div className="form-label" style={{ marginBottom: 2 }}>Local</div><div style={{ fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {selectedHearing.location}</div></div>
                )}
                {selectedHearing.meetingLink && (
                  <div className="full" style={{ gridColumn: '1 / -1' }}><div className="form-label" style={{ marginBottom: 2 }}>Link da Reunião</div><a href={selectedHearing.meetingLink} target="_blank" style={{ fontSize: 14 }}>{selectedHearing.meetingLink}</a></div>
                )}
                {selectedHearing.participants && (
                  <div className="full" style={{ gridColumn: '1 / -1' }}><div className="form-label" style={{ marginBottom: 2 }}>Participantes</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedHearing.participants}</div></div>
                )}
                {selectedHearing.description && (
                  <div className="full" style={{ gridColumn: '1 / -1' }}><div className="form-label" style={{ marginBottom: 2 }}>Descrição</div><p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>{selectedHearing.description}</p></div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Alterar Status</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <button key={k} onClick={() => updateStatus(selectedHearing.id, k as HearingStatus)} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: selectedHearing.status === k ? v.bg : 'var(--bg-hover)', color: selectedHearing.status === k ? v.color : 'var(--text-secondary)', border: `1px solid ${selectedHearing.status === k ? v.color : 'var(--border-default)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Notas / Ata</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 120, width: '100%' }}
                  value={selectedHearing.notes}
                  onChange={e => updateNotes(selectedHearing.id, e.target.value)}
                  placeholder="Registrar ata da audiência, observações, decisões..."
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedHearing(null)}>Fechar</button>
              <button className="btn btn-ghost" onClick={() => { openEdit(selectedHearing); setSelectedHearing(null); }}><Edit3 size={14} /> Editar</button>
            </div>
          </div>
        </>
      )}

      {showForm && (
        <>
          <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingId(null); }} />
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3>{editingId ? 'Editar Audiência' : 'Nova Audiência'}</h3>
              <button className="modal-close" onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Título <span style={{ color: '#EF4444' }}>*</span></label>
                  <input className="form-input" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Título da audiência" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" value={formType} onChange={e => setFormType(e.target.value as HearingType)}>
                    {HEARING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lembrete</label>
                  <select className="form-select" value={formReminder} onChange={e => setFormReminder(e.target.value)}>
                    <option value="15min antes">15min antes</option>
                    <option value="30min antes">30min antes</option>
                    <option value="1h antes">1h antes</option>
                    <option value="1 dia antes">1 dia antes</option>
                    <option value="Não lembrar">Não lembrar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Data <span style={{ color: '#EF4444' }}>*</span></label>
                  <input className="form-input" type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Horário Início</label>
                  <input className="form-input" type="time" value={formStartTime} onChange={e => setFormStartTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Horário Fim</label>
                  <input className="form-input" type="time" value={formEndTime} onChange={e => setFormEndTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Local</label>
                  <input className="form-input" value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="Fórum, sala..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Link da Reunião</label>
                  <input className="form-input" value={formMeetingLink} onChange={e => setFormMeetingLink(e.target.value)} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Cliente</label>
                  <select className="form-select" value={formClient} onChange={e => setFormClient(e.target.value)}>
                    <option value="">Selecione</option>
                    {CLIENT_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Processo</label>
                  <select className="form-select" value={formCaseNumber} onChange={e => setFormCaseNumber(e.target.value)}>
                    <option value="">Selecione</option>
                    {CASE_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Responsável <span style={{ color: '#EF4444' }}>*</span></label>
                  <select className="form-select" value={formResponsible} onChange={e => setFormResponsible(e.target.value)}>
                    <option value="">Selecione</option>
                    {RESPONSIBLE_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Participantes</label>
                  <input className="form-input" value={formParticipants} onChange={e => setFormParticipants(e.target.value)} placeholder="Nomes separados por vírgula" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Descrição</label>
                  <textarea className="form-textarea" value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Descrição da audiência..." />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveForm} disabled={!formTitle || !formDate || !formResponsible}>
                {editingId ? 'Salvar' : 'Criar Audiência'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
