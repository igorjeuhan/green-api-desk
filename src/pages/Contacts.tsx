import React, { useState } from 'react';
import { Plus, Search, Download, Upload, Trash2, User, Building2, DollarSign, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { useToast } from '@/hooks/use-toast';

const ContactCard: React.FC<{
  contact: any;
  onRemove: (id: string) => void;
}> = ({ contact, onRemove }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cliente':
        return <User className="w-4 h-4" />;
      case 'Lead':
        return <DollarSign className="w-4 h-4" />;
      case 'Fornecedor':
        return <Building2 className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cliente':
        return 'bg-success text-success-foreground';
      case 'Lead':
        return 'bg-warning text-warning-foreground';
      case 'Fornecedor':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{contact.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">{contact.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getCategoryColor(contact.category)}>
              <div className="flex items-center space-x-1">
                {getCategoryIcon(contact.category)}
                <span className="text-xs">{contact.category}</span>
              </div>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(contact.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          Adicionado em: {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
};

export const Contacts: React.FC = () => {
  const { contacts, addContact, removeContact, importContacts } = useWhatsApp();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'Cliente' as 'Cliente' | 'Lead' | 'Fornecedor' | 'Outro',
  });

  const [importText, setImportText] = useState('');

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    addContact(formData);
    setFormData({ name: '', phone: '', category: 'Cliente' });
    setIsAddDialogOpen(false);
  };

  const handleImportContacts = () => {
    if (!importText.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira os dados dos contatos',
        variant: 'destructive',
      });
      return;
    }

    const lines = importText.trim().split('\n');
    const newContacts = lines
      .map(line => {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length >= 2) {
          return {
            name: parts[0],
            phone: parts[1],
            category: (parts[2] as any) || 'Cliente',
          };
        }
        return null;
      })
      .filter(contact => contact !== null);

    if (newContacts.length === 0) {
      toast({
        title: 'Erro',
        description: 'Nenhum contato válido encontrado',
        variant: 'destructive',
      });
      return;
    }

    importContacts(newContacts);
    setImportText('');
    setIsImportDialogOpen(false);
  };

  const exportContacts = () => {
    const csvContent = contacts
      .map(contact => `${contact.name},${contact.phone},${contact.category}`)
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contatos.csv';
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Exportação concluída',
      description: 'Lista de contatos exportada com sucesso',
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || contact.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = {
    Cliente: contacts.filter(c => c.category === 'Cliente').length,
    Lead: contacts.filter(c => c.category === 'Lead').length,
    Fornecedor: contacts.filter(c => c.category === 'Fornecedor').length,
    Outro: contacts.filter(c => c.category === 'Outro').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contatos</h1>
          <p className="text-muted-foreground">
            Gerencie sua lista de contatos para campanhas WhatsApp
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportContacts} disabled={contacts.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>

          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Contatos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dados dos Contatos</Label>
                  <textarea
                    className="w-full h-32 p-3 border border-border rounded-md resize-none font-mono text-sm"
                    placeholder="Nome,Telefone,Categoria&#10;João Silva,5511999999999,Cliente&#10;Maria Santos,5511888888888,Lead"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: Nome,Telefone,Categoria (um por linha)
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleImportContacts} className="flex-1">
                    Importar Contatos
                  </Button>
                  <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Contato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Contato</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Nome do contato"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    placeholder="5511999999999"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cliente">Cliente</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Adicionar Contato
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{categoryCounts.Cliente}</p>
              <p className="text-sm text-muted-foreground">Clientes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{categoryCounts.Lead}</p>
              <p className="text-sm text-muted-foreground">Leads</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{categoryCounts.Fornecedor}</p>
              <p className="text-sm text-muted-foreground">Fornecedores</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">{categoryCounts.Outro}</p>
              <p className="text-sm text-muted-foreground">Outros</p>
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
              placeholder="Buscar contatos por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="Cliente">Cliente</SelectItem>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Fornecedor">Fornecedor</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onRemove={removeContact}
          />
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              {searchTerm || categoryFilter !== 'all' ? (
                <Search className="w-8 h-8 text-muted-foreground" />
              ) : (
                <Plus className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Nenhum contato encontrado'
                  : 'Nenhum contato adicionado'
                }
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Adicione seu primeiro contato para começar'
                }
              </p>
            </div>
            {!searchTerm && categoryFilter === 'all' && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Contato
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};