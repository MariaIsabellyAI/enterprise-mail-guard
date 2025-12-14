import { supabase } from '@/integrations/supabase/client';
import { SocialPost, SocialPostInput } from '../entities/SocialPost';

export const socialPostRepository = {
  async getAll(): Promise<SocialPost[]> {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .order('data_publicacao', { ascending: false });

    if (error) throw error;
    return data as SocialPost[];
  },

  async getByPeriod(dataInicio: string, dataFim: string): Promise<SocialPost[]> {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .gte('data_publicacao', dataInicio)
      .lte('data_publicacao', `${dataFim}T23:59:59.999Z`)
      .order('data_publicacao', { ascending: false });

    if (error) throw error;
    return data as SocialPost[];
  },

  async getById(id: string): Promise<SocialPost | null> {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as SocialPost | null;
  },

  async create(post: SocialPostInput, userId: string): Promise<SocialPost> {
    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        ...post,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as SocialPost;
  },

  async createMany(posts: SocialPostInput[], userId: string): Promise<SocialPost[]> {
    const postsWithUserId = posts.map(post => ({
      ...post,
      user_id: userId,
    }));

    const { data, error } = await supabase
      .from('social_posts')
      .insert(postsWithUserId)
      .select();

    if (error) throw error;
    return data as SocialPost[];
  },

  async update(id: string, updates: Partial<SocialPostInput>): Promise<SocialPost> {
    const { data, error } = await supabase
      .from('social_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SocialPost;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
