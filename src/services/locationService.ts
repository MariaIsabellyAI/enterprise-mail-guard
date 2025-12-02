import { supabase } from '@/integrations/supabase/client';
import { Estado, Municipio } from '@/types';

export const locationService = {
  async getEstados(): Promise<Estado[]> {
    const { data, error } = await supabase
      .from('estados')
      .select('*')
      .order('sigla');
    
    if (error) throw error;
    return data as Estado[];
  },

  async getMunicipios(estadoSigla?: string): Promise<Municipio[]> {
    let query = supabase.from('municipios').select('*');
    
    if (estadoSigla) {
      query = query.eq('estado_sigla', estadoSigla);
    }
    
    const { data, error } = await query.order('nome');
    
    if (error) throw error;
    return data as Municipio[];
  }
};
