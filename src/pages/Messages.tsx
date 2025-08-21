import React, { useState } from 'react';
import { Send, Clock, Check, CheckCheck, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { useToast } from '@/hooks/use-toast';

const MessageHistoryItem: React.FC<{ message: any }> = ({ message }) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Check className="w-4 h-4 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-success" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-primary" />;
      case 'failed':
        return <X className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (message.status) {
      case 'sent':
        return <Badge variant="secondary">Enviada</Badge>;
      case 'delivered':
        return <Badge className="bg-success text-success-foreground">Entregue</Badge>;
      case 'read':
        return <Badge className="bg-primary text-primary-foreground">Lida</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="outline">Processando</Badge>;
    }
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{message.to}</span>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground mb-2 bg-muted p-2 rounded">
              {message.content}
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {getStatusIcon()}
              <span>{new Date(message.timestamp).toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Messages: React.FC = () => {
  const { activeSessions, sendMessage, messages } = useWhatsApp();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    sessionId: '',
    to: '',
    message: '',
    typingDelay: '1000',
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sessionId || !formData.to || !formData.message) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate typing delay
      const delay = parseInt(formData.typingDelay);
      if (delay > 0) {
        toast({
          title: 'Digitando...',
          description: `Aguardando ${delay}ms antes de enviar`,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await sendMessage(formData.sessionId, formData.to, formData.message);
      
      // Reset form
      setFormData(prev => ({ ...prev, to: '', message: '' }));
      
    } catch (error) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Tente novamente em alguns instantes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const recentMessages = messages.slice(-10).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Enviar Mensagens</h1>
        <p className="text-muted-foreground">
          Envie mensagens individuais através das suas sessões ativas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Message Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-primary" />
              <span>Nova Mensagem</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4">
              {/* Session Selection */}
              <div className="space-y-2">
                <Label htmlFor="session">Sessão *</Label>
                <Select 
                  value={formData.sessionId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sessionId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma sessão ativa" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeSessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.clientName} ({session.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeSessions.length === 0 && (
                  <p className="text-sm text-destructive">
                    Nenhuma sessão ativa disponível. Conecte uma sessão primeiro.
                  </p>
                )}
              </div>

              {/* Destination Number */}
              <div className="space-y-2">
                <Label htmlFor="to">Número de Destino *</Label>
                <Input
                  id="to"
                  placeholder="5511999999999"
                  value={formData.to}
                  onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: código do país + DDD + número (sem espaços ou símbolos)
                </p>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem aqui..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.message.length} / 4096 caracteres
                </p>
              </div>

              {/* Typing Delay */}
              <div className="space-y-2">
                <Label htmlFor="typingDelay">Delay de Digitação (ms)</Label>
                <Input
                  id="typingDelay"
                  type="number"
                  min="0"
                  max="10000"
                  value={formData.typingDelay}
                  onChange={(e) => setFormData(prev => ({ ...prev, typingDelay: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Simula o tempo de digitação antes de enviar (0 = instantâneo)
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || activeSessions.length === 0}
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Message History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCheck className="w-5 h-5 text-primary" />
              <span>Mensagens Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentMessages.length > 0 ? (
                recentMessages.map((message) => (
                  <MessageHistoryItem key={message.id} message={message} />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhuma mensagem enviada
                  </h3>
                  <p className="text-muted-foreground">
                    Suas mensagens aparecerão aqui após serem enviadas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Enviadas</p>
                <p className="text-lg font-bold text-foreground">
                  {messages.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCheck className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Entregues</p>
                <p className="text-lg font-bold text-success">
                  {messages.filter(m => m.status === 'delivered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCheck className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Lidas</p>
                <p className="text-lg font-bold text-primary">
                  {messages.filter(m => m.status === 'read').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Falharam</p>
                <p className="text-lg font-bold text-destructive">
                  {messages.filter(m => m.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};