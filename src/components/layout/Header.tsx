import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { isApiOnline, stats } = useWhatsApp();

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="hidden md:block">
          <h2 className="text-lg font-semibold text-foreground">Dashboard WhatsApp API</h2>
          <p className="text-sm text-muted-foreground">
            {stats.activeSessions} sessões ativas • {stats.messagesToday} mensagens hoje
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* API Status indicator */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-success/10 rounded-full">
          <div className={`w-2 h-2 rounded-full ${isApiOnline ? 'bg-success' : 'bg-destructive'}`} />
          <span className="text-sm font-medium text-success">
            API {isApiOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};