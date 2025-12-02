import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LocationSelect } from '@/components/ui/location-select';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Download, 
  Search,
  Calendar,
  Loader2,
  Mail
} from 'lucide-react';
import { Email } from '@/types';

export default function PendingEmails() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [emailUpdates, setEmailUpdates] = useState<Record<string, { estado: string; municipio: string }>>({});

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['pending-emails'],
    queryFn: emailService.getPending,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(emailUpdates)
        .filter(([_, val]) => val.estado && val.municipio)
        .map(([id, val]) => ({ id, ...val }));
      
      if (updates.length === 0) {
        throw new Error('Nenhum e-mail com classificação completa');
      }
      
      await emailService.updateMany(updates);
    },
    onSuccess: () => {
      toast({ title: 'Classificações salvas com sucesso!' });
      setEmailUpdates({});
      queryClient.invalidateQueries({ queryKey: ['pending-emails'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    },
  });

  const handleLocationChange = (emailId: string, field: 'estado' | 'municipio', value: string) => {
    setEmailUpdates(prev => ({
      ...prev,
      [emailId]: {
        ...prev[emailId],
        [field]: value,
        ...(field === 'estado' ? { municipio: '' } : {})
      }
    }));
  };

  const getEmailLocation = (email: Email) => {
    const update = emailUpdates[email.id];
    return {
      estado: update?.estado || email.estado || '',
      municipio: update?.municipio || email.municipio || ''
    };
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = !searchTerm || 
      email.remetente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.destinatario.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      email.data_envio.startsWith(dateFilter);
    
    return matchesSearch && matchesDate;
  });

  const exportToCsv = () => {
    const headers = ['Remetente', 'Destinatário', 'Data', 'Estado', 'Município'];
    const rows = filteredEmails.map(email => {
      const loc = getEmailLocation(email);
      return [
        email.remetente,
        email.destinatario,
        new Date(email.data_envio).toLocaleDateString('pt-BR'),
        loc.estado,
        loc.municipio
      ];
    });
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emails_pendentes.csv';
    a.click();
  };

  const hasUpdates = Object.keys(emailUpdates).length > 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="E-mails Pendentes" 
        description="Lista de e-mails aguardando classificação"
      >
        <Button 
          variant="outline" 
          onClick={exportToCsv}
          disabled={filteredEmails.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
        <Button 
          onClick={() => saveMutation.mutate()}
          disabled={!hasUpdates || saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Tudo
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por remetente ou destinatário..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative sm:w-48">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-10"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum e-mail pendente encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Remetente</th>
                    <th className="text-left p-4 font-medium">Destinatário</th>
                    <th className="text-left p-4 font-medium">Data</th>
                    <th className="text-left p-4 font-medium">Local</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmails.map((email) => {
                    const loc = getEmailLocation(email);
                    return (
                      <tr key={email.id} className="border-b table-row-hover">
                        <td className="p-4">
                          <span className="font-medium">{email.remetente}</span>
                        </td>
                        <td className="p-4 text-muted-foreground">{email.destinatario}</td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(email.data_envio).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4">
                          <LocationSelect
                            compact
                            estado={loc.estado}
                            municipio={loc.municipio}
                            onEstadoChange={(val) => handleLocationChange(email.id, 'estado', val)}
                            onMunicipioChange={(val) => handleLocationChange(email.id, 'municipio', val)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
