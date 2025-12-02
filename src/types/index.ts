export interface Profile {
  id: string;
  email: string;
  nome: string;
  tipo_usuario: 'admin' | 'colaborador';
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  remetente: string;
  destinatario: string;
  assunto: string;
  corpo: string | null;
  data_envio: string;
  estado: string | null;
  municipio: string | null;
  classificado: boolean;
  colaborador_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Municipio {
  id: number;
  nome: string;
  estado_sigla: string;
}

export interface DashboardStats {
  total: number;
  classificados: number;
  pendentes: number;
}

export interface EmailsByState {
  estado: string;
  count: number;
}

export interface TopDestinatario {
  destinatario: string;
  count: number;
}

export interface TrendData {
  date: string;
  count: number;
}
