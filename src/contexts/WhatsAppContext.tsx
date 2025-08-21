import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Session {
  id: string;
  clientName: string;
  webhookUrl: string;
  status: 'connected' | 'waiting-qr' | 'disconnected' | 'initializing';
  createdAt: Date;
  qrCode?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  category: 'Cliente' | 'Lead' | 'Fornecedor' | 'Outro';
  createdAt: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  to: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface WhatsAppGroup {
  id: string;
  name: string;
  participantsCount: number;
  unreadCount: number;
}

export interface ApiSettings {
  apiUrl: string;
  timeout: number;
  autoRefreshInterval: number;
}

interface WhatsAppContextType {
  // Sessions
  sessions: Session[];
  activeSessions: Session[];
  createSession: (clientName: string, webhookUrl: string) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  
  // Contacts
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  removeContact: (id: string) => void;
  importContacts: (contacts: Omit<Contact, 'id' | 'createdAt'>[]) => void;
  
  // Messages
  messages: Message[];
  sendMessage: (sessionId: string, to: string, content: string) => Promise<void>;
  
  // Groups
  groups: WhatsAppGroup[];
  loadGroups: (sessionId: string) => void;
  
  // Settings
  apiSettings: ApiSettings;
  updateApiSettings: (settings: Partial<ApiSettings>) => void;
  
  // Stats
  stats: {
    activeSessions: number;
    messagesToday: number;
    totalContacts: number;
    totalGroups: number;
  };
  
  // Status
  isApiOnline: boolean;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
};

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mock data initialization
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      clientName: 'Empresa XYZ',
      webhookUrl: 'https://webhook.site/xyz',
      status: 'connected',
      createdAt: new Date(),
    },
    {
      id: '2',
      clientName: 'Loja ABC',
      webhookUrl: 'https://webhook.site/abc',
      status: 'waiting-qr',
      createdAt: new Date(),
    },
  ]);

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'João Silva',
      phone: '5511999999999',
      category: 'Cliente',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Maria Santos',
      phone: '5511888888888',
      category: 'Lead',
      createdAt: new Date(),
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    apiUrl: 'http://localhost:3000/api',
    timeout: 5000,
    autoRefreshInterval: 10000,
  });

  const activeSessions = sessions.filter(s => s.status === 'connected');
  const isApiOnline = true; // Mock status

  const stats = {
    activeSessions: activeSessions.length,
    messagesToday: messages.filter(m => {
      const today = new Date();
      return m.timestamp.toDateString() === today.toDateString();
    }).length,
    totalContacts: contacts.length,
    totalGroups: groups.length,
  };

  const createSession = (clientName: string, webhookUrl: string) => {
    const newSession: Session = {
      id: Date.now().toString(),
      clientName,
      webhookUrl,
      status: 'initializing',
      createdAt: new Date(),
    };
    setSessions(prev => [...prev, newSession]);
    toast({
      title: 'Sessão criada',
      description: `Nova sessão criada para ${clientName}`,
    });
    
    // Simulate status change
    setTimeout(() => {
      setSessions(prev => prev.map(s => 
        s.id === newSession.id ? { ...s, status: 'waiting-qr' as const } : s
      ));
    }, 2000);
  };

  const updateSession = (id: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast({
      title: 'Sessão removida',
      description: 'A sessão foi removida com sucesso',
    });
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...contactData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setContacts(prev => [...prev, newContact]);
    toast({
      title: 'Contato adicionado',
      description: `${contactData.name} foi adicionado aos contatos`,
    });
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    toast({
      title: 'Contato removido',
      description: 'O contato foi removido com sucesso',
    });
  };

  const importContacts = (newContacts: Omit<Contact, 'id' | 'createdAt'>[]) => {
    const contactsWithId = newContacts.map(contact => ({
      ...contact,
      id: Date.now().toString() + Math.random(),
      createdAt: new Date(),
    }));
    setContacts(prev => [...prev, ...contactsWithId]);
    toast({
      title: 'Contatos importados',
      description: `${newContacts.length} contatos foram importados`,
    });
  };

  const sendMessage = async (sessionId: string, to: string, content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sessionId,
      to,
      content,
      timestamp: new Date(),
      status: 'sent',
    };
    setMessages(prev => [...prev, newMessage]);
    
    toast({
      title: 'Mensagem enviada',
      description: `Mensagem enviada para ${to}`,
    });
    
    // Simulate delivery
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, status: 'delivered' as const } : m
      ));
    }, 1000);
  };

  const loadGroups = (sessionId: string) => {
    // Mock groups data
    const mockGroups: WhatsAppGroup[] = [
      { id: '1', name: 'Grupo Vendas', participantsCount: 25, unreadCount: 3 },
      { id: '2', name: 'Equipe Suporte', participantsCount: 12, unreadCount: 0 },
      { id: '3', name: 'Clientes VIP', participantsCount: 48, unreadCount: 7 },
    ];
    setGroups(mockGroups);
    toast({
      title: 'Grupos carregados',
      description: `${mockGroups.length} grupos encontrados`,
    });
  };

  const updateApiSettings = (settings: Partial<ApiSettings>) => {
    setApiSettings(prev => ({ ...prev, ...settings }));
    toast({
      title: 'Configurações salvas',
      description: 'As configurações da API foram atualizadas',
    });
  };

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Auto refresh logic here
    }, apiSettings.autoRefreshInterval);

    return () => clearInterval(interval);
  }, [apiSettings.autoRefreshInterval]);

  return (
    <WhatsAppContext.Provider value={{
      sessions,
      activeSessions,
      createSession,
      updateSession,
      deleteSession,
      contacts,
      addContact,
      removeContact,
      importContacts,
      messages,
      sendMessage,
      groups,
      loadGroups,
      apiSettings,
      updateApiSettings,
      stats,
      isApiOnline,
    }}>
      {children}
    </WhatsAppContext.Provider>
  );
};