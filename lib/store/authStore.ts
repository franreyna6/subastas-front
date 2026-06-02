import AsyncStorage from '@react-native-async-storage/async-storage';

export type Rol = 'cliente' | 'duenio';

export interface AuthSession {
  token: string;
  rol: Rol;
  userId: number;
  nombre: string;
}

export const authStore = {
  async save(session: AuthSession) {
    await AsyncStorage.setItem('auth_token', session.token);
    await AsyncStorage.setItem('auth_session', JSON.stringify(session));
  },

  async get(): Promise<AuthSession | null> {
    const raw = await AsyncStorage.getItem('auth_session');
    return raw ? JSON.parse(raw) : null;
  },

  async clear() {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_session');
  },
};
