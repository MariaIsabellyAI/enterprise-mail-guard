import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { LocationSelect } from '@/components/ui/location-select';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.object({
  remetente: z.string().email('E-mail do remetente inválido'),
  destinatario: z.string().email('E-mail do destinatário inválido'),
  assunto: z.string().min(1, 'Assunto é obrigatório'),
  corpo: z.string().optional(),
  data_envio: z.string().min(1, 'Data é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  municipio: z.string().min(1, 'Município é obrigatório'),
});

export default function NewEmail() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    remetente: '',
    destinatario: '',
    assunto: '',
    corpo: '',
    data_envio: '',
    estado: '',
    municipio: '',
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const validated = emailSchema.parse(formData);
      
      await emailService.create({
        remetente: validated.remetente,
        destinatario: validated.destinatario,
        assunto: validated.assunto,
        corpo: validated.corpo || null,
        data_envio: new Date(validated.data_envio).toISOString(),
        estado: validated.estado,
        municipio: validated.municipio,
        classificado: true,
        colaborador_id: profile?.id || null,
      });
    },
    onSuccess: () => {
      toast({ title: 'E-mail cadastrado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      navigate('/lista');
    },
    onError: (error) => {
      if (error instanceof z.ZodError) {
        toast({ variant: 'destructive', title: error.errors[0].message });
      } else {
        toast({ variant: 'destructive', title: 'Erro ao cadastrar', description: error.message });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Novo E-mail Manual" 
        description="Preencha os dados do envio"
      />

      <Card className="max-w-2xl animate-fade-in">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="remetente">Remetente</Label>
                <Input
                  id="remetente"
                  type="email"
                  placeholder="remetente@empresa.com"
                  value={formData.remetente}
                  onChange={(e) => setFormData({ ...formData, remetente: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinatario">Destinatário</Label>
                <Input
                  id="destinatario"
                  type="email"
                  placeholder="destinatario@dominio.com"
                  value={formData.destinatario}
                  onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_envio">Data / Hora</Label>
              <Input
                id="data_envio"
                type="datetime-local"
                value={formData.data_envio}
                onChange={(e) => setFormData({ ...formData, data_envio: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assunto">Assunto</Label>
              <Input
                id="assunto"
                placeholder="Assunto do e-mail"
                value={formData.assunto}
                onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="corpo">Corpo da mensagem</Label>
              <Textarea
                id="corpo"
                placeholder="Digite o conteúdo do e-mail..."
                rows={6}
                value={formData.corpo}
                onChange={(e) => setFormData({ ...formData, corpo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Localização</Label>
              <LocationSelect
                estado={formData.estado}
                municipio={formData.municipio}
                onEstadoChange={(val) => setFormData({ ...formData, estado: val, municipio: '' })}
                onMunicipioChange={(val) => setFormData({ ...formData, municipio: val })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
