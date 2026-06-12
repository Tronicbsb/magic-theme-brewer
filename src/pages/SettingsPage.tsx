import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDeckThemes } from '@/hooks/useDeckThemes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, Mail, User, ShieldAlert, Sparkles, HelpCircle, Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { themes } = useDeckThemes();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasSavedKey, setHasSavedKey] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('custom_gemini_api_key') || '';
    setApiKey(savedKey);
    setHasSavedKey(!!savedKey);
  }, []);

  const handleSaveKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      toast.error('A chave não pode estar vazia.');
      return;
    }
    localStorage.setItem('custom_gemini_api_key', trimmed);
    setHasSavedKey(true);
    toast.success('Chave de API do Gemini salva com sucesso!');
  };

  const handleClearKey = () => {
    localStorage.removeItem('custom_gemini_api_key');
    setApiKey('');
    setHasSavedKey(false);
    toast.success('Chave de API do Gemini removida.');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0d0e12] text-foreground p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Configurações
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie sua conta e visualize suas estatísticas
          </p>
        </div>

        {/* Card de Perfil */}
        <Card className="bg-[#16181f]/80 border-[#282d3d] backdrop-blur-md shadow-xl">
          <CardHeader className="flex flex-col items-center pb-4 text-center">
            <Avatar className="h-20 w-20 border-2 border-primary/40 shadow-lg mb-3">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Usuário'} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {user.displayName?.substring(0, 2).toUpperCase() || 'US'}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl font-semibold text-slate-100">{user.displayName}</CardTitle>
            <CardDescription className="text-slate-400 text-sm">{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 border-t border-[#282d3d]/50">
            <div className="flex items-center gap-3 text-sm text-slate-300 py-1">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">UID:</span>
              <span className="text-xs text-slate-500 font-mono select-all truncate">{user.uid}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300 py-1">
              <Mail className="h-4 w-4 text-primary" />
              <span className="font-medium">Provedor:</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium uppercase">
                Google
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card de Estatísticas do Banco */}
        <Card className="bg-[#16181f]/80 border-[#282d3d] backdrop-blur-md shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
              Estatísticas da Coleção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[#282d3d]/30">
              <span className="text-sm text-slate-400">Temas Salvos</span>
              <span className="text-xl font-extrabold text-primary shadow-[0_0_15px_rgba(168,85,247,0.15)] px-3 py-0.5 bg-primary/5 rounded-lg border border-primary/10">
                {themes.length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-400">Status da Nuvem</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                Sincronizado
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card de Configurações da IA (Gemini) */}
        <Card className="bg-[#16181f]/80 border-[#282d3d] backdrop-blur-md shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-bold text-slate-200 flex items-center gap-2">
              <Key className="h-4 w-4 text-purple-400" />
              Configuração do Gemini AI
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Insira sua chave de API para habilitar o escaneamento de cartas via IA. Ela fica salva de forma segura apenas localmente em seu dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="gemini-key" className="text-xs text-slate-300 font-medium">Chave de API (Google AI Studio)</Label>
              <div className="relative">
                <Input
                  id="gemini-key"
                  type={showKey ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-[#0d0e12] border-[#282d3d] text-slate-100 placeholder:text-slate-600 focus-visible:ring-purple-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Você pode obter uma chave gratuita acessando o{' '}
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline inline-flex items-center gap-0.5"
                >
                  Google AI Studio
                </a>.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSaveKey}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9"
              >
                Salvar Chave
              </Button>
              {hasSavedKey && (
                <Button
                  onClick={handleClearKey}
                  variant="outline"
                  className="border-[#282d3d] text-slate-400 hover:bg-slate-900 hover:text-slate-200 text-xs h-9 px-3"
                >
                  Remover
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card de Suporte & Informações */}
        <Card className="bg-[#16181f]/80 border-[#282d3d] backdrop-blur-md shadow-xl">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3 text-xs text-slate-500">
              <ShieldAlert className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-400">Segurança de Dados</p>
                <p className="mt-0.5">Seus decks são protegidos e associados exclusivamente ao seu ID do Firebase Auth.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-xs text-slate-500 border-t border-[#282d3d]/30 pt-3">
              <HelpCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-400">Versão do Aplicativo</p>
                <p className="mt-0.5">v1.0.0 (PWA/TWA)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ação de Logout */}
        <div className="pt-2">
          <Button
            variant="destructive"
            onClick={logout}
            className="w-full h-12 bg-red-950/40 hover:bg-red-900/40 border border-red-500/20 hover:border-red-500/40 text-red-200 transition-all font-semibold rounded-xl flex items-center justify-center gap-3 shadow-lg"
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </Button>
        </div>

      </div>
    </div>
  );
}
