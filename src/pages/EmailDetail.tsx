import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LocationSelect } from '@/components/ui/location-select';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Pencil, 
  Save, 
  X, 
  Loader2,
  Mail,
  User,
  Calendar,
  FileText,
  MapPin
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function EmailDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editOpen, setEditOpen] = useState(false);
  const [editState, setEditState] = useState('');
  const [editMunicipio, setEditMunicipio] = useState('');

  const { data: email, isLoading, error } = useQuery({
    queryKey: ['email', id],
    queryFn: () => emailService.getById(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!email) return;
      await emailService.update(email.id, {
        estado: editState,
        municipio: editMunicipio,
        classificado: !!(editState && editMunicipio),
      });
    },
    onSuccess: () => {
      toast({ title: 'Localização atualizada!' });
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['email', id] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    },
  });

  const openEditDialog = () => {
    setEditState(email?.estado || '');
    setEditMunicipio(email?.municipio || '');
    setEditOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Mail className="h-12 w-12 mb-4 opacity-50" />
        <p>E-mail não encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/lista')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Detalhes do E-mail">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </PageHeader>

      <Card className="max-w-3xl animate-fade-in">
        <CardContent className="p-6 space-y-6">
          {/* Header Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary-light">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remetente</p>
                <p className="font-medium">{email.remetente}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent-light">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destinatário</p>
                <p className="font-medium">{email.destinatario}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-info-light">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-medium">
                  {new Date(email.data_envio).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success-light">
                <MapPin className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Localização</p>
                <p className="font-medium">
                  {email.estado && email.municipio 
                    ? `${email.estado} - ${email.municipio}`
                    : 'Não classificado'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-warning-light">
              <FileText className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Assunto</p>
              <p className="font-semibold text-lg">{email.assunto}</p>
            </div>
          </div>

          {/* Message Body */}
          <div className="border-t pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Mensagem</p>
            <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap">
              {email.corpo || 'Sem conteúdo'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6 flex gap-3">
            <Button onClick={openEditDialog}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar Local
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Localização</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <LocationSelect
              estado={editState}
              municipio={editMunicipio}
              onEstadoChange={(val) => {
                setEditState(val);
                setEditMunicipio('');
              }}
              onMunicipioChange={setEditMunicipio}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
