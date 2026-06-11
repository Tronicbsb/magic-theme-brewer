import { ManaColor } from '@/types/deck';
import { cn } from '@/lib/utils';

interface ManaSymbolLargeProps {
  color: ManaColor;
  className?: string;
}

export const ManaSymbolLarge = ({ color, className }: ManaSymbolLargeProps) => {
  // Configurações visuais específicas para cada cor de mana (degradês e cores)
  const configs = {
    white: {
      bg: 'from-[#fcfaf3] to-[#d8cbb5] text-[#4a3e2a]',
      icon: (
        <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
          {/* Sol/Plains */}
          <circle cx="50" cy="50" r="16" />
          <path d="M50 12 l4 12 h-8 z" />
          <path d="M50 88 l4 -12 h-8 z" />
          <path d="M12 50 l12 4 v-8 z" />
          <path d="M88 50 l-12 4 v-8 z" />
          <path d="M23 23 l9 9 l-6 6 z" />
          <path d="M77 77 l-9 -9 l6 -6 z" />
          <path d="M23 77 l9 -9 l6 6 z" />
          <path d="M77 23 l-9 9 l6 -6 z" />
        </svg>
      ),
    },
    blue: {
      bg: 'from-[#e0f2f1] to-[#0288d1] text-[#0d47a1]',
      icon: (
        <svg viewBox="0 0 100 100" className="w-11 h-11" fill="currentColor">
          {/* Gota d'água/Island */}
          <path d="M50 16 C50 16, 23 52, 23 70 A 27 27 0 0 0 77 70 C 77 52, 50 16, 50 16 Z M50 32 C 55 45, 68 55, 68 70 A 18 18 0 0 1 32 70 C 32 55, 45 45, 50 32 Z" />
        </svg>
      ),
    },
    black: {
      bg: 'from-[#78909c] to-[#212121] text-[#000000]',
      icon: (
        <svg viewBox="0 0 100 100" className="w-11 h-11" fill="currentColor">
          {/* Caveira/Swamp */}
          <path d="M50 16 C30 16, 23 30, 23 48 C23 60, 31 70, 31 82 C31 85, 34 88, 38 88 L62 88 C66 88, 69 85, 69 82 C69 70, 77 60, 77 48 C77 30, 70 16, 50 16 Z M39 48 A 6 6 0 1 1 39 49 Z M61 48 A 6 6 0 1 1 61 49 Z M50 63 L45 74 L55 74 Z" />
        </svg>
      ),
    },
    red: {
      bg: 'from-[#ffab91] to-[#d84315] text-[#3e0f00]',
      icon: (
        <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
          {/* Chama/Mountain */}
          <path d="M50 12 C35 35, 20 50, 20 70 A 30 30 0 0 0 80 70 C 80 50, 65 35, 50 12 Z M42 42 C 45 46, 55 46, 58 42 C 65 55, 70 65, 70 70 A 20 20 0 0 1 30 70 C 30 65, 35 55, 42 42 Z" />
        </svg>
      ),
    },
    green: {
      bg: 'from-[#a5d6a7] to-[#2e7d32] text-[#0a310d]',
      icon: (
        <svg viewBox="0 0 100 100" className="w-11 h-11" fill="currentColor">
          {/* Árvore/Forest */}
          <path d="M50 12 L80 54 L62 54 L76 74 L24 74 L38 54 L20 54 Z M45 74 L55 74 L55 88 L45 88 Z" />
        </svg>
      ),
    },
  };

  const config = configs[color];

  return (
    <div
      className={cn(
        'w-full h-full bg-gradient-to-br flex items-center justify-center rounded-xl shadow-inner border border-white/10 opacity-90',
        config.bg,
        className
      )}
    >
      {config.icon}
    </div>
  );
};
