import { Navigation } from '@/components/Navigation';
import { ReactNode } from 'react';

interface ThemesLayoutProps {
  children: ReactNode;
}

const ThemesLayout = ({ children }: ThemesLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {children}
    </div>
  );
};

export default ThemesLayout;