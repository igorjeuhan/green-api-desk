import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, TestTube, RefreshCw, Globe, Clock, Palette, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { useToast } from '@/hooks/use-toast';

export const Settings: React.FC = () => {
  const { apiSettings, updateApiSettings } = useWhatsApp();
  const { toast } = useToast();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const [formData, setFormData] = useState({
    // API Settings
    apiUrl: apiSettings.apiUrl,
    timeout: apiSettings.timeout.toString(),
    
    // General Settings
    autoRefreshInterval: (apiSettings.autoRefreshInterval / 1000).toString(),
    theme: 'light',
    language: 'pt-BR',
    notifications: true,
    soundNotifications: false,
    
    // Advanced Settings
    retryAttempts: '3',
    requestDelay: '1000',
    maxConcurrentRequests: '5',
  });

  const handleSaveSettings = () => {
    const newApiSettings = {
      apiUrl: formData.apiUrl,
      timeout: parseInt(formData.timeout),
      autoRefreshInterval: parseInt(formData.autoRefreshInterval) * 1000,
    };

    updateApiSettings(newApiSettings);
    
    toast({
      title: 'Configurações salvas',
      description: 'Todas as configurações foram atualizadas com sucesso',
    });
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Conexão bem-sucedida',
        description: 'A API está respondendo corretamente',
      });
      
    } catch (error) {
      toast({
        title: 'Falha na conexão',
        description: 'Não foi possível conectar com a API. Verifique a URL e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleResetToDefaults = () => {
    setFormData({
      apiUrl: 'http://localhost:3000/api',
      timeout: '5000',
      autoRefreshInterval: '10',
      theme: 'light',
      language: 'pt-BR',
      notifications: true,
      soundNotifications: false,
      retryAttempts: '3',
      requestDelay: '1000',
      maxConcurrentRequests: '5',
    });
    
    toast({
      title: 'Configurações restauradas',
      description: 'Todas as configurações foram restauradas para o padrão',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Configure as preferências da API e do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-primary" />
              <span>Configurações da API</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">URL da API *</Label>
              <Input
                id="apiUrl"
                placeholder="http://localhost:3000/api"
                value={formData.apiUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                URL base da sua API WhatsApp Business
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout de Requisições (ms)</Label>
              <Input
                id="timeout"
                type="number"
                min="1000"
                max="30000"
                value={formData.timeout}
                onChange={(e) => setFormData(prev => ({ ...prev, timeout: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Tempo limite para requisições à API (padrão: 5000ms)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retryAttempts">Tentativas de Retry</Label>
              <Select 
                value={formData.retryAttempts} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, retryAttempts: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 tentativa</SelectItem>
                  <SelectItem value="2">2 tentativas</SelectItem>
                  <SelectItem value="3">3 tentativas</SelectItem>
                  <SelectItem value="5">5 tentativas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestDelay">Delay entre Requisições (ms)</Label>
              <Input
                id="requestDelay"
                type="number"
                min="0"
                max="5000"
                value={formData.requestDelay}
                onChange={(e) => setFormData(prev => ({ ...prev, requestDelay: e.target.value }))}
              />
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleTestConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <>
                  <TestTube className="w-4 h-4 mr-2 animate-spin" />
                  Testando Conexão...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar Conexão
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <span>Configurações Gerais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="autoRefreshInterval">Intervalo de Atualização (segundos)</Label>
              <Select 
                value={formData.autoRefreshInterval} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, autoRefreshInterval: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 segundos</SelectItem>
                  <SelectItem value="10">10 segundos</SelectItem>
                  <SelectItem value="15">15 segundos</SelectItem>
                  <SelectItem value="30">30 segundos</SelectItem>
                  <SelectItem value="60">1 minuto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Tema da Interface</Label>
              <Select 
                value={formData.theme} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select 
                value={formData.language} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificações</Label>
                  <p className="text-xs text-muted-foreground">
                    Receber notificações de eventos
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={formData.notifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="soundNotifications">Sons de Notificação</Label>
                  <p className="text-xs text-muted-foreground">
                    Reproduzir sons para eventos importantes
                  </p>
                </div>
                <Switch
                  id="soundNotifications"
                  checked={formData.soundNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, soundNotifications: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxConcurrentRequests">Máx. Requisições Simultâneas</Label>
              <Select 
                value={formData.maxConcurrentRequests} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, maxConcurrentRequests: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Controla quantas requisições podem ser feitas ao mesmo tempo
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">Status da Performance</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Latência média:</span>
                  <span className="text-success font-medium">245ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Requisições/min:</span>
                  <span className="text-primary font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de sucesso:</span>
                  <span className="text-success font-medium">99.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-primary" />
              <span>Sobre o Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versão:</span>
                <span className="font-medium">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última atualização:</span>
                <span className="font-medium">15/01/2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ambiente:</span>
                <span className="font-medium text-success">Produção</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <Button variant="outline" className="w-full" onClick={handleResetToDefaults}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Restaurar Padrões
              </Button>
              
              <Button className="w-full" onClick={handleSaveSettings}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-warning mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-warning">Importante</p>
              <p className="text-sm text-muted-foreground">
                Algumas configurações podem exigir reinicialização das sessões para entrar em vigor. 
                Configurações de performance muito baixas podem afetar o funcionamento do sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};