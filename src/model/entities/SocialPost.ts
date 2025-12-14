export interface SocialPost {
  id: string;
  user_id: string;
  data_publicacao: string;
  link: string;
  tema: string;
  texto: string;
  created_at: string;
  updated_at: string;
}

export interface SocialPostInput {
  data_publicacao: string;
  link: string;
  tema: string;
  texto: string;
}

export interface SocialPostFilters {
  dataInicio?: string;
  dataFim?: string;
}

export interface SocialTrendData {
  date: string;
  count: number;
}
