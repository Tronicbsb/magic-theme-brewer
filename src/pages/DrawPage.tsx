import { useState } from 'react';
import { useDeckThemes } from '@/hooks/useDeckThemes';
import { DeckTheme, Player, DrawResult } from '@/types/deck';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeCard } from '@/components/ThemeCard';
import { Shuffle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const DrawPage = () => {
  const { themes } = useDeckThemes();
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const performDraw = async () => {
    if (themes.length < 4) {
      toast.error('É necessário ter pelo menos 4 temas cadastrados para realizar o sorteio!');
      return;
    }

    setIsDrawing(true);
    
    // Simular um delay para dar efeito de sorteio
    await new Promise(resolve => setTimeout(resolve, 1000));

    const shuffledThemes = shuffleArray(themes);
    
    const player1Themes = shuffledThemes.slice(0, 2);
    const player2Themes = shuffledThemes.slice(2, 4);

    const result: DrawResult = {
      player1: {
        id: 1,
        name: 'Jogador 1',
        themes: player1Themes,
      },
      player2: {
        id: 2,
        name: 'Jogador 2',
        themes: player2Themes,
      },
      drawDate: new Date(),
    };

    setDrawResult(result);
    setIsDrawing(false);
    toast.success('Sorteio realizado com sucesso!');
  };

  const resetDraw = () => {
    setDrawResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Sorteio de Semi Decks
          </h1>
          <p className="text-muted-foreground text-lg">
            Cada jogador receberá 2 temas aleatórios para construir seus semi decks
          </p>
        </div>

        {!drawResult ? (
          <div className="text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Shuffle className="h-6 w-6" />
                  Iniciar Sorteio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  {themes.length} temas disponíveis
                </p>
                <Button
                  onClick={performDraw}
                  disabled={isDrawing || themes.length < 4}
                  size="lg"
                  className="w-full"
                >
                  {isDrawing ? (
                    <>
                      <Shuffle className="h-4 w-4 mr-2 animate-spin" />
                      Sorteando...
                    </>
                  ) : (
                    <>
                      <Shuffle className="h-4 w-4 mr-2" />
                      Sortear Temas
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <Button
                onClick={resetDraw}
                variant="outline"
                className="mb-6"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Novo Sorteio
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Jogador 1 */}
              <Card className="bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-center text-primary">
                    {drawResult.player1.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {drawResult.player1.themes.map((theme) => (
                    <ThemeCard key={theme.id} theme={theme} />
                  ))}
                </CardContent>
              </Card>

              {/* Jogador 2 */}
              <Card className="bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-center text-accent">
                    {drawResult.player2.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {drawResult.player2.themes.map((theme) => (
                    <ThemeCard key={theme.id} theme={theme} />
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Sorteio realizado em: {drawResult.drawDate.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawPage;