import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao realizar o login. Verifique se o provedor do Google está ativo no Firebase.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0d0e12] overflow-hidden px-4">
      {/* Elementos de background dinâmicos (orbes de mana brilhantes) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-950/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Grid de fundo sutil */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" 
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />

      <Card className="w-full max-w-md bg-[#16181f]/85 border-[#282d3d] shadow-2xl backdrop-blur-md relative z-10 p-4">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.15)] animate-bounce duration-1000">
              <Wand2 className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Magic JumpStart Dex
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm max-w-[320px] mx-auto">
            Crie, customize e sorteie seus decks temáticos do MTG JumpStart de forma prática e segura.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-white text-black hover:bg-slate-200 transition-all font-semibold rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-white/5 disabled:opacity-50"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.56h3.28c1.92,-1.76 3.03,-4.37 3.03,-7.42c0,-0.66 -0.06,-1.29 -0.16,-1.94Z" fill="#4285F4" />
                  <path d="M12,20.7c2.35,0 4.32,-0.78 5.76,-2.12l-2.88,-2.24c-0.8,0.54 -1.82,0.86 -2.88,0.86c-2.22,0 -4.1,-1.5 -4.77,-3.52H3.88v2.32c1.44,2.87 4.4,4.82 7.85,4.82Z" fill="#34A853" />
                  <path d="M7.23,13.68c-0.17,-0.51 -0.27,-1.06 -0.27,-1.63c0,-0.57 0.1,-1.12 0.27,-1.63V8.12H3.88c-0.57,1.14 -0.9,2.44 -0.9,3.82c0,1.38 0.33,2.68 0.9,3.82l3.35,-2.57c-0.17,-0.51 -0.27,-1.06 -0.27,-1.63Z" fill="#FBBC05" />
                  <path d="M12,6.56c1.28,0 2.43,0.44 3.33,1.3l2.5,-2.5c-1.51,-1.41 -3.49,-2.27 -5.83,-2.27c-3.45,0 -6.41,1.95 -7.85,4.82l3.35,2.57c0.67,-2.02 2.55,-3.52 4.77,-3.52Z" fill="#EA4335" />
                </g>
              </svg>
            )}
            Entrar com o Google
          </Button>
          <div className="text-center text-xs text-slate-500 pt-4 border-t border-[#282d3d] mt-6">
            Não é afiliado à Wizards of the Coast ou Hasbro.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
