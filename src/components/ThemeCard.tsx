import { DeckTheme } from '@/types/deck';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ManaIcon } from './ManaIcon';
import { Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeCardProps {
  theme: DeckTheme;
  onEdit?: (theme: DeckTheme) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ThemeCard = ({ 
  theme, 
  onEdit, 
  onDelete, 
  showActions = false,
  isSelected = false,
  onClick 
}: ThemeCardProps) => {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-lg cursor-pointer",
        isSelected && "ring-2 ring-primary shadow-magic",
        onClick && "hover:scale-105"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <ManaIcon color={theme.manaColor} size="lg" />
            <h3 className="font-bold text-lg text-card-foreground">{theme.name}</h3>
          </div>
          
          {showActions && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(theme);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(theme.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm mb-2">{theme.description}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="capitalize">{theme.manaColor}</span>
          <span>{theme.createdAt.toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};