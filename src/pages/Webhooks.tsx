import React, { useState } from 'react';
import { Webhook, Plus, TestTube, CheckCircle, XCircle, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface WebhookConfig {
  id: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  lastTest: Date | null;
  createdAt: Date;
}

interface WebhookEvent {
  id: string;
  type: 'message' | 'status' | 'qr' | 'ready';
  data: any;
  timestamp: Date;
  webhookId: string;
}

export const Webhooks: React.FC = () => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      url: 'https://webhook.site/abc123',
      status: 'active',
      lastTest: new Date(),
      createdAt: new Date(),
    },
    {
      id: '2',
      url: 'https://myapp.com/webhook/whatsapp',
      status: 'error',
      lastTest: new Date(Date.now() - 86400000), // 1 day ago
      createdAt: new Date(Date.now() - 259200000), // 3 days ago
    },
  ]);

  const [webhookEvents] = useState<WebhookEvent[]>([
    {
      id: '1',
      type: 'message',
      data: { from: '5511999999999', message: 'Olá!' },
      timestamp: new Date(),
      webhookId: '1',
    },
    {
      id: '2',
      type: 'status',
      data: { session: 'session1', status: 'connected' },
      timestamp: new Date(Date.now() - 300000), // 5 min ago
      webhookId: '1',
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState<string | null>(null);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWebhookUrl) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira uma URL válida',
        variant: 'destructive',
      });
      return;
    }

    const newWebhook: WebhookConfig = {
      id: Date.now().toString(),
      url: newWebhookUrl,
      status: 'inactive',
      lastTest: null,
      createdAt: new Date(),
    };

    setWebhooks(prev => [...prev, newWebhook]);
    setNewWebhookUrl('');
    setIsAddDialogOpen(false);
    
    toast({
      title: 'Webhook adicionado',
      description: 'Novo webhook configurado com sucesso',
    });
  };

  const handleTestWebhook = async (webhookId: string) => {
    setIsTestingWebhook(webhookId);
    
    try {
      // Simulate webhook test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setWebhooks(prev => prev.map(webhook => 
        webhook.id === webhookId 
          ? { ...webhook, status: 'active' as const, lastTest: new Date() }
          : webhook
      ));

      toast({
        title: 'Teste concluído',
        description: 'Webhook está respondendo corretamente',
      });
      
    } catch (error) {
      setWebhooks(prev => prev.map(webhook => 
        webhook.id === webhookId 
          ? { ...webhook, status: 'error' as const, lastTest: new Date() }
          : webhook
      ));

      toast({
        title: 'Teste falhou',
        description: 'Webhook não está respondendo',
        variant: 'destructive',
      });
    } finally {
      setIsTestingWebhook(null);
    }
  };

  const handleRemoveWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== webhookId));
    toast({
      title: 'Webhook removido',
      description: 'Webhook foi removido com sucesso',
    });
  };

  const getStatusIcon = (status: WebhookConfig['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: WebhookConfig['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Ativo</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
    }
  };

  const getEventTypeColor = (type: WebhookEvent['type']) => {
    switch (type) {
      case 'message':
        return 'bg-primary text-primary-foreground';
      case 'status':
        return 'bg-success text-success-foreground';
      case 'qr':
        return 'bg-warning text-warning-foreground';
      case 'ready':
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
          <p className="text-muted-foreground">
            Configure e gerencie endpoints para receber eventos da API
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Webhook</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddWebhook} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">URL do Webhook *</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://sua-app.com/webhook"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A URL deve aceitar requisições POST e retornar status 200
                </p>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Adicionar Webhook
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhook Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Webhook className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-bold text-foreground">{webhooks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-lg font-bold text-success">
                  {webhooks.filter(w => w.status === 'active').length}
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
                <p className="text-sm text-muted-foreground">Com Erro</p>
                <p className="text-lg font-bold text-destructive">
                  {webhooks.filter(w => w.status === 'error').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-lg font-bold text-muted-foreground">
                  {webhooks.filter(w => w.status === 'inactive').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webhooks List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-primary" />
                <span>Webhooks Configurados</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getStatusIcon(webhook.status)}
                            <span className="font-medium text-sm">Webhook #{webhook.id}</span>
                            {getStatusBadge(webhook.status)}
                          </div>
                          <p className="text-xs font-mono text-muted-foreground break-all">
                            {webhook.url}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block">Criado:</span>
                          <span>{webhook.createdAt.toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div>
                          <span className="block">Último teste:</span>
                          <span>
                            {webhook.lastTest ? webhook.lastTest.toLocaleString('pt-BR') : 'Nunca'}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestWebhook(webhook.id)}
                          disabled={isTestingWebhook === webhook.id}
                        >
                          {isTestingWebhook === webhook.id ? (
                            <>
                              <TestTube className="w-3 h-3 mr-1 animate-spin" />
                              Testando...
                            </>
                          ) : (
                            <>
                              <TestTube className="w-3 h-3 mr-1" />
                              Testar
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveWebhook(webhook.id)}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {webhooks.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Webhook className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum webhook configurado
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione seu primeiro webhook para receber eventos
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Webhook
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Eventos Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {webhookEvents.map((event) => (
                  <div key={event.id} className="p-3 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {event.timestamp.toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-xs font-mono bg-muted p-2 rounded">
                      <pre>{JSON.stringify(event.data, null, 2)}</pre>
                    </div>
                  </div>
                ))}

                {webhookEvents.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">
                      Nenhum evento recente
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Os eventos aparecerão aqui quando forem recebidos
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Webhook Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Documentação dos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Tipos de Eventos:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-3">
                  <Badge className="bg-primary text-primary-foreground">MESSAGE</Badge>
                  <span className="text-muted-foreground">
                    Disparado quando uma mensagem é recebida
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-success text-success-foreground">STATUS</Badge>
                  <span className="text-muted-foreground">
                    Disparado quando o status da sessão muda
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-warning text-warning-foreground">QR</Badge>
                  <span className="text-muted-foreground">
                    Disparado quando um QR Code é gerado
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-primary text-primary-foreground">READY</Badge>
                  <span className="text-muted-foreground">
                    Disparado quando a sessão está pronta para uso
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Requisitos do Webhook:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Deve aceitar requisições POST</li>
                <li>• Deve retornar status HTTP 200 para confirmar recebimento</li>
                <li>• Timeout de 10 segundos para resposta</li>
                <li>• Dados enviados em formato JSON no body da requisição</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};