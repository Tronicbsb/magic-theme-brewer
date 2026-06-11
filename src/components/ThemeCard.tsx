import { useState } from 'react';
import { DeckTheme } from '@/types/deck';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ManaSymbolLarge } from './ManaSymbolLarge';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  return (
    <>
      <Card 
        className={cn(
          "transition-all duration-200 hover:shadow-lg cursor-pointer overflow-hidden bg-[#16181f] border-[#282d3d] hover:border-[#3a4157]",
          isSelected && "ring-2 ring-primary shadow-magic",
          onClick && "hover:scale-[1.02]"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4 flex gap-4 items-start">
          {/* Lado Esquerdo: Miniatura da Imagem ou Símbolo de Mana Grande (Proporção 5:7 de MTG) */}
          <div 
            className="w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d0e12] border border-[#282d3d] flex items-center justify-center cursor-zoom-in relative group transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomOpen(true);
            }}
          >
            {theme.imageUrl ? (
              <>
                <img 
                  src={theme.imageUrl} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                  alt={theme.name} 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-1 rounded-full uppercase tracking-wider">Ampliar</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-full h-full transition-transform group-hover:scale-105">
                  <ManaSymbolLarge color={theme.manaColor} />
                </div>
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-1 rounded-full uppercase tracking-wider">Ampliar</span>
                </div>
              </>
            )}
          </div>

          {/* Lado Direito: Conteúdo e Ações */}
          <div className="flex-grow min-w-0 flex flex-col justify-between h-28 sm:h-32 py-1">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base sm:text-lg text-card-foreground truncate">{theme.name}</h3>
                
                {showActions && (
                  <div className="flex gap-0.5 flex-shrink-0">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-[#282d3d] hover:text-white"
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
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
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

              <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mt-1 pr-1 leading-relaxed">
                {theme.description || "Sem descrição cadastrada."}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mt-auto">
              <span className="capitalize font-semibold text-slate-400 flex items-center gap-1.5">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  theme.manaColor === 'white' && 'bg-mana-white',
                  theme.manaColor === 'blue' && 'bg-mana-blue',
                  theme.manaColor === 'black' && 'bg-mana-black',
                  theme.manaColor === 'red' && 'bg-mana-red',
                  theme.manaColor === 'green' && 'bg-mana-green',
                )} />
                {theme.manaColor === 'white' && 'Branco'}
                {theme.manaColor === 'blue' && 'Azul'}
                {theme.manaColor === 'black' && 'Preto'}
                {theme.manaColor === 'red' && 'Vermelho'}
                {theme.manaColor === 'green' && 'Verde'}
              </span>
              <span>{theme.createdAt.toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Zoom da Carta (Preserva proporção 5:7) */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="bg-black/95 border-[#282d3d] p-0 max-w-[90vw] md:max-w-[450px] aspect-[5/7] overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center">
          {theme.imageUrl ? (
            <img 
              src={theme.imageUrl} 
              className="w-full h-full object-contain" 
              alt={theme.name} 
            />
          ) : (
            <div className="w-full h-full p-8 bg-[#0d0e12] flex items-center justify-center">
              <div className="w-48 h-64 sm:w-64 sm:h-88">
                <ManaSymbolLarge color={theme.manaColor} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};