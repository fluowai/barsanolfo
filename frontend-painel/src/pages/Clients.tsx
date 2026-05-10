import { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Edit, Trash2, Eye, Phone, Mail, FileText,
  Calendar, X, MapPin, User, Briefcase, Building2, Tag, Clock,
  CheckCircle, XCircle, AlertTriangle, DollarSign, FileSpreadsheet,
  MessageSquare, ListChecks, History, Upload, Download, ChevronDown,
  ChevronRight, Shield, Hash, Cake, HeartHandshake, GraduationCap,
  Globe, Star, ArrowUpRight, MoreHorizontal, Filter, UserPlus,
  Gavel, BookOpen, ScrollText, Receipt, TrendingUp, PiggyBank,
  AlertCircle, Loader2, ChevronLeft, ChevronFirst, Send
} from 'lucide-react';

interface ClientTag {
  id: string;
  name: string;
  color: string;
}

interface ClientCase {
  id: string;
  number: string;
  title: string;
  type: string;
  status: string;
  value?: number;
  court?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientDocument {
  id: string;
  name: string;
  category: string;
  status: string;
  size?: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface ClientContract {
  id: string;
  title: string;
  description?: string;
  value: number;
  startDate: string;
  endDate?: string;
  status: string;
  type: string;
}

interface ClientFinancial {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  transactions: ClientTransaction[];
}

interface ClientTransaction {
  id: string;
  description: string;
  value: number;
  type: 'income' | 'expense';
  status: 'paid' | 'pending' | 'overdue';
  date: string;
  category: string;
}

interface ClientTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
  createdAt: string;
}

interface ClientActivity {
  id: string;
  type: string;
  description: string;
  author: string;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  type: 'PF' | 'PJ';
  email: string;
  phone: string;
  whatsapp?: string;
  cpfCnpj: string;
  rg?: string;
  birthDate?: string;
  maritalStatus?: string;
  profession?: string;
  address?: string;
  city?: string;
  state?: string;
  notes?: string;
  tags: ClientTag[];
  status: 'active' | 'inactive' | 'overdue' | 'onboarding' | 'closed';
  responsibleName: string;
  responsibleId?: string;
  lawyerName?: string;
  lawyerId?: string;
  createdAt: string;
  updatedAt: string;
  cases: ClientCase[];
  documents: ClientDocument[];
  contracts: ClientContract[];
  financial: ClientFinancial;
  tasks: ClientTask[];
  activities: ClientActivity[];
}

interface ClientFormData {
  name: string;
  type: 'PF' | 'PJ';
  email: string;
  phone: string;
  whatsapp: string;
  cpfCnpj: string;
  rg: string;
  birthDate: string;
  maritalStatus: string;
  profession: string;
  address: string;
  city: string;
  state: string;
  notes: string;
  tags: string;
  responsibleName: string;
  lawyerName: string;
}

const CLIENT_STATUSES: Record<string, { label: string; color: string; bgClass: string }> = {
  active: { label: 'Ativo', color: '#10B981', bgClass: 'badge-green' },
  inactive: { label: 'Inativo', color: '#6B7280', bgClass: 'badge-default' },
  overdue: { label: 'Inadimplente', color: '#EF4444', bgClass: 'badge-red' },
  onboarding: { label: 'Em Onboarding', color: '#F59E0B', bgClass: 'badge-orange' },
  closed: { label: 'Encerrado', color: '#6B7280', bgClass: 'badge-default' },
};

const TEAM_MEMBERS = [
  { id: '1', name: 'Dra. Fernanda Lima' },
  { id: '2', name: 'Dr. Ricardo Santos' },
  { id: '3', name: 'Dra. Juliana Costa' },
  { id: '4', name: 'Dr. Paulo Oliveira' },
  { id: '5', name: 'Dra. Mariana Torres' },
  { id: '6', name: 'Dr. Eduardo Martins' },
];

const MARITAL_STATUSES = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'];
const BRAZILIAN_STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const avatarColors = [
  '#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626', '#DB2777',
  '#0891B2', '#4F46E5', '#65A30D', '#C026D3', '#0D9488', '#EA580C',
];

const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const generateMockClients = (): Client[] => [
  {
    id: '1', name: 'Ana Costa Silva', type: 'PF', email: 'ana.costa@email.com',
    phone: '(11) 98765-4321', whatsapp: '(11) 98765-4321', cpfCnpj: '123.456.789-00',
    rg: '12.345.678-9', birthDate: '1985-06-15', maritalStatus: 'Casado(a)',
    profession: 'Médica', address: 'Av. Paulista, 1000', city: 'São Paulo', state: 'SP',
    notes: 'Cliente indica outros médicos. Preferência por atendimento presencial.',
    tags: [{ id: 't1', name: 'Premium', color: '#E4C23A' }, { id: 't2', name: 'Indicador', color: '#10B981' }],
    status: 'active', responsibleName: 'Dra. Fernanda Lima', responsibleId: '1',
    lawyerName: 'Dr. Ricardo Santos', lawyerId: '2',
    createdAt: '2025-08-10T09:00:00', updatedAt: '2026-05-09T14:00:00',
    cases: [
      { id: 'c1', number: '0001234-56.2026.8.26.0100', title: 'Ação de Indenização - Erro Médico', type: 'Cível', status: 'active', value: 150000, court: 'TJSP', assignedTo: 'Dr. Ricardo Santos', createdAt: '2026-01-15T10:00:00', updatedAt: '2026-05-08T16:00:00' },
      { id: 'c2', number: '0005678-90.2026.8.26.0100', title: 'Revisão de Contrato de Plano de Saúde', type: 'Consumidor', status: 'active', value: 45000, court: 'TJSP', assignedTo: 'Dr. Ricardo Santos', createdAt: '2026-03-20T11:00:00', updatedAt: '2026-05-05T09:00:00' },
    ],
    documents: [
      { id: 'd1', name: 'RG.pdf', category: 'Documento Pessoal', status: 'verified', size: '2.3 MB', uploadedAt: '2026-01-15T10:30:00', uploadedBy: 'Ana Costa' },
      { id: 'd2', name: 'CPF.pdf', category: 'Documento Pessoal', status: 'verified', size: '1.1 MB', uploadedAt: '2026-01-15T10:31:00', uploadedBy: 'Ana Costa' },
      { id: 'd3', name: 'Contrato_Social.pdf', category: 'Contrato', status: 'pending', size: '4.5 MB', uploadedAt: '2026-03-20T14:00:00', uploadedBy: 'Dra. Fernanda Lima' },
    ],
    contracts: [
      { id: 'ct1', title: 'Honorários Advocatícios - Indenização', value: 15000, startDate: '2026-01-15', status: 'active', type: 'Sucesso' },
      { id: 'ct2', title: 'Assessoria Mensal - Pessoa Física', value: 1200, startDate: '2026-02-01', status: 'active', type: 'Mensal' },
    ],
    financial: {
      totalPaid: 15000, totalPending: 2400, totalOverdue: 0,
      transactions: [
        { id: 'f1', description: 'Sinal - Honorários Indenização', value: 5000, type: 'income', status: 'paid', date: '2026-01-20', category: 'Honorários' },
        { id: 'f2', description: 'Mensalidade Fev/2026', value: 1200, type: 'income', status: 'paid', date: '2026-02-05', category: 'Mensalidade' },
        { id: 'f3', description: 'Mensalidade Mar/2026', value: 1200, type: 'income', status: 'paid', date: '2026-03-05', category: 'Mensalidade' },
        { id: 'f4', description: 'Mensalidade Abr/2026', value: 1200, type: 'income', status: 'pending', date: '2026-04-05', category: 'Mensalidade' },
        { id: 'f5', description: 'Mensalidade Mai/2026', value: 1200, type: 'income', status: 'pending', date: '2026-05-05', category: 'Mensalidade' },
      ]
    },
    tasks: [
      { id: 'tk1', title: 'Revisar petição inicial', description: 'Verificar documentos anexados', status: 'in_progress', priority: 'high', dueDate: '2026-05-15', assignedTo: 'Dr. Ricardo Santos', createdAt: '2026-05-08T16:00:00' },
      { id: 'tk2', title: 'Agendar reunião com cliente', description: 'Discutir andamento do processo', status: 'pending', priority: 'medium', dueDate: '2026-05-20', assignedTo: 'Dra. Fernanda Lima', createdAt: '2026-05-09T10:00:00' },
    ],
    activities: [
      { id: 'a1', type: 'case_created', description: 'Processo 0001234-56.2026.8.26.0100 foi criado', author: 'Sistema', createdAt: '2026-01-15T10:00:00' },
      { id: 'a2', type: 'document_uploaded', description: 'RG.pdf foi enviado', author: 'Ana Costa', createdAt: '2026-01-15T10:30:00' },
      { id: 'a3', type: 'contract_signed', description: 'Contrato de Honorários assinado', author: 'Ana Costa', createdAt: '2026-01-15T11:00:00' },
      { id: 'a4', type: 'payment_received', description: 'Pagamento de R$ 5.000 recebido', author: 'Sistema', createdAt: '2026-01-20T09:00:00' },
      { id: 'a5', type: 'status_change', description: 'Status alterado para Ativo', author: 'Dra. Fernanda Lima', createdAt: '2026-01-20T15:00:00' },
    ]
  },
  {
    id: '2', name: 'Roberto Almeida', type: 'PF', email: 'roberto.almeida@email.com',
    phone: '(21) 99876-5432', cpfCnpj: '234.567.890-11', rg: '23.456.789-0',
    birthDate: '1978-11-22', maritalStatus: 'Divorciado(a)', profession: 'Empresário',
    address: 'Rua das Flores, 500', city: 'Rio de Janeiro', state: 'RJ',
    notes: 'Cliente de alto poder aquisitivo. Prefere contato por WhatsApp.',
    tags: [{ id: 't3', name: 'VIP', color: '#E4C23A' }],
    status: 'active', responsibleName: 'Dr. Ricardo Santos', responsibleId: '2',
    lawyerName: 'Dra. Fernanda Lima', lawyerId: '1',
    createdAt: '2025-09-05T08:30:00', updatedAt: '2026-05-08T11:00:00',
    cases: [
      { id: 'c3', number: '0009012-34.2026.8.19.0001', title: 'Ação de Cobrança', type: 'Cível', status: 'active', value: 350000, court: 'TJRJ', assignedTo: 'Dra. Fernanda Lima', createdAt: '2026-02-10T09:00:00', updatedAt: '2026-05-08T11:00:00' },
    ],
    documents: [
      { id: 'd4', name: 'CNH.pdf', category: 'Documento Pessoal', status: 'verified', size: '1.8 MB', uploadedAt: '2026-02-10T10:00:00', uploadedBy: 'Roberto Almeida' },
    ],
    contracts: [
      { id: 'ct3', title: 'Honorários Advocatícios - Cobrança', value: 35000, startDate: '2026-02-10', status: 'active', type: 'Sucesso' },
    ],
    financial: {
      totalPaid: 10000, totalPending: 25000, totalOverdue: 0,
      transactions: [
        { id: 'f6', description: 'Sinal - Honorários Cobrança', value: 10000, type: 'income', status: 'paid', date: '2026-02-15', category: 'Honorários' },
      ]
    },
    tasks: [], activities: [
      { id: 'a6', type: 'case_created', description: 'Processo 0009012-34.2026.8.19.0001 criado', author: 'Sistema', createdAt: '2026-02-10T09:00:00' },
    ]
  },
  {
    id: '3', name: 'Empresa Alfa Ltda', type: 'PJ', email: 'contato@alfa.com.br',
    phone: '(11) 3456-7890', cpfCnpj: '12.345.678/0001-90',
    address: 'Av. Brigadeiro Faria Lima, 2000', city: 'São Paulo', state: 'SP',
    notes: 'Empresa de tecnologia. 50 funcionários.',
    tags: [{ id: 't4', name: 'Empresarial', color: '#3B82F6' }, { id: 't5', name: 'Tecnologia', color: '#8B5CF6' }],
    status: 'active', responsibleName: 'Dra. Juliana Costa', responsibleId: '3',
    lawyerName: 'Dr. Paulo Oliveira', lawyerId: '4',
    createdAt: '2024-03-01T09:00:00', updatedAt: '2026-05-10T08:00:00',
    cases: [
      { id: 'c4', number: '0003456-78.2026.8.26.0100', title: 'Revisão de Contratos Comerciais', type: 'Empresarial', status: 'active', value: 80000, court: 'TJSP', assignedTo: 'Dr. Paulo Oliveira', createdAt: '2026-01-05T10:00:00', updatedAt: '2026-05-10T08:00:00' },
      { id: 'c5', number: '0007890-12.2026.8.26.0100', title: 'Defesa em Ação Trabalhista', type: 'Trabalhista', status: 'active', value: 120000, court: 'TRT-2', assignedTo: 'Dra. Juliana Costa', createdAt: '2026-03-15T09:00:00', updatedAt: '2026-05-09T16:00:00' },
    ],
    documents: [
      { id: 'd5', name: 'Contrato_Social_Alfa.pdf', category: 'Documento Societário', status: 'verified', size: '3.2 MB', uploadedAt: '2024-03-01T10:00:00', uploadedBy: 'Admin' },
      { id: 'd6', name: 'CNPJ_Cartao.pdf', category: 'Documento Fiscal', status: 'verified', size: '0.5 MB', uploadedAt: '2024-03-01T10:05:00', uploadedBy: 'Admin' },
    ],
    contracts: [
      { id: 'ct4', title: 'Assessoria Jurídica Empresarial Mensal', value: 5000, startDate: '2024-03-01', status: 'active', type: 'Mensal' },
    ],
    financial: {
      totalPaid: 125000, totalPending: 10000, totalOverdue: 0,
      transactions: [
        { id: 'f7', description: 'Mensalidade Mar/2024', value: 5000, type: 'income', status: 'paid', date: '2024-03-05', category: 'Mensalidade' },
        { id: 'f8', description: 'Mensalidade Abr/2026', value: 5000, type: 'income', status: 'pending', date: '2026-04-05', category: 'Mensalidade' },
        { id: 'f9', description: 'Mensalidade Mai/2026', value: 5000, type: 'income', status: 'pending', date: '2026-05-05', category: 'Mensalidade' },
      ]
    },
    tasks: [
      { id: 'tk3', title: 'Preparar defesa trabalhista', status: 'in_progress', priority: 'high', dueDate: '2026-05-18', assignedTo: 'Dra. Juliana Costa', createdAt: '2026-05-09T16:00:00' },
    ],
    activities: [
      { id: 'a7', type: 'case_created', description: 'Processo 0003456-78.2026.8.26.0100 criado', author: 'Sistema', createdAt: '2026-01-05T10:00:00' },
      { id: 'a8', type: 'contract_signed', description: 'Contrato de Assessoria Mensal renovado', author: 'Empresa Alfa', createdAt: '2026-01-31T17:00:00' },
    ]
  },
  {
    id: '4', name: 'Maria Santos Oliveira', type: 'PF', email: 'maria.santos@email.com',
    phone: '(31) 98765-1234', whatsapp: '(31) 98765-1234', cpfCnpj: '345.678.901-22',
    rg: '34.567.890-1', birthDate: '1990-03-08', maritalStatus: 'Casado(a)',
    profession: 'Professora', address: 'Rua da Bahia, 300', city: 'Belo Horizonte', state: 'MG',
    notes: 'Cliente em dificuldades financeiras. Necessário renegociar.',
    tags: [{ id: 't6', name: 'Renegociação', color: '#EF4444' }],
    status: 'overdue', responsibleName: 'Dra. Fernanda Lima', responsibleId: '1',
    lawyerName: 'Dra. Fernanda Lima', lawyerId: '1',
    createdAt: '2024-06-15T14:00:00', updatedAt: '2026-05-01T09:00:00',
    cases: [
      { id: 'c6', number: '0002345-67.2026.8.13.0001', title: 'Ação de Divórcio Consensual', type: 'Família', status: 'active', value: 20000, court: 'TJMG', assignedTo: 'Dra. Fernanda Lima', createdAt: '2026-01-20T14:00:00', updatedAt: '2026-04-28T10:00:00' },
    ],
    documents: [
      { id: 'd7', name: 'RG_Maria.pdf', category: 'Documento Pessoal', status: 'verified', size: '1.5 MB', uploadedAt: '2026-01-20T15:00:00', uploadedBy: 'Maria Santos' },
    ],
    contracts: [
      { id: 'ct5', title: 'Honorários - Divórcio', value: 5000, startDate: '2026-01-20', status: 'active', type: 'Parcelado' },
    ],
    financial: {
      totalPaid: 1000, totalPending: 1500, totalOverdue: 2500,
      transactions: [
        { id: 'f10', description: '1ª Parcela - Honorários', value: 1000, type: 'income', status: 'paid', date: '2026-02-05', category: 'Honorários' },
        { id: 'f11', description: '2ª Parcela - Honorários', value: 1000, type: 'income', status: 'overdue', date: '2026-03-05', category: 'Honorários' },
        { id: 'f12', description: '3ª Parcela - Honorários', value: 1000, type: 'income', status: 'overdue', date: '2026-04-05', category: 'Honorários' },
        { id: 'f13', description: 'Custas Processuais', value: 1500, type: 'expense', status: 'pending', date: '2026-04-10', category: 'Custas' },
      ]
    },
    tasks: [
      { id: 'tk4', title: 'Negociar parcelas em atraso', status: 'pending', priority: 'high', dueDate: '2026-05-12', assignedTo: 'Dra. Fernanda Lima', createdAt: '2026-05-01T09:00:00' },
    ],
    activities: [
      { id: 'a9', type: 'payment_overdue', description: 'Parcela de honorários em atraso (30 dias)', author: 'Sistema', createdAt: '2026-04-05T00:00:00' },
    ]
  },
  {
    id: '5', name: 'Dr. Carlos Pereira', type: 'PF', email: 'carlos.pereira@email.com',
    phone: '(41) 99988-7766', cpfCnpj: '456.789.012-33',
    birthDate: '1965-09-12', maritalStatus: 'Casado(a)', profession: 'Advogado',
    address: 'Rua XV de Novembro, 800', city: 'Curitiba', state: 'PR',
    notes: 'Colega de profissão. Desconto especial combinado.',
    tags: [{ id: 't7', name: 'Parceiro', color: '#8B5CF6' }, { id: 't8', name: 'Desconto', color: '#10B981' }],
    status: 'active', responsibleName: 'Dra. Juliana Costa', responsibleId: '3',
    lawyerName: 'Dr. Paulo Oliveira', lawyerId: '4',
    createdAt: '2025-11-01T10:00:00', updatedAt: '2026-05-09T10:00:00',
    cases: [
      { id: 'c7', number: '0006789-01.2026.8.16.0001', title: 'Consultoria em Direito Societário', type: 'Empresarial', status: 'active', value: 30000, court: 'TJPR', assignedTo: 'Dr. Paulo Oliveira', createdAt: '2026-04-01T10:00:00', updatedAt: '2026-05-09T10:00:00' },
    ],
    documents: [
      { id: 'd8', name: 'OAB_Carteira.pdf', category: 'Profissional', status: 'verified', size: '0.8 MB', uploadedAt: '2025-11-01T11:00:00', uploadedBy: 'Carlos Pereira' },
    ],
    contracts: [
      { id: 'ct6', title: 'Consultoria Jurídica - Projeto Específico', value: 8000, startDate: '2026-04-01', endDate: '2026-06-30', status: 'active', type: 'Prazo' },
    ],
    financial: {
      totalPaid: 4000, totalPending: 4000, totalOverdue: 0,
      transactions: [
        { id: 'f14', description: '1ª Parcela Consultoria', value: 4000, type: 'income', status: 'paid', date: '2026-04-10', category: 'Honorários' },
      ]
    },
    tasks: [], activities: []
  },
  {
    id: '6', name: 'Construtora Beta S.A.', type: 'PJ', email: 'financeiro@construtorabeta.com.br',
    phone: '(11) 4004-5678', cpfCnpj: '98.765.432/0001-10',
    address: 'Av. Engenheiro Luiz Carlos Berrini, 1500', city: 'São Paulo', state: 'SP',
    notes: 'Cliente inativo - contratos encerrados em 2025. Pode retornar.',
    tags: [{ id: 't9', name: 'Inativo', color: '#6B7280' }],
    status: 'inactive', responsibleName: 'Dr. Paulo Oliveira', responsibleId: '4',
    lawyerName: 'Dr. Ricardo Santos', lawyerId: '2',
    createdAt: '2023-05-10T09:00:00', updatedAt: '2025-12-20T17:00:00',
    cases: [
      { id: 'c8', number: '0001112-23.2024.8.26.0100', title: 'Ação de Despejo', type: 'Cível', status: 'closed', value: 95000, court: 'TJSP', assignedTo: 'Dr. Ricardo Santos', createdAt: '2024-02-01T09:00:00', updatedAt: '2025-08-15T16:00:00' },
    ],
    documents: [
      { id: 'd9', name: 'Contrato_Social_Beta.pdf', category: 'Documento Societário', status: 'verified', size: '4.1 MB', uploadedAt: '2023-05-10T10:00:00', uploadedBy: 'Admin' },
    ],
    contracts: [
      { id: 'ct7', title: 'Assessoria Jurídica Empresarial (Encerrado)', value: 3000, startDate: '2023-06-01', endDate: '2025-12-31', status: 'closed', type: 'Mensal' },
    ],
    financial: {
      totalPaid: 96000, totalPending: 0, totalOverdue: 0,
      transactions: [
        { id: 'f15', description: 'Última mensalidade', value: 3000, type: 'income', status: 'paid', date: '2025-12-05', category: 'Mensalidade' },
      ]
    },
    tasks: [], activities: []
  },
  {
    id: '7', name: 'Juliana Oliveira', type: 'PF', email: 'juliana.oliveira@email.com',
    phone: '(51) 98877-6655', whatsapp: '(51) 98877-6655', cpfCnpj: '567.890.123-44',
    birthDate: '1995-12-28', maritalStatus: 'Solteiro(a)', profession: 'Designer',
    address: 'Rua Padre Chagas, 200', city: 'Porto Alegre', state: 'RS',
    notes: 'Lead convertida recentemente. Coletando documentos.',
    tags: [{ id: 't10', name: 'Em Captação', color: '#F59E0B' }],
    status: 'onboarding', responsibleName: 'Dra. Mariana Torres', responsibleId: '5',
    lawyerName: 'Dra. Mariana Torres', lawyerId: '5',
    createdAt: '2026-05-01T09:00:00', updatedAt: '2026-05-10T10:00:00',
    cases: [],
    documents: [],
    contracts: [
      { id: 'ct8', title: 'Contrato de Honorários - Preliminar', value: 3000, startDate: '2026-05-01', status: 'active', type: 'Fixado' },
    ],
    financial: {
      totalPaid: 1000, totalPending: 2000, totalOverdue: 0,
      transactions: [
        { id: 'f16', description: 'Sinal - Honorários', value: 1000, type: 'income', status: 'paid', date: '2026-05-02', category: 'Honorários' },
      ]
    },
    tasks: [
      { id: 'tk5', title: 'Solicitar documentos pendentes', status: 'pending', priority: 'high', dueDate: '2026-05-14', assignedTo: 'Dra. Mariana Torres', createdAt: '2026-05-10T10:00:00' },
      { id: 'tk6', title: 'Abrir primeiro processo', status: 'pending', priority: 'medium', assignedTo: 'Dra. Mariana Torres', createdAt: '2026-05-10T10:00:00' },
    ],
    activities: [
      { id: 'a10', type: 'client_created', description: 'Cliente cadastrado no sistema', author: 'Dra. Mariana Torres', createdAt: '2026-05-01T09:00:00' },
      { id: 'a11', type: 'contract_signed', description: 'Contrato preliminar assinado', author: 'Juliana Oliveira', createdAt: '2026-05-01T10:00:00' },
    ]
  },
  {
    id: '8', name: 'Escritório Gamma Advocacia', type: 'PJ', email: 'contato@gammalaw.com.br',
    phone: '(61) 3225-9988', cpfCnpj: '45.678.901/0001-23',
    address: 'SHS Quadra 6, Bloco A', city: 'Brasília', state: 'DF',
    notes: 'Contrato encerrado. Todos os processos arquivados.',
    tags: [{ id: 't11', name: 'Encerrado', color: '#6B7280' }],
    status: 'closed', responsibleName: 'Dr. Eduardo Martins', responsibleId: '6',
    lawyerName: 'Dra. Juliana Costa', lawyerId: '3',
    createdAt: '2022-02-01T08:00:00', updatedAt: '2026-04-30T18:00:00',
    cases: [
      { id: 'c9', number: '0003334-45.2022.8.07.0001', title: 'Mandado de Segurança', type: 'Tributário', status: 'closed', value: 50000, court: 'TJDFT', assignedTo: 'Dra. Juliana Costa', createdAt: '2022-06-01T10:00:00', updatedAt: '2024-10-30T17:00:00' },
    ],
    documents: [
      { id: 'd10', name: 'Procuração_Gamma.pdf', category: 'Documento Societário', status: 'verified', size: '1.2 MB', uploadedAt: '2022-02-01T09:00:00', uploadedBy: 'Admin' },
    ],
    contracts: [
      { id: 'ct9', title: 'Assessoria Jurídica (Encerrado)', value: 4000, startDate: '2022-02-01', endDate: '2026-04-30', status: 'closed', type: 'Mensal' },
    ],
    financial: {
      totalPaid: 204000, totalPending: 0, totalOverdue: 0,
      transactions: [
        { id: 'f17', description: 'Última mensalidade', value: 4000, type: 'income', status: 'paid', date: '2026-04-05', category: 'Mensalidade' },
      ]
    },
    tasks: [], activities: [
      { id: 'a12', type: 'status_change', description: 'Status alterado para Encerrado', author: 'Dr. Eduardo Martins', createdAt: '2026-04-30T18:00:00' },
    ]
  },
];

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailTab, setDetailTab] = useState('resumo');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [responsibleFilter, setResponsibleFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [caseFilterStatus, setCaseFilterStatus] = useState('ALL');
  const [formData, setFormData] = useState<ClientFormData>({
    name: '', type: 'PF', email: '', phone: '', whatsapp: '', cpfCnpj: '',
    rg: '', birthDate: '', maritalStatus: '', profession: '', address: '',
    city: '', state: '', notes: '', tags: '', responsibleName: '', lawyerName: ''
  });

  useEffect(() => {
    setTimeout(() => {
      setClients(generateMockClients());
      setLoading(false);
    }, 400);
  }, []);

  const filteredClients = clients.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm
      || c.name.toLowerCase().includes(q)
      || c.email.toLowerCase().includes(q)
      || c.phone.includes(q)
      || c.cpfCnpj.includes(q)
      || (c.city?.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesResponsible = responsibleFilter === 'ALL' || c.responsibleName === responsibleFilter;
    return matchesSearch && matchesStatus && matchesResponsible;
  });

  const handleCreateClient = () => {
    if (!formData.name || !formData.phone) return;
    const tags = formData.tags
      ? formData.tags.split(',').filter(Boolean).map((t, i) => ({ id: `t${Date.now()}_${i}`, name: t.trim(), color: '#6B7280' }))
      : [];
    const newClient: Client = {
      id: String(Date.now()),
      name: formData.name,
      type: formData.type,
      email: formData.email,
      phone: formData.phone,
      whatsapp: formData.whatsapp || undefined,
      cpfCnpj: formData.cpfCnpj,
      rg: formData.rg || undefined,
      birthDate: formData.birthDate || undefined,
      maritalStatus: formData.maritalStatus || undefined,
      profession: formData.profession || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      notes: formData.notes || undefined,
      tags,
      status: 'active',
      responsibleName: formData.responsibleName || 'Não atribuído',
      responsibleId: undefined,
      lawyerName: formData.lawyerName || undefined,
      lawyerId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cases: [], documents: [], contracts: [], financial: { totalPaid: 0, totalPending: 0, totalOverdue: 0, transactions: [] }, tasks: [], activities: [
        { id: `a${Date.now()}`, type: 'client_created', description: 'Cliente cadastrado no sistema', author: formData.responsibleName || 'Sistema', createdAt: new Date().toISOString() }
      ],
    };
    setClients([newClient, ...clients]);
    handleCloseForm();
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name, type: client.type, email: client.email, phone: client.phone,
      whatsapp: client.whatsapp || '', cpfCnpj: client.cpfCnpj, rg: client.rg || '',
      birthDate: client.birthDate || '', maritalStatus: client.maritalStatus || '',
      profession: client.profession || '', address: client.address || '',
      city: client.city || '', state: client.state || '', notes: client.notes || '',
      tags: client.tags.map(t => t.name).join(', '),
      responsibleName: client.responsibleName, lawyerName: client.lawyerName || '',
    });
    setShowFormModal(true);
  };

  const handleUpdateClient = () => {
    if (!editingClient || !formData.name || !formData.phone) return;
    const tags = formData.tags
      ? formData.tags.split(',').filter(Boolean).map((t, i) => ({ id: `${Date.now()}_${i}`, name: t.trim(), color: '#6B7280' }))
      : [];
    const updated = clients.map(c =>
      c.id === editingClient.id
        ? {
            ...c, name: formData.name, type: formData.type, email: formData.email,
            phone: formData.phone, whatsapp: formData.whatsapp || undefined,
            cpfCnpj: formData.cpfCnpj, rg: formData.rg || undefined,
            birthDate: formData.birthDate || undefined, maritalStatus: formData.maritalStatus || undefined,
            profession: formData.profession || undefined, address: formData.address || undefined,
            city: formData.city || undefined, state: formData.state || undefined,
            notes: formData.notes || undefined, tags, responsibleName: formData.responsibleName || 'Não atribuído',
            lawyerName: formData.lawyerName || undefined, updatedAt: new Date().toISOString(),
          }
        : c
    );
    setClients(updated);
    handleCloseForm();
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    if (selectedClient?.id === id) setSelectedClient(null);
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
    setEditingClient(null);
    setFormData({ name: '', type: 'PF', email: '', phone: '', whatsapp: '', cpfCnpj: '', rg: '', birthDate: '', maritalStatus: '', profession: '', address: '', city: '', state: '', notes: '', tags: '', responsibleName: '', lawyerName: '' });
  };

  const openNewForm = () => {
    setEditingClient(null);
    setFormData({ name: '', type: 'PF', email: '', phone: '', whatsapp: '', cpfCnpj: '', rg: '', birthDate: '', maritalStatus: '', profession: '', address: '', city: '', state: '', notes: '', tags: '', responsibleName: '', lawyerName: '' });
    setShowFormModal(true);
  };

  const getFilteredCases = (client: Client) => {
    if (caseFilterStatus === 'ALL') return client.cases;
    return client.cases.filter(c => c.status === caseFilterStatus);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          <div className="loading-spinner lg" />
          <p>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <style>{`
        .clients-360-page { max-width: 1400px; }
        .clients-grid-360 { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; margin-top: 24px; }
        .client-card-360 { background: var(--bg-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: 0; transition: all var(--transition-base); display: flex; flex-direction: column; position: relative; overflow: hidden; }
        .client-card-360:hover { border-color: var(--border-light); box-shadow: var(--shadow-lg); transform: translateY(-2px); }
        .client-card-360 .card-top { display: flex; align-items: flex-start; gap: 16px; padding: 20px 20px 16px; }
        .client-avatar-lg { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 18px; flex-shrink: 0; }
        .client-card-360 .card-top-info { flex: 1; min-width: 0; }
        .client-card-360 .card-top-info h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .client-card-360 .card-top-info .client-subtitle { font-size: 12px; color: var(--text-tertiary); }
        .client-card-360 .card-body-360 { padding: 0 20px 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .client-info-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
        .client-info-row svg { flex-shrink: 0; color: var(--text-tertiary); width: 14px; height: 14px; }
        .client-stats-row { display: flex; gap: 12px; margin: 4px 0; }
        .client-stat-chip { display: flex; align-items: center; gap: 4px; background: var(--bg-secondary); border-radius: 999px; padding: 4px 10px; font-size: 11px; font-weight: 600; color: var(--text-secondary); }
        .client-stat-chip svg { width: 12px; height: 12px; }
        .client-tags-row { display: flex; flex-wrap: wrap; gap: 4px; }
        .client-tag-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
        .client-card-360 .card-footer-360 { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-top: 1px solid var(--border-default); background: var(--bg-secondary); margin-top: auto; }
        .card-footer-360 .footer-responsible { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-tertiary); }
        .card-footer-360 .footer-responsible span { color: var(--text-secondary); font-weight: 500; }
        .card-footer-360 .footer-actions { display: flex; gap: 4px; }
        .card-footer-360 .footer-actions button { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); color: var(--text-tertiary); transition: all var(--transition-fast); background: transparent; border: none; cursor: pointer; }
        .card-footer-360 .footer-actions button:hover { background: var(--bg-hover); color: var(--text-primary); }
        .card-footer-360 .footer-actions button.danger:hover { background: var(--red-bg); color: var(--red); }
        .filter-bar-360 { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 16px 0; }
        .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-chip { padding: 6px 14px; border-radius: 999px; border: 1px solid var(--border-default); background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 500; cursor: pointer; transition: all var(--transition-fast); }
        .filter-chip:hover { border-color: var(--border-light); color: var(--text-primary); background: var(--bg-hover); }
        .filter-chip.active { border-color: var(--gold-primary); color: var(--gold-primary); background: var(--gold-glow); }
        .form-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .form-group.full { grid-column: 1 / -1; }
        .detail-drawer { position: fixed; top: 0; right: 0; height: 100vh; width: 800px; max-width: 100vw; z-index: 500; display: flex; flex-direction: column; background: var(--bg-card); border-left: 1px solid var(--border-default); box-shadow: -8px 0 30px rgba(0,0,0,0.3); animation: slideInRight 0.3s ease; }
        .detail-drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 499; animation: fadeIn 0.2s ease; }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .drawer-header-360 { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border-default); }
        .drawer-header-360 .drawer-title { display: flex; align-items: center; gap: 12px; }
        .drawer-header-360 .drawer-title .mini-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; }
        .drawer-header-360 .drawer-title h2 { font-size: 18px; font-weight: 700; margin: 0; }
        .drawer-tabs { display: flex; gap: 0; padding: 0 24px; border-bottom: 1px solid var(--border-default); overflow-x: auto; flex-shrink: 0; }
        .drawer-tabs::-webkit-scrollbar { height: 2px; }
        .drawer-tab { display: flex; align-items: center; gap: 6px; padding: 12px 16px; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--text-tertiary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all var(--transition-fast); white-space: nowrap; }
        .drawer-tab:hover { color: var(--text-secondary); }
        .drawer-tab.active { color: var(--gold-primary); border-bottom-color: var(--gold-primary); }
        .drawer-tab svg { width: 14px; height: 14px; }
        .drawer-body-360 { flex: 1; overflow-y: auto; padding: 24px; }
        .detail-section { margin-bottom: 28px; }
        .detail-section:last-child { margin-bottom: 0; }
        .detail-section-title { font-size: 13px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .detail-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .detail-info-item { display: flex; flex-direction: column; gap: 2px; }
        .detail-info-item.full { grid-column: 1 / -1; }
        .detail-info-item .dii-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-info-item .dii-value { font-size: 14px; color: var(--text-primary); font-weight: 500; }
        .detail-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .detail-stat-card { background: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 4px; }
        .detail-stat-card .dsc-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .detail-stat-card .dsc-value { font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
        .detail-stat-card .dsc-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; }
        .timeline-360 { position: relative; padding-left: 24px; }
        .timeline-360::before { content: ''; position: absolute; left: 7px; top: 4px; bottom: 4px; width: 2px; background: var(--border-default); }
        .timeline-item-360 { position: relative; padding-bottom: 20px; }
        .timeline-item-360:last-child { padding-bottom: 0; }
        .timeline-dot-360 { position: absolute; left: -24px; top: 4px; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #fff; }
        .timeline-content-360 { background: var(--bg-secondary); border-radius: var(--radius-md); padding: 12px 14px; }
        .timeline-content-360 .tl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .timeline-content-360 .tl-author { font-size: 12px; font-weight: 600; color: var(--text-primary); }
        .timeline-content-360 .tl-time { font-size: 11px; color: var(--text-tertiary); }
        .timeline-content-360 .tl-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
        .empty-detail { padding: 40px 20px; text-align: center; color: var(--text-tertiary); }
        .empty-detail svg { margin: 0 auto 12px; opacity: 0.4; }
        .empty-detail p { font-size: 14px; }
        .mini-table { width: 100%; font-size: 13px; }
        .mini-table th { text-align: left; padding: 8px 12px; font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--border-default); font-weight: 600; }
        .mini-table td { padding: 10px 12px; border-bottom: 1px solid var(--border-default); color: var(--text-secondary); }
        .mini-table tr:hover td { background: var(--bg-hover); }
        .mini-table .status-indicator { display: inline-flex; align-items: center; gap: 4px; }
        .mini-table .status-indicator .dot { width: 6px; height: 6px; border-radius: 50%; }
        .doc-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-secondary); border-radius: var(--radius-md); }
        .doc-item:hover { background: var(--bg-hover); }
        .doc-item .doc-info { display: flex; align-items: center; gap: 10px; }
        .doc-item .doc-info .doc-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--gold-glow); color: var(--gold-primary); }
        .doc-item .doc-info .doc-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
        .doc-item .doc-info .doc-meta { font-size: 11px; color: var(--text-tertiary); }
        .transaction-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-secondary); border-radius: var(--radius-md); }
        .transaction-item .tx-left { display: flex; flex-direction: column; gap: 2px; }
        .transaction-item .tx-left .tx-desc { font-size: 13px; color: var(--text-primary); font-weight: 500; }
        .transaction-item .tx-left .tx-meta { font-size: 11px; color: var(--text-tertiary); }
        .transaction-item .tx-right { text-align: right; }
        .transaction-item .tx-right .tx-value { font-size: 14px; font-weight: 700; }
        .transaction-item .tx-right .tx-value.income { color: var(--green); }
        .transaction-item .tx-right .tx-value.expense { color: var(--red); }
        .task-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: var(--bg-secondary); border-radius: var(--radius-md); }
        .task-item .task-check { margin-top: 2px; }
        .task-item .task-check .ck { width: 18px; height: 18px; border: 2px solid var(--border-default); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all var(--transition-fast); }
        .task-item .task-check .ck:hover { border-color: var(--gold-primary); }
        .task-item .task-check .ck.done { background: var(--green); border-color: var(--green); }
        .task-item .task-check .ck.done::after { content: ''; width: 6px; height: 10px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-top: -2px; }
        .task-item .task-body { flex: 1; }
        .task-item .task-body .task-title { font-size: 13px; color: var(--text-primary); font-weight: 500; }
        .task-item .task-body .task-meta { font-size: 11px; color: var(--text-tertiary); display: flex; gap: 8px; margin-top: 4px; }
        .task-item .task-priority { flex-shrink: 0; }
        .priority-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .priority-dot.low { background: var(--green); }
        .priority-dot.medium { background: var(--orange); }
        .priority-dot.high { background: var(--red); }
        .sub-tabs { display: flex; gap: 4px; margin-bottom: 16px; }
        .sub-tab { padding: 6px 14px; border-radius: 999px; background: transparent; border: 1px solid var(--border-default); color: var(--text-tertiary); font-size: 12px; font-weight: 500; cursor: pointer; transition: all var(--transition-fast); }
        .sub-tab:hover { border-color: var(--border-light); color: var(--text-secondary); }
        .sub-tab.active { border-color: var(--gold-primary); color: var(--gold-primary); background: var(--gold-glow); }
        .flex-center { display: flex; align-items: center; }
        @media (max-width: 768px) {
          .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
          .detail-drawer { width: 100vw; }
          .clients-grid-360 { grid-template-columns: 1fr; }
          .detail-info-grid { grid-template-columns: 1fr; }
          .detail-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .drawer-tabs { padding: 0 16px; }
          .drawer-tab { padding: 10px 12px; font-size: 11px; }
        }
      `}</style>

      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={26} />
            Clientes
          </h1>
          <p className="page-subtitle">{clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openNewForm}>
            <Plus size={18} />
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="filter-bar-360">
        <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Buscar por nome, email, CPF, telefone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary" style={{ gap: '8px' }} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={16} />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="filter-bar-expanded" style={{ marginBottom: 0 }}>
          <div className="filter-grid">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">Todos</option>
                {Object.entries(CLIENT_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Responsável</label>
              <select className="form-select" value={responsibleFilter} onChange={e => setResponsibleFilter(e.target.value)}>
                <option value="ALL">Todos</option>
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ justifyContent: 'flex-end', display: 'flex' }}>
              <button className="btn btn-ghost" onClick={() => { setStatusFilter('ALL'); setResponsibleFilter('ALL'); }}>
                Limpar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="filter-chips" style={{ marginTop: '8px' }}>
        {['ALL', ...Object.keys(CLIENT_STATUSES)].map(s => (
          <button
            key={s}
            className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'ALL' ? 'Todos' : CLIENT_STATUSES[s].label}
          </button>
        ))}
      </div>

      {filteredClients.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '32px' }}>
          <Users size={48} />
          <h4>Nenhum cliente encontrado</h4>
          <p>Tente ajustar os filtros ou crie um novo cliente.</p>
          <button className="btn btn-primary" onClick={openNewForm}>
            <Plus size={16} />
            Novo Cliente
          </button>
        </div>
      ) : (
        <div className="clients-grid-360">
          {filteredClients.map(client => (
            <div key={client.id} className="client-card-360">
              <div className="card-top">
                <div className="client-avatar-lg" style={{ background: getAvatarColor(client.name) }}>
                  {getInitials(client.name)}
                </div>
                <div className="card-top-info">
                  <h3>{client.name}</h3>
                  <div className="client-subtitle">
                    <span className={`badge ${CLIENT_STATUSES[client.status]?.bgClass || 'badge-default'}`} style={{ fontSize: '11px' }}>
                      {CLIENT_STATUSES[client.status]?.label || client.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-body-360">
                <div className="client-info-row">
                  <Mail /> {client.email}
                </div>
                <div className="client-info-row">
                  <Phone /> {client.phone}
                </div>
                <div className="client-info-row">
                  <Hash /> {client.cpfCnpj}
                </div>
                <div className="client-stats-row">
                  <div className="client-stat-chip">
                    <Briefcase size={12} /> {client.cases.length} processos
                  </div>
                  <div className="client-stat-chip">
                    <FileText size={12} /> {client.documents.length} docs
                  </div>
                  <div className="client-stat-chip">
                    <DollarSign size={12} /> {formatCurrency(client.financial.totalPaid + client.financial.totalPending + client.financial.totalOverdue)}
                  </div>
                </div>
                {client.tags.length > 0 && (
                  <div className="client-tags-row">
                    {client.tags.map(tag => (
                      <span key={tag.id} className="badge badge-default" style={{ fontSize: '10px' }}>
                        <span className="client-tag-dot" style={{ background: tag.color }} />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-footer-360">
                <div className="footer-responsible">
                  <User size={12} />
                  <span>{client.responsibleName}</span>
                </div>
                <div className="footer-actions">
                  <button title="Visualizar" onClick={() => { setSelectedClient(client); setDetailTab('resumo'); }}>
                    <Eye size={16} />
                  </button>
                  <button title="Editar" onClick={() => handleEditClient(client)}>
                    <Edit size={16} />
                  </button>
                  <button className="danger" title="Excluir" onClick={() => handleDeleteClient(client.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showFormModal && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal modal-lg" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button className="modal-close" onClick={handleCloseForm}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group full">
                  <label className="form-label">Nome *</label>
                  <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nome completo / Razão Social" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as 'PF' | 'PJ' })}>
                    <option value="PF">Pessoa Física</option>
                    <option value="PJ">Pessoa Jurídica</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{formData.type === 'PF' ? 'CPF' : 'CNPJ'}</label>
                  <input className="form-input" value={formData.cpfCnpj} onChange={e => setFormData({ ...formData, cpfCnpj: e.target.value })} placeholder={formData.type === 'PF' ? '000.000.000-00' : '00.000.000/0001-00'} />
                </div>
                <div className="form-group">
                  <label className="form-label">RG / IE</label>
                  <input className="form-input" value={formData.rg} onChange={e => setFormData({ ...formData, rg: e.target.value })} />
                </div>
                {formData.type === 'PF' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Data de Nascimento</label>
                      <input className="form-input" type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Estado Civil</label>
                      <select className="form-select" value={formData.maritalStatus} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}>
                        <option value="">Selecione...</option>
                        {MARITAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Profissão</label>
                      <input className="form-input" value={formData.profession} onChange={e => setFormData({ ...formData, profession: e.target.value })} />
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone *</label>
                  <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(11) 99999-9999" />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input className="form-input" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="(11) 99999-9999" />
                </div>
                <div className="form-group">
                  <label className="form-label">Endereço</label>
                  <input className="form-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input className="form-input" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })}>
                    <option value="">Selecione...</option>
                    {BRAZILIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label className="form-label">Observações</label>
                  <textarea className="form-textarea" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (separadas por vírgula)</label>
                  <input className="form-input" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder="ex: Premium, VIP, Trabalhista" />
                </div>
                <div className="form-group">
                  <label className="form-label">Responsável</label>
                  <select className="form-select" value={formData.responsibleName} onChange={e => setFormData({ ...formData, responsibleName: e.target.value })}>
                    <option value="">Selecione...</option>
                    {TEAM_MEMBERS.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Advogado</label>
                  <select className="form-select" value={formData.lawyerName} onChange={e => setFormData({ ...formData, lawyerName: e.target.value })}>
                    <option value="">Selecione...</option>
                    {TEAM_MEMBERS.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleCloseForm}>Cancelar</button>
              <button className="btn btn-primary" onClick={editingClient ? handleUpdateClient : handleCreateClient}>
                {editingClient ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedClient && (
        <>
          <div className="detail-drawer-overlay" onClick={() => setSelectedClient(null)} />
          <div className="detail-drawer">
            <div className="drawer-header-360">
              <div className="drawer-title">
                <div className="mini-avatar" style={{ background: getAvatarColor(selectedClient.name) }}>
                  {getInitials(selectedClient.name)}
                </div>
                <div>
                  <h2>{selectedClient.name}</h2>
                  <span className={`badge ${CLIENT_STATUSES[selectedClient.status]?.bgClass || 'badge-default'}`} style={{ fontSize: '11px' }}>
                    {CLIENT_STATUSES[selectedClient.status]?.label || selectedClient.status}
                  </span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedClient(null)}><X size={20} /></button>
            </div>

            <div className="drawer-tabs">
              <button className={`drawer-tab ${detailTab === 'resumo' ? 'active' : ''}`} onClick={() => setDetailTab('resumo')}><User size={14} />Resumo</button>
              <button className={`drawer-tab ${detailTab === 'processos' ? 'active' : ''}`} onClick={() => setDetailTab('processos')}><Gavel size={14} />Processos ({selectedClient.cases.length})</button>
              <button className={`drawer-tab ${detailTab === 'documentos' ? 'active' : ''}`} onClick={() => setDetailTab('documentos')}><FileText size={14} />Documentos ({selectedClient.documents.length})</button>
              <button className={`drawer-tab ${detailTab === 'contratos' ? 'active' : ''}`} onClick={() => setDetailTab('contratos')}><ScrollText size={14} />Contratos ({selectedClient.contracts.length})</button>
              <button className={`drawer-tab ${detailTab === 'financeiro' ? 'active' : ''}`} onClick={() => setDetailTab('financeiro')}><DollarSign size={14} />Financeiro</button>
              <button className={`drawer-tab ${detailTab === 'atendimentos' ? 'active' : ''}`} onClick={() => setDetailTab('atendimentos')}><MessageSquare size={14} />Atendimentos</button>
              <button className={`drawer-tab ${detailTab === 'tarefas' ? 'active' : ''}`} onClick={() => setDetailTab('tarefas')}><ListChecks size={14} />Tarefas ({selectedClient.tasks.length})</button>
              <button className={`drawer-tab ${detailTab === 'historico' ? 'active' : ''}`} onClick={() => setDetailTab('historico')}><History size={14} />Histórico</button>
            </div>

            <div className="drawer-body-360">
              {detailTab === 'resumo' && (
                <>
                  <div className="detail-stats-grid">
                    <div className="detail-stat-card">
                      <div className="dsc-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}><Briefcase size={18} /></div>
                      <div className="dsc-value">{selectedClient.cases.length}</div>
                      <div className="dsc-label">Processos</div>
                    </div>
                    <div className="detail-stat-card">
                      <div className="dsc-icon" style={{ background: 'var(--gold-glow)', color: 'var(--gold-primary)' }}><FileText size={18} /></div>
                      <div className="dsc-value">{selectedClient.documents.length}</div>
                      <div className="dsc-label">Documentos</div>
                    </div>
                    <div className="detail-stat-card">
                      <div className="dsc-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}><ScrollText size={18} /></div>
                      <div className="dsc-value">{selectedClient.contracts.length}</div>
                      <div className="dsc-label">Contratos</div>
                    </div>
                    <div className="detail-stat-card">
                      <div className="dsc-icon" style={{ background: selectedClient.financial.totalOverdue > 0 ? 'var(--red-bg)' : 'var(--green-bg)', color: selectedClient.financial.totalOverdue > 0 ? 'var(--red)' : 'var(--green)' }}><DollarSign size={18} /></div>
                      <div className="dsc-value">{formatCurrency(selectedClient.financial.totalPaid + selectedClient.financial.totalPending + selectedClient.financial.totalOverdue)}</div>
                      <div className="dsc-label">Total Financeiro</div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-section-title"><User size={14} /> Informações do Cliente</div>
                    <div className="detail-info-grid">
                      <div className="detail-info-item"><span className="dii-label">Email</span><span className="dii-value">{selectedClient.email || '-'}</span></div>
                      <div className="detail-info-item"><span className="dii-label">Telefone</span><span className="dii-value">{selectedClient.phone || '-'}</span></div>
                      {selectedClient.whatsapp && <div className="detail-info-item"><span className="dii-label">WhatsApp</span><span className="dii-value">{selectedClient.whatsapp}</span></div>}
                      <div className="detail-info-item"><span className="dii-label">{selectedClient.type === 'PF' ? 'CPF' : 'CNPJ'}</span><span className="dii-value">{selectedClient.cpfCnpj}</span></div>
                      {selectedClient.rg && <div className="detail-info-item"><span className="dii-label">{selectedClient.type === 'PF' ? 'RG' : 'IE'}</span><span className="dii-value">{selectedClient.rg}</span></div>}
                      {selectedClient.birthDate && <div className="detail-info-item"><span className="dii-label">Nascimento</span><span className="dii-value">{formatDate(selectedClient.birthDate)}</span></div>}
                      {selectedClient.maritalStatus && <div className="detail-info-item"><span className="dii-label">Estado Civil</span><span className="dii-value">{selectedClient.maritalStatus}</span></div>}
                      {selectedClient.profession && <div className="detail-info-item"><span className="dii-label">Profissão</span><span className="dii-value">{selectedClient.profession}</span></div>}
                      {selectedClient.address && <div className="detail-info-item full"><span className="dii-label">Endereço</span><span className="dii-value">{selectedClient.address}{selectedClient.city ? `, ${selectedClient.city}` : ''}{selectedClient.state ? `/${selectedClient.state}` : ''}</span></div>}
                      <div className="detail-info-item"><span className="dii-label">Responsável</span><span className="dii-value">{selectedClient.responsibleName}</span></div>
                      {selectedClient.lawyerName && <div className="detail-info-item"><span className="dii-label">Advogado</span><span className="dii-value">{selectedClient.lawyerName}</span></div>}
                      <div className="detail-info-item"><span className="dii-label">Cadastro</span><span className="dii-value">{formatDate(selectedClient.createdAt)}</span></div>
                      {selectedClient.notes && <div className="detail-info-item full"><span className="dii-label">Observações</span><span className="dii-value">{selectedClient.notes}</span></div>}
                      {selectedClient.tags.length > 0 && (
                        <div className="detail-info-item full">
                          <span className="dii-label">Tags</span>
                          <span className="dii-value" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '4px' }}>
                            {selectedClient.tags.map(tag => (
                              <span key={tag.id} className="badge badge-default" style={{ fontSize: '11px' }}>
                                <span className="client-tag-dot" style={{ background: tag.color }} />
                                {tag.name}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedClient.activities.length > 0 && (
                    <div className="detail-section">
                      <div className="detail-section-title"><Clock size={14} /> Atividades Recentes</div>
                      <div className="timeline-360">
                        {selectedClient.activities.slice(0, 5).map(act => (
                          <div key={act.id} className="timeline-item-360">
                            <div className="timeline-dot-360" style={{ background: act.type === 'payment_received' || act.type === 'payment_overdue' ? 'var(--green)' : act.type === 'status_change' ? 'var(--gold-primary)' : act.type === 'case_created' ? 'var(--blue)' : 'var(--text-tertiary)' }}>
                            </div>
                            <div className="timeline-content-360">
                              <div className="tl-header">
                                <span className="tl-author">{act.author}</span>
                                <span className="tl-time">{formatDateTime(act.createdAt)}</span>
                              </div>
                              <div className="tl-desc">{act.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {detailTab === 'processos' && (
                <div className="detail-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div className="detail-section-title" style={{ margin: 0 }}><Gavel size={14} /> Processos</div>
                    <button className="btn btn-sm btn-primary"><Plus size={14} /> Novo Processo</button>
                  </div>
                  <div className="sub-tabs">
                    {['ALL', 'active', 'suspended', 'archived', 'closed'].map(s => (
                      <button key={s} className={`sub-tab ${caseFilterStatus === s ? 'active' : ''}`} onClick={() => setCaseFilterStatus(s)}>
                        {s === 'ALL' ? 'Todos' : s === 'active' ? 'Ativos' : s === 'suspended' ? 'Suspensos' : s === 'archived' ? 'Arquivados' : 'Encerrados'}
                      </button>
                    ))}
                  </div>
                  {getFilteredCases(selectedClient).length === 0 ? (
                    <div className="empty-detail">
                      <Gavel size={40} />
                      <p>Nenhum processo encontrado.</p>
                    </div>
                  ) : (
                    <table className="mini-table">
                      <thead>
                        <tr>
                          <th>Número</th>
                          <th>Título</th>
                          <th>Área</th>
                          <th>Valor</th>
                          <th>Status</th>
                          <th>Atualização</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredCases(selectedClient).map(c => (
                          <tr key={c.id}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{c.number}</td>
                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.title}</td>
                            <td><span className="badge badge-default">{c.type}</span></td>
                            <td>{c.value ? formatCurrency(c.value) : '-'}</td>
                            <td>
                              <span className={`status-indicator`}>
                                <span className="dot" style={{ background: c.status === 'active' ? 'var(--green)' : c.status === 'suspended' ? 'var(--orange)' : 'var(--text-tertiary)' }} />
                                {c.status === 'active' ? 'Ativo' : c.status === 'suspended' ? 'Suspenso' : c.status === 'archived' ? 'Arquivado' : 'Encerrado'}
                              </span>
                            </td>
                            <td style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{formatDate(c.updatedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {detailTab === 'documentos' && (
                <div className="detail-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div className="detail-section-title" style={{ margin: 0 }}><FileText size={14} /> Documentos</div>
                    <button className="btn btn-sm btn-primary"><Upload size={14} /> Upload</button>
                  </div>
                  {selectedClient.documents.length === 0 ? (
                    <div className="empty-detail">
                      <FileText size={40} />
                      <p>Nenhum documento cadastrado.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedClient.documents.map(doc => (
                        <div key={doc.id} className="doc-item">
                          <div className="doc-info">
                            <div className="doc-icon"><FileText size={18} /></div>
                            <div>
                              <div className="doc-name">{doc.name}</div>
                              <div className="doc-meta">{doc.category} • {doc.size} • {formatDate(doc.uploadedAt)}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`badge ${doc.status === 'verified' ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: '10px' }}>
                              {doc.status === 'verified' ? 'Verificado' : 'Pendente'}
                            </span>
                            <button className="btn btn-icon btn-sm" title="Download"><Download size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'contratos' && (
                <div className="detail-section">
                  <div className="detail-section-title"><ScrollText size={14} /> Contratos</div>
                  {selectedClient.contracts.length === 0 ? (
                    <div className="empty-detail">
                      <ScrollText size={40} />
                      <p>Nenhum contrato cadastrado.</p>
                    </div>
                  ) : (
                    <table className="mini-table">
                      <thead>
                        <tr>
                          <th>Título</th>
                          <th>Tipo</th>
                          <th>Valor</th>
                          <th>Início</th>
                          <th>Fim</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClient.contracts.map(ct => (
                          <tr key={ct.id}>
                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{ct.title}</td>
                            <td><span className="badge badge-default">{ct.type}</span></td>
                            <td style={{ fontWeight: 600 }}>{formatCurrency(ct.value)}</td>
                            <td>{formatDate(ct.startDate)}</td>
                            <td>{ct.endDate ? formatDate(ct.endDate) : '-'}</td>
                            <td>
                              <span className={`badge ${ct.status === 'active' ? 'badge-green' : 'badge-default'}`}>
                                {ct.status === 'active' ? 'Ativo' : 'Encerrado'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {detailTab === 'financeiro' && (
                <div className="detail-section">
                  <div className="detail-section-title"><DollarSign size={14} /> Resumo Financeiro</div>
                  <div className="detail-stats-grid" style={{ marginBottom: '24px' }}>
                    <div className="detail-stat-card">
                      <div className="dsc-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}><PiggyBank size={18} /></div>
                      <div className="dsc-value" style={{ color: 'var(--green)' }}>{formatCurrency(selectedClient.financial.totalPaid)}</div>
                      <div className="dsc-label">Total Recebido</div>
                    </div>
                    <div className="detail-stat-card">
                      <div className="dsc-icon" style={{ background: 'var(--orange-bg)', color: 'var(--orange)' }}><TrendingUp size={18} /></div>
                      <div className="dsc-value" style={{ color: 'var(--orange)' }}>{formatCurrency(selectedClient.financial.totalPending)}</div>
                      <div className="dsc-label">A Receber</div>
                    </div>
                    <div className="detail-stat-card">
                      <div className="dsc-icon" style={{ background: selectedClient.financial.totalOverdue > 0 ? 'var(--red-bg)' : 'var(--green-bg)', color: selectedClient.financial.totalOverdue > 0 ? 'var(--red)' : 'var(--green)' }}>
                        <AlertCircle size={18} />
                      </div>
                      <div className="dsc-value" style={{ color: selectedClient.financial.totalOverdue > 0 ? 'var(--red)' : 'var(--green)' }}>
                        {formatCurrency(selectedClient.financial.totalOverdue)}
                      </div>
                      <div className="dsc-label">Em Atraso</div>
                    </div>
                    <div className="detail-stat-card">
                      <div className="dsc-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}><Receipt size={18} /></div>
                      <div className="dsc-value">{selectedClient.financial.transactions.length}</div>
                      <div className="dsc-label">Transações</div>
                    </div>
                  </div>

                  <div className="detail-section-title" style={{ marginTop: '8px' }}>Últimas Transações</div>
                  {selectedClient.financial.transactions.length === 0 ? (
                    <div className="empty-detail">
                      <Receipt size={40} />
                      <p>Nenhuma transação registrada.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedClient.financial.transactions.slice().reverse().map(tx => (
                        <div key={tx.id} className="transaction-item">
                          <div className="tx-left">
                            <span className="tx-desc">{tx.description}</span>
                            <span className="tx-meta">{tx.category} • {formatDate(tx.date)}</span>
                          </div>
                          <div className="tx-right">
                            <div className={`tx-value ${tx.type}`}>
                              {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.value)}
                            </div>
                            <span className={`badge ${tx.status === 'paid' ? 'badge-green' : tx.status === 'overdue' ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: '10px' }}>
                              {tx.status === 'paid' ? 'Pago' : tx.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'atendimentos' && (
                <div className="detail-section">
                  <div className="detail-section-title"><MessageSquare size={14} /> Atendimentos</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Registrar novo atendimento</label>
                        <input className="form-input" placeholder="Descreva o contato..." />
                      </div>
                      <button className="btn btn-sm btn-primary"><Send size={14} /> Enviar</button>
                    </div>
                  </div>
                  <div className="timeline-360">
                    {selectedClient.activities
                      .filter(a => ['note', 'call', 'whatsapp', 'email', 'meeting'].includes(a.type) || a.type.startsWith('client_created'))
                      .concat()
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 8)
                      .map(act => (
                        <div key={act.id} className="timeline-item-360">
                          <div className="timeline-dot-360" style={{ background: act.type === 'client_created' ? 'var(--blue)' : 'var(--text-tertiary)' }}></div>
                          <div className="timeline-content-360">
                            <div className="tl-header">
                              <span className="tl-author">{act.author}</span>
                              <span className="tl-time">{formatDateTime(act.createdAt)}</span>
                            </div>
                            <div className="tl-desc">{act.description}</div>
                          </div>
                        </div>
                      ))}
                    {selectedClient.activities.filter(a => ['note', 'call', 'whatsapp', 'email', 'meeting'].includes(a.type)).length === 0 && (
                      <div className="empty-detail">
                        <MessageSquare size={40} />
                        <p>Nenhum atendimento registrado.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailTab === 'tarefas' && (
                <div className="detail-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div className="detail-section-title" style={{ margin: 0 }}><ListChecks size={14} /> Tarefas</div>
                    <button className="btn btn-sm btn-primary"><Plus size={14} /> Nova Tarefa</button>
                  </div>
                  {selectedClient.tasks.length === 0 ? (
                    <div className="empty-detail">
                      <ListChecks size={40} />
                      <p>Nenhuma tarefa pendente.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedClient.tasks.map(task => (
                        <div key={task.id} className="task-item">
                          <div className="task-check">
                            <div className={`ck ${task.status === 'completed' ? 'done' : ''}`} onClick={() => {
                              const updated = clients.map(c => c.id === selectedClient.id ? {
                                ...c, tasks: c.tasks.map(t => t.id === task.id ? { ...t, status: t.status === 'completed' ? 'pending' as const : 'completed' as const } : t)
                              } : c);
                              setClients(updated);
                              setSelectedClient(updated.find(c => c.id === selectedClient.id)!);
                            }} />
                          </div>
                          <div className="task-body">
                            <div className="task-title" style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.6 : 1 }}>
                              {task.title}
                            </div>
                            <div className="task-meta">
                              {task.description && <span>{task.description}</span>}
                              {task.dueDate && <span>Venc: {formatDate(task.dueDate)}</span>}
                              {task.assignedTo && <span>{task.assignedTo}</span>}
                            </div>
                          </div>
                          <div className="task-priority">
                            <span className={`priority-dot ${task.priority}`} title={task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'historico' && (
                <div className="detail-section">
                  <div className="detail-section-title"><History size={14} /> Histórico de Atividades</div>
                  {selectedClient.activities.length === 0 ? (
                    <div className="empty-detail">
                      <History size={40} />
                      <p>Nenhum registro de atividade.</p>
                    </div>
                  ) : (
                    <div className="timeline-360">
                      {selectedClient.activities.slice().reverse().map(act => (
                        <div key={act.id} className="timeline-item-360">
                          <div className="timeline-dot-360" style={{ background: act.type === 'payment_received' ? 'var(--green)' : act.type === 'payment_overdue' ? 'var(--red)' : act.type === 'status_change' ? 'var(--gold-primary)' : act.type === 'case_created' ? 'var(--blue)' : act.type === 'contract_signed' ? 'var(--orange)' : 'var(--text-tertiary)' }}></div>
                          <div className="timeline-content-360">
                            <div className="tl-header">
                              <span className="tl-author">{act.author}</span>
                              <span className="tl-time">{formatDateTime(act.createdAt)}</span>
                            </div>
                            <div className="tl-desc">{act.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
