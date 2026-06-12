import { useState, useMemo, useEffect } from 'react';
import { documentsApi } from '../services/api';
import {
  Plus, Search, Filter, X, Eye, Download, Trash2, FileText,
  Folder, FolderOpen, Upload, Clock, CheckCircle2, AlertTriangle,
  ChevronRight, ChevronDown, File, Image, Video, Headphones,
  FileSignature, Shield, Archive, MoreVertical, Tag, Users,
  Briefcase, EyeOff, History, Edit3
} from 'lucide-react';

type DocCategory = 'Documento Pessoal' | 'Procuração' | 'Contrato' | 'Declaração' | 'Petição Inicial' | 'Contestação' | 'Recurso' | 'Decisão' | 'Sentença' | 'Acórdão' | 'Comprovante' | 'Provas' | 'Áudio' | 'Imagem' | 'Vídeo' | 'BO' | 'Intimação' | 'Publicação' | 'Guia de Custas' | 'Recibo' | 'NF' | 'Outros';
type DocStatus = 'PENDENTE' | 'ENVIADO' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'VENCIDO' | 'ARQUIVADO';

interface DocVersion {
  id: string;
  version: number;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  notes: string;
}

interface Document {
  id: string;
  title: string;
  category: DocCategory;
  status: DocStatus;
  client: string;
  caseNumber: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  notes: string;
  tags: string;
  visibleToClient: boolean;
  uploadedBy: string;
  uploadedAt: string;
  versions: DocVersion[];
  expiryDate: string;
}

const DOC_CATEGORIES: DocCategory[] = ['Documento Pessoal', 'Procuração', 'Contrato', 'Declaração', 'Petição Inicial', 'Contestação', 'Recurso', 'Decisão', 'Sentença', 'Acórdão', 'Comprovante', 'Provas', 'Áudio', 'Imagem', 'Vídeo', 'BO', 'Intimação', 'Publicação', 'Guia de Custas', 'Recibo', 'NF', 'Outros'];

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string }> = {
  PENDENTE: { label: 'Pendente', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  ENVIADO: { label: 'Enviado', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  EM_ANALISE: { label: 'Em Análise', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  APROVADO: { label: 'Aprovado', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  REJEITADO: { label: 'Rejeitado', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  VENCIDO: { label: 'Vencido', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  ARQUIVADO: { label: 'Arquivado', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

const TEAM_MEMBERS = ['Dra. Fernanda Lima', 'Dr. Ricardo Santos', 'Dra. Juliana Costa', 'Dr. Paulo Oliveira', 'Secretaria'];
const CLIENT_LIST = ['João Silva', 'Maria Oliveira', 'Carlos Santos', 'Ana Beatriz', 'Empresa ABC Ltda', 'Roberto Almeida', 'Fernanda Costa'];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function getFileIcon(type: string) {
  if (type === 'pdf') return FileText;
  if (type === 'image') return Image;
  if (type === 'video') return Video;
  if (type === 'audio') return Headphones;
  if (type === 'doc') return FileSignature;
  return File;
}

function StatusBadge({ status }: { status: DocStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      {status === 'APROVADO' ? <CheckCircle2 size={12} /> : status === 'REJEITADO' || status === 'VENCIDO' ? <X size={12} /> : status === 'ARQUIVADO' ? <Archive size={12} /> : <Clock size={12} />}
      {cfg.label}
    </span>
  );
}

interface FolderNode {
  id: string;
  label: string;
  icon: typeof Folder;
  children?: FolderNode[];
}

const folderTree: FolderNode[] = [
  { id: 'all', label: 'Todos Documentos', icon: Folder },
  { id: 'by-client', label: 'Por Cliente', icon: Users, children: [
    { id: 'c-joao', label: 'João Silva', icon: Folder },
    { id: 'c-maria', label: 'Maria Oliveira', icon: Folder },
    { id: 'c-carlos', label: 'Carlos Santos', icon: Folder },
    { id: 'c-abc', label: 'Empresa ABC Ltda', icon: Folder },
  ]},
  { id: 'by-case', label: 'Por Processo', icon: Briefcase, children: [
    { id: 'p-0000832', label: '0000832-35.2018.4.01.3202', icon: Folder },
    { id: 'p-1234567', label: '1234567-89.2023.8.26.0000', icon: Folder },
    { id: 'p-9876543', label: '9876543-21.2024.4.03.6100', icon: Folder },
  ]},
  { id: 'by-category', label: 'Por Categoria', icon: Tag, children: [
    { id: 'cat-proc', label: 'Procurações', icon: Folder },
    { id: 'cat-pet', label: 'Petições', icon: Folder },
    { id: 'cat-cont', label: 'Contratos', icon: Folder },
    { id: 'cat-sent', label: 'Sentenças', icon: Folder },
  ]},
];

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await documentsApi.list();
        const list = (res as any).documents || (res as any).data || [];
        setDocuments(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Erro ao carregar documentos:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [activeFolder, setActiveFolder] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['by-client', 'by-case']);

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocCategory>('Outros');
  const [uploadClient, setUploadClient] = useState('');
  const [uploadCase, setUploadCase] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadVisible, setUploadVisible] = useState(true);

  const filtered = useMemo(() => {
    let list = [...documents];
    const q = search.toLowerCase();
    if (q) list = list.filter(d => d.title.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q) || d.client.toLowerCase().includes(q) || d.tags.toLowerCase().includes(q));
    if (filterCategory) list = list.filter(d => d.category === filterCategory);
    if (filterStatus) list = list.filter(d => d.status === filterStatus);
    if (filterClient) list = list.filter(d => d.client === filterClient);
    if (activeFolder.startsWith('c-')) {
      const names: Record<string, string> = { 'c-joao': 'João Silva', 'c-maria': 'Maria Oliveira', 'c-carlos': 'Carlos Santos', 'c-abc': 'Empresa ABC Ltda' };
      if (names[activeFolder]) list = list.filter(d => d.client === names[activeFolder]);
    }
    if (activeFolder.startsWith('p-')) {
      const cases: Record<string, string> = { 'p-0000832': '0000832-35.2018.4.01.3202', 'p-1234567': '1234567-89.2023.8.26.0000', 'p-9876543': '9876543-21.2024.4.03.6100' };
      if (cases[activeFolder]) list = list.filter(d => d.caseNumber === cases[activeFolder]);
    }
    return list;
  }, [documents, search, filterCategory, filterStatus, filterClient, activeFolder]);

  const stats = useMemo(() => ({
    total: documents.length,
    pendentes: documents.filter(d => d.status === 'PENDENTE' || d.status === 'EM_ANALISE').length,
    aprovados: documents.filter(d => d.status === 'APROVADO').length,
    vencidos: documents.filter(d => d.status === 'VENCIDO').length,
  }), [documents]);

  function handleUpload() {
    if (!uploadTitle) return;
    const newDoc: Document = {
      id: String(Date.now()),
      title: uploadTitle,
      category: uploadCategory,
      status: 'PENDENTE',
      client: uploadClient,
      caseNumber: uploadCase,
      fileName: uploadTitle.replace(/\s+/g, '_').toLowerCase() + '.pdf',
      fileSize: '0 B',
      fileType: 'pdf',
      notes: uploadNotes,
      tags: '',
      visibleToClient: uploadVisible,
      uploadedBy: 'Usuário Atual',
      uploadedAt: new Date().toISOString(),
      versions: [{ id: `v_${Date.now()}`, version: 1, fileName: uploadTitle.replace(/\s+/g, '_').toLowerCase() + '.pdf', fileSize: '0 B', uploadedBy: 'Usuário Atual', uploadedAt: new Date().toISOString(), notes: 'Upload inicial' }],
      expiryDate: '',
    };
    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setUploadTitle(''); setUploadCategory('Outros'); setUploadClient(''); setUploadCase(''); setUploadNotes(''); setUploadVisible(true);
  }

  function toggleVisibility(id: string) {
    setDocuments(documents.map(d => d.id === id ? { ...d, visibleToClient: !d.visibleToClient } : d));
  }

  function toggleFolder(id: string) {
    setExpandedFolders(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }

  function renderFolder(node: FolderNode, depth = 0) {
    const isExpanded = expandedFolders.includes(node.id);
    const isActive = activeFolder === node.id;
    const Icon = isExpanded && node.children ? FolderOpen : node.icon;
    return (
      <div key={node.id}>
        <div
          onClick={() => { if (node.children) toggleFolder(node.id); setActiveFolder(node.id); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', paddingLeft: 12 + depth * 16, borderRadius: 6, cursor: 'pointer', fontSize: 13, background: isActive ? 'var(--gold-glow)' : 'transparent', color: isActive ? 'var(--gold-primary)' : 'var(--text-secondary)', transition: 'all 0.15s' }}
        >
          {node.children ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span style={{ width: 14 }} />}
          <Icon size={16} />
          <span style={{ fontWeight: isActive ? 600 : 400 }}>{node.label}</span>
        </div>
        {node.children && isExpanded && node.children.map(child => renderFolder(child, depth + 1))}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Documentos / GED</h1>
          <p className="page-subtitle">{documents.length} documentos cadastrados</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-gold" onClick={() => setShowUploadModal(true)}>
            <Upload size={18} /> Upload Documento
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-tertiary)' }}>Carregando documentos...</div>
      ) : (
      <><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value" style={{ color: 'var(--gold-primary)' }}>{stats.total}</div></div>
        <div className="stat-card"><div className="stat-label">Pendentes</div><div className="stat-value" style={{ color: '#F59E0B' }}>{stats.pendentes}</div></div>
        <div className="stat-card"><div className="stat-label">Aprovados</div><div className="stat-value" style={{ color: '#10B981' }}>{stats.aprovados}</div></div>
        <div className="stat-card"><div className="stat-label">Vencidos</div><div className="stat-value" style={{ color: '#EF4444' }}>{stats.vencidos}</div></div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 240, flexShrink: 0 }}>
          <div className="card" style={{ padding: 8 }}>
            {folderTree.map(node => renderFolder(node))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{ flex: '1 1 240px', maxWidth: 320 }}>
              <Search className="search-icon" size={16} />
              <input type="text" placeholder="Buscar documentos..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Categoria</label>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="">Todas</option>
                {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
              <label>Cliente</label>
              <select value={filterClient} onChange={e => setFilterClient(e.target.value)}>
                <option value="">Todos</option>
                {CLIENT_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Categoria</th>
                  <th>Cliente / Processo</th>
                  <th>Arquivo</th>
                  <th>Status</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => {
                  const Icon = getFileIcon(doc.fileType);
                  return (
                    <tr key={doc.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDoc(doc)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: doc.fileType === 'image' ? 'rgba(59,130,246,0.12)' : doc.fileType === 'video' ? 'rgba(239,68,68,0.12)' : doc.fileType === 'audio' ? 'rgba(16,185,129,0.12)' : 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: doc.fileType === 'image' ? '#3B82F6' : doc.fileType === 'video' ? '#EF4444' : doc.fileType === 'audio' ? '#10B981' : 'var(--gold-primary)', flexShrink: 0 }}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{doc.title}</div>
                            {doc.tags && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{doc.tags.split(',').slice(0, 2).join(', ')}</div>}
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-gold" style={{ fontSize: 11 }}>{doc.category}</span></td>
                      <td>
                        <div style={{ fontSize: 13 }}>
                          <div style={{ color: 'var(--text-primary)' }}>{doc.client}</div>
                          {doc.caseNumber && <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{doc.caseNumber}</div>}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>
                          <div style={{ color: 'var(--text-secondary)' }}>{doc.fileName}</div>
                          <div style={{ color: 'var(--text-tertiary)' }}>{doc.fileSize}</div>
                        </div>
                      </td>
                      <td><StatusBadge status={doc.status} /></td>
                      <td>
                        <button
                          onClick={e => { e.stopPropagation(); toggleVisibility(doc.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: doc.visibleToClient ? '#10B981' : 'var(--text-tertiary)', padding: 4 }}
                          title={doc.visibleToClient ? 'Visível ao cliente' : 'Oculto do cliente'}
                        >
                          {doc.visibleToClient ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </td>
                      <td><span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{formatDate(doc.uploadedAt)}</span></td>
                      <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedDoc(doc)} title="Detalhes"><Eye size={14} /></button>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setSelectedDoc(doc); setShowVersionHistory(true); }} title="Versões"><History size={14} /></button>
                          <button className="btn btn-ghost btn-icon btn-sm" title="Download"><Download size={14} /></button>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))} style={{ color: '#EF4444' }} title="Excluir"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>Nenhum documento encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>)}

      {selectedDoc && !showVersionHistory && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedDoc(null)} />
          <div className="modal modal-lg" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>{selectedDoc.title}</h3>
              <button className="modal-close" onClick={() => setSelectedDoc(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <StatusBadge status={selectedDoc.status} />
                <span className="badge badge-gold">{selectedDoc.category}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><div className="form-label">Cliente</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedDoc.client}</div></div>
                <div><div className="form-label">Processo</div><div style={{ fontSize: 14, color: selectedDoc.caseNumber ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{selectedDoc.caseNumber || '—'}</div></div>
                <div><div className="form-label">Arquivo</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedDoc.fileName}</div></div>
                <div><div className="form-label">Tamanho</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedDoc.fileSize}</div></div>
                <div><div className="form-label">Enviado por</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedDoc.uploadedBy}</div></div>
                <div><div className="form-label">Data</div><div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{formatDate(selectedDoc.uploadedAt)}</div></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="form-label">Visível ao Cliente</div>
                  <div style={{ fontSize: 14, color: selectedDoc.visibleToClient ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {selectedDoc.visibleToClient ? <><CheckCircle2 size={14} /> Sim</> : <><X size={14} /> Não</>}
                  </div>
                </div>
                {selectedDoc.notes && (
                  <div style={{ gridColumn: '1 / -1' }}><div className="form-label">Observações</div><p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>{selectedDoc.notes}</p></div>
                )}
                {selectedDoc.expiryDate && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div className="form-label">Data de Validade</div>
                    <div style={{ fontSize: 14, color: new Date(selectedDoc.expiryDate) < new Date() ? '#EF4444' : 'var(--text-primary)' }}>
                      {formatDate(selectedDoc.expiryDate)}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setShowVersionHistory(true); }}>
                  <History size={14} /> Histórico de Versões ({selectedDoc.versions.length})
                </button>
                <button className="btn btn-sm" style={{ marginLeft: 8, background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                  <Download size={14} /> Download
                </button>
                <button
                  onClick={() => toggleVisibility(selectedDoc.id)}
                  className="btn btn-sm"
                  style={{ marginLeft: 8, background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                >
                  {selectedDoc.visibleToClient ? <EyeOff size={14} /> : <Eye size={14} />} {selectedDoc.visibleToClient ? 'Ocultar' : 'Tornar Visível'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showVersionHistory && selectedDoc && (
        <>
          <div className="modal-overlay" onClick={() => { setShowVersionHistory(false); setSelectedDoc(null); }} />
          <div className="modal">
            <div className="modal-header">
              <h3>Versões - {selectedDoc.title}</h3>
              <button className="modal-close" onClick={() => { setShowVersionHistory(false); setSelectedDoc(null); }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {selectedDoc.versions.map((v, idx) => (
                <div key={v.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: idx < selectedDoc.versions.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>v{v.version}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{v.fileName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{v.fileSize} • {v.uploadedBy} • {formatDate(v.uploadedAt)}</div>
                    {v.notes && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.notes}</div>}
                  </div>
                  <button className="btn btn-ghost btn-icon btn-sm"><Download size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showUploadModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)} />
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3>Upload de Documento</h3>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Título do Documento <span style={{ color: '#EF4444' }}>*</span></label>
                  <input className="form-input" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Ex: RG - Nome Cliente" />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select className="form-select" value={uploadCategory} onChange={e => setUploadCategory(e.target.value as DocCategory)}>
                    {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cliente</label>
                  <select className="form-select" value={uploadClient} onChange={e => setUploadClient(e.target.value)}>
                    <option value="">Selecione</option>
                    {CLIENT_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Processo</label>
                  <input className="form-input" value={uploadCase} onChange={e => setUploadCase(e.target.value)} placeholder="Nº processo" />
                </div>
                <div className="form-group">
                  <label className="form-label">Arquivo</label>
                  <div style={{ border: '2px dashed var(--border-default)', borderRadius: 8, padding: 24, textAlign: 'center', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                    <Upload size={24} style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 13 }}>Clique para selecionar ou arraste o arquivo</div>
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Observações</label>
                  <textarea className="form-textarea" value={uploadNotes} onChange={e => setUploadNotes(e.target.value)} placeholder="Observações sobre o documento..." />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-checkbox" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" checked={uploadVisible} onChange={e => setUploadVisible(e.target.checked)} />
                    Visível para o cliente no portal
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleUpload} disabled={!uploadTitle}>
                <Upload size={16} /> Fazer Upload
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
