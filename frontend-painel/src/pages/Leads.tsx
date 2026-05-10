import { useEffect, useState } from 'react';
import {
  Search, Filter, Plus, Eye, Edit, Trash2, UserPlus, Phone, Mail,
  MessageSquare, Clock, FileText, CheckCircle, XCircle,
  X, LayoutGrid, List, Tag,
  AlertTriangle, Users, TrendingUp, Star, Send, StickyNote,
  Briefcase, Activity, MoreVertical
} from 'lucide-react';
import { leadsApi } from '../services/api';

interface LeadInteraction {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  authorName: string;
}

interface LeadTriage {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  cpfCnpj?: string;
  city?: string;
  state?: string;
  source: string;
  legalArea?: string;
  description?: string;
  urgency: string;
  potentialValue?: number;
  score?: number;
  status: string;
  lossReason?: string;
  responsibleId?: string;
  responsibleName?: string;
  lastContactAt?: string;
  nextAction?: string;
  nextActionDate?: string;
  tags?: string;
  notes?: string;
  createdAt: string;
  interactions: LeadInteraction[];
  triages: LeadTriage[];
}

const LEAD_STATUSES: Record<string, { label: string; color: string; bgClass: string }> = {
  NEW: { label: 'Novo', color: '#3B82F6', bgClass: 'badge-info' },
  AWAITING_CONTACT: { label: 'Aguardando Contato', color: '#F59E0B', bgClass: 'badge-warning' },
  TRIAGE: { label: 'Em Triagem', color: '#8B5CF6', bgClass: 'badge-primary' },
  SCHEDULED: { label: 'Agendado', color: '#06B6D4', bgClass: 'badge-info' },
  PROPOSAL_SENT: { label: 'Proposta Enviada', color: '#EC4899', bgClass: 'badge-primary' },
  CLOSED: { label: 'Fechado', color: '#10B981', bgClass: 'badge-success' },
  LOST: { label: 'Perdido', color: '#EF4444', bgClass: 'badge-danger' },
};

const URGENCY_LEVELS: Record<string, { label: string; color: string; bgClass: string }> = {
  LOW: { label: 'Baixa', color: '#6B7280', bgClass: 'badge-neutral' },
  NORMAL: { label: 'Normal', color: '#3B82F6', bgClass: 'badge-info' },
  HIGH: { label: 'Alta', color: '#F59E0B', bgClass: 'badge-warning' },
  URGENT: { label: 'Urgente', color: '#EF4444', bgClass: 'badge-danger' },
};

const LEAD_SOURCES = [
  'Site', 'Google Ads', 'Facebook', 'Instagram', 'LinkedIn',
  'Indicação', 'Telefone', 'E-mail', 'Evento', 'Outdoor', 'Outro'
];

const LEGAL_AREAS = [
  'Direito do Trabalho', 'Direito Civil', 'Direito de Família',
  'Direito Empresarial', 'Direito Tributário', 'Direito Previdenciário',
  'Direito do Consumidor', 'Direito Penal', 'Direito Administrativo',
  'Direito Ambiental', 'Direito Digital', 'Outra'
];

const TEAM_MEMBERS = [
  { id: '1', name: 'Dra. Fernanda Lima' },
  { id: '2', name: 'Dr. Ricardo Santos' },
  { id: '3', name: 'Dra. Juliana Costa' },
  { id: '4', name: 'Dr. Paulo Oliveira' },
];



const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getTimeElapsed = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return formatDate(dateStr);
};

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailTab, setDetailTab] = useState<'summary' | 'interactions' | 'documents' | 'triages'>('summary');
  const [contextMenuLead, setContextMenuLead] = useState<Lead | null>(null);
  const [lossReason, setLossReason] = useState('');
  const [newInteraction, setNewInteraction] = useState('');

  const [filters, setFilters] = useState({
    status: 'ALL',
    source: 'ALL',
    legalArea: 'ALL',
    urgency: 'ALL',
    responsible: 'ALL',
    dateFrom: '',
    dateTo: '',
  });

  const [newLeadForm, setNewLeadForm] = useState<Partial<Lead>>({
    name: '', phone: '', whatsapp: '', email: '', cpfCnpj: '',
    city: '', state: '', source: '', legalArea: '', description: '',
    urgency: 'NORMAL', responsibleName: '', tags: '', notes: ''
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response: any = await leadsApi.list();
      setLeads(response.leads || []);
    } catch (err) {
      setError('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.phone.includes(searchTerm) ||
      (lead.cpfCnpj?.includes(searchTerm));

    const matchesStatus = filters.status === 'ALL' || lead.status === filters.status;
    const matchesSource = filters.source === 'ALL' || lead.source === filters.source;
    const matchesLegalArea = filters.legalArea === 'ALL' || lead.legalArea === filters.legalArea;
    const matchesUrgency = filters.urgency === 'ALL' || lead.urgency === filters.urgency;
    const matchesResponsible = filters.responsible === 'ALL' || lead.responsibleName === filters.responsible;

    return matchesSearch && matchesStatus && matchesSource && matchesLegalArea && matchesUrgency && matchesResponsible;
  });

  const stats = {
    total: leads.length,
    today: leads.filter(l => {
      const today = new Date().toDateString();
      return new Date(l.createdAt).toDateString() === today;
    }).length,
    conversionRate: leads.length > 0
      ? Math.round((leads.filter(l => l.status === 'CLOSED').length / leads.length) * 100)
      : 0,
    urgent: leads.filter(l => l.urgency === 'URGENT' && l.status !== 'CLOSED' && l.status !== 'LOST').length,
  };

  const kanbanColumns = Object.keys(LEAD_STATUSES).filter(s => !['CLOSED', 'LOST'].includes(s)).concat(['CLOSED', 'LOST']);

  const getLeadsByStatus = (status: string) => filteredLeads.filter(l => l.status === status);

  const handleCreateLead = async () => {
    if (!newLeadForm.name || !newLeadForm.phone || !newLeadForm.source) return;

    try {
      const response: any = await leadsApi.create({
        name: newLeadForm.name,
        phone: newLeadForm.phone,
        whatsapp: newLeadForm.whatsapp,
        email: newLeadForm.email,
        cpfCnpj: newLeadForm.cpfCnpj,
        city: newLeadForm.city,
        state: newLeadForm.state,
        source: newLeadForm.source,
        legalArea: newLeadForm.legalArea,
        description: newLeadForm.description,
        urgency: newLeadForm.urgency || 'NORMAL',
        tags: newLeadForm.tags,
        notes: newLeadForm.notes,
      });
      if (response.lead) {
        setLeads([response.lead, ...leads]);
      }
      setShowNewLeadModal(false);
      setNewLeadForm({
        name: '', phone: '', whatsapp: '', email: '', cpfCnpj: '',
        city: '', state: '', source: '', legalArea: '', description: '',
        urgency: 'NORMAL', responsibleName: '', tags: '', notes: ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    try {
      await leadsApi.updateStatus(lead.id, newStatus);
      const updated = leads.map(l => l.id === lead.id ? { ...l, status: newStatus } : l);
      setLeads(updated);
      if (selectedLead?.id === lead.id) {
        setSelectedLead({ ...lead, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsLost = async () => {
    if (!selectedLead || !lossReason.trim()) return;
    try {
      await leadsApi.updateStatus(selectedLead.id, 'LOST');
      const updated = leads.map(l =>
        l.id === selectedLead.id
          ? { ...l, status: 'LOST', lossReason }
          : l
      );
      setLeads(updated);
      setShowLostModal(false);
      setLossReason('');
      setSelectedLead(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async () => {
    if (!contextMenuLead) return;
    try {
      await leadsApi.delete(contextMenuLead.id);
      setLeads(leads.filter(l => l.id !== contextMenuLead.id));
      setShowDeleteConfirm(false);
      setContextMenuLead(null);
      if (selectedLead?.id === contextMenuLead.id) {
        setSelectedLead(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertLead = async () => {
    if (!selectedLead) return;
    try {
      await leadsApi.convert(selectedLead.id);
      const updated = leads.map(l =>
        l.id === selectedLead.id
          ? { ...l, status: 'CLOSED' }
          : l
      );
      setLeads(updated);
      setShowConvertModal(false);
      setSelectedLead(null);
      alert('Lead convertido com sucesso! Redirecionando para cliente...');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInteraction = async () => {
    if (!selectedLead || !newInteraction.trim()) return;
    try {
      const response: any = await leadsApi.addInteraction(selectedLead.id, {
        type: 'NOTE',
        content: newInteraction,
      });
      const interaction = response.interaction || {
        id: String(Date.now()),
        type: 'NOTE',
        content: newInteraction,
        createdAt: new Date().toISOString(),
        authorName: 'Usuário Atual',
      };
      const updated = leads.map(l =>
        l.id === selectedLead.id
          ? { ...l, interactions: [interaction, ...l.interactions] }
          : l
      );
      setLeads(updated);
      setSelectedLead({
        ...selectedLead,
        interactions: [interaction, ...selectedLead.interactions]
      });
      setNewInteraction('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Clock className="animate-spin" size={32} />
          </div>
          <p>Carregando leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert alert-danger">
          <XCircle size={20} />
          <div>
            <strong>{error}</strong>
            <button className="btn btn-sm btn-secondary mt-2" onClick={() => window.location.reload()}>
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <style>{`
        .leads-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .kanban-board { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; }
        .kanban-column { min-width: 300px; max-width: 320px; flex-shrink: 0; }
        .kanban-column-header { position: sticky; top: 0; z-index: 10; }
        .kanban-cards { display: flex; flex-direction: column; gap: 12px; }
        .kanban-card { cursor: grab; transition: all 0.2s ease; }
        .kanban-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .drawer { position: fixed; top: 0; right: 0; height: 100vh; width: 520px; max-width: 100vw; z-index: 500; transform: translateX(100%); transition: transform 0.3s ease; }
        .drawer.open { transform: translateX(0); }
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 499; backdrop-filter: blur(2px); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; animation: fadeIn 0.2s ease; backdrop-filter: blur(4px); }
        .modal-content { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.4); animation: slideUp 0.3s ease; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid var(--border); }
        .modal-header h2 { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .btn-close { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; border-radius: 8px; }
        .btn-close:hover { color: var(--primary); background: var(--primary-light); }
        .modal-body { padding: 24px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 24px; border-top: 1px solid var(--border); }
        .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
        @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
        .form-group label span.req { color: var(--danger); }
        .form-control { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 12px; color: var(--text-primary); font-size: 14px; outline: none; transition: all 0.2s ease; font-family: inherit; }
        .form-control:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .form-control::placeholder { color: var(--text-tertiary); }
        textarea.form-control { min-height: 100px; resize: vertical; }
        .select-wrapper { position: relative; }
        .select-wrapper select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L2 4h8z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
        .tabs-row { display: flex; gap: 4px; padding: 0 24px; border-bottom: 1px solid var(--border); }
        .tab-btn { padding: 12px 16px; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .tab-btn:hover { color: var(--text-primary); }
        .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
        .dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 4px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; min-width: 200px; z-index: 100; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden; }
        .dropdown-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; background: transparent; border: none; color: var(--text-primary); font-size: 13px; text-align: left; cursor: pointer; transition: all 0.15s ease; }
        .dropdown-item:hover { background: var(--bg-secondary); }
        .dropdown-item.danger { color: var(--danger); }
        .dropdown-item.danger:hover { background: var(--danger-bg); }
        .divider { height: 1px; background: var(--border); margin: 4px 0; }
        .drawer-content { height: 100%; display: flex; flex-direction: column; background: var(--bg-elevated); border-left: 1px solid var(--border); }
        .drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
        .drawer-body { flex: 1; overflow-y: auto; }
        .drawer-section { padding: 20px 24px; }
        .drawer-section.border-b { border-bottom: 1px solid var(--border); }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 768px) { .info-grid { grid-template-columns: 1fr; } }
        .info-item { display: flex; flex-direction: column; gap: 2px; }
        .info-item.full { grid-column: 1 / -1; }
        .info-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; }
        .info-value { font-size: 14px; color: var(--text-primary); font-weight: 500; }
        .timeline { position: relative; padding-left: 20px; }
        .timeline::before { content: ''; position: absolute; left: 5px; top: 4px; bottom: 4px; width: 2px; background: var(--border); }
        .timeline-item { position: relative; padding-bottom: 20px; }
        .timeline-item:last-child { padding-bottom: 0; }
        .timeline-dot { position: absolute; left: -20px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: var(--primary); border: 3px solid var(--bg-elevated); }
        .timeline-dot.note { background: #6B7280; }
        .timeline-dot.email { background: #3B82F6; }
        .timeline-dot.call { background: #10B981; }
        .timeline-dot.whatsapp { background: #25D366; }
        .timeline-content { background: var(--bg-secondary); border-radius: 10px; padding: 12px 14px; }
        .timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .timeline-author { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .timeline-time { font-size: 11px; color: var(--text-tertiary); }
        .timeline-text { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
        .interaction-input { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); }
        .interaction-input input { flex: 1; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; color: var(--text-primary); outline: none; font-size: 14px; }
        .interaction-input input:focus { border-color: var(--primary); }
        .btn-mini { padding: 6px 12px; font-size: 12px; border-radius: 6px; }
        .stat-card-2 { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 16px; padding: 20px; display: flex; gap: 16px; align-items: center; }
        .stat-icon-2 { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-icon-2.primary { background: var(--primary-light); color: var(--primary); }
        .stat-icon-2.success { background: var(--success-bg); color: var(--success); }
        .stat-icon-2.warning { background: var(--warning-bg); color: var(--warning); }
        .stat-icon-2.danger { background: var(--danger-bg); color: var(--danger); }
        .view-toggle { display: flex; background: var(--bg-secondary); border-radius: 8px; padding: 4px; border: 1px solid var(--border); }
        .view-toggle button { padding: 8px 16px; background: transparent; border: none; color: var(--text-secondary); font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 6px; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
        .view-toggle button.active { background: var(--primary); color: #1a1a1a; }
        .quick-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .quick-actions .btn { font-size: 12px; padding: 8px 12px; }
        .filter-bar-expanded { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 24px; animation: slideDown 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .filter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .score-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .score-high { background: rgba(16,185,129,0.15); color: #10B981; }
        .score-medium { background: rgba(245,158,11,0.15); color: #F59E0B; }
        .score-low { background: rgba(239,68,68,0.15); color: #EF4444; }
        .chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: var(--bg-secondary); border-radius: 999px; font-size: 11px; color: var(--text-secondary); }
        .chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .search-input-wrapper { flex: 1; min-width: 250px; display: flex; align-items: center; gap: 10px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 10px; padding: 0 14px; color: var(--text-tertiary); transition: all 0.2s ease; }
        .search-input-wrapper:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .search-input-wrapper input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-size: 14px; outline: none; padding: 12px 0; }
        .search-input-wrapper input::placeholder { color: var(--text-tertiary); }
        .relative { position: relative; }
        .status-flow { display: flex; gap: 6px; flex-wrap: wrap; }
        .status-btn { padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-secondary); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .status-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
        .status-btn.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
        .action-bar { display: flex; gap: 8px; padding: 16px 24px; border-top: 1px solid var(--border); }
        .action-bar .btn { flex: 1; }
        .table-actions { display: flex; gap: 4px; }
        .empty-state-sm { padding: 30px 20px; text-align: center; }
        .empty-state-sm p { font-size: 13px; color: var(--text-tertiary); }
        .column-count { background: var(--bg-tertiary); color: var(--text-secondary); padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
      `}</style>

      <div className="page-header">
        <div className="page-header-content">
          <h1>
            <Users size={28} />
            Gestão de Leads
          </h1>
          <p>{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} encontrado{filteredLeads.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="page-actions">
          <div className="view-toggle">
            <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>
              <List size={16} />
              Tabela
            </button>
            <button className={viewMode === 'kanban' ? 'active' : ''} onClick={() => setViewMode('kanban')}>
              <LayoutGrid size={16} />
              Kanban
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNewLeadModal(true)}>
            <Plus size={18} />
            Novo Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 mb-6" style={{ gap: '16px' }}>
        <div className="stat-card-2">
          <div className="stat-icon-2 primary">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-label">Total Leads</div>
            <div className="stat-value" style={{ fontSize: '26px' }}>{stats.total}</div>
          </div>
        </div>
        <div className="stat-card-2">
          <div className="stat-icon-2 success">
            <Activity size={24} />
          </div>
          <div>
            <div className="stat-label">Leads Hoje</div>
            <div className="stat-value" style={{ fontSize: '26px' }}>{stats.today}</div>
          </div>
        </div>
        <div className="stat-card-2">
          <div className="stat-icon-2 warning">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-label">Taxa de Conversão</div>
            <div className="stat-value" style={{ fontSize: '26px' }}>{stats.conversionRate}%</div>
          </div>
        </div>
        <div className="stat-card-2">
          <div className="stat-icon-2 danger">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-label">Leads Urgentes</div>
            <div className="stat-value" style={{ fontSize: '26px' }}>{stats.urgent}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone, CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setShowFilters(!showFilters)}
          style={{ gap: '8px' }}
        >
          <Filter size={16} />
          Filtros
          {filters.status !== 'ALL' || filters.source !== 'ALL' || filters.legalArea !== 'ALL' || filters.urgency !== 'ALL' || filters.responsible !== 'ALL' ? (
            <span style={{
              background: 'var(--primary)', color: '#1a1a1a',
              borderRadius: '999px', width: '18px', height: '18px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700'
            }}>!</span>
          ) : null}
        </button>
      </div>

      {showFilters && (
        <div className="filter-bar-expanded">
          <div className="filter-grid">
            <div className="form-group">
              <label>Status</label>
              <div className="select-wrapper">
                <select className="form-control" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                  <option value="ALL">Todos</option>
                  {Object.entries(LEAD_STATUSES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Origem</label>
              <div className="select-wrapper">
                <select className="form-control" value={filters.source} onChange={e => setFilters({ ...filters, source: e.target.value })}>
                  <option value="ALL">Todas</option>
                  {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Área Jurídica</label>
              <div className="select-wrapper">
                <select className="form-control" value={filters.legalArea} onChange={e => setFilters({ ...filters, legalArea: e.target.value })}>
                  <option value="ALL">Todas</option>
                  {LEGAL_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Urgência</label>
              <div className="select-wrapper">
                <select className="form-control" value={filters.urgency} onChange={e => setFilters({ ...filters, urgency: e.target.value })}>
                  <option value="ALL">Todas</option>
                  {Object.entries(URGENCY_LEVELS).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Responsável</label>
              <div className="select-wrapper">
                <select className="form-control" value={filters.responsible} onChange={e => setFilters({ ...filters, responsible: e.target.value })}>
                  <option value="ALL">Todos</option>
                  {TEAM_MEMBERS.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group flex flex-col justify-end">
              <button
                className="btn btn-ghost"
                onClick={() => setFilters({ status: 'ALL', source: 'ALL', legalArea: 'ALL', urgency: 'ALL', responsible: 'ALL', dateFrom: '', dateTo: '' })}
              >
                Limpar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'table' ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Origem</th>
                <th>Área Jurídica</th>
                <th>Status</th>
                <th>Urgência</th>
                <th>Score</th>
                <th>Responsável</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => { setSelectedLead(lead); setDetailTab('summary'); }}>
                        {lead.name}
                      </span>
                      {lead.tags && (
                        <div className="chips">
                          {lead.tags.split(',').filter(Boolean).slice(0, 2).map((tag, i) => (
                            <span key={i} className="chip">{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {lead.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <Mail size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          {lead.email}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <Phone size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        {lead.phone}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{lead.source}</span>
                  </td>
                  <td>
                    <span className="badge badge-primary">{lead.legalArea || 'Não definida'}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${LEAD_STATUSES[lead.status]?.bgClass || 'badge-neutral'}`}
                    >
                      {LEAD_STATUSES[lead.status]?.label || lead.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${URGENCY_LEVELS[lead.urgency]?.bgClass || 'badge-neutral'}`}
                    >
                      {URGENCY_LEVELS[lead.urgency]?.label || lead.urgency}
                    </span>
                  </td>
                  <td>
                    {lead.score ? (
                      <span className={`score-badge ${lead.score >= 70 ? 'score-high' : lead.score >= 50 ? 'score-medium' : 'score-low'}`}>
                        <Star size={10} />
                        {lead.score}/100
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>-</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {lead.responsibleName || 'Não atribuído'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                      {getTimeElapsed(lead.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-icon btn-sm"
                        title="Ver detalhes"
                        onClick={() => { setSelectedLead(lead); setDetailTab('summary'); }}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn btn-icon btn-sm"
                        title="Editar"
                        onClick={() => { setSelectedLead(lead); setDetailTab('summary'); }}
                      >
                        <Edit size={14} />
                      </button>
                      <div className="relative">
                        <button
                          className="btn btn-icon btn-sm"
                          title="Mais ações"
                          onClick={() => setContextMenuLead(contextMenuLead?.id === lead.id ? null : lead)}
                        >
                          <MoreVertical size={14} />
                        </button>
                        {contextMenuLead?.id === lead.id && (
                          <>
                            <div className="dropdown-menu">
                              <button className="dropdown-item" onClick={() => {
                                setSelectedLead(lead);
                                setContextMenuLead(null);
                                setDetailTab('summary');
                              }}>
                                <Eye size={14} />
                                Ver detalhes
                              </button>
                              {lead.status !== 'CLOSED' && lead.status !== 'LOST' && (
                                <button className="dropdown-item" onClick={() => {
                                  setSelectedLead(lead);
                                  setShowConvertModal(true);
                                  setContextMenuLead(null);
                                }}>
                                  <UserPlus size={14} />
                                  Converter para Cliente
                                </button>
                              )}
                              {lead.status !== 'CLOSED' && lead.status !== 'LOST' && (
                                <button className="dropdown-item" onClick={() => {
                                  setSelectedLead(lead);
                                  setShowLostModal(true);
                                  setLossReason('');
                                  setContextMenuLead(null);
                                }}>
                                  <XCircle size={14} />
                                  Marcar como Perdido
                                </button>
                              )}
                              {lead.whatsapp && (
                                <a
                                  className="dropdown-item"
                                  href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                                  target="_blank"
                                >
                                  <MessageSquare size={14} />
                                  WhatsApp
                                </a>
                              )}
                              {lead.email && (
                                <a
                                  className="dropdown-item"
                                  href={`mailto:${lead.email}`}
                                >
                                  <Mail size={14} />
                                  Enviar E-mail
                                </a>
                              )}
                              <div className="divider" />
                              <button className="dropdown-item danger" onClick={() => {
                                setContextMenuLead(lead);
                                setShowDeleteConfirm(true);
                              }}>
                                <Trash2 size={14} />
                                Excluir
                              </button>
                            </div>
                            <div
                              style={{ position: 'fixed', inset: 0, zIndex: 50 }}
                              onClick={() => setContextMenuLead(null)}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLeads.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Users size={40} />
              </div>
              <h4>Nenhum lead encontrado</h4>
              <p>Não há leads correspondentes aos filtros selecionados. Tente ajustar os filtros ou crie um novo lead.</p>
              <button className="btn btn-primary" onClick={() => setShowNewLeadModal(true)}>
                <Plus size={16} />
                Criar novo Lead
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="kanban-board">
          {kanbanColumns.map(status => {
            const columnLeads = getLeadsByStatus(status);
            const statusInfo = LEAD_STATUSES[status];
            return (
              <div key={status} className="kanban-column">
                <div className="kanban-column-header card" style={{ padding: '12px 14px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: statusInfo.color
                    }} />
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <span className="column-count">{columnLeads.length}</span>
                </div>
                <div className="kanban-cards">
                  {columnLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="kanban-card card"
                      style={{ padding: '14px', cursor: 'pointer' }}
                      onClick={() => { setSelectedLead(lead); setDetailTab('summary'); }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                          {lead.name}
                        </strong>
                        <span
                          className={`badge ${URGENCY_LEVELS[lead.urgency]?.bgClass || 'badge-neutral'}`}
                          style={{ fontSize: '10px', flexShrink: 0 }}
                        >
                          {URGENCY_LEVELS[lead.urgency]?.label || lead.urgency}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <Phone size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        {lead.phone}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                          {lead.source}
                        </span>
                        {lead.legalArea && (
                          <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                            {lead.legalArea}
                          </span>
                        )}
                        {lead.score && (
                          <span className={`score-badge ${lead.score >= 70 ? 'score-high' : lead.score >= 50 ? 'score-medium' : 'score-low'}`}>
                            {lead.score}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {getTimeElapsed(lead.createdAt)} atrás
                        </span>
                        {lead.responsibleName && (
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {lead.responsibleName.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {columnLeads.length === 0 && (
                    <div className="empty-state-sm">
                      <p>Nenhum lead</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedLead && (
        <>
          <div className="drawer-overlay" onClick={() => {
            setSelectedLead(null);
            setNewInteraction('');
          }} />
          <div className="drawer open">
            <div className="drawer-content">
              <div className="drawer-header">
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {selectedLead.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span className={`badge ${LEAD_STATUSES[selectedLead.status]?.bgClass || 'badge-neutral'}`}>
                      {LEAD_STATUSES[selectedLead.status]?.label}
                    </span>
                    <span className={`badge ${URGENCY_LEVELS[selectedLead.urgency]?.bgClass || 'badge-neutral'}`}>
                      {URGENCY_LEVELS[selectedLead.urgency]?.label}
                    </span>
                    {selectedLead.score && (
                      <span className={`score-badge ${selectedLead.score >= 70 ? 'score-high' : selectedLead.score >= 50 ? 'score-medium' : 'score-low'}`}>
                        <Star size={10} />
                        {selectedLead.score}
                      </span>
                    )}
                  </div>
                </div>
                <button className="btn-close" onClick={() => {
                  setSelectedLead(null);
                  setNewInteraction('');
                }}>
                  <X size={20} />
                </button>
              </div>

              {selectedLead.status !== 'CLOSED' && selectedLead.status !== 'LOST' && (
                <div className="action-bar">
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '12px' }}
                    onClick={() => setShowConvertModal(true)}
                  >
                    <UserPlus size={14} />
                    Converter
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12px' }}
                    onClick={() => { setShowLostModal(true); setLossReason(''); }}
                  >
                    <XCircle size={14} />
                    Perdido
                  </button>
                  {selectedLead.whatsapp && (
                    <a
                      className="btn btn-secondary btn-sm"
                      href={`https://wa.me/${selectedLead.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      style={{ fontSize: '12px', textDecoration: 'none' }}
                    >
                      <MessageSquare size={14} />
                      WA
                    </a>
                  )}
                </div>
              )}

              {selectedLead.status !== 'CLOSED' && selectedLead.status !== 'LOST' && (
                <div className="drawer-section border-b">
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    Alterar Status
                  </div>
                  <div className="status-flow">
                    {Object.keys(LEAD_STATUSES)
                      .filter(s => !['CLOSED', 'LOST'].includes(s))
                      .map(status => (
                        <button
                          key={status}
                          className={`status-btn ${selectedLead.status === status ? 'active' : ''}`}
                          onClick={() => handleStatusChange(selectedLead, status)}
                        >
                          {LEAD_STATUSES[status].label}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="tabs-row">
                <button
                  className={`tab-btn ${detailTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setDetailTab('summary')}
                >
                  Resumo
                </button>
                <button
                  className={`tab-btn ${detailTab === 'interactions' ? 'active' : ''}`}
                  onClick={() => setDetailTab('interactions')}
                >
                  Interações ({selectedLead.interactions.length})
                </button>
                <button
                  className={`tab-btn ${detailTab === 'documents' ? 'active' : ''}`}
                  onClick={() => setDetailTab('documents')}
                >
                  Documentos
                </button>
                {selectedLead.triages.length > 0 && (
                  <button
                    className={`tab-btn ${detailTab === 'triages' ? 'active' : ''}`}
                    onClick={() => setDetailTab('triages')}
                  >
                    Triagem ({selectedLead.triages.length})
                  </button>
                )}
              </div>

              <div className="drawer-body">
                {detailTab === 'summary' && (
                  <>
                    <div className="drawer-section border-b">
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserPlus size={14} style={{ color: 'var(--primary)' }} />
                        Dados Pessoais
                      </div>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Nome</span>
                          <span className="info-value">{selectedLead.name}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">CPF/CNPJ</span>
                          <span className="info-value">{selectedLead.cpfCnpj || 'Não informado'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Telefone</span>
                          <span className="info-value">{selectedLead.phone}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">WhatsApp</span>
                          <span className="info-value">{selectedLead.whatsapp || 'Não informado'}</span>
                        </div>
                        <div className="info-item full">
                          <span className="info-label">E-mail</span>
                          <span className="info-value">{selectedLead.email || 'Não informado'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Cidade</span>
                          <span className="info-value">{selectedLead.city || 'Não informado'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Estado</span>
                          <span className="info-value">{selectedLead.state || 'Não informado'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="drawer-section border-b">
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={14} style={{ color: 'var(--primary)' }} />
                        Dados do Lead
                      </div>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Origem</span>
                          <span className="info-value">{selectedLead.source}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Área Jurídica</span>
                          <span className="info-value">{selectedLead.legalArea || 'Não definida'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Responsável</span>
                          <span className="info-value">{selectedLead.responsibleName || 'Não atribuído'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Valor Potencial</span>
                          <span className="info-value">
                            {selectedLead.potentialValue
                              ? `R$ ${selectedLead.potentialValue.toLocaleString('pt-BR')}`
                              : 'Não estimado'}
                          </span>
                        </div>
                        <div className="info-item full">
                          <span className="info-label">Próxima Ação</span>
                          <span className="info-value">
                            {selectedLead.nextAction
                              ? `${selectedLead.nextAction} - ${selectedLead.nextActionDate ? formatDate(selectedLead.nextActionDate) : ''}`
                              : 'Nenhuma definida'}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Criado em</span>
                          <span className="info-value">{formatDateTime(selectedLead.createdAt)}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Último Contato</span>
                          <span className="info-value">
                            {selectedLead.lastContactAt ? formatDateTime(selectedLead.lastContactAt) : 'Nunca'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedLead.description && (
                      <div className="drawer-section border-b">
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} style={{ color: 'var(--primary)' }} />
                          Descrição do Caso
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                          {selectedLead.description}
                        </p>
                      </div>
                    )}

                    {selectedLead.tags && (
                      <div className="drawer-section border-b">
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Tag size={14} style={{ color: 'var(--primary)' }} />
                          Tags
                        </div>
                        <div className="chips">
                          {selectedLead.tags.split(',').filter(Boolean).map((tag, i) => (
                            <span key={i} className="chip">{tag.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedLead.notes && (
                      <div className="drawer-section border-b">
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <StickyNote size={14} style={{ color: 'var(--primary)' }} />
                          Observações
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                          {selectedLead.notes}
                        </p>
                      </div>
                    )}

                    {selectedLead.status === 'LOST' && selectedLead.lossReason && (
                      <div className="drawer-section">
                        <div style={{
                          background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
                          borderRadius: '10px', padding: '14px'
                        }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                            <XCircle size={16} style={{ color: 'var(--danger)' }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)' }}>
                              Motivo da Perda
                            </span>
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                            {selectedLead.lossReason}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {detailTab === 'interactions' && (
                  <>
                    {selectedLead.interactions.length > 0 ? (
                      <div className="drawer-section">
                        <div className="timeline">
                          {selectedLead.interactions.map(int => (
                            <div key={int.id} className="timeline-item">
                              <div className={`timeline-dot ${int.type.toLowerCase()}`} />
                              <div className="timeline-content">
                                <div className="timeline-header">
                                  <span className="timeline-author">{int.authorName}</span>
                                  <span className="timeline-time">{formatDateTime(int.createdAt)}</span>
                                </div>
                                <p className="timeline-text">{int.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="drawer-section">
                        <div className="empty-state-sm">
                          <p>Nenhuma interação registrada</p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {detailTab === 'documents' && (
                  <div className="drawer-section">
                    <div className="empty-state-sm">
                      <FileText size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
                      <p>Nenhum documento anexado</p>
                    </div>
                  </div>
                )}

                {detailTab === 'triages' && (
                  <div className="drawer-section">
                    {selectedLead.triages.map(t => (
                      <div key={t.id} style={{
                        background: 'var(--bg-secondary)', borderRadius: '10px', padding: '14px', marginBottom: '10px'
                      }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                          {t.question}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {t.answer}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                          {formatDateTime(t.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {detailTab === 'interactions' && (
                <div className="interaction-input">
                  <input
                    placeholder="Registrar uma interação..."
                    value={newInteraction}
                    onChange={e => setNewInteraction(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddInteraction()}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleAddInteraction}
                    disabled={!newInteraction.trim()}
                  >
                    <Send size={14} />
                  </button>
                </div>
              )}

              <div className="action-bar">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedLead(null);
                    setNewInteraction('');
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showNewLeadModal && (
        <div className="modal-overlay" onClick={() => setShowNewLeadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Lead</h2>
              <button className="btn-close" onClick={() => setShowNewLeadModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group full">
                  <label><span className="req">*</span> Nome Completo / Razão Social</label>
                  <input
                    className="form-control"
                    placeholder="Nome do lead"
                    value={newLeadForm.name || ''}
                    onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><span className="req">*</span> Telefone</label>
                  <input
                    className="form-control"
                    placeholder="(00) 00000-0000"
                    value={newLeadForm.phone || ''}
                    onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input
                    className="form-control"
                    placeholder="(00) 00000-0000"
                    value={newLeadForm.whatsapp || ''}
                    onChange={e => setNewLeadForm({ ...newLeadForm, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>E-mail</label>
                  <input
                    className="form-control"
                    placeholder="email@exemplo.com"
                    type="email"
                    value={newLeadForm.email || ''}
                    onChange={e => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>CPF/CNPJ</label>
                  <input
                    className="form-control"
                    placeholder="000.000.000-00"
                    value={newLeadForm.cpfCnpj || ''}
                    onChange={e => setNewLeadForm({ ...newLeadForm, cpfCnpj: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cidade</label>
                  <input
                    className="form-control"
                    placeholder="Cidade"
                    value={newLeadForm.city || ''}
                    onChange={e => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <div className="select-wrapper">
                    <select
                      className="form-control"
                      value={newLeadForm.state || ''}
                      onChange={e => setNewLeadForm({ ...newLeadForm, state: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><span className="req">*</span> Origem</label>
                  <div className="select-wrapper">
                    <select
                      className="form-control"
                      value={newLeadForm.source || ''}
                      onChange={e => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Área Jurídica</label>
                  <div className="select-wrapper">
                    <select
                      className="form-control"
                      value={newLeadForm.legalArea || ''}
                      onChange={e => setNewLeadForm({ ...newLeadForm, legalArea: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {LEGAL_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Urgência</label>
                  <div className="select-wrapper">
                    <select
                      className="form-control"
                      value={newLeadForm.urgency || 'NORMAL'}
                      onChange={e => setNewLeadForm({ ...newLeadForm, urgency: e.target.value })}
                    >
                      {Object.entries(URGENCY_LEVELS).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Responsável</label>
                  <div className="select-wrapper">
                    <select
                      className="form-control"
                      value={newLeadForm.responsibleName || ''}
                      onChange={e => setNewLeadForm({ ...newLeadForm, responsibleName: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {TEAM_MEMBERS.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Descrição do Caso</label>
                <textarea
                  className="form-control"
                  placeholder="Descreva brevemente o caso..."
                  rows={3}
                  value={newLeadForm.description || ''}
                  onChange={e => setNewLeadForm({ ...newLeadForm, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tags</label>
                  <input
                    className="form-control"
                    placeholder="Separadas por vírgula"
                    value={newLeadForm.tags || ''}
                    onChange={e => setNewLeadForm({ ...newLeadForm, tags: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Observações</label>
                  <input
                    className="form-control"
                    placeholder="Observações internas"
                    value={newLeadForm.notes || ''}
                    onChange={e => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowNewLeadModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateLead}
                disabled={!newLeadForm.name?.trim() || !newLeadForm.phone?.trim() || !newLeadForm.source?.trim()}
              >
                <Plus size={16} />
                Criar Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {showConvertModal && selectedLead && (
        <div className="modal-overlay" onClick={() => setShowConvertModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <UserPlus size={22} style={{ color: 'var(--success)' }} />
                Converter Lead
              </h2>
              <button className="btn-close" onClick={() => setShowConvertModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                background: 'var(--success-bg)', border: '1px solid var(--success-border)',
                borderRadius: '12px', padding: '16px', marginBottom: '16px'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {selectedLead.name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedLead.phone}
                  {selectedLead.email && ` • ${selectedLead.email}`}
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                Esta ação irá:
              </p>
              <ul style={{ margin: '12px 0 0 20px', padding: 0 }}>
                <li style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Alterar o status para <strong>Fechado</strong>
                </li>
                <li style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Criar um registro de <strong>Cliente</strong> automaticamente
                </li>
                <li style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Redirecionar para a <strong>área de clientes</strong>
                </li>
              </ul>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowConvertModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleConvertLead}>
                <CheckCircle size={16} />
                Confirmar Conversão
              </button>
            </div>
          </div>
        </div>
      )}

      {showLostModal && selectedLead && (
        <div className="modal-overlay" onClick={() => { setShowLostModal(false); setLossReason(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <XCircle size={22} style={{ color: 'var(--danger)' }} />
                Marcar como Perdido
              </h2>
              <button className="btn-close" onClick={() => { setShowLostModal(false); setLossReason(''); }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Por que este lead foi perdido?
              </p>
              <div className="form-group">
                <label>Motivo</label>
                <textarea
                  className="form-control"
                  placeholder="Descreva o motivo..."
                  rows={4}
                  value={lossReason}
                  onChange={e => setLossReason(e.target.value)}
                />
              </div>
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Sugestões:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Preço muito alto', 'Concorrente', 'Sem interesse',
                    'Desistiu do processo', 'Não responde', 'Outro'
                  ].map(reason => (
                    <button
                      key={reason}
                      className="btn btn-secondary btn-mini"
                      style={{ fontSize: '11px' }}
                      onClick={() => setLossReason(reason)}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowLostModal(false); setLossReason(''); }}>
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleMarkAsLost}
                disabled={!lossReason.trim()}
              >
                <XCircle size={16} />
                Confirmar Perda
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && contextMenuLead && (
        <div className="modal-overlay" onClick={() => { setShowDeleteConfirm(false); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Trash2 size={22} style={{ color: 'var(--danger)' }} />
                Excluir Lead
              </h2>
              <button className="btn-close" onClick={() => setShowDeleteConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                Tem certeza que deseja excluir o lead <strong>{contextMenuLead.name}</strong>?
              </p>
              <p style={{ fontSize: '13px', color: 'var(--danger)', marginTop: '12px', marginBottom: 0 }}>
                <strong>Esta ação não pode ser desfeita.</strong>
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDeleteLead}>
                <Trash2 size={16} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
