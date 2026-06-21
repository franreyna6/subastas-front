import { api } from './apiClient';
import { authStore, AuthSession } from '@/lib/store/authStore';

export const authApi = {
  async login(email: string, password: string) {
    const result = await api.post<AuthSession>('/api/auth/login', { email, password });
    if (result.data) {
      await authStore.save(result.data);
    }
    return result;
  },

  async register(data: {
    nombre: string;
    documento: string;
    direccion?: string;
    email: string;
    password: string;
    rol: 'cliente' | 'duenio';
  }) {
    return api.post<{ mensaje: string; userId: number }>('/api/auth/register', data);
  },

  async preRegister(data: {
    nombre: string;
    documento: string;
    direccion?: string;
    telefono?: string;
    pais?: number;
    email: string;
    rol: 'cliente' | 'duenio';
    fotoFrenteBase64?: string;
    fotoDorsoBase64?: string;
  }) {
    return api.post<{ mensaje: string; preRegistroId: number }>('/api/auth/pre-register', data);
  },

  async completeRegistration(data: {
    codigo: string;
    password: string;
  }) {
    return api.post<{ mensaje: string; userId: number }>('/api/auth/complete-registration', data);
  },

  async logout() {
    await authStore.clear();
  },
};
