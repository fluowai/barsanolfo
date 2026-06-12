import { useState, useMemo, useEffect } from 'react';
import { contractsApi } from '../services/api';
import {
  Plus, Search, Filter, X, Eye, Edit3, Trash2, FileText,
  CheckCircle2, Clock, AlertTriangle, Download, Send,
  ChevronRight, User, Briefcase, DollarSign, Calendar,
  Percent, FileSignature, MoreVertical, Ban, Archive
} from 'lucide-react';

type ContractType = 'Honorários Fixos' | 'Êxito' | 'Misto' | 'Consulta' | 'Recorrência';
type ContractStatus = 'RASCUNHO' | 'GERADO' | 'ENVIADO' | 'VISUALIZADO' | 'ASSINADO' | 'RECUSADO' | 'VENCIDO' | 'CANCELADO';

interface Clause {
  id: string;
  title: string;
  content: string;
}

interface ContractTimeline {
  id: string;
  date: string;
  event: string;
  description: string;
  user: string;
}

interface Contract {
  id: string;
  title: string;
  type: ContractType;
  status: ContractStatus;
  client: string;
  caseNumber: string;
  totalValue: number;
  upfront: number;
  installments: number;
  contingencyPercent: number;
  paymentMethod: string;
  dueDay: number;
  startDate: string;
  endDate: string;
  clauses: Clause[];
  notes: string;
  generatedBy: string;
  createdAt: string;
  timeline: ContractTimeline[];
  signingDate: string;
}

const CONTRACT_TYPES: ContractType[] = ['Honorários Fixos', 'Êxito', 'Misto', 'Consulta', 'Recorrência'];

const STATUS_CONFIG: Record<ContractStatus, { label: string; color: string; bg: string }> = {
  RASCUNHO: { label: 'Rascunho', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  GERADO: { label: 'Gerado', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  ENVIADO: { label: 'Enviado', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  VISUALIZADO: { label: 'Visualizado', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  ASSINADO: { label: 'Assinado', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  RECUSADO: { label: 'Recusado', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  VENCIDO: { label: 'Vencido', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  CANCELADO: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

const CLIENTS = ['João Silva', 'Maria Oliveira', 'Carlos Santos', 'Ana Beatriz', 'Empresa ABC Ltda', 'Roberto Almeida', 'Fernanda Costa'];
const CASES = ['0000832-35.2018.4.01.3202', '1234567-89.2023.8.26.0000', '9876543-21.2024.4.03.6100', '4567890-12.2024.8.26.0100', '7890123-45.2023.8.26.0200'];
const TEAM = ['Dra. Fernanda Lima', 'Dr. Ricardo Santos', 'Dra. Juliana Costa', 'Dr. Paulo Oliveira'];



function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function StatusBadge({ status }: { status: ContractStatus }) {
  const cfg = STATUS_CONFIG[status];
  const icon = status === 'ASSINADO' ? CheckCircle2 : status === 'CANCELADO' || status === 'RECUSADO' ? X : status === 'ENVIADO' ? Send : status === 'RASCUNHO' ? FileText : Clock;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      {icon({ size: 12 })}
      {cfg.label}
    </span>
  );
}

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await contractsApi.list();
        const list = (res as any).contracts || (res as any).data || [];
        setContracts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Erro ao carregar contratos:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<ContractType>('Honorários Fixos');
  const [formClient, setFormClient] = useState('');
  const [formCase, setFormCase] = useState('');
  const [formTotalValue, setFormTotalValue] = useState(0);
  const [formUpfront, setFormUpfront] = useState(0);
  const [formInstallments, setFormInstallments] = useState(1);
  const [formContingency, setFormContingency] = useState(0);
  const [formPaymentMethod, setFormPaymentMethod] = useState('Transferência Bancária');
  const [formDueDay, setFormDueDay] = useState(5);
  const [formClauses, setFormClauses] = useState<string[]>(['']);
  const [formNotes, setFormNotes] = useState('');

  const filtered = useMemo(() => {
    let list = [...contracts];
    const q = search.toLowerCase();
    if (q) list = list.filter(c => c.title.toLowerCase().includes(q) || c.client.toLowerCase().includes(q) || c.caseNumber.toLowerCase().includes(q));
    if (filterStatus) list = list.filter(c => c.status === filterStatus);
    if (filterType) list = list.filter(c => c.type === filterType);
    if (filterClient) list = list.filter(c => c.client === filterClient);
    return list;
  }, [contracts, search, filterStatus, filterType, filterClient]);

  const stats = useMemo(() => ({
    total: contracts.length,
    ativos: contracts.filter(c => c.status === 'ASSINADO').length,
    rascunhos: contracts.filter(c => c.status === 'RASCUNHO').length,
    enviados: contracts.filter(c => c.status === 'ENVIADO' || c.status === 'VISUALIZADO').length,
  }), [contracts]);

  function openCreate() {
    setEditingId(null);
    setFormTitle(''); setFormType('Honorários Fixos'); setFormClient(''); setFormCase('');
    setFormTotalValue(0); setFormUpfront(0); setFormInstallments(1); setFormContingency(0);
    setFormPaymentMethod('Transferência Bancária'); setFormDueDay(5); setFormClauses(['']); setFormNotes('');
    setShowForm(true);
  }

  function openEdit(c: Contract) {
    setEditingId(c.id);
    setFormTitle(c.title); setFormType(c.type); setFormClient(c.client); setFormCase(c.caseNumber);
    setFormTotalValue(c.totalValue); setFormUpfront(c.upfront); setFormInstallments(c.installments);
    setFormContingency(c.contingencyPercent); setFormPaymentMethod(c.paymentMethod); setFormDueDay(c.dueDay);
    setFormClauses(c.clauses.length > 0 ? c.clauses.map(cl => cl.content) : ['']);
    setFormNotes(c.notes);
    setShowForm(true);
  }

  function saveForm() {
    if (!formTitle || !formClient) return;
    const cl = formClauses.filter(c => c.trim()).map((content, i) => ({ id: `cl_${Date.now()}_${i}`, title: `Cláusula ${i + 1}`, content }));
    const existing = editingId ? contracts.find(c => c.id === editingId) : null;
    const data: Contract = {
      id: editingId || String(Date.now()),
      title: formTitle, type: formType, status: existing?.status || 'RASCUNHO',
      client: formClient, caseNumber: formCase, totalValue: formTotalValue, upfront: formUpfront,
      installments: formInstallments, contingencyPercent: formContingency, paymentMethod: formPaymentMethod,
      dueDay: formDueDay, startDate: existing?.startDate || '', endDate: existing?.endDate || '',
      clauses: cl, notes: formNotes, generatedBy: existing?.generatedBy || 'Usuário Atual',
      createdAt: existing?.createdAt || new Date().toISOString(),
      timeline: existing?.timeline || [{ id: `tl_${Date.now()}`, date: new Date().toISOString(), event: 'Criação', description: 'Contrato criado', user: 'Usuário Atual' }],
      signingDate: existing?.signingDate || '',
    };
    if (editingId) {
      setContracts(contracts.map(c => c.id === editingId ? data : c));
    } else {
      setContracts([data, ...contracts]);
    }
    setShowForm(false);
    setEditingId(null);
  }

  function deleteContract(id: string) {
    setContracts(contracts.filter(c => c.id !== id));
    if (selectedContract?.id === id) setSelectedContract(null);
  }

  function updateStatus(id: string, status: ContractStatus) {
    const now = new Date().toISOString();
    setContracts(contracts.map(c => {
      if (c.id !== id) return c;
      const tl = [...c.timeline, { id: `tl_${Date.now()}`, date: now, event: status, description: `Status alterado para ${STATUS_CONFIG[status].label}`, user: 'Usuário Atual' }];
      return { ...c, status, timeline: tl, signingDate: status === 'ASSINADO' ? now : c.signingDate };
    }));
    if (selectedContract?.id === id) setSelectedContract({ ...selectedContract, status, timeline: [...selectedContract.timeline, { id: `tl_${Date.now()}`, date: now, event: status, description: `Status alterado`, user: 'Usuário Atual' }], signingDate: status === 'ASSINADO' ? now : selectedContract.signingDate });
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Contratos</h1>
          <p className="page-subtitle">{contracts.length} contratos cadastrados</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-gold" onClick={openCreate}><Plus size={18} /> Novo Contrato</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-tertiary)' }}>Carregando contratos...</div>
      ) : (
      <><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value" style={{ color: 'var(--gold-primary)' }}>{stats.total}</div></div>
        <div className="stat-card"><div className="stat-label">Ativos</div><div className="stat-value" style={{ color: '#10B981' }}>{stats.ativos}</div></div>
        <div className="stat-card"><div className="stat-label">Rascunhos</div><div className="stat-value" style={{ color: '#6B7280' }}>{stats.rascunhos}</div></div>
        <div className="stat-card"><div className="stat-label">Enviados</div><div className="stat-value" style={{ color: '#8B5CF6' }}>{stats.enviados}</div></div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: '1 1 280px', maxWidth: 360 }}>
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Buscar contratos..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Tipo</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Todos</option>
            {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Cliente</label>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)}>
            <option value="">Todos</option>
            {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Tipo</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Criação</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedContract(c)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: c.status === 'ASSINADO' ? 'rgba(16,185,129,0.12)' : c.status === 'RASCUNHO' ? 'var(--gold-glow)' : 'rgba(107,114,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.status === 'ASSINADO' ? '#10B981' : c.status === 'RASCUNHO' ? 'var(--gold-primary)' : '#6B7280', flexShrink: 0 }}>
                      <FileSignature size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{c.title}</div>
                      {c.caseNumber && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{c.caseNumber}</div>}
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-gold" style={{ fontSize: 11 }}>{c.type}</span></td>
                <td><span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{c.client}</span></td>
                <td><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(c.totalValue)}</span></td>
                <td><StatusBadge status={c.status} /></td>
                <td><span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{formatDate(c.createdAt)}</span></td>
                <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedContract(c)} title="Detalhes"><Eye size={14} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(c)} title="Editar"><Edit3 size={14} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteContract(c.id)} style={{ color: '#EF4444' }} title="Excluir"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>Nenhum contrato encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      </>)}

      {selectedContract && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedContract(null)} />
          <div className="modal modal-lg" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3>{selectedContract.title}</h3>
                <StatusBadge status={selectedContract.status} />
              </div>
              <button className="modal-close" onClick={() => setSelectedContract(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div><div className="form-label">Tipo</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedContract.type}</div></div>
                <div><div className="form-label">Cliente</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedContract.client}</div></div>
                {selectedContract.caseNumber && <div><div className="form-label">Processo</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedContract.caseNumber}</div></div>}
                <div><div className="form-label">Valor Total</div><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold-primary)' }}>{formatCurrency(selectedContract.totalValue)}</div></div>
                <div><div className="form-label">Entrada</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{formatCurrency(selectedContract.upfront)}</div></div>
                <div><div className="form-label">Parcelas</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedContract.installments}</div></div>
                {selectedContract.contingencyPercent > 0 && <div><div className="form-label">Contingência</div><div style={{ fontSize: 14, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 4 }}><Percent size={14} /> {selectedContract.contingencyPercent}%</div></div>}
                <div><div className="form-label">Método Pagamento</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedContract.paymentMethod}</div></div>
                <div><div className="form-label">Vencimento</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>Dia {selectedContract.dueDay}</div></div>
                <div><div className="form-label">Criado por</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedContract.generatedBy}</div></div>
                <div><div className="form-label">Data</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{formatDate(selectedContract.createdAt)}</div></div>
              </div>

              {selectedContract.clauses.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div className="form-label" style={{ marginBottom: 8 }}>Cláusulas</div>
                  {selectedContract.clauses.map(cl => (
                    <div key={cl.id} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 8, border: '1px solid var(--border-default)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold-primary)', marginBottom: 4 }}>{cl.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{cl.content}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedContract.notes && (
                <div style={{ marginBottom: 20 }}>
                  <div className="form-label" style={{ marginBottom: 4 }}>Observações</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{selectedContract.notes}</p>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div className="form-label" style={{ marginBottom: 8 }}>Alterar Status</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <button key={k} onClick={() => updateStatus(selectedContract.id, k as ContractStatus)} disabled={selectedContract.status === k} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: selectedContract.status === k ? v.bg : 'var(--bg-hover)', color: selectedContract.status === k ? v.color : 'var(--text-secondary)', border: `1px solid ${selectedContract.status === k ? v.color : 'var(--border-default)'}`, cursor: selectedContract.status === k ? 'default' : 'pointer', transition: 'all 0.2s', opacity: selectedContract.status === k ? 1 : 0.8 }}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>Linha do Tempo</div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {selectedContract.timeline.map((tl, idx) => (
                    <div key={tl.id} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: idx < selectedContract.timeline.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: tl.event === 'Assinado' ? '#10B981' : tl.event === 'Criação' ? 'var(--gold-primary)' : '#6B7280', marginTop: 6, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{tl.event}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatDate(tl.date)}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tl.description}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>por {tl.user}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button className="btn btn-primary btn-sm"><Download size={14} /> Exportar PDF</button>
                <button className="btn btn-secondary btn-sm"><Send size={14} /> Enviar para Assinatura</button>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(selectedContract)}><Edit3 size={14} /> Editar</button>
              </div>
            </div>
          </div>
        </>
      )}

      {showForm && (
        <>
          <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingId(null); }} />
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3>{editingId ? 'Editar Contrato' : 'Novo Contrato'}</h3>
              <button className="modal-close" onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Título <span style={{ color: '#EF4444' }}>*</span></label>
                  <input className="form-input" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Ex: Honorários Trabalhistas - Cliente" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" value={formType} onChange={e => setFormType(e.target.value as ContractType)}>
                    {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cliente <span style={{ color: '#EF4444' }}>*</span></label>
                  <select className="form-select" value={formClient} onChange={e => setFormClient(e.target.value)}>
                    <option value="">Selecione</option>
                    {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Processo</label>
                  <select className="form-select" value={formCase} onChange={e => setFormCase(e.target.value)}>
                    <option value="">Selecione</option>
                    {CASES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Valor Total</label>
                  <input className="form-input" type="number" value={formTotalValue || ''} onChange={e => setFormTotalValue(Number(e.target.value))} placeholder="0,00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Entrada (Upfront)</label>
                  <input className="form-input" type="number" value={formUpfront || ''} onChange={e => setFormUpfront(Number(e.target.value))} placeholder="0,00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Parcelas</label>
                  <input className="form-input" type="number" min={1} value={formInstallments} onChange={e => setFormInstallments(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contingência (%)</label>
                  <input className="form-input" type="number" min={0} max={100} value={formContingency || ''} onChange={e => setFormContingency(Number(e.target.value))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Método Pagamento</label>
                  <select className="form-select" value={formPaymentMethod} onChange={e => setFormPaymentMethod(e.target.value)}>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Boleto">Boleto</option>
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Dia Vencimento</label>
                  <input className="form-input" type="number" min={1} max={31} value={formDueDay} onChange={e => setFormDueDay(Number(e.target.value))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Cláusulas</label>
                  {formClauses.map((cl, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input className="form-input" value={cl} onChange={e => { const next = [...formClauses]; next[idx] = e.target.value; setFormClauses(next); }} placeholder={`Cláusula ${idx + 1}`} />
                      {formClauses.length > 1 && (
                        <button className="btn btn-ghost btn-icon" onClick={() => setFormClauses(formClauses.filter((_, i) => i !== idx))} style={{ color: '#EF4444', flexShrink: 0 }}><X size={16} /></button>
                      )}
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={() => setFormClauses([...formClauses, ''])} style={{ color: 'var(--gold-primary)' }}><Plus size={14} /> Adicionar Cláusula</button>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Observações</label>
                  <textarea className="form-textarea" value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Observações do contrato..." />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveForm} disabled={!formTitle || !formClient}>
                {editingId ? 'Salvar' : 'Criar Contrato'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
