import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Wand2, Shuffle, Plus, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Wand2 className="h-8 w-8 text-primary mr-3" />
            <span className="text-xl font-bold text-foreground">Magic Deck Sorteio</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button 
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                className="flex items-center gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Sorteio
              </Button>
            </Link>
            
            <Link to="/themes">
              <Button 
                variant={location.pathname === '/themes' ? 'default' : 'ghost'}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Temas
              </Button>
            </Link>

            {user && (
              <div className="flex items-center gap-3 pl-2 border-l border-border ml-2">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Avatar'} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user.displayName?.substring(0, 2).toUpperCase() || 'US'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm text-muted-foreground max-w-[120px] truncate">
                  {user.displayName}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={logout} 
                  title="Sair"
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};