import { supabase } from '@/lib/supabase';

export type AuctionStatus = 'UPCOMING' | 'LIVE' | 'CLOSED';

export interface Auction {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  base_price: number;
  current_price: number;
  image_url: string | null;
  status: AuctionStatus;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export const auctionsService = {
  async getActive() {
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .in('status', ['LIVE', 'UPCOMING'])
      .order('status', { ascending: false })
      .order('starts_at', { ascending: true });
    return { data: data as Auction[] | null, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', id)
      .single();
    return { data: data as Auction | null, error };
  },
};
