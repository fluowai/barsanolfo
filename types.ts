// ============================================
// TIPOS CENTRALIZADOS - BARSA ADVOCACIA
// ============================================

// SITE COMPONENTS
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface NavItem {
  label: string;
  href: string;
}

// ============================================
// FORM TYPES
// ============================================

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  type: 'rescisao' | 'horas' | 'assedio' | 'outro';
  message: string;
}

export interface FormErrors {
  name: string;
  phone: string;
  email: string;
  type: string;
  message: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  rg?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseModel {
  id: string;
  number: string;
  type: string;
  court?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'CLOSED';
  value?: number;
  filedDate?: string;
  clientId: string;
  lawyerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'LAWYER' | 'SECRETARY';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// ============================================
// STATS TYPES
// ============================================

export interface LeadStats {
  total: number;
  recent: number;
  byStatus: Array<{ status: string; _count: number }>;
}

export interface ProcessData {
  numeroProcesso: string;
  classe: { nome: string };
  sistema: { nome: string };
  tribunal: string;
  dataHoraUltimaAtualizacao: string;
  movimentos: ProcessMove[];
}

export interface ProcessMove {
  dataHora: string;
  nome: string;
  complementosTabelados?: { nome: string; valor: string | number }[];
}
