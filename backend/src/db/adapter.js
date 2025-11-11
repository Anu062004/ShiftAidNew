import { getSupabase } from './supabase.js';

function isUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value));
}

// NGOs (Supabase only)
export const NGOs = {
  async list({ category, verified, search }) {
    const sb = getSupabase();
    let q = sb.from('ngos').select('*');
    if (category) q = q.eq('category', category);
    if (typeof verified === 'boolean') q = q.eq('verified', verified);
    if (search) q = q.textSearch('name', search, { type: 'websearch' });
    const { data, error } = await q.order('totalDonations', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async getById(id) {
    const sb = getSupabase();
    const { data, error } = await sb.from('ngos').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },
  async findByWallet(walletAddress) {
    const sb = getSupabase();
    const { data, error } = await sb.from('ngos').select('*').eq('walletAddress', walletAddress.toLowerCase()).single();
    if (error) return null;
    return data;
  },
  async create(payload) {
    const sb = getSupabase();
    const { data, error } = await sb.from('ngos').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  },
  async verify(id) {
    const sb = getSupabase();
    const { data, error } = await sb.from('ngos').update({ verified: true }).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },
  async update(id, changes) {
    const sb = getSupabase();
    const { data, error } = await sb.from('ngos').update({ ...changes, updatedAt: new Date().toISOString() }).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },
  isValidId(id) {
    return isUUID(id);
  }
};

// Donations (Supabase only)
export const Donations = {
  async create(doc) {
    const sb = getSupabase();
    const { data, error } = await sb.from('donations').insert(doc).select('*').single();
    if (error) throw error;
    return data;
  },
  async getById(id) {
    const sb = getSupabase();
    const { data, error } = await sb.from('donations').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },
  async listByDonor(donorAddress) {
    const sb = getSupabase();
    const { data, error } = await sb.from('donations').select('*')
      .eq('donorAddress', donorAddress.toLowerCase())
      .order('createdAt', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },
  async listByNGO(ngoId) {
    const sb = getSupabase();
    const { data, error } = await sb.from('donations').select('*')
      .eq('ngoId', ngoId)
      .order('createdAt', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data || [];
  },
  async list({ page = 1, limit = 20, status }) {
    const sb = getSupabase();
    let q = sb.from('donations').select('*', { count: 'exact' });
    if (status) q = q.eq('status', status);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    q = q.order('createdAt', { ascending: false }).range(from, to);
    const { data, error, count } = await q;
    if (error) throw error;
    return { donations: data || [], total: count || 0 };
  },
  async findByOrderId(orderId) {
    const sb = getSupabase();
    const { data, error } = await sb.from('donations').select('*').eq('sideshiftOrderId', orderId).single();
    if (error) return null;
    return data;
  },
  async update(id, changes) {
    const sb = getSupabase();
    const { data, error } = await sb.from('donations').update({ ...changes, updatedAt: new Date().toISOString() }).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },
  isValidId(id) {
    return isUUID(id);
  }
};

export function usingSupabase() {
  return true;
}


