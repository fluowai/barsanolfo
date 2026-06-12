export const STORAGE_KEYS = {
  AUTH_TOKEN: 'woojuris_auth_token',
  REFRESH_TOKEN: 'woojuris_refresh_token',
  USER: 'woojuris_user',
  THEME: 'woojuris_theme',
} as const;

export const API_BASE_URL = '';
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  LEADS: '/api/leads',
  LEADS_STATS: '/api/leads/stats',
  LEADS_CONVERT: '/api/leads/convert',
  LEADS_TRIAGE: '/api/leads/triage',
  CLIENTS: '/api/clients',
  CASES: '/api/cases',
  CASES_IMPORT: '/api/cases/import',
  DEADLINES: '/api/deadlines',
  TASKS: '/api/tasks',
  HEARINGS: '/api/hearings',
  DOCUMENTS: '/api/documents',
  CONTRACTS: '/api/contracts',
  FINANCIAL: '/api/financial',
  FINANCIAL_DASHBOARD: '/api/financial/dashboard',
  MARKETING: '/api/marketing',
  TEAM: '/api/team',
  NOTIFICATIONS: '/api/notifications',
  DATAJUD_SEARCH: '/api/datajud/search',
  DATAJUD_JURISPRUDENCE: '/api/datajud/jurisprudence',
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',
  WHATSAPP: '/api/whatsapp',
  WHATSAPP_INSTANCES: '/api/instances',
  AI_ANALYZE: '/api/ai/analyze-case',
  AI_CONFIG: '/api/ai-config',
  PETITION_CONFIG: '/api/petition-config',
  PETITIONS: '/api/petitions',
  PETITION_TEMPLATES: '/api/petition-templates',
} as const;

export const LEAD_STATUS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Novo', color: '#3B82F6' },
  AWAITING_CONTACT: { label: 'Aguardando Contato', color: '#F59E0B' },
  TRIAGE: { label: 'Em Triagem', color: '#8B5CF6' },
  AWAITING_DOCS: { label: 'Aguardando Documentos', color: '#06B6D4' },
  SCHEDULED: { label: 'Agendado', color: '#EC4899' },
  MEETING_DONE: { label: 'Reunião Realizada', color: '#F97316' },
  PROPOSAL_SENT: { label: 'Proposta Enviada', color: '#E4C23A' },
  CONTRACT_SENT: { label: 'Contrato Enviado', color: '#65A30D' },
  PAYMENT_PENDING: { label: 'Pagamento Pendente', color: '#D97706' },
  CLOSED: { label: 'Fechado', color: '#10B981' },
  LOST: { label: 'Perdido', color: '#EF4444' },
  DISQUALIFIED: { label: 'Desqualificado', color: '#6B7280' },
};

export const LEAD_SOURCES = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'GOOGLE', label: 'Google' },
  { value: 'SITE', label: 'Site' },
  { value: 'INDICATION', label: 'Indicação' },
  { value: 'PAID_TRAFFIC', label: 'Tráfego Pago' },
  { value: 'ORGANIC', label: 'Orgânico' },
  { value: 'EVENT', label: 'Evento' },
  { value: 'COUNTER', label: 'Balcão' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'MANUAL', label: 'Manual' },
];

export const LEGAL_AREAS = [
  { value: 'CRIMINAL', label: 'Direito Penal' },
  { value: 'FAMILY', label: 'Direito de Família' },
  { value: 'LABOR', label: 'Direito do Trabalho' },
  { value: 'SOCIAL_SECURITY', label: 'Direito Previdenciário' },
  { value: 'CIVIL', label: 'Direito Civil' },
  { value: 'BUSINESS', label: 'Direito Empresarial' },
  { value: 'CONSUMER', label: 'Direito do Consumidor' },
  { value: 'TAX', label: 'Direito Tributário' },
  { value: 'REAL_ESTATE', label: 'Direito Imobiliário' },
  { value: 'ADMINISTRATIVE', label: 'Direito Administrativo' },
];

export const URGENCY_LEVELS: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Baixa', color: '#6B7280' },
  NORMAL: { label: 'Normal', color: '#3B82F6' },
  HIGH: { label: 'Alta', color: '#F59E0B' },
  URGENT: { label: 'Urgente', color: '#EF4444' },
};

export const CASE_STATUS: Record<string, { label: string; color: string }> = {
  ANALYSIS: { label: 'Em Análise', color: '#8B5CF6' },
  ACTIVE: { label: 'Ativo', color: '#10B981' },
  AWAITING_DISTRIBUTION: { label: 'Aguardando Distribuição', color: '#F59E0B' },
  IN_PROGRESS: { label: 'Em Andamento', color: '#3B82F6' },
  AWAITING_HEARING: { label: 'Aguardando Audiência', color: '#F97316' },
  AWAITING_DECISION: { label: 'Aguardando Decisão', color: '#06B6D4' },
  IN_APPEAL: { label: 'Em Recurso', color: '#EC4899' },
  IN_EXECUTION: { label: 'Em Execução', color: '#65A30D' },
  SUSPENDED: { label: 'Suspenso', color: '#D97706' },
  CLOSED: { label: 'Encerrado', color: '#EF4444' },
  ARCHIVED: { label: 'Arquivado', color: '#6B7280' },
};

export const CASE_PHASES = [
  { value: 'PRE_PROCEDURAL', label: 'Pré-Processual' },
  { value: 'INITIAL', label: 'Inicial' },
  { value: 'DEFENSE', label: 'Contestação' },
  { value: 'INSTRUCTION', label: 'Instrução' },
  { value: 'HEARING', label: 'Audiência' },
  { value: 'SENTENCE', label: 'Sentença' },
  { value: 'APPEAL', label: 'Recurso' },
  { value: 'ENFORCEMENT', label: 'Cumprimento de Sentença' },
  { value: 'EXECUTION', label: 'Execução' },
  { value: 'ARCHIVED', label: 'Arquivado' },
];

export const DEADLINE_TYPES = [
  { value: 'CONTESTATION', label: 'Contestação' },
  { value: 'APPEAL', label: 'Recurso' },
  { value: 'MANIFESTATION', label: 'Manifestação' },
  { value: 'EMBARGS', label: 'Embargos' },
  { value: 'INTERLOCUTORY_APPEAL', label: 'Agravo' },
  { value: 'APPELLATE', label: 'Apelação' },
  { value: 'COUNTER_ARGUMENTS', label: 'Contrarrazões' },
  { value: 'COMPLIANCE', label: 'Cumprimento de Determinação' },
  { value: 'DOCUMENT_JOINDER', label: 'Juntada de Documentos' },
  { value: 'HEARING', label: 'Audiência' },
  { value: 'ADMINISTRATIVE', label: 'Prazo Administrativo' },
  { value: 'OTHER', label: 'Outro' },
];

export const DEADLINE_STATUS: Record<string, { label: string; color: string }> = {
  NOT_STARTED: { label: 'Não Iniciado', color: '#6B7280' },
  IN_PRODUCTION: { label: 'Em Produção', color: '#3B82F6' },
  IN_REVIEW: { label: 'Em Revisão', color: '#8B5CF6' },
  AWAITING_PROTOCOL: { label: 'Aguardando Protocolo', color: '#F59E0B' },
  FILED: { label: 'Protocolado', color: '#06B6D4' },
  COMPLETED: { label: 'Concluído', color: '#10B981' },
  MISSED: { label: 'Perdido', color: '#EF4444' },
  CANCELLED: { label: 'Cancelado', color: '#6B7280' },
};

export const TASK_STATUS: Record<string, { label: string; color: string }> = {
  TODO: { label: 'A Fazer', color: '#6B7280' },
  IN_PROGRESS: { label: 'Em Andamento', color: '#3B82F6' },
  AWAITING_CLIENT: { label: 'Aguardando Cliente', color: '#F59E0B' },
  AWAITING_DOCUMENT: { label: 'Aguardando Documento', color: '#D97706' },
  AWAITING_LAWYER: { label: 'Aguardando Advogado', color: '#8B5CF6' },
  IN_REVIEW: { label: 'Em Revisão', color: '#EC4899' },
  READY_FOR_PROTOCOL: { label: 'Pronto para Protocolo', color: '#06B6D4' },
  FILED: { label: 'Protocolado', color: '#65A30D' },
  COMPLETED: { label: 'Concluído', color: '#10B981' },
  CANCELLED: { label: 'Cancelado', color: '#6B7280' },
};

export const TASK_PRIORITY: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Baixa', color: '#6B7280' },
  MEDIUM: { label: 'Média', color: '#3B82F6' },
  HIGH: { label: 'Alta', color: '#F59E0B' },
  URGENT: { label: 'Urgente', color: '#EF4444' },
  CRITICAL: { label: 'Crítica', color: '#DC2626' },
};

export const CLIENT_STATUS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Ativo', color: '#10B981' },
  INACTIVE: { label: 'Inativo', color: '#6B7280' },
  ONBOARDING: { label: 'Em Onboarding', color: '#3B82F6' },
  AWAITING_DOCS: { label: 'Aguardando Documentos', color: '#F59E0B' },
  OVERDUE: { label: 'Inadimplente', color: '#EF4444' },
  CLOSED: { label: 'Encerrado', color: '#6B7280' },
  ARCHIVED: { label: 'Arquivado', color: '#374151' },
};

export const HEARING_STATUS: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: 'Agendado', color: '#3B82F6' },
  CONFIRMED: { label: 'Confirmado', color: '#10B981' },
  RESCHEDULED: { label: 'Remarcado', color: '#F59E0B' },
  COMPLETED: { label: 'Realizado', color: '#10B981' },
  CANCELLED: { label: 'Cancelado', color: '#EF4444' },
  NO_SHOW: { label: 'Não Compareceu', color: '#DC2626' },
};

export const HEARING_TYPES = [
  { value: 'HEARING', label: 'Audiência' },
  { value: 'CLIENT_MEETING', label: 'Reunião com Cliente' },
  { value: 'INTERNAL_MEETING', label: 'Reunião Interna' },
  { value: 'JUDGMENT_SESSION', label: 'Sessão de Julgamento' },
  { value: 'ORAL_ARGUMENT', label: 'Sustentação Oral' },
  { value: 'DILIGENCE', label: 'Diligência' },
  { value: 'DISPATCH', label: 'Despacho' },
  { value: 'PROTOCOL', label: 'Protocolo' },
  { value: 'DEADLINE', label: 'Prazo' },
  { value: 'COMMERCIAL', label: 'Atendimento Comercial' },
  { value: 'VIDEO_CALL', label: 'Videoconferência' },
];

export const DOCUMENT_CATEGORIES = [
  { value: 'PERSONAL_DOC', label: 'Documento Pessoal' },
  { value: 'PROCURATION', label: 'Procuração' },
  { value: 'CONTRACT', label: 'Contrato de Honorários' },
  { value: 'DECLARATION', label: 'Declaração' },
  { value: 'INITIAL_PETITION', label: 'Petição Inicial' },
  { value: 'DEFENSE', label: 'Contestação' },
  { value: 'APPEAL', label: 'Recurso' },
  { value: 'DECISION', label: 'Decisão' },
  { value: 'SENTENCE', label: 'Sentença' },
  { value: 'RULING', label: 'Acórdão' },
  { value: 'RECEIPT', label: 'Comprovante' },
  { value: 'EVIDENCE', label: 'Provas' },
  { value: 'AUDIO', label: 'Áudio' },
  { value: 'IMAGE', label: 'Imagem' },
  { value: 'VIDEO', label: 'Vídeo' },
  { value: 'BO', label: 'Boletim de Ocorrência' },
  { value: 'SUMMONS', label: 'Intimação' },
  { value: 'PUBLICATION', label: 'Publicação' },
  { value: 'COSTS_GUIDE', label: 'Guia de Custas' },
  { value: 'INVOICE', label: 'Nota Fiscal' },
  { value: 'OTHER', label: 'Outros' },
];

export const CONTRACT_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Rascunho', color: '#6B7280' },
  GENERATED: { label: 'Gerado', color: '#3B82F6' },
  SENT: { label: 'Enviado', color: '#F59E0B' },
  VIEWED: { label: 'Visualizado', color: '#8B5CF6' },
  SIGNED: { label: 'Assinado', color: '#10B981' },
  REJECTED: { label: 'Recusado', color: '#EF4444' },
  EXPIRED: { label: 'Vencido', color: '#6B7280' },
  CANCELLED: { label: 'Cancelado', color: '#6B7280' },
};

export const CONTRACT_TYPES = [
  { value: 'FIXED_FEE', label: 'Honorários Fixos' },
  { value: 'CONTINGENCY_FEE', label: 'Honorários de Êxito' },
  { value: 'MIXED', label: 'Misto' },
  { value: 'CONSULTATION', label: 'Consulta' },
  { value: 'RECURRING', label: 'Recorrente' },
];

export const FINANCIAL_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: '#F59E0B' },
  PAID: { label: 'Pago', color: '#10B981' },
  PARTIALLY_PAID: { label: 'Parcialmente Pago', color: '#8B5CF6' },
  OVERDUE: { label: 'Vencido', color: '#EF4444' },
  CANCELLED: { label: 'Cancelado', color: '#6B7280' },
  IN_COLLECTION: { label: 'Em Cobrança', color: '#DC2626' },
};

export const INCOME_CATEGORIES = [
  { value: 'INITIAL_FEES', label: 'Honorários Iniciais' },
  { value: 'MONTHLY_FEES', label: 'Honorários Mensais' },
  { value: 'CONTINGENCY_FEES', label: 'Honorários de Êxito' },
  { value: 'CONSULTATION', label: 'Consulta' },
  { value: 'AGREEMENT', label: 'Acordo' },
  { value: 'RECURRENCE', label: 'Recorrência' },
  { value: 'OTHER_INCOME', label: 'Outros' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'COSTS', label: 'Custas' },
  { value: 'DILIGENCE', label: 'Diligência' },
  { value: 'CORRESPONDENT', label: 'Correspondente' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'TAXES', label: 'Impostos' },
  { value: 'PAYROLL', label: 'Folha' },
  { value: 'RENT', label: 'Aluguel' },
  { value: 'TRAVEL', label: 'Deslocamento' },
  { value: 'CARTORIO', label: 'Cartório' },
  { value: 'OTHER_EXPENSE', label: 'Outros' },
];

export const PAYMENT_METHODS = [
  { value: 'PIX', label: 'Pix' },
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'TRANSFER', label: 'Transferência' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'DEPOSIT', label: 'Depósito' },
];

export const CONVERSATION_STATUS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nova', color: '#3B82F6' },
  IN_PROGRESS: { label: 'Em Atendimento', color: '#F59E0B' },
  AWAITING_CLIENT: { label: 'Aguardando Cliente', color: '#8B5CF6' },
  AWAITING_TEAM: { label: 'Aguardando Equipe', color: '#EC4899' },
  RESOLVED: { label: 'Resolvida', color: '#10B981' },
  ARCHIVED: { label: 'Arquivada', color: '#6B7280' },
};

export const AUTOMATION_TRIGGERS = [
  { value: 'LEAD_CREATED', label: 'Lead Criado' },
  { value: 'LEAD_URGENT', label: 'Lead Urgente' },
  { value: 'PROPOSAL_SENT', label: 'Proposta Enviada' },
  { value: 'CONTRACT_SIGNED', label: 'Contrato Assinado' },
  { value: 'CLIENT_CREATED', label: 'Cliente Criado' },
  { value: 'DEADLINE_APPROACHING', label: 'Prazo Próximo' },
  { value: 'DEADLINE_OVERDUE', label: 'Prazo Atrasado' },
  { value: 'INVOICE_OVERDUE', label: 'Parcela Vencida' },
  { value: 'CLIENT_OVERDUE', label: 'Cliente Inadimplente' },
  { value: 'DOCUMENT_REJECTED', label: 'Documento Rejeitado' },
  { value: 'HEARING_SCHEDULED', label: 'Audiência Marcada' },
  { value: 'CASE_INACTIVE', label: 'Processo Sem Movimentação' },
  { value: 'CLIENT_INACTIVE', label: 'Cliente Sem Atualização' },
];

export const AUTOMATION_ACTIONS = [
  { value: 'CREATE_TASK', label: 'Criar Tarefa' },
  { value: 'NOTIFY_USER', label: 'Notificar Usuário' },
  { value: 'UPDATE_STATUS', label: 'Atualizar Status' },
  { value: 'SEND_MESSAGE', label: 'Enviar Mensagem' },
  { value: 'CREATE_REMINDER', label: 'Criar Lembrete' },
  { value: 'UPDATE_FIELD', label: 'Atualizar Campo' },
];

export const NOTIFICATION_TYPES: Record<string, { label: string; icon: string }> = {
  DEADLINE: { label: 'Prazo', icon: 'Calendar' },
  LEAD_NEW: { label: 'Novo Lead', icon: 'UserPlus' },
  LEAD_URGENT: { label: 'Lead Urgente', icon: 'AlertTriangle' },
  CLIENT_RESPONDED: { label: 'Cliente Respondeu', icon: 'MessageSquare' },
  CONTRACT_SIGNED: { label: 'Contrato Assinado', icon: 'FileSignature' },
  PAYMENT_RECEIVED: { label: 'Pagamento Recebido', icon: 'DollarSign' },
  INVOICE_OVERDUE: { label: 'Parcela Vencida', icon: 'AlertCircle' },
  HEARING_UPCOMING: { label: 'Audiência Próxima', icon: 'Video' },
  TASK_ASSIGNED: { label: 'Tarefa Atribuída', icon: 'CheckSquare' },
  TASK_OVERDUE: { label: 'Tarefa Atrasada', icon: 'Clock' },
  DOCUMENT_SENT: { label: 'Documento Enviado', icon: 'FileText' },
  DOCUMENT_REJECTED: { label: 'Documento Rejeitado', icon: 'XCircle' },
  CASE_UPDATED: { label: 'Processo Atualizado', icon: 'Scale' },
};
