import React, { useState } from 'react';
import { Users, RefreshCw, Download, MessageCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { useToast } from '@/hooks/use-toast';

const GroupCard: React.FC<{
  group: any;
  onExtractContacts: (groupId: string) => void;
}> = ({ group, onExtractContacts }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-foreground text-lg">{group.name}</h3>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              ID: {group.id}
            </p>
          </div>
          {group.unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground">
              {group.unreadCount} não lidas
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-border">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-lg font-bold text-foreground">
                {group.participantsCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Participantes</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <MessageCircle className="w-4 h-4 text-success" />
              <span className="text-lg font-bold text-foreground">
                {group.unreadCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Não Lidas</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExtractContacts(group.id)}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Extrair Contatos
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const Groups: React.FC = () => {
  const { activeSessions, groups, loadGroups } = useWhatsApp();
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadGroups = async () => {
    if (!selectedSession) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma sessão primeiro',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      loadGroups(selectedSession);
    } catch (error) {
      toast({
        title: 'Erro ao carregar grupos',
        description: 'Tente novamente em alguns instantes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractContacts = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      toast({
        title: 'Extração iniciada',
        description: `Extraindo contatos do grupo: ${group.name}`,
      });
      
      // Simulate extraction
      setTimeout(() => {
        toast({
          title: 'Contatos extraídos',
          description: `${group.participantsCount} contatos foram extraídos do grupo ${group.name}`,
        });
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Grupos WhatsApp</h1>
        <p className="text-muted-foreground">
          Gerencie e extraia contatos dos grupos das suas sessões
        </p>
      </div>

      {/* Session Selection and Load Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Carregar Grupos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedSession} onValueChange={setSelectedSession}>
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
            </div>
            
            <Button 
              onClick={handleLoadGroups}
              disabled={isLoading || !selectedSession}
              className="md:w-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Carregar Grupos
                </>
              )}
            </Button>
          </div>

          {activeSessions.length === 0 && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning">
                Nenhuma sessão ativa disponível. Conecte uma sessão primeiro para carregar os grupos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Groups Stats */}
      {groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Grupos</p>
                  <p className="text-lg font-bold text-foreground">{groups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Participantes</p>
                  <p className="text-lg font-bold text-success">
                    {groups.reduce((sum, group) => sum + group.participantsCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Mensagens Não Lidas</p>
                  <p className="text-lg font-bold text-warning">
                    {groups.reduce((sum, group) => sum + group.unreadCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Grupos Ativos</p>
                  <p className="text-lg font-bold text-primary">
                    {groups.filter(g => g.unreadCount > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Groups List */}
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onExtractContacts={handleExtractContacts}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">
                {selectedSession ? 'Nenhum grupo encontrado' : 'Selecione uma sessão'}
              </h3>
              <p className="text-muted-foreground">
                {selectedSession 
                  ? 'Esta sessão não possui grupos ou não foi possível carregá-los'
                  : 'Escolha uma sessão ativa para carregar os grupos disponíveis'
                }
              </p>
            </div>
            {selectedSession && (
              <Button onClick={handleLoadGroups} disabled={isLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como usar esta funcionalidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <p>Selecione uma sessão WhatsApp ativa no dropdown acima</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <p>Clique em "Carregar Grupos" para buscar os grupos da sessão selecionada</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <p>Use o botão "Extrair Contatos" em cada grupo para obter os números dos participantes</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                4
              </div>
              <p>Os contatos extraídos serão adicionados automaticamente à sua lista de contatos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};