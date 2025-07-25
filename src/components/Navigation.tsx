import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wand2, Shuffle, Plus } from 'lucide-react';

export const Navigation = () => {
  const location = useLocation();

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
          </div>
        </div>
      </div>
    </nav>
  );
};