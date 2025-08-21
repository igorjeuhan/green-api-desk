import React, { useState } from 'react';
import { Plus, RefreshCw, Power, TestTube, QrCode, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { useToast } from '@/hooks/use-toast';

const SessionCard: React.FC<{
  session: any;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
}> = ({ session, onUpdate, onDelete, onTest }) => {
  const getStatusIcon = () => {
    switch (session.status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'waiting-qr':
        return <QrCode className="w-5 h-5 text-warning" />;
      case 'initializing':
        return <Clock className="w-5 h-5 text-status-loading" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case 'connected':
        return <Badge className="bg-success text-success-foreground">Conectado</Badge>;
      case 'waiting-qr':
        return <Badge className="bg-warning text-warning-foreground">Aguardando QR</Badge>;
      case 'initializing':
        return <Badge className="bg-status-loading text-white">Inicializando</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Desconectado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">{session.clientName}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ID da Sessão:</span>
            <span className="font-mono text-foreground">{session.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Webhook:</span>
            <span className="font-mono text-xs text-foreground truncate max-w-32">
              {session.webhookUrl}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Criado em:</span>
            <span className="text-foreground">
              {new Date(session.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {session.status === 'waiting-qr' && (
          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center space-x-2 mb-2">
              <QrCode className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-warning">QR Code necessário</span>
            </div>
            <div className="w-32 h-32 bg-white border-2 border-dashed border-warning/30 rounded-lg flex items-center justify-center">
              <QrCode className="w-12 h-12 text-warning/50" />
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdate(session.id)}
            disabled={session.status === 'initializing'}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest(session.id)}
            disabled={session.status !== 'connected'}
          >
            <TestTube className="w-4 h-4 mr-2" />
            Testar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(session.id)}
          >
            <Power className="w-4 h-4 mr-2" />
            Desconectar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const Sessions: React.FC = () => {
  const { sessions, createSession, updateSession, deleteSession } = useWhatsApp();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    webhookUrl: '',
  });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.webhookUrl) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    createSession(formData.clientName, formData.webhookUrl);
    setFormData({ clientName: '', webhookUrl: '' });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateSession = (id: string) => {
    toast({
      title: 'Atualizando sessão...',
      description: 'Verificando status da conexão',
    });
    // Simulate update
    setTimeout(() => {
      toast({
        title: 'Sessão atualizada',
        description: 'Status da sessão foi verificado',
      });
    }, 1500);
  };

  const handleTestSession = (id: string) => {
    toast({
      title: 'Testando conexão...',
      description: 'Enviando mensagem de teste',
    });
    // Simulate test
    setTimeout(() => {
      toast({
        title: 'Teste concluído',
        description: 'Conexão está funcionando corretamente',
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sessões WhatsApp</h1>
          <p className="text-muted-foreground">
            Gerencie suas conexões com a API do WhatsApp Business
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Sessão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Sessão</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  placeholder="Ex: Empresa XYZ"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">URL do Webhook</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://webhook.site/seu-webhook"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Criar Sessão
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Conectadas</p>
                <p className="text-lg font-bold text-success">
                  {sessions.filter(s => s.status === 'connected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Aguardando QR</p>
                <p className="text-lg font-bold text-warning">
                  {sessions.filter(s => s.status === 'waiting-qr').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-status-loading" />
              <div>
                <p className="text-sm text-muted-foreground">Inicializando</p>
                <p className="text-lg font-bold text-status-loading">
                  {sessions.filter(s => s.status === 'initializing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Desconectadas</p>
                <p className="text-lg font-bold text-destructive">
                  {sessions.filter(s => s.status === 'disconnected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onUpdate={handleUpdateSession}
            onDelete={deleteSession}
            onTest={handleTestSession}
          />
        ))}
      </div>

      {sessions.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Nenhuma sessão criada</h3>
              <p className="text-muted-foreground">
                Crie sua primeira sessão WhatsApp para começar
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Sessão
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};