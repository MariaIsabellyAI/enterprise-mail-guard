import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialPostService } from '@/model/services/SocialPostService';
import { SocialPostInput, SocialPostFilters } from '@/model/entities/SocialPost';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function useSocialViewModel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<SocialPostFilters>({});

  // Queries
  const postsQuery = useQuery({
    queryKey: ['social-posts', filters],
    queryFn: () => socialPostService.getFiltered(filters),
  });

  const trendQuery = useQuery({
    queryKey: ['social-trend', filters.dataInicio, filters.dataFim],
    queryFn: () => {
      if (filters.dataInicio && filters.dataFim) {
        return socialPostService.getTrendByPeriod(filters.dataInicio, filters.dataFim);
      }
      // Default: last 7 days
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return socialPostService.getTrendByPeriod(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
    },
    enabled: true,
  });

  const statsQuery = useQuery({
    queryKey: ['social-stats', filters],
    queryFn: () => socialPostService.getStats(filters),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (post: SocialPostInput) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      return socialPostService.create(post, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      queryClient.invalidateQueries({ queryKey: ['social-trend'] });
      queryClient.invalidateQueries({ queryKey: ['social-stats'] });
      toast({ title: 'Publicação criada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar publicação', description: error.message, variant: 'destructive' });
    },
  });

  const createManyMutation = useMutation({
    mutationFn: (posts: SocialPostInput[]) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      return socialPostService.createMany(posts, user.id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      queryClient.invalidateQueries({ queryKey: ['social-trend'] });
      queryClient.invalidateQueries({ queryKey: ['social-stats'] });
      toast({ title: `${data.length} publicações criadas com sucesso!` });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar publicações', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SocialPostInput> }) =>
      socialPostService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      queryClient.invalidateQueries({ queryKey: ['social-trend'] });
      toast({ title: 'Publicação atualizada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar publicação', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => socialPostService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      queryClient.invalidateQueries({ queryKey: ['social-trend'] });
      queryClient.invalidateQueries({ queryKey: ['social-stats'] });
      toast({ title: 'Publicação excluída com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir publicação', description: error.message, variant: 'destructive' });
    },
  });

  // Actions
  const applyFilters = useCallback((newFilters: SocialPostFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const generatePDF = useCallback(() => {
    const posts = postsQuery.data || [];
    if (posts.length === 0) {
      toast({ title: 'Nenhuma publicação para exportar', variant: 'destructive' });
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Relatório de Publicações - Redes Sociais', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const periodoText = filters.dataInicio && filters.dataFim 
      ? `Período: ${new Date(filters.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(filters.dataFim).toLocaleDateString('pt-BR')}`
      : 'Período: Todos';
    doc.text(periodoText, 14, 30);
    doc.text(`Total de publicações: ${posts.length}`, 14, 36);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 42);

    // Table
    const tableData = posts.map(post => [
      new Date(post.data_publicacao).toLocaleDateString('pt-BR'),
      post.tema,
      post.texto.substring(0, 50) + (post.texto.length > 50 ? '...' : ''),
      post.link.substring(0, 30) + (post.link.length > 30 ? '...' : ''),
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Data', 'Tema', 'Texto', 'Link']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save('publicacoes-redes-sociais.pdf');
    toast({ title: 'PDF gerado com sucesso!' });
  }, [postsQuery.data, filters, toast]);

  return {
    // State
    filters,
    posts: postsQuery.data || [],
    trendData: trendQuery.data || [],
    stats: statsQuery.data,
    isLoading: postsQuery.isLoading,
    isTrendLoading: trendQuery.isLoading,
    
    // Actions
    applyFilters,
    clearFilters,
    createPost: createMutation.mutateAsync,
    createManyPosts: createManyMutation.mutateAsync,
    updatePost: updateMutation.mutateAsync,
    deletePost: deleteMutation.mutateAsync,
    generatePDF,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
