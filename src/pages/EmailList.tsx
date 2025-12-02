import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { emailService } from '@/services/emailService';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Calendar,
  Loader2,
  Mail,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function EmailList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['emails'],
    queryFn: emailService.getAll,
  });

  const filteredEmails = emails.filter(email => {
    const matchesSearch = !searchTerm || 
      email.remetente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.destinatario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.assunto.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      email.data_envio.startsWith(dateFilter);
    
    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredEmails.length / ITEMS_PER_PAGE);
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Histórico de E-mails" 
        description={`${filteredEmails.length} e-mails encontrados`}
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por remetente, destinatário ou assunto..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="relative sm:w-48">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-10"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
          ) : paginatedEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum e-mail encontrado</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium">Remetente</th>
                      <th className="text-left p-4 font-medium">Destinatário</th>
                      <th className="text-left p-4 font-medium">Assunto</th>
                      <th className="text-left p-4 font-medium">Local</th>
                      <th className="text-left p-4 font-medium w-20">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmails.map((email) => (
                      <tr key={email.id} className="border-b table-row-hover">
                        <td className="p-4">
                          <span className="font-medium">{email.remetente}</span>
                        </td>
                        <td className="p-4 text-muted-foreground">{email.destinatario}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[200px]">{email.assunto}</span>
                            {!email.classificado && (
                              <Badge variant="outline" className="bg-warning-light text-warning border-warning/30">
                                Pendente
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {email.estado && email.municipio 
                            ? `${email.estado} / ${email.municipio}`
                            : '-'
                          }
                        </td>
                        <td className="p-4">
                          <Link to={`/email/${email.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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
    </div>
  );
}
