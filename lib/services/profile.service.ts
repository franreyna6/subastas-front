import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  dni: string | null;
  address: string | null;
  country: string | null;
  category: 'BRONCE' | 'PLATA' | 'ORO';
  created_at: string;
}

export interface UserStats {
  total_bid: number;
  participated: number;
  won: number;
  payments: number;
}

export const profileService = {
  async getCurrent() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('No autenticado') };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return { data: data as Profile | null, error };
  },

  async getStats() {
    const { data, error } = await supabase.rpc('get_user_stats');
    return { data: data as UserStats | null, error };
  },
};
