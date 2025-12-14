import { socialPostRepository } from '../repositories/SocialPostRepository';
import { SocialPost, SocialPostInput, SocialTrendData, SocialPostFilters } from '../entities/SocialPost';

export const socialPostService = {
  async getAll(): Promise<SocialPost[]> {
    return socialPostRepository.getAll();
  },

  async getFiltered(filters: SocialPostFilters): Promise<SocialPost[]> {
    if (filters.dataInicio && filters.dataFim) {
      return socialPostRepository.getByPeriod(filters.dataInicio, filters.dataFim);
    }
    return socialPostRepository.getAll();
  },

  async getById(id: string): Promise<SocialPost | null> {
    return socialPostRepository.getById(id);
  },

  async create(post: SocialPostInput, userId: string): Promise<SocialPost> {
    return socialPostRepository.create(post, userId);
  },

  async createMany(posts: SocialPostInput[], userId: string): Promise<SocialPost[]> {
    return socialPostRepository.createMany(posts, userId);
  },

  async update(id: string, updates: Partial<SocialPostInput>): Promise<SocialPost> {
    return socialPostRepository.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    return socialPostRepository.delete(id);
  },

  async getTrendByPeriod(dataInicio: string, dataFim: string): Promise<SocialTrendData[]> {
    const posts = await socialPostRepository.getByPeriod(dataInicio, dataFim);
    
    const toLocalDateStr = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Create date range buckets
    const counts: Record<string, number> = {};
    const start = new Date(dataInicio);
    const end = new Date(dataFim);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      counts[toLocalDateStr(d)] = 0;
    }

    // Count posts per day
    posts.forEach(post => {
      const postDate = new Date(post.data_publicacao);
      const dateStr = toLocalDateStr(postDate);
      if (counts[dateStr] !== undefined) {
        counts[dateStr]++;
      }
    });

    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  },

  async getStats(filters: SocialPostFilters): Promise<{ total: number }> {
    const posts = await this.getFiltered(filters);
    return { total: posts.length };
  },
};
