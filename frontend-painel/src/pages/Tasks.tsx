import { useState, useMemo, useEffect } from 'react';
import { tasksApi } from '../services/api';
import {
  Plus, Search, X, LayoutGrid, List, Clock, AlertTriangle,
  CheckCircle2, Circle, Paperclip, MessageSquare,
  Play, Pause, Trash2, Edit3, ChevronDown,
  Calendar, FileText, CornerDownRight,
  Timer, Flag
} from 'lucide-react';
import './Tasks.css';

type Priority = 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
type Status = 'TODO' | 'IN_PROGRESS' | 'AWAITING_CLIENT' | 'AWAITING_DOCUMENT' | 'AWAITING_LAWYER' | 'IN_REVIEW' | 'COMPLETED';
type ViewMode = 'kanban' | 'table';

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
}

interface SubTask {
  id: string;
  title: string;
  done: boolean;
  assignedTo: string;
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

interface TimeEntry {
  id: string;
  startTime: string;
  endTime?: string;
  description: string;
}

interface HistoryEntry {
  id: string;
  field: string;
  oldValue?: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignedTo: string;
  reviewer: string;
  client: string;
  caseNumber: string;
  deadline: string;
  estimatedMinutes: number;
  tags: string[];
  notes: string;
  checklist: ChecklistItem[];
  comments: Comment[];
  subtasks: SubTask[];
  attachments: Attachment[];
  timeEntries: TimeEntry[];
  history: HistoryEntry[];
  createdAt: string;
}

const priorityColors: Record<Priority, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: '#ef4444' },
  URGENT: { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: '#f97316' },
  HIGH: { bg: 'rgba(234,179,8,0.15)', text: '#eab308', border: '#eab308' },
  MEDIUM: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', border: '#3b82f6' },
  LOW: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', border: '#10b981' },
};

const statusLabels: Record<string, string> = {
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Andamento',
  AWAITING_CLIENT: 'Aguardando Cliente',
  AWAITING_DOCUMENT: 'Aguardando Documento',
  AWAITING_LAWYER: 'Aguardando Advogado',
  IN_REVIEW: 'Em Revisão',
  COMPLETED: 'Concluído',
};

const kanbanColumns: { key: string; title: string; statuses: Status[]; color: string }[] = [
  { key: 'TODO', title: 'A FAZER', statuses: ['TODO'], color: '#6b7280' },
  { key: 'IN_PROGRESS', title: 'EM ANDAMENTO', statuses: ['IN_PROGRESS'], color: '#3b82f6' },
  { key: 'AWAITING', title: 'AGUARDANDO', statuses: ['AWAITING_CLIENT', 'AWAITING_DOCUMENT', 'AWAITING_LAWYER'], color: '#f97316' },
  { key: 'IN_REVIEW', title: 'EM REVISÃO', statuses: ['IN_REVIEW'], color: '#8b5cf6' },
  { key: 'COMPLETED', title: 'CONCLUÍDO', statuses: ['COMPLETED'], color: '#10b981' },
];

const mockTasks: Task[] = [];

const teamMembers = [
  'Dr. Paulo', 'Dra. Maria', 'Dra. Ana', 'Secretaria', 'Equipe'
];

const clientOptions = [
  'Carlos Silva', 'Maria Oliveira', 'Empresa ABC Ltda', 'João Pereira',
  'Empresa XYZ', 'Roberto Almeida', 'Fernanda Costa', 'Geral', 'Interno'
];

const caseOptions = [
  '0000832-35.2018.4.01.3202', '1234567-89.2023.8.26.0000',
  '9876543-21.2022.8.19.0001', '5555666-77.2024.5.01.0001',
  '1111222-33.2021.8.26.0100', '3333444-55.2023.8.26.0200'
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR');
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function avatarColor(name: string): string {
  const colors = ['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function classNames(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ width: '100%', height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color || 'var(--gold-primary)', borderRadius: 2, transition: 'width 0.3s ease' }} />
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const c = priorityColors[priority];
  const label = { CRITICAL: 'Crítica', URGENT: 'Urgente', HIGH: 'Alta', MEDIUM: 'Média', LOW: 'Baixa' }[priority];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {priority === 'CRITICAL' || priority === 'URGENT' ? <AlertTriangle size={12} /> : <Flag size={12} />}
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    TODO: '#6b7280', IN_PROGRESS: '#3b82f6', AWAITING_CLIENT: '#f97316',
    AWAITING_DOCUMENT: '#f97316', AWAITING_LAWYER: '#f97316',
    IN_REVIEW: '#8b5cf6', COMPLETED: '#10b981',
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${colorMap[status] || '#6b7280'}18`, color: colorMap[status] || '#6b7280', border: `1px solid ${colorMap[status] || '#6b7280'}40` }}>
      {status === 'COMPLETED' ? <CheckCircle2 size={12} /> : status === 'IN_PROGRESS' ? <Play size={12} /> : <Circle size={12} />}
      {statusLabels[status] || status}
    </span>
  );
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: avatarColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {getInitials(name)}
    </div>
  );
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return `${h}h${m > 0 ? `${m}min` : ''}`;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await tasksApi.list();
        const list = (res as any).tasks || (res as any).data || [];
        setTasks(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Erro ao carregar tarefas:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [filterClient, setFilterClient] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<string>('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeTimeSpent, setCompleteTimeSpent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTaskId, setTimerTaskId] = useState<string | null>(null);
  const [timerStart, setTimerStart] = useState<Date | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('MEDIUM');
  const [formStatus, setFormStatus] = useState<Status>('TODO');
  const [formAssignedTo, setFormAssignedTo] = useState('');
  const [formReviewer, setFormReviewer] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formCaseNumber, setFormCaseNumber] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formEstimatedMinutes, setFormEstimatedMinutes] = useState(60);
  const [formTags, setFormTags] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formChecklist, setFormChecklist] = useState<string[]>(['']);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.client.toLowerCase().includes(q) && !t.caseNumber.toLowerCase().includes(q)) return false;
      }
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterAssignee && t.assignedTo !== filterAssignee) return false;
      if (filterClient && t.client !== filterClient) return false;
      if (filterPeriod) {
        const d = new Date(t.deadline);
        const now = new Date();
        if (filterPeriod === 'today') {
          if (d.toDateString() !== now.toDateString()) return false;
        } else if (filterPeriod === 'week') {
          const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);
          if (d < now || d > weekEnd) return false;
        } else if (filterPeriod === 'overdue') {
          if (d >= now || t.status === 'COMPLETED') return false;
        }
      }
      return true;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority, filterAssignee, filterClient, filterPeriod]);

  const totalTasks = tasks.length;
  const todoCount = tasks.filter(t => t.status === 'TODO').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const overdueCount = tasks.filter(t => t.status !== 'COMPLETED' && isOverdue(t.deadline)).length;

  function openForm(task?: Task) {
    if (task) {
      setEditingTask(task);
      setFormTitle(task.title);
      setFormDescription(task.description);
      setFormPriority(task.priority);
      setFormStatus(task.status);
      setFormAssignedTo(task.assignedTo);
      setFormReviewer(task.reviewer);
      setFormClient(task.client);
      setFormCaseNumber(task.caseNumber);
      setFormDeadline(task.deadline ? task.deadline.slice(0, 16) : '');
      setFormEstimatedMinutes(task.estimatedMinutes);
      setFormTags(task.tags.join(', '));
      setFormNotes(task.notes);
      setFormChecklist(task.checklist.length > 0 ? task.checklist.map(c => c.text) : ['']);
    } else {
      setEditingTask(null);
      setFormTitle('');
      setFormDescription('');
      setFormPriority('MEDIUM');
      setFormStatus('TODO');
      setFormAssignedTo('');
      setFormReviewer('');
      setFormClient('');
      setFormCaseNumber('');
      setFormDeadline('');
      setFormEstimatedMinutes(60);
      setFormTags('');
      setFormNotes('');
      setFormChecklist(['']);
    }
    setShowFormModal(true);
  }

  function saveForm() {
    const clItems = formChecklist.filter(c => c.trim()).map((text, i) => ({
      id: `cl_${Date.now()}_${i}`, text, done: false,
    }));
    const taskData: Task = {
      id: editingTask?.id || `task_${Date.now()}`,
      title: formTitle,
      description: formDescription,
      priority: formPriority,
      status: formStatus,
      assignedTo: formAssignedTo,
      reviewer: formReviewer,
      client: formClient,
      caseNumber: formCaseNumber,
      deadline: formDeadline ? new Date(formDeadline).toISOString() : '',
      estimatedMinutes: formEstimatedMinutes || 0,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      notes: formNotes,
      checklist: editingTask ? [...editingTask.checklist, ...clItems.filter(c => !editingTask.checklist.find(ec => ec.text === c.text))] : clItems,
      comments: editingTask?.comments || [],
      subtasks: editingTask?.subtasks || [],
      attachments: editingTask?.attachments || [],
      timeEntries: editingTask?.timeEntries || [],
      history: editingTask?.history || [],
      createdAt: editingTask?.createdAt || new Date().toISOString(),
    };
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? taskData : t));
    } else {
      setTasks([...tasks, taskData]);
    }
    setShowFormModal(false);
    setEditingTask(null);
  }

  function changeTaskStatus(taskId: string, newStatus: Status) {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      const history = [...t.history, {
        id: `h_${Date.now()}`,
        field: 'status',
        oldValue: t.status,
        newValue: newStatus,
        changedBy: 'Dr. Paulo',
        changedAt: new Date().toISOString(),
      }];
      if (newStatus === 'COMPLETED') {
        setSelectedTask({ ...t, status: newStatus, history });
        setShowCompleteModal(true);
        return t;
      }
      return { ...t, status: newStatus, history };
    }));
  }

  function confirmComplete() {
    if (!selectedTask) return;
    setTasks(tasks.map(t => {
      if (t.id !== selectedTask.id) return t;
      const te = t.timeEntries;
      if (completeTimeSpent) {
        te.push({
          id: `te_${Date.now()}`,
          startTime: new Date(Date.now() - parseInt(completeTimeSpent) * 60000).toISOString(),
          endTime: new Date().toISOString(),
          description: completeNotes || 'Tarefa concluída',
        });
      }
      return {
        ...t,
        status: 'COMPLETED' as Status,
        notes: completeNotes ? `${t.notes}\n[Conclusão] ${completeNotes}` : t.notes,
        timeEntries: te,
        history: [...t.history, {
          id: `h_${Date.now()}`, field: 'status',
          oldValue: t.status, newValue: 'COMPLETED' as Status,
          changedBy: 'Dr. Paulo', changedAt: new Date().toISOString(),
        }],
      };
    }));
    setShowCompleteModal(false);
    setSelectedTask(null);
    setCompleteNotes('');
    setCompleteTimeSpent('');
  }

  function addComment(taskId: string) {
    if (!newComment.trim()) return;
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        comments: [...t.comments, {
          id: `cm_${Date.now()}`,
          author: 'Dr. Paulo',
          avatar: '',
          content: newComment,
          createdAt: new Date().toISOString(),
        }],
      };
    }));
    setNewComment('');
  }

  function toggleChecklistItem(taskId: string, itemId: string) {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, checklist: t.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c) };
    }));
  }

  function addChecklistItem(taskId: string) {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, checklist: [...t.checklist, { id: `cl_${Date.now()}`, text: '', done: false }] };
    }));
  }

  function updateChecklistText(taskId: string, itemId: string, text: string) {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, checklist: t.checklist.map(c => c.id === itemId ? { ...c, text } : c) };
    }));
  }

  function removeChecklistItem(taskId: string, itemId: string) {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, checklist: t.checklist.filter(c => c.id !== itemId) };
    }));
  }

  function deleteTask(taskId: string) {
    setTasks(tasks.filter(t => t.id !== taskId));
    setSelectedTask(null);
  }

  function startTimer(taskId: string) {
    setTimerRunning(true);
    setTimerTaskId(taskId);
    setTimerStart(new Date());
  }

  function stopTimer() {
    if (timerStart && timerTaskId) {
      setTasks(tasks.map(t => {
        if (t.id !== timerTaskId) return t;
        return {
          ...t,
          timeEntries: [...t.timeEntries, {
            id: `te_${Date.now()}`,
            startTime: timerStart.toISOString(),
            endTime: new Date().toISOString(),
            description: '',
          }],
        };
      }));
    }
    setTimerRunning(false);
    setTimerTaskId(null);
    setTimerStart(null);
  }

  const overdueStyle = (deadline: string, status: string) => {
    if (status === 'COMPLETED' || !deadline) return {};
    const overdue = isOverdue(deadline);
    const near = !overdue && new Date(deadline).getTime() - Date.now() < 86400000 * 2;
    return {
      color: overdue ? '#ef4444' : near ? '#f97316' : 'var(--text-muted)',
      fontWeight: overdue ? 700 : near ? 600 : 400,
    };
  };

  function kanbanTasks(statuses: Status[]) {
    return filteredTasks.filter(t => statuses.includes(t.status));
  }

  return (
    <div className="page tasks-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Tarefas</h1>
          <p className="page-subtitle">{totalTasks} tarefas cadastradas</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-gold" onClick={() => openForm()}>
            <Plus size={18} />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid-360" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Tarefas</div>
          <div className="stat-value" style={{ color: 'var(--gold-primary)' }}>{totalTasks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">A Fazer</div>
          <div className="stat-value" style={{ color: '#6b7280' }}>{todoCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Em Andamento</div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{inProgressCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Atrasadas</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{overdueCount}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: '1 1 300px', maxWidth: 400 }}>
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Buscar por título, cliente ou processo..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-elevated)', borderRadius: 8, padding: 3, border: '1px solid var(--border-default)' }}>
          <button onClick={() => setViewMode('kanban')} className={classNames('btn btn-sm', viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost')} style={viewMode === 'kanban' ? { background: 'var(--gold-primary)', color: 'var(--text-inverse)', border: 'none' } : {}}>
            <LayoutGrid size={16} /> Kanban
          </button>
          <button onClick={() => setViewMode('table')} className={classNames('btn btn-sm', viewMode === 'table' ? 'btn-primary' : 'btn-ghost')} style={viewMode === 'table' ? { background: 'var(--gold-primary)', color: 'var(--text-inverse)', border: 'none' } : {}}>
            <List size={16} /> Tabela
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar" style={{ marginBottom: 20 }}>
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Prioridade</label>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">Todas</option>
            <option value="CRITICAL">Crítica</option>
            <option value="URGENT">Urgente</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Média</option>
            <option value="LOW">Baixa</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Responsável</label>
          <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
            <option value="">Todos</option>
            {teamMembers.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Cliente</label>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)}>
            <option value="">Todos</option>
            {clientOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Período</label>
          <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
            <option value="">Todos</option>
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="overdue">Atrasadas</option>
          </select>
        </div>
        {(searchQuery || filterStatus || filterPriority || filterAssignee || filterClient || filterPeriod) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearchQuery(''); setFilterStatus(''); setFilterPriority(''); setFilterAssignee(''); setFilterClient(''); setFilterPeriod(''); }} style={{ color: '#ef4444' }}>
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="kanban-board">
          {kanbanColumns.map(col => {
            const items = kanbanTasks(col.statuses);
            return (
              <div key={col.key} className="kanban-column">
                <div className="kanban-header">
                  <h4 style={{ color: col.color }}>{col.title}</h4>
                  <span className="kanban-count">{items.length}</span>
                </div>
                {items.map(task => (
                  <div key={task.id} className="kanban-card" onClick={() => setSelectedTask(task)}>
                    <div className="kanban-card-title">{task.title}</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                      <PriorityBadge priority={task.priority} />
                      {task.deadline && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, ...overdueStyle(task.deadline, task.status) }}>
                          <Calendar size={11} />
                          {formatDate(task.deadline)}
                        </span>
                      )}
                    </div>
                    {task.checklist.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>
                          <span>{task.checklist.filter(c => c.done).length}/{task.checklist.length}</span>
                        </div>
                        <ProgressBar value={task.checklist.filter(c => c.done).length} max={task.checklist.length} />
                      </div>
                    )}
                    <div className="kanban-card-meta">
                      <Avatar name={task.assignedTo} size={24} />
                      {task.comments.length > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MessageSquare size={12} />
                          {task.comments.length}
                        </span>
                      )}
                      {task.attachments.length > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Paperclip size={12} />
                          {task.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    Nenhuma tarefa
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Responsável</th>
                <th>Cliente / Processo</th>
                <th>Data Limite</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {task.priority === 'CRITICAL' && <AlertTriangle size={14} color="#ef4444" />}
                      <span>{task.title}</span>
                    </div>
                  </td>
                  <td><PriorityBadge priority={task.priority} /></td>
                  <td><StatusBadge status={task.status} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar name={task.assignedTo} size={24} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{task.assignedTo}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ color: 'var(--text)' }}>{task.client}</div>
                      {task.caseNumber && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{task.caseNumber}</div>}
                    </div>
                  </td>
                  <td>
                    {task.deadline ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, ...overdueStyle(task.deadline, task.status) }}>
                        <Calendar size={13} />
                        {formatDate(task.deadline)}
                      </span>
                    ) : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                  </td>
                  <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openForm(task)} title="Editar">
                        <Edit3 size={14} />
                      </button>
                      <StatusDropdown task={task} onStatusChange={changeTaskStatus} />
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteTask(task.id)} style={{ color: '#ef4444' }} title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    Nenhuma tarefa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Detail Panel */}
      {selectedTask && (
        <>
          <div className="overlay" onClick={() => setSelectedTask(null)} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(520px, 100vw - 32px)', background: 'var(--bg-card)', borderLeft: '1px solid var(--border-default)', zIndex: 1001, overflow: 'auto', boxShadow: 'var(--shadow-xl)', animation: 'slideIn 250ms ease' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
              <h3 style={{ fontSize: 16 }}>Detalhes da Tarefa</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedTask(null)}><X size={18} /></button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Title & actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, flex: 1 }}>{selectedTask.title}</h2>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-icon" onClick={() => { setSelectedTask(null); openForm(selectedTask); }} title="Editar"><Edit3 size={16} /></button>
                  <button className="btn btn-ghost btn-icon" onClick={() => deleteTask(selectedTask.id)} style={{ color: '#ef4444' }} title="Excluir"><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Priority & Status */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <PriorityBadge priority={selectedTask.priority} />
                <StatusBadge status={selectedTask.status} />
                {selectedTask.deadline && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, ...overdueStyle(selectedTask.deadline, selectedTask.status), background: 'var(--bg-hover)' }}>
                    <Clock size={12} />
                    {formatDate(selectedTask.deadline)}
                  </span>
                )}
              </div>

              {/* Status change */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Alterar Status</label>
                <select
                  value={selectedTask.status}
                  onChange={e => { const ns = e.target.value as Status; setSelectedTask({ ...selectedTask, status: ns }); changeTaskStatus(selectedTask.id, ns); }}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* Description */}
              {selectedTask.description && (
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Descrição</label>
                  <p style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{selectedTask.description}</p>
                </div>
              )}

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 2 }}>Responsável</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar name={selectedTask.assignedTo} size={28} />
                    <span style={{ fontSize: 14 }}>{selectedTask.assignedTo}</span>
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 2 }}>Revisor</label>
                  <span style={{ fontSize: 14, color: selectedTask.reviewer ? 'var(--text)' : 'var(--text-muted)' }}>{selectedTask.reviewer || '—'}</span>
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 2 }}>Cliente</label>
                  <span style={{ fontSize: 14 }}>{selectedTask.client}</span>
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 2 }}>Processo</label>
                  <span style={{ fontSize: 14, color: selectedTask.caseNumber ? 'var(--text)' : 'var(--text-muted)' }}>{selectedTask.caseNumber || '—'}</span>
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 2 }}>Tempo Estimado</label>
                  <span style={{ fontSize: 14 }}>{selectedTask.estimatedMinutes > 0 ? formatTime(selectedTask.estimatedMinutes) : '—'}</span>
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 2 }}>Tags</label>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {selectedTask.tags.length > 0 ? selectedTask.tags.map(tag => (
                      <span key={tag} className="badge badge-gold">{tag}</span>
                    )) : <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>—</span>}
                  </div>
                </div>
              </div>

              {/* Time tracking */}
              <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>Controle de Tempo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Timer size={18} style={{ color: 'var(--gold-primary)' }} />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>
                    {selectedTask.timeEntries.reduce((acc, te) => {
                      if (te.endTime) return acc + Math.round((new Date(te.endTime).getTime() - new Date(te.startTime).getTime()) / 60000);
                      return acc;
                    }, 0)}min registrados
                  </span>
                </div>
                {timerRunning && timerTaskId === selectedTask.id ? (
                  <button className="btn btn-danger btn-sm" onClick={stopTimer}>
                    <Pause size={14} /> Parar Timer
                  </button>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => startTimer(selectedTask.id)}>
                    <Play size={14} /> Iniciar Timer
                  </button>
                )}
                {selectedTask.timeEntries.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {selectedTask.timeEntries.map(te => (
                      <div key={te.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', padding: '4px 0', borderBottom: '1px solid var(--border-default)' }}>
                        <span>{te.description || 'Registro de tempo'}</span>
                        <span>{formatDateTime(te.startTime)}{te.endTime ? ` → ${formatDateTime(te.endTime)}` : ' (em andamento)'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>Checklist</label>
                <ProgressBar value={selectedTask.checklist.filter(c => c.done).length} max={selectedTask.checklist.length} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginBottom: 8 }}>
                  {selectedTask.checklist.filter(c => c.done).length} de {selectedTask.checklist.length} concluídos
                </div>
                {selectedTask.checklist.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-default)' }}>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleChecklistItem(selectedTask.id, item.id)}
                      style={{ accentColor: 'var(--gold-primary)' }}
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={e => updateChecklistText(selectedTask.id, item.id, e.target.value)}
                      style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 13, color: item.done ? 'var(--text-muted)' : 'var(--text)', textDecoration: item.done ? 'line-through' : 'none', outline: 'none' }}
                    />
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeChecklistItem(selectedTask.id, item.id)} style={{ color: 'var(--text-tertiary)' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, color: 'var(--gold-primary)' }} onClick={() => addChecklistItem(selectedTask.id)}>
                  <Plus size={14} /> Adicionar item
                </button>
              </div>

              {/* Subtasks */}
              {selectedTask.subtasks.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>Subtarefas</label>
                  {selectedTask.subtasks.map(st => (
                    <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-default)' }}>
                      <input type="checkbox" checked={st.done} readOnly style={{ accentColor: 'var(--gold-primary)' }} />
                      <span style={{ flex: 1, fontSize: 13, color: st.done ? 'var(--text-muted)' : 'var(--text)', textDecoration: st.done ? 'line-through' : 'none' }}>{st.title}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{st.assignedTo}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Attachments */}
              {selectedTask.attachments.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>Anexos</label>
                  {selectedTask.attachments.map(att => (
                    <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 6, marginBottom: 4, border: '1px solid var(--border-default)' }}>
                      <FileText size={16} style={{ color: 'var(--gold-primary)' }} />
                      <span style={{ flex: 1, fontSize: 13 }}>{att.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{att.size}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {selectedTask.notes && (
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Observações</label>
                  <p style={{ color: 'var(--text)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{selectedTask.notes}</p>
                </div>
              )}

              {/* Comments */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>
                  Comentários ({selectedTask.comments.length})
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <textarea
                    placeholder="Adicionar comentário..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, resize: 'vertical', minHeight: 60, outline: 'none' }}
                  />
                  <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }} onClick={() => addComment(selectedTask.id)} disabled={!newComment.trim()}>
                    Enviar
                  </button>
                </div>
                {selectedTask.comments.map(cm => (
                  <div key={cm.id} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 6, border: '1px solid var(--border-default)' }}>
                    <Avatar name={cm.author} size={30} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{cm.author}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDateTime(cm.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>{cm.content}</p>
                    </div>
                  </div>
                ))}
                {selectedTask.comments.length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>Nenhum comentário ainda.</p>
                )}
              </div>

              {/* History */}
              {selectedTask.history.length > 0 && (
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>Histórico</label>
                  {selectedTask.history.map(h => (
                    <div key={h.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-default)', fontSize: 12, color: 'var(--text-muted)' }}>
                      <CornerDownRight size={12} style={{ flexShrink: 0 }} />
                      <span>{h.changedBy} alterou <strong>{h.field}</strong> de "{h.oldValue || 'vazio'}" para "{h.newValue}"</span>
                      <span style={{ marginLeft: 'auto' }}>{formatDateTime(h.changedAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Task Form Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
              <button className="modal-close" onClick={() => setShowFormModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Título</label>
                  <input className="form-input" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Título da tarefa" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Descrição</label>
                  <textarea className="form-textarea" rows={3} value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Descreva a tarefa..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Prioridade</label>
                  <select className="form-select" value={formPriority} onChange={e => setFormPriority(e.target.value as Priority)}>
                    <option value="CRITICAL">Crítica</option>
                    <option value="URGENT">Urgente</option>
                    <option value="HIGH">Alta</option>
                    <option value="MEDIUM">Média</option>
                    <option value="LOW">Baixa</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formStatus} onChange={e => setFormStatus(e.target.value as Status)}>
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Responsável Principal</label>
                  <select className="form-select" value={formAssignedTo} onChange={e => setFormAssignedTo(e.target.value)}>
                    <option value="">Selecione...</option>
                    {teamMembers.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Revisor</label>
                  <select className="form-select" value={formReviewer} onChange={e => setFormReviewer(e.target.value)}>
                    <option value="">Sem revisor</option>
                    {teamMembers.filter(m => m !== formAssignedTo).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cliente</label>
                  <select className="form-select" value={formClient} onChange={e => setFormClient(e.target.value)}>
                    <option value="">Selecione...</option>
                    {clientOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Processo</label>
                  <select className="form-select" value={formCaseNumber} onChange={e => setFormCaseNumber(e.target.value)}>
                    <option value="">Sem processo</option>
                    {caseOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Data Limite</label>
                  <input className="form-input" type="datetime-local" value={formDeadline} onChange={e => setFormDeadline(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tempo Estimado (minutos)</label>
                  <input className="form-input" type="number" min={1} value={formEstimatedMinutes} onChange={e => setFormEstimatedMinutes(parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Tags (separadas por vírgula)</label>
                  <input className="form-input" value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="ex: urgente, revisão, clientes" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Observações</label>
                  <textarea className="form-textarea" rows={2} value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Observações adicionais..." />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Checklist</label>
                  {formChecklist.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <input
                        className="form-input"
                        value={item}
                        onChange={e => {
                          const newCl = [...formChecklist];
                          newCl[idx] = e.target.value;
                          setFormChecklist(newCl);
                        }}
                        placeholder="Item do checklist"
                      />
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setFormChecklist(formChecklist.filter((_, i) => i !== idx))}
                        style={{ color: '#ef4444' }}
                        disabled={formChecklist.length === 1}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--gold-primary)', marginTop: 4 }} onClick={() => setFormChecklist([...formChecklist, ''])}>
                    <Plus size={14} /> Adicionar item
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowFormModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveForm} disabled={!formTitle.trim() || !formAssignedTo}>
                {editingTask ? 'Salvar' : 'Criar Tarefa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Confirmation Modal */}
      {showCompleteModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Concluir Tarefa</h3>
              <button className="modal-close" onClick={() => setShowCompleteModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
                Confirmar conclusão da tarefa: <strong>{selectedTask.title}</strong>?
              </p>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Tempo gasto (minutos)</label>
                <input className="form-input" type="number" min={1} value={completeTimeSpent} onChange={e => setCompleteTimeSpent(e.target.value)} placeholder="Opcional" />
              </div>
              <div className="form-group">
                <label className="form-label">Observações de conclusão</label>
                <textarea className="form-textarea" rows={3} value={completeNotes} onChange={e => setCompleteNotes(e.target.value)} placeholder="Notas sobre a conclusão..." />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setShowCompleteModal(false); setSelectedTask(prev => prev ? { ...prev, status: prev.history[prev.history.length - 1]?.oldValue as Status || prev.status } : null); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmComplete} style={{ background: '#10b981', borderColor: '#10b981' }}>
                <CheckCircle2 size={16} /> Confirmar Conclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusDropdown({ task, onStatusChange }: { task: Task; onStatusChange: (id: string, s: Status) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setOpen(!open)} title="Alterar status">
        <ChevronDown size={14} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 1 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 2, background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, boxShadow: 'var(--shadow-lg)', minWidth: 180, padding: 4 }}>
            {Object.entries(statusLabels).map(([k, v]) => (
              <button
                key={k}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', fontSize: 13, border: 'none', background: task.status === k ? 'var(--gold-glow)' : 'transparent', color: task.status === k ? 'var(--gold-primary)' : 'var(--text)', borderRadius: 6, cursor: 'pointer' }}
                onClick={() => { onStatusChange(task.id, k as Status); setOpen(false); }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = task.status === k ? 'var(--gold-glow)' : 'transparent')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {k === 'COMPLETED' ? <CheckCircle2 size={14} /> : k === 'IN_PROGRESS' ? <Play size={14} /> : <Circle size={14} />}
                  {v}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
