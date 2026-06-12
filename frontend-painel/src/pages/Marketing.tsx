import { useState, useMemo, useEffect } from 'react';
import { marketingApi } from '../services/api';
import {
  Calendar, Plus, Search, Filter, X, Edit3, Trash2, Eye,
  CheckCircle2, AlertTriangle, Clock, BarChart3, Users,
  TrendingUp, Share2, FileText, Image, Video, Play,
  Globe, Instagram, Facebook, Linkedin, Target,
  AlertCircle, ChevronLeft, ChevronRight, PieChart
} from 'lucide-react';

type PostStatus = 'RASCUNHO' | 'AGENDADO' | 'PUBLICADO' | 'ARQUIVADO';
type ContentType = 'artigo' | 'video' | 'infografico' | 'podcast' | 'post_social' | 'newsletter';
type CampaignStatus = 'ATIVA' | 'PAUSADA' | 'CONCLUIDA' | 'RASCUNHO';

interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: PostStatus;
  scheduledFor: string;
  publishedAt: string;
  author: string;
  channel: string;
  tags: string;
  notes: string;
  ethicalAlert: boolean;
  ethicalAlertMessage: string;
}

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  channel: string;
  budget: number;
  leads: number;
  conversions: number;
  spent: number;
  startDate: string;
  endDate: string;
  description: string;
}

const PROHIBITED_TERMS = ['garantimos resultado', 'causa ganha', 'melhor advogado', 'promoção', 'desconto', 'resultado garantido', 'sucesso garantido', '100% de êxito', 'advocacia agressiva'];

function checkEthical(content: string): { hasAlert: boolean; message: string } {
  const lower = content.toLowerCase();
  for (const term of PROHIBITED_TERMS) {
    if (lower.includes(term)) return { hasAlert: true, message: `Conteúdo contém termo proibido: "${term}"` };
  }
  return { hasAlert: false, message: '' };
}

const CONTENT_TYPES: ContentItem[] = [
  { id: 'c1', title: 'Guia Completo: Direitos Trabalhistas do Home Office', type: 'artigo', status: 'PUBLICADO', scheduledFor: '2026-04-28', publishedAt: '2026-04-28', author: 'Dra. Fernanda Lima', channel: 'Blog', tags: 'trabalhista,home office,direitos', notes: 'Post com alto engajamento', ethicalAlert: false, ethicalAlertMessage: '' },
  { id: 'c2', title: 'Reforma Tributária: O que muda para sua empresa', type: 'artigo', status: 'PUBLICADO', scheduledFor: '2026-05-01', publishedAt: '2026-05-01', author: 'Dr. Paulo Oliveira', channel: 'LinkedIn', tags: 'tributário,reforma,empresas', notes: '', ethicalAlert: false, ethicalAlertMessage: '' },
  { id: 'c3', title: '5 Sinais de que você precisa de um advogado de família', type: 'post_social', status: 'AGENDADO', scheduledFor: '2026-05-15', publishedAt: '', author: 'Dra. Juliana Costa', channel: 'Instagram', tags: 'família,divórcio,guarda', notes: 'Usar carrossel', ethicalAlert: false, ethicalAlertMessage: '' },
  { id: 'c4', title: 'Direitos do Consumidor: Saiba como reclamar', type: 'video', status: 'PUBLICADO', scheduledFor: '2026-04-20', publishedAt: '2026-04-20', author: 'Dr. Ricardo Santos', channel: 'YouTube', tags: 'consumidor,reclamação', notes: 'Vídeo de 5min', ethicalAlert: false, ethicalAlertMessage: '' },
  { id: 'c5', title: 'GARANTIMOS RESULTADO - Contrate já!', type: 'post_social', status: 'RASCUNHO', scheduledFor: '2026-05-20', publishedAt: '', author: 'Estagiário', channel: 'Facebook', tags: 'promoção', notes: 'REVISAR - termo proibido', ethicalAlert: true, ethicalAlertMessage: 'Conteúdo contém termo proibido: "garantimos resultado"' },
  { id: 'c6', title: 'Planejamento Sucessório: Proteja seu patrimônio', type: 'artigo', status: 'AGENDADO', scheduledFor: '2026-05-22', publishedAt: '', author: 'Dr. Paulo Oliveira', channel: 'Blog', tags: 'sucessão,patrimônio,planejamento', notes: '', ethicalAlert: false, ethicalAlertMessage: '' },
  { id: 'c7', title: 'Jurisprudência Comentada: STJ - Direito Civil', type: 'podcast', status: 'RASCUNHO', scheduledFor: '', publishedAt: '', author: 'Dra. Fernanda Lima', channel: 'Spotify', tags: 'jurisprudência,STJ,civil', notes: 'Convidado: Prof. Carlos', ethicalAlert: false, ethicalAlertMessage: '' },
  { id: 'c8', title: 'Infográfico: Etapas de um Processo Judicial', type: 'infografico', status: 'PUBLICADO', scheduledFor: '2026-04-15', publishedAt: '2026-04-15', author: 'Marketing', channel: 'Instagram', tags: 'processo,infográfico', notes: '', ethicalAlert: false, ethicalAlertMessage: '' },
  { id: 'c9', title: 'Newsletter Maio: Atualizações Jurídicas', type: 'newsletter', status: 'AGENDADO', scheduledFor: '2026-05-10', publishedAt: '', author: 'Marketing', channel: 'E-mail', tags: 'newsletter,atualizações', notes: 'Enviar para lista completa', ethicalAlert: false, ethicalAlertMessage: '' },
  { id: 'c10', title: 'A MELHOR ADVOGADA da cidade - Contrate!', type: 'post_social', status: 'RASCUNHO', scheduledFor: '', publishedAt: '', author: 'Estagiário', channel: 'Instagram', tags: 'promoção', notes: 'REVISÃO URGENTE - Termo proibido', ethicalAlert: true, ethicalAlertMessage: 'Conteúdo contém termo proibido: "melhor advogado"' },
  { id: 'c11', title: 'Pensão Alimentícia: Perguntas Frequentes', type: 'post_social', status: 'PUBLICADO', scheduledFor: '2026-04-25', publishedAt: '2026-04-25', author: 'Dra. Juliana Costa', channel: 'Instagram', tags: 'pensão,família,FAQs', notes: '', ethicalAlert: false, ethicalAlertMessage: '' },
  { id: 'c12', title: 'Webinar: LGPD para Escritórios de Advocacia', type: 'video', status: 'AGENDADO', scheduledFor: '2026-05-28', publishedAt: '', author: 'Dr. Ricardo Santos', channel: 'YouTube', tags: 'LGPD,webinar,dados', notes: 'Link da transmissão será enviado', ethicalAlert: false, ethicalAlertMessage: '' },
];



const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; bg: string }> = {
  RASCUNHO: { label: 'Rascunho', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  AGENDADO: { label: 'Agendado', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  PUBLICADO: { label: 'Publicado', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  ARQUIVADO: { label: 'Arquivado', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

const CAMP_STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; bg: string }> = {
  ATIVA: { label: 'Ativa', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  PAUSADA: { label: 'Pausada', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  CONCLUIDA: { label: 'Concluída', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  RASCUNHO: { label: 'Rascunho', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

const TYPE_ICONS: Record<ContentType, typeof FileText> = {
  artigo: FileText, video: Video, infografico: Image, podcast: Play, post_social: Share2, newsletter: FileText,
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Marketing() {
  const [content, setContent] = useState<ContentItem[]>(CONTENT_TYPES);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await marketingApi.campaigns.list();
        const list = (res as any).campaigns || (res as any).data || [];
        setCampaigns(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Erro ao carregar campanhas:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'campaigns' | 'analytics'>('content');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<ContentType>('artigo');
  const [formChannel, setFormChannel] = useState('Blog');
  const [formScheduledFor, setFormScheduledFor] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filteredContent = useMemo(() => {
    let list = [...content];
    const q = search.toLowerCase();
    if (q) list = list.filter(c => c.title.toLowerCase().includes(q) || c.tags.toLowerCase().includes(q) || c.author.toLowerCase().includes(q));
    if (filterStatus) list = list.filter(c => c.status === filterStatus);
    if (filterChannel) list = list.filter(c => c.channel === filterChannel);
    return list;
  }, [content, search, filterStatus, filterChannel]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [calendarMonth, calendarYear]);

  const scheduledItems = content.filter(c => c.status === 'AGENDADO' || c.status === 'PUBLICADO');
  const monthItems = scheduledItems.filter(c => {
    const dateStr = c.status === 'PUBLICADO' ? c.publishedAt : c.scheduledFor;
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T12:00:00');
    return d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
  });

  function getItemsForDay(day: number) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthItems.filter(c => (c.scheduledFor === dateStr || c.publishedAt === dateStr));
  }

  function openCreate() {
    setEditingContent(null);
    setFormTitle(''); setFormType('artigo'); setFormChannel('Blog'); setFormScheduledFor(''); setFormTags(''); setFormNotes('');
    setShowForm(true);
  }

  function openEdit(c: ContentItem) {
    setEditingContent(c);
    setFormTitle(c.title); setFormType(c.type); setFormChannel(c.channel); setFormScheduledFor(c.scheduledFor); setFormTags(c.tags); setFormNotes(c.notes);
    setShowForm(true);
  }

  function saveForm() {
    if (!formTitle) return;
    const ethical = checkEthical(`${formTitle} ${formNotes}`);
    const data: ContentItem = {
      id: editingContent?.id || String(Date.now()),
      title: formTitle, type: formType, status: editingContent?.status || 'RASCUNHO',
      scheduledFor: formScheduledFor, publishedAt: editingContent?.publishedAt || '',
      author: editingContent?.author || 'Usuário Atual', channel: formChannel, tags: formTags, notes: formNotes,
      ethicalAlert: ethical.hasAlert, ethicalAlertMessage: ethical.message,
    };
    if (editingContent) {
      setContent(content.map(c => c.id === editingContent.id ? data : c));
    } else {
      setContent([data, ...content]);
    }
    setShowForm(false);
    setEditingContent(null);
  }

  const ethicalAlerts = content.filter(c => c.ethicalAlert);

  const analytics = useMemo(() => {
    const total = content.length;
    const published = content.filter(c => c.status === 'PUBLICADO').length;
    const scheduled = content.filter(c => c.status === 'AGENDADO').length;
    const totalLeads = campaigns.reduce((acc, c) => acc + c.leads, 0);
    const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
    const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
    const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
    return { total, published, scheduled, totalLeads, totalConversions, totalSpent, totalBudget, conversionRate: totalLeads > 0 ? Math.round((totalConversions / totalLeads) * 100) : 0 };
  }, [content, campaigns]);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Marketing Jurídico</h1>
          <p className="page-subtitle">Gestão de conteúdo e campanhas</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-gold" onClick={openCreate}><Plus size={18} /> Novo Conteúdo</button>
        </div>
      </div>

      {ethicalAlerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {ethicalAlerts.map(c => (
            <div key={c.id} className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertTriangle size={20} />
              <div style={{ flex: 1 }}>
                <strong>Alerta Ético</strong> em "{c.title}": {c.ethicalAlertMessage}
              </div>
              <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }} onClick={() => openEdit(c)}>
                <Edit3 size={14} /> Revisar
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-elevated)', borderRadius: 8, padding: 3, border: '1px solid var(--border-default)', width: 'fit-content' }}>
        {(['content', 'campaigns', 'analytics'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', borderRadius: 6, background: activeTab === tab ? 'var(--gold-primary)' : 'transparent', color: activeTab === tab ? 'var(--text-inverse)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
            {tab === 'content' ? 'Calendário Editorial' : tab === 'campaigns' ? 'Campanhas' : 'Analytics'}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{ flex: '1 1 240px', maxWidth: 320 }}>
              <Search className="search-icon" size={16} />
              <input type="text" placeholder="Buscar conteúdo..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Todos</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Canal</label>
              <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)}>
                <option value="">Todos</option>
                {['Blog', 'Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'Spotify', 'E-mail'].map(ch => <option key={ch} value={ch}>{ch}</option>)}
              </select>
            </div>
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button className="btn btn-ghost btn-icon" onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); } else setCalendarMonth(calendarMonth - 1); }}><ChevronLeft size={20} /></button>
              <h3 style={{ fontSize: 18 }}>{monthNames[calendarMonth]} {calendarYear}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); } else setCalendarMonth(calendarMonth + 1); }}><ChevronRight size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--border-default)' }}>
              {dayNames.map(d => <div key={d} style={{ padding: 8, textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-card)', textTransform: 'uppercase' }}>{d}</div>)}
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`e${i}`} style={{ background: 'var(--bg-card)', minHeight: 80 }} />;
                const items = getItemsForDay(day);
                const isToday = day === new Date().getDate() && calendarMonth === new Date().getMonth() && calendarYear === new Date().getFullYear();
                return (
                  <div key={day} style={{ background: 'var(--bg-card)', minHeight: 80, padding: 4, border: isToday ? '1px solid var(--gold-primary)' : 'none' }}>
                    <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--gold-primary)' : 'var(--text-primary)', marginBottom: 2, display: 'inline-block' }}>{day}</span>
                    {items.map(item => (
                      <div key={item.id} onClick={() => openEdit(item)} style={{ fontSize: 9, padding: '2px 4px', borderRadius: 3, marginBottom: 2, background: item.ethicalAlert ? 'rgba(239,68,68,0.2)' : 'var(--gold-glow)', color: item.ethicalAlert ? '#EF4444' : 'var(--gold-primary)', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title.slice(0, 25)}...
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Biblioteca de Conteúdo ({filteredContent.length})</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Conteúdo</th>
                  <th>Tipo</th>
                  <th>Canal</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Autor</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContent.map(item => {
                  const Icon = TYPE_ICONS[item.type];
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: item.ethicalAlert ? 'rgba(239,68,68,0.12)' : 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.ethicalAlert ? '#EF4444' : 'var(--gold-primary)', flexShrink: 0 }}>
                            {item.ethicalAlert ? <AlertCircle size={16} /> : <Icon size={16} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{item.title}</div>
                            {item.tags && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{item.tags}</div>}
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-gold" style={{ fontSize: 11, textTransform: 'capitalize' }}>{item.type.replace('_', ' ')}</span></td>
                      <td><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.channel}</span></td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: STATUS_CONFIG[item.status].bg, color: STATUS_CONFIG[item.status].color, border: `1px solid ${STATUS_CONFIG[item.status].color}30` }}>
                          {STATUS_CONFIG[item.status].label}
                        </span>
                      </td>
                      <td><span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{item.scheduledFor ? formatDate(item.scheduledFor) : '—'}</span></td>
                      <td><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.author}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(item)}><Edit3 size={14} /></button>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setContent(content.filter(c => c.id !== item.id))} style={{ color: '#EF4444' }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'campaigns' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-tertiary)' }}>Carregando campanhas...</div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {campaigns.map(cmp => {
              const spentPct = cmp.budget > 0 ? Math.round((cmp.spent / cmp.budget) * 100) : 0;
              const convRate = cmp.leads > 0 ? Math.round((cmp.conversions / cmp.leads) * 100) : 0;
              const cpl = cmp.conversions > 0 ? cmp.spent / cmp.conversions : 0;
              return (
                <div key={cmp.id} className="card">
                  <div className="card-header">
                    <div>
                      <h4>{cmp.name}</h4>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: CAMP_STATUS_CONFIG[cmp.status].bg, color: CAMP_STATUS_CONFIG[cmp.status].color, border: `1px solid ${CAMP_STATUS_CONFIG[cmp.status].color}30` }}>
                        {CAMP_STATUS_CONFIG[cmp.status].label}
                      </span>
                    </div>
                    <span className="badge badge-gold">{cmp.channel}</span>
                  </div>
                  <div className="card-body">
                    <p style={{ fontSize: 13, margin: '0 0 12px', color: 'var(--text-secondary)' }}>{cmp.description}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div><div className="form-label" style={{ fontSize: 10 }}>Orçamento</div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(cmp.budget)}</div></div>
                      <div><div className="form-label" style={{ fontSize: 10 }}>Gasto</div><div style={{ fontSize: 14, fontWeight: 600, color: '#EF4444' }}>{formatCurrency(cmp.spent)}</div></div>
                      <div><div className="form-label" style={{ fontSize: 10 }}>Leads</div><div style={{ fontSize: 14, fontWeight: 600, color: '#3B82F6' }}>{cmp.leads}</div></div>
                      <div><div className="form-label" style={{ fontSize: 10 }}>Conversões</div><div style={{ fontSize: 14, fontWeight: 600, color: '#10B981' }}>{cmp.conversions}</div></div>
                      <div><div className="form-label" style={{ fontSize: 10 }}>Taxa Conv.</div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold-primary)' }}>{convRate}%</div></div>
                      <div><div className="form-label" style={{ fontSize: 10 }}>CPA</div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(cpl)}</div></div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                        <span>Progresso</span>
                        <span>{spentPct}%</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${spentPct}%`, height: '100%', background: cmp.status === 'ATIVA' ? 'var(--gold-primary)' : cmp.status === 'CONCLUIDA' ? '#10B981' : '#6B7280', borderRadius: 3, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-label">Conteúdo Total</div>
              <div className="stat-value" style={{ color: 'var(--gold-primary)' }}>{analytics.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Publicados</div>
              <div className="stat-value" style={{ color: '#10B981' }}>{analytics.published}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Agendados</div>
              <div className="stat-value" style={{ color: '#3B82F6' }}>{analytics.scheduled}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Alerta Éticos</div>
              <div className="stat-value" style={{ color: '#EF4444' }}>{ethicalAlerts.length}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="card">
              <div className="card-header"><h4>Leads por Canal</h4></div>
              <div className="card-body">
                {campaigns.reduce((acc: { channel: string; leads: number }[], cmp) => {
                  const existing = acc.find(a => a.channel === cmp.channel);
                  if (existing) existing.leads += cmp.leads;
                  else acc.push({ channel: cmp.channel, leads: cmp.leads });
                  return acc;
                }, []).map((item, idx) => {
                  const maxLeads = Math.max(...campaigns.reduce((acc: number[], cmp) => { const e = acc.find((_, i) => campaigns.filter((c, j) => c.channel === item.channel).length > 0); return acc; }, []));
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-default)' }}>
                      <span style={{ width: 80, fontSize: 13, color: 'var(--text-primary)' }}>{item.channel}</span>
                      <div style={{ flex: 1, height: 8, background: 'var(--bg-hover)', borderRadius: 4 }}>
                        <div style={{ width: `${Math.min(100, (item.leads / analytics.totalLeads) * 100)}%`, height: '100%', background: 'var(--gold-primary)', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', width: 40, textAlign: 'right' }}>{item.leads}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h4>Performance Campanhas</h4></div>
              <div className="card-body">
                {campaigns.filter(c => c.status === 'ATIVA').map(cmp => (
                  <div key={cmp.id} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-primary)' }}>{cmp.name}</span>
                      <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>{cmp.leads} leads</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                      <span>Gasto: {formatCurrency(cmp.spent)}</span>
                      <span>CPA: {formatCurrency(cmp.conversions > 0 ? cmp.spent / cmp.conversions : 0)}</span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: 'var(--bg-hover)', borderRadius: 2 }}>
                      <div style={{ width: `${Math.min(100, (cmp.spent / cmp.budget) * 100)}%`, height: '100%', background: 'var(--gold-primary)', borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-label">Total Investido</div>
              <div className="stat-value" style={{ color: '#EF4444' }}>{formatCurrency(analytics.totalSpent)}</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-label">Leads Gerados</div>
              <div className="stat-value" style={{ color: '#3B82F6' }}>{analytics.totalLeads}</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-label">Taxa de Conversão</div>
              <div className="stat-value" style={{ color: '#10B981' }}>{analytics.conversionRate}%</div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <>
          <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingContent(null); }} />
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3>{editingContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h3>
              <button className="modal-close" onClick={() => { setShowForm(false); setEditingContent(null); }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Título <span style={{ color: '#EF4444' }}>*</span></label>
                  <input className="form-input" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Título do conteúdo" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" value={formType} onChange={e => setFormType(e.target.value as ContentType)}>
                    <option value="artigo">Artigo</option>
                    <option value="video">Vídeo</option>
                    <option value="infografico">Infográfico</option>
                    <option value="podcast">Podcast</option>
                    <option value="post_social">Post Social</option>
                    <option value="newsletter">Newsletter</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Canal</label>
                  <select className="form-select" value={formChannel} onChange={e => setFormChannel(e.target.value)}>
                    <option value="Blog">Blog</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Spotify">Spotify</option>
                    <option value="E-mail">E-mail</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Agendar para</label>
                  <input className="form-input" type="date" value={formScheduledFor} onChange={e => setFormScheduledFor(e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Tags</label>
                  <input className="form-input" value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="tag1,tag2,tag3" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Observações</label>
                  <textarea className="form-textarea" value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Notas sobre o conteúdo..." />
                </div>
              </div>
              {formTitle && checkEthical(`${formTitle} ${formNotes}`).hasAlert && (
                <div className="alert alert-error" style={{ marginTop: 12 }}>
                  <AlertTriangle size={16} />
                  <span>{checkEthical(`${formTitle} ${formNotes}`).message}</span>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingContent(null); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveForm} disabled={!formTitle}>
                {editingContent ? 'Salvar' : 'Criar Conteúdo'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
