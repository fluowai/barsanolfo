import { useState } from 'react';
import {
  Users, Plus, Search, X, Eye, Edit, Trash2, Mail, Phone,
  Briefcase, CheckCircle, Clock, Target, UserCheck, Activity,
  Calendar, FileText, TrendingUp, Award, ChevronRight,
  ChevronLeft, Star, BarChart, MessageSquare, Shield,
  BookOpen, Percent, AlertTriangle, Loader
} from 'lucide-react';
import './Team.css';

type Role = 'SOCIO' | 'ADVOGADO' | 'ESTAGIARIO' | 'SECRETARIA' | 'FINANCEIRO';

interface CaseAssigned {
  id: string;
  title: string;
  cnjNumber: string;
  status: string;
}

interface TaskAssigned {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface DeadlineAssigned {
  id: string;
  title: string;
  dueDate: string;
  met: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  target: string;
  date: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  oab: string;
  phone: string;
  title: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar: string;
  casesAssigned: CaseAssigned[];
  tasksAssigned: TaskAssigned[];
  deadlinesAssigned: DeadlineAssigned[];
  recentActivity: ActivityLog[];
  createdAt: string;
  tarefasConcluidas: number;
  prazosCumpridos: number;
  leadsAtendidos: number;
  clientesAtivos: number;
  performanceScore: number;
}

const mockMembers: TeamMember[] = [
  {
    id: '1', name: 'Dr. Paulo Martins', email: 'paulo@escritorio.com', password: '', role: 'SOCIO',
    oab: '123.456', phone: '(11) 99999-0001', title: 'Sócio Fundador', status: 'ACTIVE', avatar: '',
    tarefasConcluidas: 145, prazosCumpridos: 98, leadsAtendidos: 42, clientesAtivos: 18, performanceScore: 97,
    casesAssigned: [
      { id: 'c1', title: 'Reclamação Trabalhista - Assédio Moral', cnjNumber: '0000832-35.2018.4.01.3202', status: 'ACTIVE' },
      { id: 'c2', title: 'Ação Indenizatória - Veículo com Defeito', cnjNumber: '0056789-01.2023.8.13.0024', status: 'ACTIVE' },
      { id: 'c3', title: 'Ação de Alimentos - Guarda', cnjNumber: '0034567-89.2026.8.13.0024', status: 'ACTIVE' },
    ],
    tasksAssigned: [
      { id: 't1', title: 'Revisar petição inicial', dueDate: '2026-05-20', completed: false },
      { id: 't2', title: 'Elaborar parecer jurídico', dueDate: '2026-05-22', completed: true },
      { id: 't3', title: 'Acompanhar audiência virtual', dueDate: '2026-05-16', completed: true },
      { id: 't4', title: 'Analisar sentença', dueDate: '2026-06-01', completed: false },
    ],
    deadlinesAssigned: [
      { id: 'd1', title: 'Contestar recurso', dueDate: '2026-06-01', met: false },
      { id: 'd2', title: 'Indicar assistente técnico', dueDate: '2026-05-20', met: true },
      { id: 'd3', title: 'Prazo para embargos', dueDate: '2026-05-25', met: true },
    ],
    recentActivity: [
      { id: 'a1', action: 'Criou tarefa', target: 'Revisar petição inicial', date: '2026-05-09T10:00:00' },
      { id: 'a2', action: 'Concluiu prazo', target: 'Indicar assistente técnico', date: '2026-05-08T14:30:00' },
      { id: 'a3', action: 'Atualizou processo', target: 'Ação Indenizatória', date: '2026-05-07T09:15:00' },
    ],
    createdAt: '2018-01-15T09:00:00',
  },
  {
    id: '2', name: 'Dra. Maria Oliveira', email: 'maria@escritorio.com', password: '', role: 'ADVOGADO',
    oab: '234.567', phone: '(11) 99999-0002', title: 'Advogada Trabalhista', status: 'ACTIVE', avatar: '',
    tarefasConcluidas: 98, prazosCumpridos: 95, leadsAtendidos: 28, clientesAtivos: 12, performanceScore: 93,
    casesAssigned: [
      { id: 'c4', title: 'Execução Fiscal - IPI', cnjNumber: '0034567-89.2022.4.03.6100', status: 'ACTIVE' },
      { id: 'c5', title: 'Aposentadoria Especial', cnjNumber: '0078901-23.2024.4.01.3202', status: 'ACTIVE' },
    ],
    tasksAssigned: [
      { id: 't5', title: 'Preparar contestação', dueDate: '2026-05-14', completed: false },
      { id: 't6', title: 'Elaborar embargos', dueDate: '2026-05-22', completed: false },
      { id: 't7', title: 'Protocolar recurso', dueDate: '2026-05-10', completed: true },
    ],
    deadlinesAssigned: [
      { id: 'd4', title: 'Contestação trabalhista', dueDate: '2026-05-14', met: false },
      { id: 'd5', title: 'Embargos à execução', dueDate: '2026-05-25', met: false },
    ],
    recentActivity: [
      { id: 'a4', action: 'Protocolou petição', target: 'Execução Fiscal', date: '2026-05-09T16:45:00' },
      { id: 'a5', action: 'Concluiu tarefa', target: 'Protocolar recurso', date: '2026-05-08T11:30:00' },
    ],
    createdAt: '2020-03-10T09:00:00',
  },
  {
    id: '3', name: 'Dr. Carlos Santos', email: 'carlos@escritorio.com', password: '', role: 'ADVOGADO',
    oab: '345.678', phone: '(11) 99999-0003', title: 'Advogado Cível', status: 'ACTIVE', avatar: '',
    tarefasConcluidas: 112, prazosCumpridos: 91, leadsAtendidos: 35, clientesAtivos: 14, performanceScore: 89,
    casesAssigned: [
      { id: 'c6', title: 'Divórcio Litigioso c/ Guarda', cnjNumber: '0012345-67.2020.8.26.0100', status: 'ACTIVE' },
      { id: 'c7', title: 'Cobrança Indevida - Negativação', cnjNumber: '0090123-45.2021.8.21.0001', status: 'ACTIVE' },
      { id: 'c8', title: 'Defesa Criminal - Furto', cnjNumber: '0012345-67.2025.8.26.0100', status: 'ACTIVE' },
    ],
    tasksAssigned: [
      { id: 't8', title: 'Elaborar contrarrazões', dueDate: '2026-05-18', completed: false },
      { id: 't9', title: 'Preparar testemunhas de defesa', dueDate: '2026-06-15', completed: false },
      { id: 't10', title: 'Analisar apelação', dueDate: '2026-05-25', completed: true },
    ],
    deadlinesAssigned: [
      { id: 'd6', title: 'Contrarrazões de apelação', dueDate: '2026-05-20', met: false },
      { id: 'd7', title: 'Audiência de Instrução', dueDate: '2026-07-10', met: false },
    ],
    recentActivity: [
      { id: 'a6', action: 'Analisou documento', target: 'Apelação Banco Nacional', date: '2026-05-09T08:00:00' },
    ],
    createdAt: '2019-06-01T09:00:00',
  },
  {
    id: '4', name: 'Juliana Lima', email: 'juliana@escritorio.com', password: '', role: 'SECRETARIA',
    oab: '', phone: '(11) 99999-0004', title: 'Secretária', status: 'ACTIVE', avatar: '',
    tarefasConcluidas: 210, prazosCumpridos: 99, leadsAtendidos: 15, clientesAtivos: 0, performanceScore: 96,
    casesAssigned: [],
    tasksAssigned: [
      { id: 't11', title: 'Organizar documentos novos clientes', dueDate: '2026-05-15', completed: false },
      { id: 't12', title: 'Atualizar planilha de prazos', dueDate: '2026-05-20', completed: false },
      { id: 't13', title: 'Formatar parecer para envio', dueDate: '2026-05-12', completed: true },
      { id: 't14', title: 'Cobrar parcela vencida', dueDate: '2026-05-12', completed: false },
    ],
    deadlinesAssigned: [],
    recentActivity: [
      { id: 'a7', action: 'Formatou documento', target: 'Parecer Jurídico - Fernanda Costa', date: '2026-05-09T09:45:00' },
      { id: 'a8', action: 'Atualizou planilha', target: 'Planilha de Prazos', date: '2026-05-08T17:00:00' },
    ],
    createdAt: '2021-02-01T09:00:00',
  },
  {
    id: '5', name: 'Pedro Costa', email: 'pedro@escritorio.com', password: '', role: 'ESTAGIARIO',
    oab: '', phone: '(11) 99999-0005', title: 'Estagiário', status: 'ACTIVE', avatar: '',
    tarefasConcluidas: 67, prazosCumpridos: 88, leadsAtendidos: 5, clientesAtivos: 0, performanceScore: 82,
    casesAssigned: [],
    tasksAssigned: [
      { id: 't15', title: 'Pesquisar jurisprudência', dueDate: '2026-05-18', completed: false },
      { id: 't16', title: 'Reunir documentos', dueDate: '2026-05-18', completed: true },
      { id: 't17', title: 'Elaborar resumo processual', dueDate: '2026-05-22', completed: false },
    ],
    deadlinesAssigned: [],
    recentActivity: [
      { id: 'a9', action: 'Concluiu pesquisa', target: 'Jurisprudência STJ - Tema 123', date: '2026-05-09T15:30:00' },
    ],
    createdAt: '2025-01-10T09:00:00',
  },
  {
    id: '6', name: 'Ana Beatriz', email: 'ana@escritorio.com', password: '', role: 'FINANCEIRO',
    oab: '', phone: '(11) 99999-0006', title: 'Analista Financeira', status: 'ACTIVE', avatar: '',
    tarefasConcluidas: 134, prazosCumpridos: 97, leadsAtendidos: 3, clientesAtivos: 0, performanceScore: 94,
    casesAssigned: [],
    tasksAssigned: [
      { id: 't18', title: 'Gerar relatório financeiro mensal', dueDate: '2026-05-25', completed: false },
      { id: 't19', title: 'Conciliar extratos bancários', dueDate: '2026-05-15', completed: true },
      { id: 't20', title: 'Enviar boletos pendentes', dueDate: '2026-05-10', completed: true },
    ],
    deadlinesAssigned: [],
    recentActivity: [
      { id: 'a10', action: 'Conciliou', target: 'Extrato Maio/2026', date: '2026-05-09T11:00:00' },
      { id: 'a11', action: 'Emitiu relatório', target: 'Inadimplência Abril/2026', date: '2026-05-07T16:30:00' },
    ],
    createdAt: '2022-08-15T09:00:00',
  },
];

const roleLabels: Record<Role, string> = {
  SOCIO: 'Sócio',
  ADVOGADO: 'Advogado(a)',
  ESTAGIARIO: 'Estagiário(a)',
  SECRETARIA: 'Secretário(a)',
  FINANCEIRO: 'Financeiro',
};

const roleColors: Record<Role, string> = {
  SOCIO: '#D4AF37',
  ADVOGADO: '#3B82F6',
  ESTAGIARIO: '#10B981',
  SECRETARIA: '#8B5CF6',
  FINANCEIRO: '#06B6D4',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('pt-BR');
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function avatarColor(name: string): string {
  const colors = ['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#D4AF37'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: avatarColor(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff',
      flexShrink: 0,
      border: '2px solid rgba(255,255,255,0.1)',
    }}>
      {getInitials(name)}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === 'ACTIVE';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      background: active ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
      color: active ? '#10B981' : '#6B7280',
      border: `1px solid ${active ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.3)'}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#10B981' : '#6B7280' }} />
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}

function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ width: '100%', height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color || 'var(--gold-primary)', borderRadius: 3, transition: 'width 0.3s ease' }} />
    </div>
  );
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>(mockMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);
  const [detailTab, setDetailTab] = useState('profile');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<Role>('ADVOGADO');
  const [formOab, setFormOab] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const filteredMembers = members.filter(m => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !searchTerm ||
      m.name.toLowerCase().includes(s) ||
      m.email.toLowerCase().includes(s) ||
      m.title.toLowerCase().includes(s);
    const matchRole = !roleFilter || m.role === roleFilter;
    const matchStatus = !statusFilter || m.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: members.length,
    advogados: members.filter(m => m.role === 'ADVOGADO' || m.role === 'SOCIO').length,
    estagiarios: members.filter(m => m.role === 'ESTAGIARIO').length,
    secretaria: members.filter(m => m.role === 'SECRETARIA' || m.role === 'FINANCEIRO').length,
    active: members.filter(m => m.status === 'ACTIVE').length,
    avgPerformance: Math.round(members.reduce((acc, m) => acc + m.performanceScore, 0) / members.length),
  };

  function openForm(member?: TeamMember) {
    if (member) {
      setEditingMember(member);
      setFormName(member.name);
      setFormEmail(member.email);
      setFormPassword('');
      setFormRole(member.role);
      setFormOab(member.oab);
      setFormPhone(member.phone);
      setFormTitle(member.title);
      setFormStatus(member.status);
    } else {
      setEditingMember(null);
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setFormRole('ADVOGADO');
      setFormOab('');
      setFormPhone('');
      setFormTitle('');
      setFormStatus('ACTIVE');
    }
    setShowFormModal(true);
  }

  function saveForm(e: React.FormEvent) {
    e.preventDefault();
    if (editingMember) {
      setMembers(members.map(m => m.id === editingMember.id ? {
        ...m,
        name: formName,
        email: formEmail,
        password: formPassword || m.password,
        role: formRole,
        oab: formOab,
        phone: formPhone,
        title: formTitle,
        status: formStatus,
      } : m));
    } else {
      const newMember: TeamMember = {
        id: `m${Date.now()}`,
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        oab: formOab,
        phone: formPhone,
        title: formTitle,
        status: formStatus,
        avatar: '',
        tarefasConcluidas: 0,
        prazosCumpridos: 0,
        leadsAtendidos: 0,
        clientesAtivos: 0,
        performanceScore: 0,
        casesAssigned: [],
        tasksAssigned: [],
        deadlinesAssigned: [],
        recentActivity: [],
        createdAt: new Date().toISOString(),
      };
      setMembers([...members, newMember]);
    }
    setShowFormModal(false);
    setEditingMember(null);
  }

  function handleDelete(id: string) {
    setMembers(members.filter(m => m.id !== id));
    setConfirmDelete(null);
    if (viewingMember?.id === id) setViewingMember(null);
  }

  function getCompletionRate(tasks: { completed: boolean }[]): number {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
  }

  function getDeadlineRate(deadlines: { met: boolean }[]): number {
    if (deadlines.length === 0) return 100;
    return Math.round((deadlines.filter(d => d.met).length / deadlines.length) * 100);
  }

  const roleOptions: { value: Role; label: string }[] = [
    { value: 'SOCIO', label: 'Sócio' },
    { value: 'ADVOGADO', label: 'Advogado(a)' },
    { value: 'ESTAGIARIO', label: 'Estagiário(a)' },
    { value: 'SECRETARIA', label: 'Secretário(a)' },
    { value: 'FINANCEIRO', label: 'Financeiro' },
  ];

  return (
    <div className="page team-page">
      <style>{`
        .team-page { max-width: 1400px; }
        .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
        .team-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: all 0.2s; }
        .team-card:hover { border-color: var(--gold-primary); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
        .team-card-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .team-card-info { flex: 1; min-width: 0; }
        .team-card-name { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 2px; }
        .team-card-role { font-size: 12px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; }
        .team-card-contact { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
        .team-card-contact-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
        .team-card-divider { height: 1px; background: var(--border); margin: 14px 0; }
        .productivity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .productivity-item { display: flex; flex-direction: column; gap: 2px; }
        .productivity-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; }
        .productivity-value { font-size: 18px; font-weight: 700; }
        .productivity-sub { font-size: 11px; color: var(--text-muted); }
        .team-card-actions { display: flex; gap: 6px; margin-top: 14px; }
        .team-card-actions button { flex: 1; padding: 8px; border-radius: 8px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.15s; }
        .drawer { position: fixed; top: 0; right: 0; height: 100vh; width: 640px; max-width: 100vw; z-index: 500; transform: translateX(100%); transition: transform 0.3s ease; }
        .drawer.open { transform: translateX(0); }
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 499; backdrop-filter: blur(2px); }
        .drawer-content { height: 100%; display: flex; flex-direction: column; background: var(--bg-card); border-left: 1px solid var(--border); }
        .drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
        .drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
        .detail-tabs { display: flex; gap: 2px; overflow-x: auto; border-bottom: 1px solid var(--border); background: var(--bg-elevated); }
        .detail-tab { padding: 12px 14px; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .detail-tab:hover { color: var(--text-primary); background: var(--bg-hover); }
        .detail-tab.active { color: var(--gold-primary); border-bottom-color: var(--gold-primary); }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
        .info-field { display: flex; flex-direction: column; gap: 4px; }
        .info-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .info-value { font-size: 14px; color: var(--text-primary); font-weight: 500; word-break: break-word; }
        .section-title { font-size: 13px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .metric-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 10px; padding: 16px; text-align: center; }
        .metric-value { font-size: 28px; font-weight: 800; }
        .metric-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; margin-top: 4px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 600; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .modal-content { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; width: 560px; max-width: 90vw; max-height: 90vh; overflow-y: auto; padding: 32px; }
        .modal-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-grid-2 .full { grid-column: 1 / -1; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px; }
        .form-control { background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; color: var(--text-primary); font-size: 14px; outline: none; transition: all 0.2s; font-family: inherit; }
        .form-control:focus { border-color: var(--gold-primary); box-shadow: 0 0 0 3px var(--gold-glow); }
        .form-control::placeholder { color: var(--text-tertiary); }
        select.form-control { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23A1A1AA' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
        .modal-actions { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }
        .search-box-team { display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 0 14px; color: var(--text-tertiary); transition: all 0.2s; flex: 1; min-width: 200px; }
        .search-box-team:focus-within { border-color: var(--gold-primary); box-shadow: 0 0 0 3px var(--gold-glow); }
        .search-box-team input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-size: 14px; outline: none; padding: 12px 0; }
        .search-box-team input::placeholder { color: var(--text-tertiary); }
        .activity-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .activity-item:last-child { border-bottom: none; }
        .activity-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold-primary); flex-shrink: 0; }
        .activity-text { flex: 1; font-size: 13px; color: var(--text-primary); }
        .activity-date { font-size: 11px; color: var(--text-tertiary); white-space: nowrap; }
        .empty-state { text-align: center; padding: 48px 24px; color: var(--text-tertiary); }
        .empty-state svg { margin-bottom: 12px; opacity: 0.4; }
        .empty-state p { font-size: 14px; }
        .confirm-dialog { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 700; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .confirm-box { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; width: 360px; max-width: 90vw; text-align: center; }
        .confirm-box h3 { margin: 0 0 8px; color: var(--text-primary); }
        .confirm-box p { color: var(--text-secondary); font-size: 14px; margin-bottom: 20px; }
        .confirm-actions { display: flex; gap: 12px; justify-content: center; }
      `}</style>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={28} />
            Gestão de Equipe
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {members.length} membro{members.length !== 1 ? 's' : ''} na equipe
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => openForm()}>
            <Plus size={18} />
            Novo Membro
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-label">Total Membros</div>
          <div className="stat-value" style={{ color: 'var(--gold-primary)' }}>{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Advogados</div>
          <div className="stat-value" style={{ color: '#3B82F6' }}>{stats.advogados}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Estagiários</div>
          <div className="stat-value" style={{ color: '#10B981' }}>{stats.estagiarios}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Secretaria / Financeiro</div>
          <div className="stat-value" style={{ color: '#8B5CF6' }}>{stats.secretaria}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Performance Média</div>
          <div className="stat-value" style={{ color: '#F59E0B', fontSize: '1.25rem' }}>{stats.avgPerformance}%</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box-team">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou cargo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: 140 }}
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">Todas as Funções</option>
          {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: 120 }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Todos Status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
        </select>
        {(searchTerm || roleFilter || statusFilter) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSearchTerm(''); setRoleFilter(''); setStatusFilter(''); }}
            style={{ color: '#ef4444' }}
          >
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      {/* Team Grid */}
      <div className="team-grid">
        {filteredMembers.map(member => (
          <div key={member.id} className="team-card">
            <div className="team-card-header">
              <Avatar name={member.name} size={52} />
              <div className="team-card-info">
                <div className="team-card-name">{member.name}</div>
                <div className="team-card-role" style={{ color: roleColors[member.role] }}>
                  {roleLabels[member.role]}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{member.title}</span>
              </div>
              <StatusBadge status={member.status} />
            </div>

            <div className="team-card-contact">
              <div className="team-card-contact-item">
                <Mail size={13} />
                {member.email}
              </div>
              <div className="team-card-contact-item">
                <Phone size={13} />
                {member.phone}
              </div>
              {member.oab && (
                <div className="team-card-contact-item">
                  <Award size={13} style={{ color: 'var(--gold-primary)' }} />
                  OAB {member.oab}
                </div>
              )}
            </div>

            <div className="team-card-divider" />

            <div className="productivity-grid">
              <div className="productivity-item">
                <div className="productivity-label">Tarefas Concluídas</div>
                <div className="productivity-value" style={{ color: '#10B981' }}>{member.tarefasConcluidas}</div>
              </div>
              <div className="productivity-item">
                <div className="productivity-label">Prazos Cumpridos</div>
                <div className="productivity-value" style={{ color: '#3B82F6' }}>{member.prazosCumpridos}%</div>
              </div>
              <div className="productivity-item">
                <div className="productivity-label">Leads Atendidos</div>
                <div className="productivity-value" style={{ color: '#F59E0B' }}>{member.leadsAtendidos}</div>
              </div>
              <div className="productivity-item">
                <div className="productivity-label">Clientes Ativos</div>
                <div className="productivity-value" style={{ color: '#8B5CF6' }}>{member.clientesAtivos}</div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                <span>Performance</span>
                <span>{member.performanceScore}%</span>
              </div>
              <ProgressBar value={member.performanceScore} color={member.performanceScore >= 90 ? '#10B981' : member.performanceScore >= 70 ? '#F59E0B' : '#EF4444'} />
            </div>

            <div className="team-card-actions">
              <button onClick={() => setViewingMember(member)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                <Eye size={14} /> Visualizar
              </button>
              <button onClick={() => openForm(member)} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                <Edit size={14} /> Editar
              </button>
              <button
                onClick={() => setConfirmDelete(member.id)}
                className="btn btn-ghost btn-sm"
                style={{ flex: 0, color: '#ef4444' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {filteredMembers.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <Users size={48} />
            <p>Nenhum membro encontrado</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <Users size={22} style={{ color: 'var(--gold-primary)' }} />
              {editingMember ? 'Editar Membro' : 'Novo Membro'}
            </div>
            <form onSubmit={saveForm}>
              <div className="form-grid-2">
                <div className="form-group full">
                  <label>Nome Completo</label>
                  <input className="form-control" placeholder="Nome do membro" value={formName} onChange={e => setFormName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-control" type="email" placeholder="email@escritorio.com" value={formEmail} onChange={e => setFormEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Senha {editingMember && '(deixe em branco para manter)'}</label>
                  <input className="form-control" type="password" placeholder={editingMember ? '••••••••' : 'Nova senha'} value={formPassword} onChange={e => setFormPassword(e.target.value)} required={!editingMember} />
                </div>
                <div className="form-group">
                  <label>Função</label>
                  <select className="form-control" value={formRole} onChange={e => setFormRole(e.target.value as Role)}>
                    {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>OAB (opcional)</label>
                  <input className="form-control" placeholder="Número OAB" value={formOab} onChange={e => setFormOab(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input className="form-control" placeholder="(11) 99999-0000" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Cargo / Título</label>
                  <input className="form-control" placeholder="Ex: Sócio Fundador" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={formStatus} onChange={e => setFormStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}>
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-save">
                  <Plus size={16} /> {editingMember ? 'Salvar' : 'Adicionar'}
                </button>
                <button type="button" className="btn btn-cancel" onClick={() => setShowFormModal(false)}>
                  <X size={16} /> Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="confirm-dialog" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <AlertTriangle size={36} style={{ color: '#ef4444', marginBottom: 8 }} />
            <h3>Remover Membro</h3>
            <p>Tem certeza que deseja remover este membro da equipe? Esta ação não pode ser desfeita.</p>
            <div className="confirm-actions">
              <button className="btn btn-primary" style={{ background: '#ef4444', border: 'none' }} onClick={() => handleDelete(confirmDelete)}>
                <Trash2 size={14} /> Remover
              </button>
              <button className="btn btn-cancel" onClick={() => setConfirmDelete(null)}>
                <X size={14} /> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {viewingMember && (
        <>
          <div className="drawer-overlay" onClick={() => setViewingMember(null)} />
          <div className={`drawer open`}>
            <div className="drawer-content">
              <div className="drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={viewingMember.name} size={40} />
                  <div>
                    <h3 style={{ fontSize: 16, margin: 0 }}>{viewingMember.name}</h3>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{viewingMember.title}</span>
                  </div>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => setViewingMember(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="detail-tabs">
                {['profile', 'cases', 'tasks', 'deadlines', 'activity'].map(tab => (
                  <button
                    key={tab}
                    className={`detail-tab ${detailTab === tab ? 'active' : ''}`}
                    onClick={() => setDetailTab(tab)}
                  >
                    {tab === 'profile' && <><UserCheck size={14} /> Perfil</>}
                    {tab === 'cases' && <><Briefcase size={14} /> Processos</>}
                    {tab === 'tasks' && <><CheckCircle size={14} /> Tarefas</>}
                    {tab === 'deadlines' && <><Clock size={14} /> Prazos</>}
                    {tab === 'activity' && <><Activity size={14} /> Atividades</>}
                  </button>
                ))}
              </div>

              <div className="drawer-body">
                {/* Profile Tab */}
                {detailTab === 'profile' && (
                  <div>
                    <div className="info-grid" style={{ marginBottom: 24 }}>
                      <div className="info-field">
                        <div className="info-label">Email</div>
                        <div className="info-value">{viewingMember.email}</div>
                      </div>
                      <div className="info-field">
                        <div className="info-label">Telefone</div>
                        <div className="info-value">{viewingMember.phone}</div>
                      </div>
                      <div className="info-field">
                        <div className="info-label">Função</div>
                        <div className="info-value" style={{ color: roleColors[viewingMember.role] }}>{roleLabels[viewingMember.role]}</div>
                      </div>
                      <div className="info-field">
                        <div className="info-label">OAB</div>
                        <div className="info-value">{viewingMember.oab || '-'}</div>
                      </div>
                      <div className="info-field">
                        <div className="info-label">Status</div>
                        <StatusBadge status={viewingMember.status} />
                      </div>
                      <div className="info-field">
                        <div className="info-label">Membro desde</div>
                        <div className="info-value">{formatDate(viewingMember.createdAt)}</div>
                      </div>
                    </div>

                    <div className="section-title">
                      <BarChart size={16} />
                      Métricas de Performance
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                      <div className="metric-card">
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Tarefas Concluídas</div>
                        <div className="metric-value" style={{ color: '#10B981' }}>{viewingMember.tarefasConcluidas}</div>
                      </div>
                      <div className="metric-card">
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Prazos Cumpridos</div>
                        <div className="metric-value" style={{ color: '#3B82F6' }}>{viewingMember.prazosCumpridos}%</div>
                      </div>
                      <div className="metric-card">
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Leads Atendidos</div>
                        <div className="metric-value" style={{ color: '#F59E0B' }}>{viewingMember.leadsAtendidos}</div>
                      </div>
                      <div className="metric-card">
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Clientes Ativos</div>
                        <div className="metric-value" style={{ color: '#8B5CF6' }}>{viewingMember.clientesAtivos}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span className="info-label">Performance Score: {viewingMember.performanceScore}%</span>
                        <span style={{ fontSize: 12, color: viewingMember.performanceScore >= 90 ? '#10B981' : viewingMember.performanceScore >= 70 ? '#F59E0B' : '#EF4444', fontWeight: 700 }}>
                          {viewingMember.performanceScore >= 90 ? 'Excelente' : viewingMember.performanceScore >= 70 ? 'Bom' : 'Precisa Melhorar'}
                        </span>
                      </div>
                      <ProgressBar value={viewingMember.performanceScore} color={viewingMember.performanceScore >= 90 ? '#10B981' : viewingMember.performanceScore >= 70 ? '#F59E0B' : '#EF4444'} />
                    </div>
                  </div>
                )}

                {/* Cases Tab */}
                {detailTab === 'cases' && (
                  <div>
                    <div className="section-title">
                      <Briefcase size={16} />
                      Processos Atribuídos ({viewingMember.casesAssigned.length})
                    </div>
                    {viewingMember.casesAssigned.length === 0 ? (
                      <div className="empty-state">
                        <Briefcase size={36} />
                        <p>Nenhum processo atribuído</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {viewingMember.casesAssigned.map(c => (
                          <div key={c.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 14px', background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)', borderRadius: 10,
                          }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{c.cnjNumber}</div>
                            </div>
                            <span className={`badge ${c.status === 'ACTIVE' ? 'badge-active' : 'badge-gold'}`}>
                              {c.status === 'ACTIVE' ? 'Ativo' : c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tasks Tab */}
                {detailTab === 'tasks' && (
                  <div>
                    <div className="section-title">
                      <CheckCircle size={16} />
                      Tarefas Atribuídas ({viewingMember.tasksAssigned.length})
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Taxa de Conclusão</span>
                        <span style={{ fontWeight: 700, color: '#10B981' }}>{getCompletionRate(viewingMember.tasksAssigned)}%</span>
                      </div>
                      <ProgressBar value={getCompletionRate(viewingMember.tasksAssigned)} color="#10B981" />
                    </div>
                    {viewingMember.tasksAssigned.length === 0 ? (
                      <div className="empty-state">
                        <CheckCircle size={36} />
                        <p>Nenhuma tarefa atribuída</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {viewingMember.tasksAssigned.map(t => (
                          <div key={t.id} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)', borderRadius: 8,
                          }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%',
                              background: t.completed ? 'rgba(16,185,129,0.2)' : 'rgba(107,114,128,0.15)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {t.completed ? (
                                <CheckCircle size={14} color="#10B981" />
                              ) : (
                                <Clock size={14} color="#6B7280" />
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', textDecoration: t.completed ? 'line-through' : 'none' }}>
                                {t.title}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Vence: {formatDate(t.dueDate)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Deadlines Tab */}
                {detailTab === 'deadlines' && (
                  <div>
                    <div className="section-title">
                      <Clock size={16} />
                      Prazos Atribuídos ({viewingMember.deadlinesAssigned.length})
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Pontualidade</span>
                        <span style={{ fontWeight: 700, color: '#3B82F6' }}>{getDeadlineRate(viewingMember.deadlinesAssigned)}%</span>
                      </div>
                      <ProgressBar value={getDeadlineRate(viewingMember.deadlinesAssigned)} color="#3B82F6" />
                    </div>
                    {viewingMember.deadlinesAssigned.length === 0 ? (
                      <div className="empty-state">
                        <Clock size={36} />
                        <p>Nenhum prazo atribuído</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {viewingMember.deadlinesAssigned.map(d => (
                          <div key={d.id} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)', borderRadius: 8,
                          }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%',
                              background: d.met ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {d.met ? (
                                <CheckCircle size={14} color="#10B981" />
                              ) : (
                                <X size={14} color="#ef4444" />
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{d.title}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Data: {formatDate(d.dueDate)}</div>
                            </div>
                            <span style={{
                              fontSize: 11, fontWeight: 700,
                              color: d.met ? '#10B981' : '#ef4444',
                              padding: '2px 8px', borderRadius: 4,
                              background: d.met ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            }}>
                              {d.met ? 'Cumprido' : 'Não cumprido'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Activity Tab */}
                {detailTab === 'activity' && (
                  <div>
                    <div className="section-title">
                      <Activity size={16} />
                      Atividades Recentes
                    </div>
                    {viewingMember.recentActivity.length === 0 ? (
                      <div className="empty-state">
                        <Activity size={36} />
                        <p>Nenhuma atividade recente</p>
                      </div>
                    ) : (
                      <div>
                        {viewingMember.recentActivity.map(a => (
                          <div key={a.id} className="activity-item">
                            <div className="activity-dot" />
                            <div className="activity-text">
                              <strong>{a.action}</strong> - {a.target}
                            </div>
                            <div className="activity-date">{formatDateTime(a.date)}</div>
                          </div>
                        ))}
                      </div>
                    )}
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
