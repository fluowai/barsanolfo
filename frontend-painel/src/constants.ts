export const STORAGE_KEYS = {
  AUTH_TOKEN: 'barsa_auth_token',
  REFRESH_TOKEN: 'barsa_refresh_token',
  USER: 'barsa_user',
  THEME: 'barsa_theme',
} as const;

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
  ME: '/api/auth/me',
} as const;

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
