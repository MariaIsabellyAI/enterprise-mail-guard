import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSocialViewModel } from '@/viewmodel/social/useSocialViewModel';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2, Send, ArrowLeft } from 'lucide-react';

const postSchema = z.object({
  data_publicacao: z.string().min(1, 'Data é obrigatória'),
  link: z.string().url('Link inválido').min(1, 'Link é obrigatório'),
  tema: z.string().min(1, 'Tema é obrigatório').max(100, 'Tema deve ter no máximo 100 caracteres'),
  texto: z.string().min(1, 'Texto é obrigatório').max(2000, 'Texto deve ter no máximo 2000 caracteres'),
});

const formSchema = z.object({
  posts: z.array(postSchema).min(1, 'Adicione pelo menos uma publicação'),
});

type FormData = z.infer<typeof formSchema>;

export default function SocialFormView() {
  const navigate = useNavigate();
  const { createManyPosts, isCreating } = useSocialViewModel();

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      posts: [{ data_publicacao: '', link: '', tema: '', texto: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'posts',
  });

  const onSubmit = async (data: FormData) => {
    try {
      const validPosts = data.posts.map(post => ({
        data_publicacao: post.data_publicacao,
        link: post.link,
        tema: post.tema,
        texto: post.texto,
      }));
      await createManyPosts(validPosts);
      navigate('/redes-sociais');
    } catch (error) {
      // Error handled by viewmodel
    }
  };

  const addPost = () => {
    append({ data_publicacao: '', link: '', tema: '', texto: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/redes-sociais')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
          title="Nova Publicação" 
          description="Adicione uma ou mais publicações de redes sociais"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <Card key={field.id} className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">
                Publicação {index + 1}
              </CardTitle>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`posts.${index}.data_publicacao`}>Data da Publicação *</Label>
                  <Input
                    type="datetime-local"
                    {...register(`posts.${index}.data_publicacao`)}
                  />
                  {errors.posts?.[index]?.data_publicacao && (
                    <p className="text-sm text-destructive">{errors.posts[index]?.data_publicacao?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`posts.${index}.tema`}>Tema *</Label>
                  <Input
                    placeholder="Ex: Campanha de Natal"
                    {...register(`posts.${index}.tema`)}
                  />
                  {errors.posts?.[index]?.tema && (
                    <p className="text-sm text-destructive">{errors.posts[index]?.tema?.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`posts.${index}.link`}>Link da Publicação *</Label>
                <Input
                  type="url"
                  placeholder="https://instagram.com/p/..."
                  {...register(`posts.${index}.link`)}
                />
                {errors.posts?.[index]?.link && (
                  <p className="text-sm text-destructive">{errors.posts[index]?.link?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`posts.${index}.texto`}>Texto Publicado *</Label>
                <Textarea
                  placeholder="Conteúdo da publicação..."
                  rows={4}
                  {...register(`posts.${index}.texto`)}
                />
                {errors.posts?.[index]?.texto && (
                  <p className="text-sm text-destructive">{errors.posts[index]?.texto?.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={addPost}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Publicação
          </Button>

          <Button
            type="submit"
            disabled={isCreating}
            className="flex items-center gap-2 sm:ml-auto"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Salvar {fields.length > 1 ? 'Publicações' : 'Publicação'}
          </Button>
        </div>
      </form>
    </div>
  );
}
