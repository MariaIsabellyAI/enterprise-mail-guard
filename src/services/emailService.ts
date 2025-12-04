import { supabase } from '@/integrations/supabase/client';
import { Email, DashboardStats, EmailsByState, TopDestinatario, TrendData } from '@/types';

export const emailService = {
  async getAll(): Promise<Email[]> {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .order('data_envio', { ascending: false });
    
    if (error) throw error;
    return data as Email[];
  },

  async getPending(): Promise<Email[]> {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('classificado', false)
      .order('data_envio', { ascending: false });
    
    if (error) throw error;
    return data as Email[];
  },

  async getById(id: string): Promise<Email | null> {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as Email | null;
  },

  async create(email: Omit<Email, 'id' | 'created_at' | 'updated_at'>): Promise<Email> {
    const { data, error } = await supabase
      .from('emails')
      .insert(email)
      .select()
      .single();
    
    if (error) throw error;
    return data as Email;
  },

  async update(id: string, updates: Partial<Email>): Promise<Email> {
    const { data, error } = await supabase
      .from('emails')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Email;
  },

  async updateMany(emails: { id: string; estado: string; municipio: string }[]): Promise<void> {
    const promises = emails.map(email => 
      supabase
        .from('emails')
        .update({ 
          estado: email.estado, 
          municipio: email.municipio,
          classificado: !!(email.estado && email.municipio)
        })
        .eq('id', email.id)
    );
    
    await Promise.all(promises);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getStats(): Promise<DashboardStats> {
    const { data, error } = await supabase
      .from('emails')
      .select('classificado');
    
    if (error) throw error;
    
    const total = data.length;
    const classificados = data.filter(e => e.classificado).length;
    const pendentes = total - classificados;
    
    return { total, classificados, pendentes };
  },

  async getEmailsByState(): Promise<EmailsByState[]> {
    const { data, error } = await supabase
      .from('emails')
      .select('estado')
      .not('estado', 'is', null);
    
    if (error) throw error;
    
    const counts: Record<string, number> = {};
    data.forEach(email => {
      if (email.estado) {
        counts[email.estado] = (counts[email.estado] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .map(([estado, count]) => ({ estado, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  },

  async getTopDestinatarios(): Promise<TopDestinatario[]> {
    const { data, error } = await supabase
      .from('emails')
      .select('destinatario');
    
    if (error) throw error;
    
    const counts: Record<string, number> = {};
    data.forEach(email => {
      counts[email.destinatario] = (counts[email.destinatario] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([destinatario, count]) => ({ destinatario, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  },

  async getTrend(): Promise<TrendData[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('emails')
      .select('data_envio')
      .gte('data_envio', sevenDaysAgo.toISOString());
    
    if (error) throw error;
    
    const counts: Record<string, number> = {};
    
    // Helper to get local date string (YYYY-MM-DD)
    const toLocalDateStr = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Initialize buckets with local dates
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      counts[toLocalDateStr(date)] = 0;
    }
    
    // Count emails using local timezone conversion
    data.forEach(email => {
      if (email.data_envio) {
        const emailDate = new Date(email.data_envio);
        const dateStr = toLocalDateStr(emailDate);
        if (counts[dateStr] !== undefined) {
          counts[dateStr]++;
        }
      }
    });
    
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }
};
