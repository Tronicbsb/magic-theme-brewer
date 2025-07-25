import { ManaColor } from '@/types/deck';
import { cn } from '@/lib/utils';

interface ManaIconProps {
  color: ManaColor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const manaColorClasses = {
  white: 'bg-mana-white text-black border-gray-300',
  blue: 'bg-mana-blue text-white border-blue-300',
  black: 'bg-mana-black text-white border-gray-600',
  red: 'bg-mana-red text-white border-red-300',
  green: 'bg-mana-green text-white border-green-300',
};

const sizeClasses = {
  sm: 'w-4 h-4 text-xs',
  md: 'w-6 h-6 text-sm',
  lg: 'w-8 h-8 text-base',
};

const manaSymbols = {
  white: 'W',
  blue: 'U',
  black: 'B',
  red: 'R',
  green: 'G',
};

export const ManaIcon = ({ color, size = 'md', className }: ManaIconProps) => {
  return (
    <div
      className={cn(
        'rounded-full border-2 flex items-center justify-center font-bold shadow-sm',
        manaColorClasses[color],
        sizeClasses[size],
        className
      )}
    >
      {manaSymbols[color]}
    </div>
  );
};