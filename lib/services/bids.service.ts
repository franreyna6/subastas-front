import { supabase } from '@/lib/supabase';

export interface BidRow {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
  profiles?: { full_name: string | null };
}

export interface BidHistoryRow {
  auction_id: string;
  max_bid: number;
  title: string;
  status: string;
  current_price: number;
  image_url: string | null;
  ends_at: string | null;
  bid_status: string;
}

export const bidsService = {
  async getByAuction(auctionId: string) {
    const { data, error } = await supabase
      .from('bids')
      .select('*, profiles(full_name)')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })
      .limit(30);
    return { data: data as BidRow[] | null, error };
  },

  async place(auctionId: string, amount: number) {
    const { data, error } = await supabase.rpc('place_bid', {
      p_auction_id: auctionId,
      p_amount: amount,
    });
    return { data, error };
  },

  async getUserHistory() {
    const { data, error } = await supabase.rpc('get_user_bid_history');
    return { data: data as BidHistoryRow[] | null, error };
  },
};
