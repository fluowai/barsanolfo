import { api } from './api';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  perPage?: number;
}

class DataService {
  async fetchAll<T>(url: string, dataKey?: string): Promise<T[]> {
    const res = await api.get<ApiResponse<T[]>>(url);
    if (!res.success) throw new Error(res.message || 'Erro ao buscar dados');
    const list = dataKey ? (res as any)[dataKey] : (res as any).data || res;
    return Array.isArray(list) ? list : [];
  }

  async fetchOne<T>(url: string, dataKey?: string): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url);
    if (!res.success) throw new Error(res.message || 'Erro ao buscar dados');
    return dataKey ? (res as any)[dataKey] : (res as any).data || res;
  }

  async create<T>(url: string, data: any, dataKey?: string): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, data);
    if (!res.success) throw new Error(res.message || 'Erro ao criar registro');
    return dataKey ? (res as any)[dataKey] : (res as any).data || res;
  }

  async update<T>(url: string, data: any, dataKey?: string): Promise<T> {
    const res = await api.put<ApiResponse<T>>(url, data);
    if (!res.success) throw new Error(res.message || 'Erro ao atualizar registro');
    return dataKey ? (res as any)[dataKey] : (res as any).data || res;
  }

  async patch<T>(url: string, data: any, dataKey?: string): Promise<T> {
    const res = await api.patch<ApiResponse<T>>(url, data);
    if (!res.success) throw new Error(res.message || 'Erro ao atualizar registro');
    return dataKey ? (res as any)[dataKey] : (res as any).data || res;
  }

  async remove(url: string): Promise<void> {
    const res = await api.delete<ApiResponse<void>>(url);
    if (!res.success) throw new Error(res.message || 'Erro ao remover registro');
  }
}

export const dataService = new DataService();
