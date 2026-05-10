import { STORAGE_KEYS } from '../constants';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
});

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!data.success && !res.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }
  return data;
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: any) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: any) => request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(url: string, body: any) => request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};

export const leadsApi = {
  list: (params?: string) => api.get(`/api/leads${params ? `?${params}` : ''}`),
  get: (id: string) => api.get(`/api/leads/${id}`),
  create: (data: any) => api.post('/api/leads', data),
  update: (id: string, data: any) => api.put(`/api/leads/${id}`, data),
  updateStatus: (id: string, status: string) => api.put(`/api/leads/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/api/leads/${id}`),
  convert: (id: string) => api.post(`/api/leads/${id}/convert`, {}),
  stats: () => api.get('/api/leads/stats'),
  addInteraction: (id: string, data: any) => api.post(`/api/leads/${id}/interactions`, data),
  saveTriage: (id: string, data: any) => api.post(`/api/leads/${id}/triage`, data),
};

export const clientsApi = {
  list: () => api.get('/api/clients'),
  get: (id: string) => api.get(`/api/clients/${id}`),
  create: (data: any) => api.post('/api/clients', data),
  update: (id: string, data: any) => api.put(`/api/clients/${id}`, data),
  patch: (id: string, data: any) => api.patch(`/api/clients/${id}`, data),
  delete: (id: string) => api.delete(`/api/clients/${id}`),
};

export const casesApi = {
  list: () => api.get('/api/cases'),
  get: (id: string) => api.get(`/api/cases/${id}`),
  create: (data: any) => api.post('/api/cases', data),
  update: (id: string, data: any) => api.patch(`/api/cases/${id}`, data),
  delete: (id: string) => api.delete(`/api/cases/${id}`),
  importFromDatajud: (data: any) => api.post('/api/cases/import', data),
};

export const deadlinesApi = {
  list: () => api.get('/api/deadlines'),
  get: (id: string) => api.get(`/api/deadlines/${id}`),
  create: (data: any) => api.post('/api/deadlines', data),
  update: (id: string, data: any) => api.put(`/api/deadlines/${id}`, data),
  delete: (id: string) => api.delete(`/api/deadlines/${id}`),
};

export const tasksApi = {
  list: () => api.get('/api/tasks'),
  get: (id: string) => api.get(`/api/tasks/${id}`),
  create: (data: any) => api.post('/api/tasks', data),
  update: (id: string, data: any) => api.put(`/api/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/api/tasks/${id}`),
  addChecklist: (id: string, content: string) => api.post(`/api/tasks/${id}/checklist`, { content }),
  updateChecklist: (itemId: string, completed: boolean) => api.put(`/api/tasks/checklist/${itemId}`, { completed }),
  deleteChecklist: (itemId: string) => api.delete(`/api/tasks/checklist/${itemId}`),
  addComment: (id: string, content: string) => api.post(`/api/tasks/${id}/comments`, { content }),
};

export const hearingsApi = {
  list: () => api.get('/api/hearings'),
  get: (id: string) => api.get(`/api/hearings/${id}`),
  create: (data: any) => api.post('/api/hearings', data),
  update: (id: string, data: any) => api.put(`/api/hearings/${id}`, data),
  delete: (id: string) => api.delete(`/api/hearings/${id}`),
};

export const documentsApi = {
  list: () => api.get('/api/documents'),
  get: (id: string) => api.get(`/api/documents/${id}`),
  create: (data: any) => api.post('/api/documents', data),
  update: (id: string, data: any) => api.put(`/api/documents/${id}`, data),
  delete: (id: string) => api.delete(`/api/documents/${id}`),
};

export const contractsApi = {
  list: () => api.get('/api/contracts'),
  get: (id: string) => api.get(`/api/contracts/${id}`),
  create: (data: any) => api.post('/api/contracts', data),
  update: (id: string, data: any) => api.put(`/api/contracts/${id}`, data),
  delete: (id: string) => api.delete(`/api/contracts/${id}`),
  templates: () => api.get('/api/contracts/templates'),
};

export const notificationsApi = {
  list: () => api.get('/api/notifications'),
  unreadCount: () => api.get('/api/notifications/unread-count'),
  markRead: (id: string) => api.put(`/api/notifications/${id}/read`, {}),
  markAllRead: () => api.put('/api/notifications/read-all', {}),
};

export const automationsApi = {
  list: () => api.get('/api/automations'),
  create: (data: any) => api.post('/api/automations', data),
  update: (id: string, data: any) => api.put(`/api/automations/${id}`, data),
  toggle: (id: string) => api.put(`/api/automations/${id}/toggle`, {}),
  delete: (id: string) => api.delete(`/api/automations/${id}`),
  logs: () => api.get('/api/automations/logs'),
};

export const teamApi = {
  list: () => api.get('/api/team'),
  create: (data: any) => api.post('/api/team', data),
  update: (id: string, data: any) => api.put(`/api/team/${id}`, data),
  delete: (id: string) => api.delete(`/api/team/${id}`),
};
