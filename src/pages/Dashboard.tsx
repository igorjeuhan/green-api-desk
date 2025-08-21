import React from 'react';
import { 
  Activity, 
  MessageCircle, 
  Users, 
  UsersRound,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, icon, color }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {change && (
            <div className="flex items-center mt-2 space-x-1">
              {change > 0 ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={`text-sm font-medium ${change > 0 ? 'text-success' : 'text-destructive'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ActivityItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'error';
}> = ({ icon, title, description, time, status }) => (
  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
    <div className="flex-shrink-0 p-2 rounded-full bg-muted">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {status && (
          <Badge 
            variant={status === 'success' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {status}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="flex-shrink-0 text-xs text-muted-foreground">
      {time}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { stats, sessions, messages, isApiOnline } = useWhatsApp();

  const recentActivities = [
    {
      icon: <CheckCircle className="w-4 h-4 text-success" />,
      title: 'Nova sessão conectada',
      description: 'Empresa XYZ foi conectada com sucesso',
      time: '2min',
      status: 'success' as const,
    },
    {
      icon: <MessageCircle className="w-4 h-4 text-primary" />,
      title: '15 mensagens enviadas',
      description: 'Campanha promocional enviada para clientes',
      time: '5min',
      status: 'success' as const,
    },
    {
      icon: <Users className="w-4 h-4 text-warning" />,
      title: '3 novos contatos',
      description: 'Contatos importados via CSV',
      time: '12min',
    },
    {
      icon: <Activity className="w-4 h-4 text-muted-foreground" />,
      title: 'Webhook configurado',
      description: 'URL do webhook atualizada para Loja ABC',
      time: '1h',
    },
  ];

  // Mock chart data for the last 7 days
  const chartDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const chartData = [12, 19, 8, 25, 17, 32, 28];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas operações WhatsApp API
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Sessões Ativas"
          value={stats.activeSessions}
          change={12}
          icon={<Activity className="w-6 h-6 text-primary-foreground" />}
          color="bg-primary"
        />
        <MetricCard
          title="Mensagens Hoje"
          value={stats.messagesToday}
          change={8}
          icon={<MessageCircle className="w-6 h-6 text-success-foreground" />}
          color="bg-success"
        />
        <MetricCard
          title="Total de Contatos"
          value={stats.totalContacts}
          change={-2}
          icon={<Users className="w-6 h-6 text-warning-foreground" />}
          color="bg-warning"
        />
        <MetricCard
          title="Grupos"
          value={stats.totalGroups}
          change={5}
          icon={<UsersRound className="w-6 h-6 text-secondary-foreground" />}
          color="bg-secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span>Mensagens dos Últimos 7 Dias</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {chartData.map((value, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                    <div 
                      className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80"
                      style={{ height: `${(value / Math.max(...chartData)) * 200}px` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {chartDays[index]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                <span>Total: {chartData.reduce((a, b) => a + b, 0)} mensagens</span>
                <span>Média: {Math.round(chartData.reduce((a, b) => a + b, 0) / 7)} por dia</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Atividade Recente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {recentActivities.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* API Status Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>Status da API</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-success/10">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <div>
                <p className="font-medium text-success">API Online</p>
                <p className="text-sm text-muted-foreground">Funcionando normalmente</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Uptime</p>
                <p className="text-sm text-muted-foreground">99.9% (30 dias)</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted">
              <TrendingUp className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-foreground">Latência Média</p>
                <p className="text-sm text-muted-foreground">245ms</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};