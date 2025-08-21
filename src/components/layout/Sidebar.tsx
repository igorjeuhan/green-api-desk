import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Radio, 
  MessageSquare, 
  Users, 
  UsersRound,
  Webhook,
  FileText,
  Settings,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Sessões', href: '/sessions', icon: Radio },
  { name: 'Mensagens', href: '/messages', icon: MessageSquare },
  { name: 'Mensagens em Massa', href: '/bulk-messages', icon: Send },
  { name: 'Contatos', href: '/contacts', icon: Users },
  { name: 'Grupos', href: '/groups', icon: UsersRound },
  { name: 'Webhooks', href: '/webhooks', icon: Webhook },
  { name: 'Logs', href: '/logs', icon: FileText },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-foreground">WhatsApp API</h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )
                }
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* API Status */}
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center space-x-3 px-3 py-2 bg-success/10 rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm text-success font-medium">API Online</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};