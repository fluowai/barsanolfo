
import React from 'react';
import { NavItem, Service, TeamMember } from './types';

// ============================================
// API CONFIGURATION
// ============================================
export const API_BASE_URL = '';
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
  empresarial: { label: 'Direito Empresarial', code: 'empresarial' },
  societario: { label: 'Societário e M&A', code: 'societario' },
  patrimonial: { label: 'Patrimônio e Sucessão', code: 'patrimonial' },
  contratos: { label: 'Contratos Estratégicos', code: 'contratos' },
} as const;

// ============================================
// NAVIGATION
// ============================================
export const NAV_ITEMS: NavItem[] = [
  { label: 'Escritório', href: '#escritorio' },
  { label: 'Atuação', href: '#atuacao' },
  { label: 'Sócios', href: '#equipe' },
  { label: 'Contato', href: '#contato' },
  { label: 'Área do cliente', href: '/painel/login' },
];

// ============================================
// SERVICES
// ============================================
export const SERVICES: Service[] = [
  {
    id: 'empresarial', title: 'Estratégia empresarial',
    description: 'Apoio jurídico permanente para decisões de gestão, expansão, governança e mitigação de riscos.', icon: 'Building2',
  },
  {
    id: 'societario', title: 'Societário e M&A',
    description: 'Constituição, reorganização, acordos de sócios, investimentos, aquisições e saídas estruturadas.', icon: 'Network',
  },
  {
    id: 'contratos', title: 'Contratos estratégicos',
    description: 'Negociação e desenho de contratos comerciais alinhados à operação e aos objetivos do negócio.', icon: 'FileSignature',
  },
  {
    id: 'patrimonio', title: 'Patrimônio e sucessão',
    description: 'Planejamento patrimonial e sucessório para famílias empresárias, holdings e ativos relevantes.', icon: 'Landmark',
  },
  {
    id: 'disputas', title: 'Disputas complexas',
    description: 'Condução estratégica de conflitos societários, contratuais e empresariais de alta relevância.', icon: 'Scale',
  },
];

// ============================================
// TEAM
// ============================================
export const TEAM: TeamMember[] = [
  {
    name: 'Helena Prado', role: 'Sócia · Estratégia empresarial',
    bio: 'Atua na estruturação de negócios, governança e decisões societárias sensíveis. Combina rigor técnico com uma leitura prática do ambiente empresarial.',
    image: '/assets/helena-prado.png',
  },
  {
    name: 'Caio Lume', role: 'Sócio · Contratos e disputas',
    bio: 'Conduz negociações, contratos estratégicos e conflitos empresariais. Sua atuação é orientada por clareza, antecipação de riscos e soluções executáveis.',
    image: '/assets/caio-lume.png',
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
