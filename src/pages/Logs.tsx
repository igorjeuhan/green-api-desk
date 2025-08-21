import React, { useState, useEffect, useRef } from 'react';
import { Terminal, RefreshCw, Download, Trash2, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  source: string;
  message: string;
  details?: any;
}

export const Logs: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Mock logs data
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date(),
      level: 'success',
      source: 'SESSION',
      message: 'Sessão "Empresa XYZ" conectada com sucesso',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 30000),
      level: 'info',
      source: 'MESSAGE',
      message: 'Mensagem enviada para +5511999999999',
      details: { to: '+5511999999999', content: 'Olá! Como posso ajudar?' },
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 60000),
      level: 'warning',
      source: 'WEBHOOK',
      message: 'Webhook timeout - tentativa 2/3',
      details: { url: 'https://webhook.site/abc123', timeout: 5000 },
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 90000),
      level: 'error',
      source: 'API',
      message: 'Falha na autenticação da API',
      details: { error: 'Invalid API key', code: 401 },
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 120000),
      level: 'info',
      source: 'SESSION',
      message: 'QR Code gerado para sessão "Loja ABC"',
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 150000),
      level: 'success',
      source: 'BULK',
      message: 'Campanha em massa concluída - 25 mensagens enviadas',
    },
  ];

  useEffect(() => {
    // Initialize with mock data
    setLogs(mockLogs);
  }, []);

  useEffect(() => {
    // Filter logs based on level and search term
    let filtered = logs;

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, levelFilter, searchTerm]);

  useEffect(() => {
    // Auto scroll to bottom when new logs are added
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const addNewLog = () => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level: (['info', 'success', 'warning', 'error'] as const)[Math.floor(Math.random() * 4)],
      source: (['SESSION', 'MESSAGE', 'WEBHOOK', 'API', 'BULK'] as const)[Math.floor(Math.random() * 5)],
      message: 'Novo evento de teste gerado automaticamente',
    };

    setLogs(prev => [newLog, ...prev]);
  };

  // Simulate real-time logs
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 5 seconds
        addNewLog();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const clearLogs = () => {
    setLogs([]);
    toast({
      title: 'Logs limpos',
      description: 'Todos os logs foram removidos',
    });
  };

  const exportLogs = () => {
    const logText = filteredLogs
      .map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`)
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp-api-logs-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Logs exportados',
      description: 'Arquivo de logs baixado com sucesso',
    });
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-destructive';
      case 'info':
      default:
        return 'text-primary';
    }
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return <Badge className="bg-success text-success-foreground text-xs">SUCCESS</Badge>;
      case 'warning':
        return <Badge className="bg-warning text-warning-foreground text-xs">WARNING</Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">ERROR</Badge>;
      case 'info':
      default:
        return <Badge className="bg-primary text-primary-foreground text-xs">INFO</Badge>;
    }
  };

  const levelCounts = {
    info: logs.filter(l => l.level === 'info').length,
    success: logs.filter(l => l.level === 'success').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Logs do Sistema</h1>
          <p className="text-muted-foreground">
            Monitore eventos e atividades em tempo real
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportLogs} disabled={logs.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={() => setLogs([...mockLogs])}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="destructive" onClick={clearLogs} disabled={logs.length === 0}>
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Log Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{logs.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{levelCounts.info}</p>
              <p className="text-sm text-muted-foreground">Info</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{levelCounts.success}</p>
              <p className="text-sm text-muted-foreground">Sucesso</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{levelCounts.warning}</p>
              <p className="text-sm text-muted-foreground">Aviso</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{levelCounts.error}</p>
              <p className="text-sm text-muted-foreground">Erro</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nos logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
            <SelectItem value="warning">Aviso</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setAutoScroll(!autoScroll)}
          className={autoScroll ? 'bg-primary text-primary-foreground' : ''}
        >
          Auto-scroll
        </Button>
      </div>

      {/* Terminal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-primary" />
            <span>Terminal de Logs</span>
            <Badge variant="outline" className="ml-auto">
              {filteredLogs.length} entradas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div
            ref={terminalRef}
            className="bg-secondary/20 border border-border h-96 overflow-y-auto font-mono text-sm"
          >
            <div className="p-4 space-y-1">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log.id} className="hover:bg-accent/30 p-2 rounded">
                    <div className="flex items-start space-x-2">
                      <span className="text-muted-foreground text-xs shrink-0 mt-0.5">
                        {log.timestamp.toLocaleTimeString('pt-BR')}
                      </span>
                      {getLevelBadge(log.level)}
                      <span className="text-primary font-medium shrink-0">
                        [{log.source}]
                      </span>
                      <span className={`${getLevelColor(log.level)} flex-1`}>
                        {log.message}
                      </span>
                    </div>
                    {log.details && (
                      <div className="mt-1 ml-20 text-xs text-muted-foreground bg-muted p-2 rounded">
                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Terminal className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum log encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || levelFilter !== 'all' 
                      ? 'Tente ajustar os filtros de busca'
                      : 'Os logs aparecerão aqui quando eventos ocorrerem'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tipos de Origem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">Sessões & Conexões:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><Badge variant="outline" className="mr-2 text-xs">SESSION</Badge>Eventos de sessão</li>
                <li><Badge variant="outline" className="mr-2 text-xs">API</Badge>Chamadas da API</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Mensagens:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><Badge variant="outline" className="mr-2 text-xs">MESSAGE</Badge>Mensagens individuais</li>
                <li><Badge variant="outline" className="mr-2 text-xs">BULK</Badge>Mensagens em massa</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Integrações:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><Badge variant="outline" className="mr-2 text-xs">WEBHOOK</Badge>Eventos de webhook</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};