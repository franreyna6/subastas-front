import { supabase } from '@/lib/supabase';

export const authService = {
  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(email: string, password: string, meta: {
    full_name: string;
    phone: string;
    dni: string;
    address: string;
    country: string;
  }) {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'subastas://reset-password',
    });
  },

  async getUser() {
    return supabase.auth.getUser();
  },
};
