import { useState, useRef } from 'react';
import { useDeckThemes } from '@/hooks/useDeckThemes';
import { useAuth } from '@/hooks/useAuth';
import { DeckTheme, ManaColor } from '@/types/deck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ThemeCard } from '@/components/ThemeCard';
import { ManaIcon } from '@/components/ManaIcon';
import { Plus, Filter, Sparkles, BarChart2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { scanThemeCard } from '@/integrations/firebase/gemini';
import { checkAndIncrementUsage, decrementUsage } from '@/integrations/firebase/limits';

const ThemesPage = () => {
  const { themes, loading, addTheme, removeTheme, updateTheme } = useDeckThemes();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<DeckTheme | null>(null);
  const [filterColor, setFilterColor] = useState<ManaColor | 'all'>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast.error('Você precisa estar autenticado para escanear.');
      return;
    }

    setIsScanning(true);
    const scanToastId = toast.loading('Verificando limites diários...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      try {
        // 1. Verificar e Incrementar o limite diário no Firestore
        await checkAndIncrementUsage(user.uid);
        
        // 2. Chamar a API do Gemini
        toast.loading('Analisando imagem com inteligência artificial...', { id: scanToastId });
        const result = await scanThemeCard(base64Url);
        
        setFormData((prev) => ({
          ...prev,
          name: result.themeName,
          manaColor: result.manaColor,
        }));
        toast.success(`Carta identificada: ${result.themeName}!`, { id: scanToastId });
      } catch (err: any) {
        const errorMessage = err.message || '';
        const isLimitError = errorMessage.includes('limite') || errorMessage.includes('limitação');
        
        // Estornar a cota caso o erro tenha sido na chamada da IA (evita penalizar falhas de conexão/foto)
        if (!isLimitError) {
          await decrementUsage(user.uid);
        }
        
        toast.error(errorMessage || 'Erro ao escanear a carta.', { id: scanToastId });
      } finally {
        setIsScanning(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo de imagem.', { id: scanToastId });
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manaColor: 'white' as ManaColor,
  });

  const manaColors: { value: ManaColor; label: string }[] = [
    { value: 'white', label: 'Branco' },
    { value: 'blue', label: 'Azul' },
    { value: 'black', label: 'Preto' },
    { value: 'red', label: 'Vermelho' },
    { value: 'green', label: 'Verde' },
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      manaColor: 'white',
    });
    setEditingTheme(null);
  };

  const openDialog = (theme?: DeckTheme) => {
    if (theme) {
      setEditingTheme(theme);
      setFormData({
        name: theme.name,
        description: theme.description,
        manaColor: theme.manaColor,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome do tema é obrigatório');
      return;
    }

    try {
      if (editingTheme) {
        await updateTheme(editingTheme.id, formData);
        toast.success('Tema atualizado!');
      } else {
        await addTheme(formData);
        toast.success('Tema criado com sucesso!');
      }
      closeDialog();
    } catch (error) {
      toast.error('Erro ao salvar tema.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeTheme(id);
      toast.success('Tema removido!');
    } catch (error) {
      toast.error('Erro ao remover tema.');
    }
  };

  const filteredThemes = themes.filter(theme => 
    filterColor === 'all' || theme.manaColor === filterColor
  );
  return (
    <div className="min-h-screen bg-[#0d0e12] text-foreground p-6 pb-24 relative">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center py-4">
          <div className="text-left">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Seus Temas
            </h1>
            <p className="text-slate-400 text-sm mt-1 hidden sm:block">
              Cadastre os temas dos semi decks que você possui fisicamente
            </p>
          </div>
          <Button 
            onClick={() => openDialog()} 
            className="hidden sm:flex items-center gap-2 h-10 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Novo Tema
          </Button>
        </div>

        {/* Filtros em Linha Horizontal (Estilo Mobile App Store) */}
        <div className="overflow-x-auto scrollbar-none py-1 -mx-6 px-6">
          <div className="flex gap-2 w-max">
            <Button
              variant={filterColor === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterColor('all')}
              className="h-9 rounded-full px-4 border-[#282d3d]"
            >
              Todos ({themes.length})
            </Button>
            {manaColors.map((color) => {
              const count = themes.filter(t => t.manaColor === color.value).length;
              return (
                <Button
                  key={color.value}
                  variant={filterColor === color.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterColor(color.value)}
                  className="h-9 rounded-full px-4 border-[#282d3d] flex items-center gap-1.5"
                >
                  <ManaIcon color={color.value} size="sm" />
                  <span className="capitalize">{color.label}</span>
                  <span className="text-[10px] opacity-65 font-bold">({count})</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Lista de Temas */}
        {loading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-xs mt-3">Buscando temas no Firestore...</p>
          </div>
        ) : filteredThemes.length === 0 ? (
          <Card className="bg-[#16181f]/80 border-[#282d3d] backdrop-blur-md shadow-xl py-12 text-center">
            <CardContent>
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                <Filter className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm font-semibold">Nenhum tema encontrado</p>
              <p className="text-slate-500 text-xs mt-1">
                {filterColor === 'all' 
                  ? 'Você ainda não possui temas cadastrados nesta conta.' 
                  : 'Nenhum tema cadastrado para esta cor de mana.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onEdit={openDialog}
                onDelete={handleDelete}
                showActions
              />
            ))}
          </div>
        )}

        {/* Dialog / Modal (Ajustado para Mobile) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#16181f] border-[#282d3d] text-foreground max-w-sm rounded-2xl p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {editingTheme ? 'Editar Tema' : 'Novo Tema'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input de câmera oculto para dispositivos móveis */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              <Button
                type="button"
                onClick={handleScanButtonClick}
                disabled={isScanning}
                variant="outline"
                className="w-full h-11 border-dashed border-primary/45 hover:border-primary bg-primary/5 hover:bg-primary/10 rounded-xl flex items-center justify-center gap-2 text-primary text-sm font-bold transition-all"
              >
                {isScanning ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Analisando carta...
                  </>
                ) : (
                  <>
                    <Camera className="h-4.5 w-4.5" />
                    Escanear Tema por Foto
                  </>
                )}
              </Button>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nome do Tema</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Goblins"
                  className="bg-[#0d0e12] border-[#282d3d] focus-visible:ring-primary rounded-xl h-11"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Descrição (Sinergias)</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Agressão com muitas criaturas de custo baixo..."
                  className="bg-[#0d0e12] border-[#282d3d] focus-visible:ring-primary rounded-xl"
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alinhamento de Mana</label>
                <Select
                  value={formData.manaColor}
                  onValueChange={(value: ManaColor) => 
                    setFormData({ ...formData, manaColor: value })
                  }
                >
                  <SelectTrigger className="bg-[#0d0e12] border-[#282d3d] focus:ring-primary rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16181f] border-[#282d3d] text-foreground">
                    {manaColors.map((color) => (
                      <SelectItem key={color.value} value={color.value} className="focus:bg-primary/10 focus:text-primary">
                        <div className="flex items-center gap-2">
                          <ManaIcon color={color.value} size="sm" />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeDialog}
                  className="flex-1 h-11 border-[#282d3d] hover:bg-[#0d0e12] rounded-xl font-semibold text-slate-400"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 h-11 bg-primary text-primary-foreground font-semibold rounded-xl"
                >
                  {editingTheme ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Floating Action Button (FAB) - Estilo App Nativo Celular */}
        <button
          onClick={() => openDialog()}
          className="fixed bottom-20 right-5 z-40 bg-primary text-primary-foreground h-14 w-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(147,51,234,0.45)] hover:scale-105 active:scale-95 transition-all duration-200"
          title="Novo Tema"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

      </div>
    </div>
  );
};

export default ThemesPage;