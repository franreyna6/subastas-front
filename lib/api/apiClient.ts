import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Dispositivo físico → IP local de la máquina de desarrollo (actualizada a localtunnel estable)
const BASE_URL = Platform.select({
  android: 'https://subastas-back-reyna.loca.lt',
  default: 'https://subastas-back-reyna.loca.lt',
});

export { BASE_URL };

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: string | null }> {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true', // Evita la pantalla de advertencia de localtunnel
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return { data: null, error: json?.error ?? `Error ${res.status}` };
    }
    return { data: json as T, error: null };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error de conexión con el servidor';
    return { data: null, error: msg };
  }
}

export const api = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT',    body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
