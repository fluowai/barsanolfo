import { useState, useMemo } from 'react';
import {
  Search, X, Send, Phone, Mail, MessageSquare, UserPlus,
  CheckCircle2, Clock, AlertTriangle, Paperclip, Smile,
  CornerDownRight, Users, Tag, ChevronLeft, Plus,
  Bot, Instagram, Globe, Facebook, MoreVertical, FileText,
  User, ArrowRight, RefreshCw, Bell
} from 'lucide-react';

type Channel = 'whatsapp' | 'instagram' | 'facebook' | 'site' | 'email' | 'chat';
type ConvStatus = 'NOVA' | 'EM_ATENDIMENTO' | 'AGUARDANDO_CLIENTE' | 'AGUARDANDO_EQUIPE' | 'RESOLVIDA' | 'ARQUIVADA';

interface QuickReply {
  id: string;
  title: string;
  message: string;
}

interface Message {
  id: string;
  from: 'contact' | 'agent';
  content: string;
  timestamp: string;
  read: boolean;
  channel: Channel;
}

interface Conversation {
  id: string;
  contactName: string;
  contactAvatar: string;
  phone: string;
  email: string;
  channel: Channel;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  status: ConvStatus;
  assignedTo: string;
  clientLinked: string;
  leadId: string;
  tags: string;
  slaDeadline: string;
  messages: Message[];
}

const CHANNEL_CONFIG: Record<Channel, { label: string; color: string; bg: string; icon: typeof MessageSquare }> = {
  whatsapp: { label: 'WhatsApp', color: '#25D366', bg: 'rgba(37,211,102,0.12)', icon: MessageSquare },
  instagram: { label: 'Instagram', color: '#E4405F', bg: 'rgba(228,64,95,0.12)', icon: Instagram },
  facebook: { label: 'Facebook', color: '#1877F2', bg: 'rgba(24,119,242,0.12)', icon: Facebook },
  site: { label: 'Site', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', icon: Globe },
  email: { label: 'E-mail', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: Mail },
  chat: { label: 'Chat', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: Bot },
};

const STATUS_CONFIG: Record<ConvStatus, { label: string; color: string; bg: string }> = {
  NOVA: { label: 'Nova', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  EM_ATENDIMENTO: { label: 'Em Atendimento', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  AGUARDANDO_CLIENTE: { label: 'Aguardando Cliente', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  AGUARDANDO_EQUIPE: { label: 'Aguardando Equipe', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  RESOLVIDA: { label: 'Resolvida', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  ARQUIVADA: { label: 'Arquivada', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

const TEAM = ['Dra. Fernanda Lima', 'Dr. Ricardo Santos', 'Dra. Juliana Costa', 'Dr. Paulo Oliveira', 'Secretaria'];

const QUICK_REPLIES: QuickReply[] = [
  { id: 'qr1', title: 'Saudação Inicial', message: 'Olá! Tudo bem? Meu nome é [Nome] e serei seu contato no escritório. Como posso ajudá-lo hoje?' },
  { id: 'qr2', title: 'Solicitar Documentos', message: 'Para darmos andamento ao seu caso, precisamos dos seguintes documentos: RG, CPF, comprovante de residência e documentos relacionados ao assunto.' },
  { id: 'qr3', title: 'Agendar Reunião', message: 'Podemos agendar uma reunião para conversarmos melhor sobre seu caso. Quais dias e horários são melhores para você?' },
  { id: 'qr4', title: 'Prazo de Resposta', message: 'Recebemos sua solicitação e nossa equipe está analisando. Retornaremos em até 24 horas úteis.' },
  { id: 'qr5', title: 'Encerramento', message: 'Fico à disposição para qualquer dúvida. Tenha um ótimo dia!' },
];

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
const hoursAgo = (n: number) => new Date(now.getTime() - n * 3600000).toISOString();
const minutesAgo = (n: number) => new Date(now.getTime() - n * 60000).toISOString();

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: '1', contactName: 'Maria Silva', contactAvatar: '', phone: '(11) 98765-4321', email: '', channel: 'whatsapp', lastMessage: 'Bom dia! Gostaria de saber sobre meu processo trabalhista.', lastMessageAt: minutesAgo(5), unread: 2, status: 'EM_ATENDIMENTO', assignedTo: 'Dra. Fernanda Lima', clientLinked: 'Maria Silva', leadId: '', tags: 'trabalhista,processo', slaDeadline: hoursAgo(1), messages: [
    { id: 'm1', from: 'contact', content: 'Bom dia! Gostaria de saber sobre meu processo trabalhista.', timestamp: minutesAgo(5), read: true, channel: 'whatsapp' },
    { id: 'm2', from: 'agent', content: 'Olá Maria! Tudo bem? Sou a Dra. Fernanda. Seu processo está em andamento, aguardando a audiência de conciliação que será no próximo mês.', timestamp: minutesAgo(4), read: true, channel: 'whatsapp' },
    { id: 'm3', from: 'contact', content: 'Entendi. E já tem data definida?', timestamp: minutesAgo(2), read: true, channel: 'whatsapp' },
    { id: 'm4', from: 'contact', content: 'Preciso levar algum documento?', timestamp: minutesAgo(1), read: false, channel: 'whatsapp' },
  ]},
  { id: '2', contactName: 'João Pereira', contactAvatar: '', phone: '', email: 'joao.pereira@email.com', channel: 'email', lastMessage: 'Segue anexo a documentação solicitada.', lastMessageAt: hoursAgo(2), unread: 0, status: 'AGUARDANDO_EQUIPE', assignedTo: 'Dr. Ricardo Santos', clientLinked: '', leadId: 'lead_2', tags: 'contrato,análise', slaDeadline: hoursAgo(6), messages: [
    { id: 'm5', from: 'contact', content: 'Prezados, conforme conversamos, segue anexo a documentação solicitada para análise do contrato.', timestamp: hoursAgo(2), read: true, channel: 'email' },
    { id: 'm6', from: 'agent', content: 'Recebemos seus documentos. Vamos analisar e retornamos em breve.', timestamp: hoursAgo(1), read: true, channel: 'email' },
  ]},
  { id: '3', contactName: 'Ana Costa', contactAvatar: '', phone: '(21) 99876-5432', email: '', channel: 'instagram', lastMessage: 'Quanto custa uma consulta sobre divórcio?', lastMessageAt: hoursAgo(3), unread: 3, status: 'NOVA', assignedTo: '', clientLinked: '', leadId: '', tags: 'divórcio', slaDeadline: hoursAgo(2), messages: [
    { id: 'm7', from: 'contact', content: 'Olá! Vi o perfil de vocês e gostei. Quanto custa uma consulta sobre divórcio?', timestamp: hoursAgo(3), read: true, channel: 'instagram' },
  ]},
  { id: '4', contactName: 'Carlos Santos', contactAvatar: '', phone: '(31) 97765-4321', email: '', channel: 'whatsapp', lastMessage: 'Ok, aguardo o retorno. Obrigado!', lastMessageAt: hoursAgo(5), unread: 0, status: 'AGUARDANDO_CLIENTE', assignedTo: 'Dra. Juliana Costa', clientLinked: 'Carlos Santos', leadId: '', tags: 'consumidor', slaDeadline: hoursAgo(4), messages: [
    { id: 'm8', from: 'contact', content: 'Preciso de ajuda com um problema com a operadora de plano de saúde.', timestamp: hoursAgo(6), read: true, channel: 'whatsapp' },
    { id: 'm9', from: 'agent', content: 'Olá Carlos! Vou verificar seu caso. Você tem os documentos do plano em mãos?', timestamp: hoursAgo(5), read: true, channel: 'whatsapp' },
    { id: 'm10', from: 'contact', content: 'Sim, tenho tudo digitalizado.', timestamp: hoursAgo(5), read: true, channel: 'whatsapp' },
    { id: 'm11', from: 'agent', content: 'Ótimo! Pode me enviar os documentos por aqui mesmo? Vou analisar e já te dou um retorno.', timestamp: hoursAgo(5), read: true, channel: 'whatsapp' },
    { id: 'm12', from: 'contact', content: 'Ok, aguardo o retorno. Obrigado!', timestamp: hoursAgo(5), read: true, channel: 'whatsapp' },
  ]},
  { id: '5', contactName: 'Empresa XYZ', contactAvatar: '', phone: '', email: 'contato@xyz.com.br', channel: 'site', lastMessage: 'Precisamos de assessoria jurídica trabalhista urgente!', lastMessageAt: hoursAgo(1), unread: 1, status: 'NOVA', assignedTo: '', clientLinked: '', leadId: 'lead_5', tags: 'empresarial,trabalhista', slaDeadline: hoursAgo(0.5), messages: [
    { id: 'm13', from: 'contact', content: 'Bom dia. Precisamos de assessoria jurídica trabalhista urgente! Temos 50 funcionários e um ex-funcionário está processando a empresa.', timestamp: hoursAgo(1), read: true, channel: 'site' },
  ]},
  { id: '6', contactName: 'Roberto Almeida', contactAvatar: '', phone: '(41) 99988-7766', email: '', channel: 'chat', lastMessage: 'Sim, pode me ligar às 14h?', lastMessageAt: hoursAgo(4), unread: 0, status: 'RESOLVIDA', assignedTo: 'Dr. Paulo Oliveira', clientLinked: 'Roberto Almeida', leadId: '', tags: 'consultoria', slaDeadline: '', messages: [
    { id: 'm14', from: 'contact', content: 'Olá! Gostaria de agendar uma consulta sobre direito tributário.', timestamp: hoursAgo(5), read: true, channel: 'chat' },
    { id: 'm15', from: 'agent', content: 'Olá Roberto! Sou o Dr. Paulo. Podemos agendar para amanhã às 10h ou 14h. Qual horário é melhor para você?', timestamp: hoursAgo(4), read: true, channel: 'chat' },
    { id: 'm16', from: 'contact', content: 'Sim, pode me ligar às 14h?', timestamp: hoursAgo(4), read: true, channel: 'chat' },
    { id: 'm17', from: 'agent', content: 'Combinado! Ligarei amanhã às 14h. Obrigado!', timestamp: hoursAgo(4), read: true, channel: 'chat' },
  ]},
  { id: '7', contactName: 'Fernanda Lima', contactAvatar: '', phone: '(11) 96543-2198', email: '', channel: 'facebook', lastMessage: 'Tem experiência com causas previdenciárias?', lastMessageAt: hoursAgo(6), unread: 0, status: 'EM_ATENDIMENTO', assignedTo: 'Dra. Juliana Costa', clientLinked: '', leadId: '', tags: 'previdenciário', slaDeadline: hoursAgo(5), messages: [
    { id: 'm18', from: 'contact', content: 'Boa tarde! Tem experiência com causas previdenciárias?', timestamp: hoursAgo(6), read: true, channel: 'facebook' },
    { id: 'm19', from: 'agent', content: 'Boa tarde! Sim, temos vasta experiência na área previdenciária. Como podemos ajudar?', timestamp: hoursAgo(6), read: true, channel: 'facebook' },
  ]},
  { id: '8', contactName: 'Pedro Costa', contactAvatar: '', phone: '', email: 'pedro.costa@email.com', channel: 'email', lastMessage: 'Anexo a procuração assinada.', lastMessageAt: daysAgo(1), unread: 0, status: 'ARQUIVADA', assignedTo: 'Secretaria', clientLinked: '', leadId: '', tags: 'documentos', slaDeadline: '', messages: [
    { id: 'm20', from: 'contact', content: 'Conforme solicitado, anexo a procuração assinada.', timestamp: daysAgo(1), read: true, channel: 'email' },
    { id: 'm21', from: 'agent', content: 'Recebemos sua procuração. Vamos dar prosseguimento ao seu caso.', timestamp: daysAgo(1), read: true, channel: 'email' },
  ]},
  { id: '9', contactName: 'Lucas Martins', contactAvatar: '', phone: '(11) 98765-1234', email: '', channel: 'whatsapp', lastMessage: 'Estou sendo ameaçado, preciso de ajuda urgente!', lastMessageAt: minutesAgo(30), unread: 1, status: 'NOVA', assignedTo: '', clientLinked: '', leadId: 'lead_9', tags: 'urgente,penal', slaDeadline: minutesAgo(25), messages: [
    { id: 'm22', from: 'contact', content: 'Estou sendo ameaçado, preciso de ajuda urgente!', timestamp: minutesAgo(30), read: true, channel: 'whatsapp' },
  ]},
  { id: '10', contactName: 'Marina Duarte', contactAvatar: '', phone: '(21) 98877-6655', email: '', channel: 'whatsapp', lastMessage: 'Ok, muito obrigada pela atenção!', lastMessageAt: hoursAgo(8), unread: 0, status: 'RESOLVIDA', assignedTo: 'Dra. Fernanda Lima', clientLinked: 'Marina Duarte', leadId: '', tags: 'consumidor,saúde', slaDeadline: '', messages: [
    { id: 'm23', from: 'contact', content: 'Meu plano de saúde negou um exame. O que posso fazer?', timestamp: daysAgo(2), read: true, channel: 'whatsapp' },
    { id: 'm24', from: 'agent', content: 'Olá Marina! Infelizmente isso é comum. Vamos ingressar com uma ação para garantir seu direito. Você tem o contrato do plano?', timestamp: daysAgo(2), read: true, channel: 'whatsapp' },
    { id: 'm25', from: 'contact', content: 'Sim, tenho tudo.', timestamp: daysAgo(1), read: true, channel: 'whatsapp' },
    { id: 'm26', from: 'agent', content: 'Perfeito. Já preparei a documentação. Entrarei em contato para agendarmos a assinatura.', timestamp: hoursAgo(8), read: true, channel: 'whatsapp' },
    { id: 'm27', from: 'contact', content: 'Ok, muito obrigada pela atenção!', timestamp: hoursAgo(8), read: true, channel: 'whatsapp' },
  ]},
  { id: '11', contactName: 'Rafael Oliveira', contactAvatar: '', phone: '(31) 99665-4433', email: '', channel: 'instagram', lastMessage: 'Vocês atendem em BH?', lastMessageAt: hoursAgo(2), unread: 2, status: 'EM_ATENDIMENTO', assignedTo: 'Dr. Ricardo Santos', clientLinked: '', leadId: '', tags: 'atendimento', slaDeadline: hoursAgo(1), messages: [
    { id: 'm28', from: 'contact', content: 'Vocês atendem em BH?', timestamp: hoursAgo(2), read: true, channel: 'instagram' },
    { id: 'm29', from: 'agent', content: 'Olá! Sim, atendemos em todo o Brasil de forma virtual. Também temos parceiros presenciais em BH.', timestamp: hoursAgo(2), read: true, channel: 'instagram' },
  ]},
  { id: '12', contactName: 'TecSol ME', contactAvatar: '', phone: '', email: 'contato@tecsol.com', channel: 'site', lastMessage: 'Gostaria de um orçamento para consultoria tributária.', lastMessageAt: hoursAgo(12), unread: 0, status: 'AGUARDANDO_CLIENTE', assignedTo: 'Dr. Paulo Oliveira', clientLinked: '', leadId: 'lead_12', tags: 'tributário,orçamento', slaDeadline: hoursAgo(10), messages: [
    { id: 'm30', from: 'contact', content: 'Gostaria de um orçamento para consultoria tributária mensal.', timestamp: hoursAgo(12), read: true, channel: 'site' },
    { id: 'm31', from: 'agent', content: 'Olá! Obrigado pelo contato. Podemos marcar uma reunião para entender melhor suas necessidades e enviar uma proposta personalizada.', timestamp: hoursAgo(11), read: true, channel: 'site' },
  ]},
];

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'agora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return d.toLocaleDateString('pt-BR');
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function avatarColor(name: string): string {
  const colors = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function ConvStatusBadge({ status }: { status: ConvStatus }) {
  const cfg = STATUS_CONFIG[status];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>{cfg.label}</span>;
}

export default function Service() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [search, setSearch] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');

  const filtered = useMemo(() => {
    let list = [...conversations];
    const q = search.toLowerCase();
    if (q) list = list.filter(c => c.contactName.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q) || c.phone.includes(q));
    if (filterChannel) list = list.filter(c => c.channel === filterChannel);
    if (filterStatus) list = list.filter(c => c.status === filterStatus);
    list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    return list;
  }, [conversations, search, filterChannel, filterStatus]);

  const unreadCount = conversations.reduce((acc, c) => acc + c.unread, 0);

  function sendMessage() {
    if (!messageInput.trim() || !selectedConv) return;
    const msg: Message = { id: `m_${Date.now()}`, from: 'agent', content: messageInput, timestamp: new Date().toISOString(), read: true, channel: selectedConv.channel };
    setConversations(conversations.map(c => c.id === selectedConv.id ? { ...c, messages: [...c.messages, msg], lastMessage: messageInput, lastMessageAt: new Date().toISOString(), unread: 0 } : c));
    setSelectedConv({ ...selectedConv, messages: [...selectedConv.messages, msg], lastMessage: messageInput, lastMessageAt: new Date().toISOString(), unread: 0 });
    setMessageInput('');
  }

  function applyQuickReply(reply: QuickReply) {
    setMessageInput(reply.message);
    setShowQuickReplies(false);
  }

  function updateStatus(id: string, status: ConvStatus) {
    setConversations(conversations.map(c => c.id === id ? { ...c, status } : c));
    if (selectedConv?.id === id) setSelectedConv({ ...selectedConv, status });
  }

  function handleTransfer() {
    if (!selectedConv || !transferTarget) return;
    setConversations(conversations.map(c => c.id === selectedConv.id ? { ...c, assignedTo: transferTarget, status: 'AGUARDANDO_EQUIPE' } : c));
    setSelectedConv({ ...selectedConv, assignedTo: transferTarget, status: 'AGUARDANDO_EQUIPE' });
    setShowTransferModal(false);
    setTransferTarget('');
  }

  const stats = useMemo(() => ({
    total: conversations.length,
    novas: conversations.filter(c => c.status === 'NOVA').length,
    emAtendimento: conversations.filter(c => c.status === 'EM_ATENDIMENTO').length,
    aguardando: conversations.filter(c => c.status === 'AGUARDANDO_CLIENTE' || c.status === 'AGUARDANDO_EQUIPE').length,
  }), [conversations]);

  return (
    <div className="page" style={{ maxWidth: '100%', padding: 0 }}>
      <div style={{ display: 'flex', height: 'calc(100vh - var(--header-height))' }}>
        <div style={{ width: 380, flexShrink: 0, borderRight: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 18 }}>Atendimento</h2>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{unreadCount} não lidas</span>
              </div>
            </div>
            <div className="search-box" style={{ maxWidth: '100%' }}>
              <Search className="search-icon" size={16} />
              <input type="text" placeholder="Buscar conversas..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <div className="stat-card" style={{ flex: 1, padding: '8px 12px' }}>
                <div className="stat-label" style={{ fontSize: 10 }}>Novas</div>
                <div className="stat-value" style={{ fontSize: 18, color: '#3B82F6' }}>{stats.novas}</div>
              </div>
              <div className="stat-card" style={{ flex: 1, padding: '8px 12px' }}>
                <div className="stat-label" style={{ fontSize: 10 }}>Em Atend.</div>
                <div className="stat-value" style={{ fontSize: 18, color: '#10B981' }}>{stats.emAtendimento}</div>
              </div>
              <div className="stat-card" style={{ flex: 1, padding: '8px 12px' }}>
                <div className="stat-label" style={{ fontSize: 10 }}>Aguard.</div>
                <div className="stat-value" style={{ fontSize: 18, color: '#F59E0B' }}>{stats.aguardando}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              <select className="form-select" style={{ fontSize: 12, padding: '4px 8px', width: 'auto', flex: 1 }} value={filterChannel} onChange={e => setFilterChannel(e.target.value)}>
                <option value="">Todos Canais</option>
                {Object.entries(CHANNEL_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select className="form-select" style={{ fontSize: 12, padding: '4px 8px', width: 'auto', flex: 1 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Todos Status</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map(conv => {
              const ChanIcon = CHANNEL_CONFIG[conv.channel].icon;
              const isSelected = selectedConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  style={{ display: 'flex', gap: 12, padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-default)', background: isSelected ? 'var(--bg-hover)' : 'transparent', transition: 'all 0.15s' }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColor(conv.contactName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                      {getInitials(conv.contactName)}
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: CHANNEL_CONFIG[conv.channel].color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-card)' }}>
                      <ChanIcon size={8} style={{ color: '#fff' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{conv.contactName}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatDateTime(conv.lastMessageAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <ConvStatusBadge status={conv.status} />
                      {conv.unread > 0 && (
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: conv.unread > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: conv.unread > 0 ? 500 : 400 }}>
                      {conv.lastMessage}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)', fontSize: 13 }}>Nenhuma conversa encontrada.</div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
          {selectedConv ? (
            <>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarColor(selectedConv.contactName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {getInitials(selectedConv.contactName)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{selectedConv.contactName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {CHANNEL_CONFIG[selectedConv.channel].label}
                      {selectedConv.assignedTo && <span>• {selectedConv.assignedTo}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowTransferModal(true)} title="Transferir"><Users size={16} /></button>
                  <select
                    value={selectedConv.status}
                    onChange={e => updateStatus(selectedConv.id, e.target.value as ConvStatus)}
                    className="form-select"
                    style={{ fontSize: 12, padding: '4px 8px', width: 'auto' }}
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                {selectedConv.messages.map((msg, idx) => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'agent' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                    <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: msg.from === 'agent' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.from === 'agent' ? 'var(--gold-primary)' : 'var(--bg-card)', color: msg.from === 'agent' ? 'var(--text-inverse)' : 'var(--text-primary)', border: msg.from === 'agent' ? 'none' : '1px solid var(--border-default)', fontSize: 14, lineHeight: 1.5 }}>
                      <div>{msg.content}</div>
                      <div style={{ fontSize: 10, color: msg.from === 'agent' ? 'rgba(0,0,0,0.5)' : 'var(--text-tertiary)', textAlign: 'right', marginTop: 4 }}>
                        {formatTime(msg.timestamp)}
                        {msg.from === 'agent' && <span> ✓</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-default)', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ position: 'relative' }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => setShowQuickReplies(!showQuickReplies)} title="Respostas Rápidas"><CornerDownRight size={18} /></button>
                    {showQuickReplies && (
                      <>
                        <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 8, width: 300, background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', maxHeight: 300, overflowY: 'auto', zIndex: 10 }}>
                          <div style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-default)' }}>Respostas Rápidas</div>
                          {QUICK_REPLIES.map(qr => (
                            <button key={qr.id} onClick={() => applyQuickReply(qr)} style={{ display: 'block', width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--border-default)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13 }}>
                              <div style={{ fontWeight: 600, marginBottom: 2 }}>{qr.title}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{qr.message}</div>
                            </button>
                          ))}
                        </div>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 5 }} onClick={() => setShowQuickReplies(false)} />
                      </>
                    )}
                  </div>
                  <input
                    className="form-input"
                    style={{ flex: 1, borderRadius: 24, padding: '10px 16px' }}
                    placeholder="Digite sua mensagem..."
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  />
                  <button className="btn btn-primary" onClick={sendMessage} disabled={!messageInput.trim()} style={{ borderRadius: '50%', width: 42, height: 42, padding: 0 }}><Send size={18} /></button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
              <MessageSquare size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <h3 style={{ fontSize: 16, marginBottom: 8, color: 'var(--text-secondary)' }}>Selecione uma conversa</h3>
              <p style={{ fontSize: 13, margin: 0 }}>Escolha uma conversa à esquerda para iniciar o atendimento</p>
            </div>
          )}
        </div>
      </div>

      {showTransferModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowTransferModal(false)} />
          <div className="modal modal-sm">
            <div className="modal-header">
              <h3>Transferir Conversa</h3>
              <button className="modal-close" onClick={() => setShowTransferModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Transferir para:</label>
                <select className="form-select" value={transferTarget} onChange={e => setTransferTarget(e.target.value)}>
                  <option value="">Selecione</option>
                  {TEAM.filter(t => t !== selectedConv?.assignedTo).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleTransfer} disabled={!transferTarget}>Transferir</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
