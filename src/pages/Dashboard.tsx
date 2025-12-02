import { useQuery } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Users,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: emailService.getStats,
  });

  const { data: emailsByState = [] } = useQuery({
    queryKey: ['emails-by-state'],
    queryFn: emailService.getEmailsByState,
  });

  const { data: topDestinatarios = [] } = useQuery({
    queryKey: ['top-destinatarios'],
    queryFn: emailService.getTopDestinatarios,
  });

  const { data: trendData = [] } = useQuery({
    queryKey: ['trend-data'],
    queryFn: emailService.getTrend,
  });

  const today = new Date().toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard" 
        description={`Resumo geral - ${today}`}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de E-mails"
          value={statsLoading ? '...' : stats?.total || 0}
          icon={<Mail className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Classificados"
          value={statsLoading ? '...' : stats?.classificados || 0}
          icon={<CheckCircle2 className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Pendentes"
          value={statsLoading ? '...' : stats?.pendentes || 0}
          icon={<Clock className="h-6 w-6" />}
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Emails by State */}
        <Card className="animate-fade-in stagger-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              E-mails por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emailsByState}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="estado" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card className="animate-fade-in stagger-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Tendência - Últimos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('pt-BR');
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Destinatarios */}
        <Card className="animate-fade-in stagger-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Top 3 Destinatários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDestinatarios.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum dado disponível
                </p>
              ) : (
                topDestinatarios.map((item, index) => (
                  <div key={item.destinatario} className="flex items-center gap-4">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${index === 0 ? 'bg-primary text-primary-foreground' : 
                        index === 1 ? 'bg-accent text-accent-foreground' : 
                        'bg-muted text-muted-foreground'}
                    `}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.destinatario}</p>
                    </div>
                    <div className="font-semibold text-muted-foreground">
                      ({item.count})
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="animate-fade-in stagger-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Atalhos Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/pendentes">
              <Button variant="outline" className="w-full justify-between group">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Ver Pendentes
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/novo">
              <Button variant="outline" className="w-full justify-between group">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Novo Manual
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/lista">
              <Button variant="outline" className="w-full justify-between group">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Lista Geral
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
