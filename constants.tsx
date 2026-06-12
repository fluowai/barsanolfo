
import React from 'react';
import { Gavel, Scale, Briefcase, Users, FileText, ShieldAlert } from 'lucide-react';
import { NavItem, Service, TeamMember } from './types';

// ============================================
// API CONFIGURATION
// ============================================
export const API_BASE_URL = 'http://localhost:5032';
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  CONTACT: '/api/contact',
  LEADS: '/api/leads',
  LEADS_STATS: '/api/leads/stats',
  CLIENTS: '/api/clients',
  CASES: '/api/cases',
  CASES_IMPORT: '/api/cases/import',
  DATAJUD_SEARCH: '/api/datajud/search',
  TEAM: '/api/team',
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH_TOKEN: '/api/auth/refresh',
  ME: '/api/auth/me',
} as const;

// ============================================
// VALIDATION PATTERNS
// ============================================
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
  CPF_REGEX: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CNJ_PROCESS_REGEX: /^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/,
  MIN_PASSWORD_LENGTH: 8,
} as const;

// ============================================
// STATUS & ENUMS
// ============================================
export const LEAD_STATUS = {
  NEW: { label: 'Novo', color: '#3b82f6', code: 'NEW' },
  CONTACTED: { label: 'Contactado', color: '#f59e0b', code: 'CONTACTED' },
  QUALIFIED: { label: 'Qualificado', color: '#8b5cf6', code: 'QUALIFIED' },
  CONVERTED: { label: 'Convertido', color: '#10b981', code: 'CONVERTED' },
  LOST: { label: 'Perdido', color: '#ef4444', code: 'LOST' },
} as const;

export const CASE_STATUS = {
  ACTIVE: { label: 'Ativo', color: '#10b981' },
  SUSPENDED: { label: 'Suspenso', color: '#f59e0b' },
  ARCHIVED: { label: 'Arquivado', color: '#6b7280' },
  CLOSED: { label: 'Encerrado', color: '#ef4444' },
} as const;

export const USER_ROLES = {
  ADMIN: { label: 'Administrador', permissions: ['all'] },
  LAWYER: { label: 'Advogado', permissions: ['view', 'edit_own'] },
  SECRETARY: { label: 'Secretária', permissions: ['view', 'create_leads'] },
} as const;

export const PROBLEM_TYPES = {
  rescisao: { label: 'Rescisão Indireta', code: 'rescisao' },
  horas: { label: 'Horas Extras', code: 'horas' },
  assedio: { label: 'Assédio Moral', code: 'assedio' },
  outro: { label: 'Outros Direitos', code: 'outro' },
} as const;

// ============================================
// NAVIGATION
// ============================================
export const NAV_ITEMS: NavItem[] = [
  { label: 'Início', href: '#home' },
  { label: 'O Escritório', href: '#escritorio' },
  { label: 'Atuação', href: '#atuacao' },
  { label: 'Equipe', href: '#equipe' },
  { label: 'Contato', href: '#contato' },
  { label: 'Área Restrita', href: 'http://localhost:5034/painel/login' },
];

// ============================================
// SERVICES
// ============================================
export const SERVICES: Service[] = [
  {
    id: 'direitogestante',
    title: 'Direito da Gestante',
    description: 'Proteção integral à maternidade, garantindo estabilidade, licença e todos os direitos da mãe trabalhadora.',
    icon: 'ShieldAlert',
  },
  {
    id: 'rescisao',
    title: 'Rescisão Indireta',
    description: 'Quando a empresa comete falta grave, garantimos que você saia com todos os seus direitos preservados.',
    icon: 'ShieldAlert',
  },
  {
    id: 'horas-extras',
    title: 'Horas Extras e Intervalos',
    description: 'Cálculo e cobrança de horas trabalhadas além da jornada e intervalos não concedidos.',
    icon: 'Briefcase',
  },
  {
    id: 'assedio',
    title: 'Assédio Moral e Sexual',
    description: 'Defesa incisiva contra abusos no ambiente de trabalho, buscando justiça e reparação.',
    icon: 'Scale',
  },
  {
    id: 'acidente',
    title: 'Acidentes de Trabalho',
    description: 'Assessoria completa para indenizações por danos morais, materiais e estéticos decorrentes do trabalho.',
    icon: 'Gavel',
  },
  {
    id: 'documentacao',
    title: 'Vínculo Empregatício',
    description: 'Reconhecimento de direitos para trabalhadores sem carteira assinada ou com fraude na contratação.',
    icon: 'FileText',
  },
  {
    id: 'fgts',
    title: 'FGTS e Verbas Rescisórias',
    description: 'Garantia de que cada centavo devido na saída da empresa seja devidamente pago.',
    icon: 'Users',
  },
];

// ============================================
// TEAM
// ============================================
export const TEAM: TeamMember[] = [
  {
    name: 'Dra. Maria José Martins de Oliveira Almeida',
    role: 'Sócia | OAB/GO 43.681',
    bio: 'Advogada há 14 anos, formada pela UFG, especialista em Direito do Trabalho e Previdenciário. Atua com qualidade, proximidade e tecnologia na gestão da advocacia.',
    image: '/assets/prof-maria-jose.jpg',
  },
  {
    name: 'Dra. Amanda Martins de Oliveira Brandão',
    role: 'Sócia | OAB/GO 69.838',
    bio: 'Advogada formada pela Universo, pós-graduada em Direito do Trabalho. Atua nas áreas trabalhista e cível com foco em negociações complexas e defesa de direitos.',
    image: '/assets/prof-amanda.jpg.jpeg',
  },
];

// ============================================
// STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'woojuris_auth_token',
  REFRESH_TOKEN: 'woojuris_refresh_token',
  USER: 'woojuris_user',
  THEME: 'woojuris_theme',
} as const;
