import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { socialPostService } from '@/model/services/SocialPostService';
import { useSocialViewModel } from '@/viewmodel/social/useSocialViewModel';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  data_publicacao: z.string().min(1, 'Data é obrigatória'),
  link: z.string().url('Link inválido').min(1, 'Link é obrigatório'),
  tema: z.string().min(1, 'Tema é obrigatório').max(100, 'Tema deve ter no máximo 100 caracteres'),
  texto: z.string().min(1, 'Texto é obrigatório').max(2000, 'Texto deve ter no máximo 2000 caracteres'),
});

type FormData = z.infer<typeof formSchema>;

export default function SocialEditView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updatePost, isUpdating } = useSocialViewModel();

  const { data: post, isLoading } = useQuery({
    queryKey: ['social-post', id],
    queryFn: () => socialPostService.getById(id!),
    enabled: !!id,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (post) {
      const dataPublicacao = new Date(post.data_publicacao);
      const formattedDate = dataPublicacao.toISOString().slice(0, 16);
      
      reset({
        data_publicacao: formattedDate,
        link: post.link,
        tema: post.tema,
        texto: post.texto,
      });
    }
  }, [post, reset]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    try {
      await updatePost({ id, updates: data });
      navigate('/redes-sociais');
    } catch (error) {
      // Error handled by viewmodel
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Publicação não encontrada</p>
        <Button variant="link" onClick={() => navigate('/redes-sociais')}>
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/redes-sociais')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
          title="Editar Publicação" 
          description="Atualize os dados da publicação"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="data_publicacao">Data da Publicação *</Label>
                <Input
                  type="datetime-local"
                  {...register('data_publicacao')}
                />
                {errors.data_publicacao && (
                  <p className="text-sm text-destructive">{errors.data_publicacao.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tema">Tema *</Label>
                <Input
                  placeholder="Ex: Campanha de Natal"
                  {...register('tema')}
                />
                {errors.tema && (
                  <p className="text-sm text-destructive">{errors.tema.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link da Publicação *</Label>
              <Input
                type="url"
                placeholder="https://instagram.com/p/..."
                {...register('link')}
              />
              {errors.link && (
                <p className="text-sm text-destructive">{errors.link.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="texto">Texto Publicado *</Label>
              <Textarea
                placeholder="Conteúdo da publicação..."
                rows={6}
                {...register('texto')}
              />
              {errors.texto && (
                <p className="text-sm text-destructive">{errors.texto.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isUpdating} className="flex items-center gap-2">
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
