import { useState, useMemo } from 'react';
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

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
const daysFromNow = (n: number) => new Date(now.getTime() + n * 86400000).toISOString().split('T')[0];

const MOCK_DOCUMENTS: Document[] = [
  { id: '1', title: 'RG - João Silva', category: 'Documento Pessoal', status: 'APROVADO', client: 'João Silva', caseNumber: '0000832-35.2018.4.01.3202', fileName: 'rg_joao_silva.pdf', fileSize: '245 KB', fileType: 'pdf', notes: 'Documento original digitalizado', tags: 'RG,documento pessoal', visibleToClient: true, uploadedBy: 'Secretaria', uploadedAt: daysAgo(30), versions: [{ id: 'v1', version: 1, fileName: 'rg_joao_silva.pdf', fileSize: '245 KB', uploadedBy: 'Secretaria', uploadedAt: daysAgo(30), notes: 'Versão original' }], expiryDate: '' },
  { id: '2', title: 'Procuração - Maria Oliveira', category: 'Procuração', status: 'APROVADO', client: 'Maria Oliveira', caseNumber: '1234567-89.2023.8.26.0000', fileName: 'procuracao_maria.pdf', fileSize: '180 KB', fileType: 'pdf', notes: 'Procuração com poderes gerais', tags: 'procuração', visibleToClient: true, uploadedBy: 'Dra. Fernanda Lima', uploadedAt: daysAgo(25), versions: [{ id: 'v2', version: 1, fileName: 'procuracao_maria.pdf', fileSize: '180 KB', uploadedBy: 'Dra. Fernanda Lima', uploadedAt: daysAgo(25), notes: 'Original' }], expiryDate: '' },
  { id: '3', title: 'Contrato Social - ABC Ltda', category: 'Contrato', status: 'APROVADO', client: 'Empresa ABC Ltda', caseNumber: '7890123-45.2023.8.26.0200', fileName: 'contrato_social_abc.pdf', fileSize: '1.2 MB', fileType: 'pdf', notes: 'Contrato social consolidado', tags: 'contrato social,empresarial', visibleToClient: true, uploadedBy: 'Dr. Paulo Oliveira', uploadedAt: daysAgo(20), versions: [{ id: 'v3', version: 1, fileName: 'contrato_social_abc.pdf', fileSize: '1.2 MB', uploadedBy: 'Dr. Paulo Oliveira', uploadedAt: daysAgo(20), notes: 'Original' }], expiryDate: '' },
  { id: '4', title: 'Petição Inicial - Ação Indenizatória', category: 'Petição Inicial', status: 'ENVIADO', client: 'Maria Oliveira', caseNumber: '1234567-89.2023.8.26.0000', fileName: 'peticao_inicial_indenizatoria.pdf', fileSize: '560 KB', fileType: 'pdf', notes: 'Petição inicial protocolada no TJSP', tags: 'petição inicial,indenização', visibleToClient: true, uploadedBy: 'Dr. Ricardo Santos', uploadedAt: daysAgo(15), versions: [{ id: 'v4', version: 1, fileName: 'peticao_inicial_v1.docx', fileSize: '420 KB', uploadedBy: 'Dr. Ricardo Santos', uploadedAt: daysAgo(18), notes: 'Minuta' }, { id: 'v5', version: 2, fileName: 'peticao_inicial_indenizatoria.pdf', fileSize: '560 KB', uploadedBy: 'Dr. Ricardo Santos', uploadedAt: daysAgo(15), notes: 'Versão final protocolada' }], expiryDate: '' },
  { id: '5', title: 'Sentença - Processo Silva', category: 'Sentença', status: 'APROVADO', client: 'João Silva', caseNumber: '0000832-35.2018.4.01.3202', fileName: 'sentenca_silva.pdf', fileSize: '320 KB', fileType: 'pdf', notes: 'Sentença de primeiro grau', tags: 'sentença,trabalhista', visibleToClient: true, uploadedBy: 'Sistema', uploadedAt: daysAgo(10), versions: [{ id: 'v6', version: 1, fileName: 'sentenca_silva.pdf', fileSize: '320 KB', uploadedBy: 'Sistema', uploadedAt: daysAgo(10), notes: 'Extraída do PJe' }], expiryDate: '' },
  { id: '6', title: 'Comprovante de Residência', category: 'Comprovante', status: 'PENDENTE', client: 'Carlos Santos', caseNumber: '9876543-21.2024.4.03.6100', fileName: 'comprovante_residencia.jpg', fileSize: '890 KB', fileType: 'image', notes: 'Conta de luz', tags: 'comprovante,residência', visibleToClient: false, uploadedBy: 'Carlos Santos', uploadedAt: daysAgo(5), versions: [{ id: 'v7', version: 1, fileName: 'comprovante_residencia.jpg', fileSize: '890 KB', uploadedBy: 'Carlos Santos', uploadedAt: daysAgo(5), notes: 'Enviado pelo cliente' }], expiryDate: '' },
  { id: '7', title: 'Áudio - Reunião Estratégica', category: 'Áudio', status: 'ARQUIVADO', client: 'Interno', caseNumber: '', fileName: 'reuniao_estrategica.mp3', fileSize: '15 MB', fileType: 'audio', notes: 'Gravação da reunião de estratégia do mês', tags: 'áudio,reunião', visibleToClient: false, uploadedBy: 'Dra. Juliana Costa', uploadedAt: daysAgo(8), versions: [{ id: 'v8', version: 1, fileName: 'reuniao_estrategica.mp3', fileSize: '15 MB', uploadedBy: 'Dra. Juliana Costa', uploadedAt: daysAgo(8), notes: 'Gravação original' }], expiryDate: '' },
  { id: '8', title: 'Guia de Custas - Recurso', category: 'Guia de Custas', status: 'VENCIDO', client: 'Empresa ABC Ltda', caseNumber: '7890123-45.2023.8.26.0200', fileName: 'guia_custas_recurso.pdf', fileSize: '95 KB', fileType: 'pdf', notes: 'Guia de recolhimento de custas processuais', tags: 'custas,guia', visibleToClient: true, uploadedBy: 'Secretaria', uploadedAt: daysAgo(12), versions: [{ id: 'v9', version: 1, fileName: 'guia_custas_recurso.pdf', fileSize: '95 KB', uploadedBy: 'Secretaria', uploadedAt: daysAgo(12), notes: 'Original' }], expiryDate: daysAgo(2) },
  { id: '9', title: 'Imagem - Documento Acidente', category: 'Imagem', status: 'EM_ANALISE', client: 'Ana Beatriz', caseNumber: '4567890-12.2024.8.26.0100', fileName: 'foto_acidente_1.jpg', fileSize: '2.4 MB', fileType: 'image', notes: 'Foto do local do acidente', tags: 'imagem,acidente,prova', visibleToClient: true, uploadedBy: 'Ana Beatriz', uploadedAt: daysAgo(4), versions: [{ id: 'v10', version: 1, fileName: 'foto_acidente_1.jpg', fileSize: '2.4 MB', uploadedBy: 'Ana Beatriz', uploadedAt: daysAgo(4), notes: 'Enviado pela cliente' }], expiryDate: '' },
  { id: '10', title: 'Recurso de Apelação', category: 'Recurso', status: 'ENVIADO', client: 'João Silva', caseNumber: '0000832-35.2018.4.01.3202', fileName: 'recurso_apelacao_silva.pdf', fileSize: '780 KB', fileType: 'pdf', notes: 'Recurso de apelação protocolado no TRF1', tags: 'recurso,apelação', visibleToClient: true, uploadedBy: 'Dra. Fernanda Lima', uploadedAt: daysAgo(6), versions: [{ id: 'v11', version: 1, fileName: 'recurso_apelacao_v1.docx', fileSize: '600 KB', uploadedBy: 'Dra. Fernanda Lima', uploadedAt: daysAgo(10), notes: 'Minuta inicial' }, { id: 'v12', version: 2, fileName: 'recurso_apelacao_silva.pdf', fileSize: '780 KB', uploadedBy: 'Dra. Fernanda Lima', uploadedAt: daysAgo(6), notes: 'Protocolado' }], expiryDate: '' },
  { id: '11', title: 'Acórdão - TRF1', category: 'Acórdão', status: 'APROVADO', client: 'Carlos Santos', caseNumber: '9876543-21.2024.4.03.6100', fileName: 'acordao_trf1.pdf', fileSize: '450 KB', fileType: 'pdf', notes: 'Acórdão da 3ª Turma do TRF1', tags: 'acórdão,TRF1', visibleToClient: true, uploadedBy: 'Sistema', uploadedAt: daysAgo(3), versions: [{ id: 'v13', version: 1, fileName: 'acordao_trf1.pdf', fileSize: '450 KB', uploadedBy: 'Sistema', uploadedAt: daysAgo(3), notes: 'Extraído do PJe' }], expiryDate: '' },
  { id: '12', title: 'NF - Honorários Advocatícios', category: 'NF', status: 'APROVADO', client: 'Roberto Almeida', caseNumber: '', fileName: 'nf_honorarios_maio.pdf', fileSize: '120 KB', fileType: 'pdf', notes: 'Nota fiscal de honorários mensais', tags: 'NF,honorários,faturamento', visibleToClient: true, uploadedBy: 'Secretaria', uploadedAt: daysAgo(2), versions: [{ id: 'v14', version: 1, fileName: 'nf_honorarios_maio.pdf', fileSize: '120 KB', uploadedBy: 'Secretaria', uploadedAt: daysAgo(2), notes: 'Original' }], expiryDate: '' },
  { id: '13', title: 'Contrato de Honorários - ABC', category: 'Contrato', status: 'APROVADO', client: 'Empresa ABC Ltda', caseNumber: '7890123-45.2023.8.26.0200', fileName: 'contrato_honorarios_abc.pdf', fileSize: '340 KB', fileType: 'pdf', notes: 'Contrato de honorários de êxito', tags: 'contrato,honorários', visibleToClient: true, uploadedBy: 'Dr. Paulo Oliveira', uploadedAt: daysAgo(20), versions: [{ id: 'v15', version: 1, fileName: 'contrato_honorarios_abc.pdf', fileSize: '340 KB', uploadedBy: 'Dr. Paulo Oliveira', uploadedAt: daysAgo(20), notes: 'Assinado' }], expiryDate: '' },
  { id: '14', title: 'Vídeo - Gravação Audiência', category: 'Vídeo', status: 'PENDENTE', client: 'Maria Oliveira', caseNumber: '1234567-89.2023.8.26.0000', fileName: 'audiencia_virtual.mp4', fileSize: '120 MB', fileType: 'video', notes: 'Gravação da audiência virtual de conciliação', tags: 'vídeo,audiência', visibleToClient: false, uploadedBy: 'Dra. Fernanda Lima', uploadedAt: daysAgo(1), versions: [{ id: 'v16', version: 1, fileName: 'audiencia_virtual.mp4', fileSize: '120 MB', uploadedBy: 'Dra. Fernanda Lima', uploadedAt: daysAgo(1), notes: 'Original' }], expiryDate: '' },
  { id: '15', title: 'Declaração de Hipossuficiência', category: 'Declaração', status: 'APROVADO', client: 'Ana Beatriz', caseNumber: '4567890-12.2024.8.26.0100', fileName: 'declaracao_hipossuficiencia.pdf', fileSize: '80 KB', fileType: 'pdf', notes: 'Declaração de hipossuficiência para gratuidade de justiça', tags: 'declaração,justiça gratuita', visibleToClient: true, uploadedBy: 'Ana Beatriz', uploadedAt: daysAgo(7), versions: [{ id: 'v17', version: 1, fileName: 'declaracao_hipossuficiencia.pdf', fileSize: '80 KB', uploadedBy: 'Ana Beatriz', uploadedAt: daysAgo(7), notes: 'Assinado' }], expiryDate: '' },
  { id: '16', title: 'Boletim de Ocorrência', category: 'BO', status: 'EM_ANALISE', client: 'Fernanda Costa', caseNumber: '', fileName: 'bo_123456_2026.pdf', fileSize: '210 KB', fileType: 'pdf', notes: 'BO de furto de veículo', tags: 'BO,ocorrência', visibleToClient: true, uploadedBy: 'Fernanda Costa', uploadedAt: daysAgo(3), versions: [{ id: 'v18', version: 1, fileName: 'bo_123456_2026.pdf', fileSize: '210 KB', uploadedBy: 'Fernanda Costa', uploadedAt: daysAgo(3), notes: 'Digitalizado' }], expiryDate: '' },
  { id: '17', title: 'Intimação - Audiência Designada', category: 'Intimação', status: 'APROVADO', client: 'João Silva', caseNumber: '0000832-35.2018.4.01.3202', fileName: 'intimacao_audiencia.pdf', fileSize: '150 KB', fileType: 'pdf', notes: 'Intimação para audiência de instrução', tags: 'intimação,audiência', visibleToClient: true, uploadedBy: 'Sistema', uploadedAt: daysAgo(14), versions: [{ id: 'v19', version: 1, fileName: 'intimacao_audiencia.pdf', fileSize: '150 KB', uploadedBy: 'Sistema', uploadedAt: daysAgo(14), notes: 'Extraída do PJe' }], expiryDate: '' },
  { id: '18', title: 'Publicação - DJE', category: 'Publicação', status: 'APROVADO', client: 'Maria Oliveira', caseNumber: '1234567-89.2023.8.26.0000', fileName: 'publicacao_dje_10maio.pdf', fileSize: '60 KB', fileType: 'pdf', notes: 'Publicação no Diário de Justiça Eletrônico', tags: 'publicação,DJE', visibleToClient: true, uploadedBy: 'Sistema', uploadedAt: daysAgo(1), versions: [{ id: 'v20', version: 1, fileName: 'publicacao_dje_10maio.pdf', fileSize: '60 KB', uploadedBy: 'Sistema', uploadedAt: daysAgo(1), notes: 'Extraída' }], expiryDate: '' },
];

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
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [search, setSearch] = useState('');
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
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
