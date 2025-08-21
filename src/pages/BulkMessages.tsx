import React, { useState } from 'react';
import { Send, Upload, Eye, Play, Square, Users, FileText, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { useToast } from '@/hooks/use-toast';

interface BulkContact {
  name: string;
  phone: string;
}

export const BulkMessages: React.FC = () => {
  const { activeSessions } = useWhatsApp();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [bulkContacts, setBulkContacts] = useState<BulkContact[]>([]);
  
  const [settings, setSettings] = useState({
    sessionId: '',
    delayBetween: '2000',
    typingDelay: '1500',
    randomizeDelay: true,
  });
  
  const [contactsText, setContactsText] = useState('João Silva,5511999999999\nMaria Santos,5511888888888\nPedro Oliveira,5511777777777');
  const [messageTemplate, setMessageTemplate] = useState('Olá {nome}! Temos uma oferta especial para você. Confira nossos produtos em nossa loja!');

  const parseContacts = (text: string): BulkContact[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const [name, phone] = line.split(',').map(part => part.trim());
        return { name: name || 'Contato', phone: phone || '' };
      })
      .filter(contact => contact.phone.length > 0);
  };

  const generatePreview = (): Array<{ name: string; phone: string; message: string }> => {
    const contacts = parseContacts(contactsText);
    return contacts.slice(0, 5).map(contact => ({
      name: contact.name,
      phone: contact.phone,
      message: messageTemplate.replace('{nome}', contact.name),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContactsText(text);
        toast({
          title: 'CSV importado',
          description: 'Arquivo carregado com sucesso',
        });
      };
      reader.readAsText(file);
    } else {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo CSV válido',
        variant: 'destructive',
      });
    }
  };

  const handleStartBulkSending = async () => {
    if (!settings.sessionId || !messageTemplate || !contactsText) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const contacts = parseContacts(contactsText);
    if (contacts.length === 0) {
      toast({
        title: 'Erro',
        description: 'Nenhum contato válido encontrado',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const personalizedMessage = messageTemplate.replace('{nome}', contact.name);

        // Simulate sending
        await new Promise(resolve => {
          const baseDelay = parseInt(settings.delayBetween);
          const randomFactor = settings.randomizeDelay ? (Math.random() * 0.6 + 0.7) : 1; // ±30%
          const delay = baseDelay * randomFactor;
          
          setTimeout(resolve, delay);
        });

        // Update progress
        setProgress(((i + 1) / contacts.length) * 100);

        toast({
          title: `Mensagem enviada (${i + 1}/${contacts.length})`,
          description: `Para: ${contact.name} - ${contact.phone}`,
        });
      }

      toast({
        title: 'Envio concluído!',
        description: `${contacts.length} mensagens foram enviadas com sucesso`,
      });

    } catch (error) {
      toast({
        title: 'Erro no envio',
        description: 'O envio foi interrompido devido a um erro',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const contactCount = parseContacts(contactsText).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mensagens em Massa</h1>
        <p className="text-muted-foreground">
          Envie mensagens personalizadas para múltiplos contatos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <span>Configurações de Envio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sessão *</Label>
                  <Select 
                    value={settings.sessionId} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, sessionId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma sessão" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeSessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.clientName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Delay entre mensagens (ms)</Label>
                  <Input
                    type="number"
                    min="1000"
                    max="30000"
                    value={settings.delayBetween}
                    onChange={(e) => setSettings(prev => ({ ...prev, delayBetween: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Delay de digitação (ms)</Label>
                  <Input
                    type="number"
                    min="500"
                    max="10000"
                    value={settings.typingDelay}
                    onChange={(e) => setSettings(prev => ({ ...prev, typingDelay: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="randomize"
                      checked={settings.randomizeDelay}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, randomizeDelay: checked }))}
                    />
                    <Label htmlFor="randomize">Randomizar delays (±30%)</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adiciona variação natural aos delays para evitar detecção
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacts Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Lista de Contatos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Importar CSV
                    </label>
                  </Button>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  placeholder="Nome,Telefone&#10;João Silva,5511999999999&#10;Maria Santos,5511888888888"
                  value={contactsText}
                  onChange={(e) => setContactsText(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Formato: Nome,Telefone (um por linha)</span>
                  <span>{contactCount} contatos encontrados</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Modelo da Mensagem</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  placeholder="Olá {nome}! Sua mensagem personalizada aqui..."
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Use {'{nome}'} para personalizar com o nome do contato</span>
                  <span>{messageTemplate.length} caracteres</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* Progress Card */}
          {isLoading && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Enviando Mensagens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="w-full" />
                <p className="text-center text-sm text-muted-foreground">
                  {Math.round(progress)}% concluído
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" disabled={contactCount === 0}>
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Preview das Mensagens</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatePreview().map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground">{item.phone}</span>
                            </div>
                            <div className="p-2 bg-muted rounded text-sm">
                              {item.message}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {contactCount > 5 && (
                      <p className="text-center text-sm text-muted-foreground">
                        ... e mais {contactCount - 5} mensagens
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                className="w-full"
                onClick={handleStartBulkSending}
                disabled={isLoading || contactCount === 0 || !settings.sessionId}
              >
                {isLoading ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Envio
                  </>
                )}
              </Button>

              {isLoading && (
                <Button variant="destructive" className="w-full" onClick={() => setIsLoading(false)}>
                  <Square className="w-4 h-4 mr-2" />
                  Parar Envio
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Contatos válidos:</span>
                  <span className="font-medium">{contactCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tempo estimado:</span>
                  <span className="font-medium">
                    {Math.round((contactCount * parseInt(settings.delayBetween)) / 1000 / 60)} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sessão selecionada:</span>
                  <span className="font-medium text-xs">
                    {settings.sessionId ? 
                      activeSessions.find(s => s.id === settings.sessionId)?.clientName || 'N/A' 
                      : 'Nenhuma'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};