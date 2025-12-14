import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocialViewModel } from '@/viewmodel/social/useSocialViewModel';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Calendar, 
  Loader2, 
  Share2, 
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  FileDown,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Filter,
  X
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const ITEMS_PER_PAGE = 10;

export default function SocialListView() {
  const navigate = useNavigate();
  const { 
    posts, 
    trendData,
    stats,
    isLoading, 
    isTrendLoading,
    filters,
    applyFilters,
    clearFilters,
    deletePost,
    isDeleting,
    generatePDF
  } = useSocialViewModel();

  const [dataInicio, setDataInicio] = useState(filters.dataInicio || '');
  const [dataFim, setDataFim] = useState(filters.dataFim || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleApplyFilters = () => {
    applyFilters({ dataInicio, dataFim });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setDataInicio('');
    setDataFim('');
    clearFilters();
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deletePost(deleteId);
      setDeleteId(null);
    }
  };

  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters = filters.dataInicio || filters.dataFim;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Redes Sociais" 
          description={`${posts.length} publicações ${hasActiveFilters ? 'no período' : 'cadastradas'}`}
        />
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={generatePDF}
            disabled={posts.length === 0}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
          <Link to="/redes-sociais/nova">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Publicação</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtrar por Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dataInicio"
                  type="date"
                  className="pl-10"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dataFim"
                  type="date"
                  className="pl-10"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} disabled={!dataInicio || !dataFim}>
                <Search className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={handleClearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Publicações</p>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Publicações por Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {isTrendLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : trendData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Nenhum dado disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tickFormatter={(value) => {
                      const date = new Date(value + 'T12:00:00');
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value + 'T12:00:00');
                      return date.toLocaleDateString('pt-BR');
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginatedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Share2 className="h-12 w-12 mb-4 opacity-50" />
              <p>Nenhuma publicação encontrada</p>
              <Link to="/redes-sociais/nova">
                <Button variant="link" className="mt-2">
                  Adicionar primeira publicação
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium">Data</th>
                      <th className="text-left p-4 font-medium">Tema</th>
                      <th className="text-left p-4 font-medium">Texto</th>
                      <th className="text-left p-4 font-medium w-32">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPosts.map((post) => (
                      <tr key={post.id} className="border-b table-row-hover">
                        <td className="p-4">
                          <span className="font-medium">
                            {new Date(post.data_publicacao).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">{post.tema}</Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <span className="truncate block max-w-[300px]">
                            {post.texto}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <a 
                              href={post.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="icon" title="Abrir link">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Editar"
                              onClick={() => navigate(`/redes-sociais/editar/${post.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Excluir"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(post.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Publicação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
