import { useState } from 'react';
import { useDeckThemes } from '@/hooks/useDeckThemes';
import { DrawResult } from '@/types/deck';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeCard } from '@/components/ThemeCard';
import { Shuffle, RotateCcw, Sparkles } from 'lucide-react';
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
    
    // Simular delay de sorteio para criar expectativa
    await new Promise(resolve => setTimeout(resolve, 1200));

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
    toast.success('Sorteio concluído!');
  };

  const resetDraw = () => {
    setDrawResult(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-foreground p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Sorteador de Decks
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gere combinações de semi decks aleatórios para começar a partida
          </p>
        </div>

        {!drawResult ? (
          <div className="space-y-6">
            {/* Card de Início */}
            <Card className="bg-[#16181f]/80 border-[#282d3d] backdrop-blur-md shadow-xl text-center p-6">
              <CardHeader className="pb-4">
                <div className="mx-auto p-4 bg-primary/10 border border-primary/20 rounded-full w-16 h-16 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                  <Shuffle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-100">Pronto para o Sorteio</CardTitle>
                <CardDescription className="text-slate-400 text-sm mt-2">
                  Atualmente você possui <span className="font-semibold text-primary">{themes.length}</span> temas salvos na sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  onClick={performDraw}
                  disabled={isDrawing || themes.length < 4}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.2)] hover:shadow-[0_0_25px_rgba(147,51,234,0.3)] transition-all font-semibold rounded-xl"
                >
                  {isDrawing ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-spin text-purple-200" />
                      Embaralhando decks...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shuffle className="h-4 w-4" />
                      Sortear Temas
                    </div>
                  )}
                </Button>
                {themes.length < 4 && (
                  <p className="text-xs text-amber-500 mt-4 bg-amber-500/10 border border-amber-500/20 py-2 px-3 rounded-lg">
                    Cadastre pelo menos 4 temas na aba "Temas" para liberar o sorteio.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Resultados Jogador 1 */}
            <Card className="bg-[#16181f]/80 border-[#282d3d] backdrop-blur-md shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border-b border-[#282d3d]/50 py-3">
                <CardTitle className="text-md font-bold text-purple-400 flex items-center justify-between">
                  <span>{drawResult.player1.name}</span>
                  <span className="text-xs bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded-full border border-purple-500/20 font-semibold">
                    Jogador 1
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {drawResult.player1.themes.map((theme) => (
                  <ThemeCard key={theme.id} theme={theme} />
                ))}
              </CardContent>
            </Card>

            {/* Resultados Jogador 2 */}
            <Card className="bg-[#16181f]/80 border-[#282d3d] backdrop-blur-md shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border-b border-[#282d3d]/50 py-3">
                <CardTitle className="text-md font-bold text-blue-400 flex items-center justify-between">
                  <span>{drawResult.player2.name}</span>
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-semibold">
                    Jogador 2
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {drawResult.player2.themes.map((theme) => (
                  <ThemeCard key={theme.id} theme={theme} />
                ))}
              </CardContent>
            </Card>

            {/* Ação Novo Sorteio */}
            <div className="pt-2 flex flex-col items-center gap-3">
              <Button
                onClick={resetDraw}
                variant="outline"
                className="w-full h-12 border-[#282d3d] hover:bg-[#16181f] text-slate-300 font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Novo Sorteio
              </Button>
              <span className="text-[10px] text-slate-500 font-medium">
                Sorteado em: {drawResult.drawDate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawPage;