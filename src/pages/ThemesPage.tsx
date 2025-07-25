import { useState } from 'react';
import { useDeckThemes } from '@/hooks/useDeckThemes';
import { DeckTheme, ManaColor } from '@/types/deck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThemeCard } from '@/components/ThemeCard';
import { ManaIcon } from '@/components/ManaIcon';
import { Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';

const ThemesPage = () => {
  const { themes, loading, addTheme, removeTheme, updateTheme } = useDeckThemes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<DeckTheme | null>(null);
  const [filterColor, setFilterColor] = useState<ManaColor | 'all'>('all');
  
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
        toast.success('Tema atualizado com sucesso!');
      } else {
        await addTheme(formData);
        toast.success('Tema adicionado com sucesso!');
      }
      
      closeDialog();
    } catch (error) {
      toast.error('Erro ao salvar tema. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeTheme(id);
      toast.success('Tema removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover tema. Tente novamente.');
    }
  };

  const filteredThemes = themes.filter(theme => 
    filterColor === 'all' || theme.manaColor === filterColor
  );

  const themesByColor = manaColors.reduce((acc, color) => {
    acc[color.value] = themes.filter(theme => theme.manaColor === color.value);
    return acc;
  }, {} as Record<ManaColor, DeckTheme[]>);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Gerenciar Temas
            </h1>
            <p className="text-muted-foreground">
              Cadastre e gerencie os temas dos seus semi decks
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Tema
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTheme ? 'Editar Tema' : 'Novo Tema'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nome</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Goblins"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Descrição</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o tema do deck..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Cor da Mana</label>
                  <Select
                    value={formData.manaColor}
                    onValueChange={(value: ManaColor) => 
                      setFormData({ ...formData, manaColor: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {manaColors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <ManaIcon color={color.value} size="sm" />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTheme ? 'Atualizar' : 'Criar'} Tema
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrar por cor:</span>
              <div className="flex gap-2">
                <Button
                  variant={filterColor === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterColor('all')}
                >
                  Todas
                </Button>
                {manaColors.map((color) => (
                  <Button
                    key={color.value}
                    variant={filterColor === color.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterColor(color.value)}
                    className="flex items-center gap-1"
                  >
                    <ManaIcon color={color.value} size="sm" />
                    {color.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{themes.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </CardContent>
          </Card>
          
          {manaColors.map((color) => (
            <Card key={color.value}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <ManaIcon color={color.value} size="sm" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {themesByColor[color.value].length}
                  </div>
                  <div className="text-sm text-muted-foreground">{color.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lista de temas */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando temas...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredThemes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {filterColor === 'all' 
                    ? 'Nenhum tema cadastrado ainda.' 
                    : `Nenhum tema encontrado para a cor ${manaColors.find(c => c.value === filterColor)?.label}.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
};

export default ThemesPage;