import { Link, useLocation } from 'react-router-dom';
import { Shuffle, Layers, Settings } from 'lucide-react';

export const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Sorteio', icon: Shuffle },
    { path: '/themes', label: 'Temas', icon: Layers },
    { path: '/settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#16181f]/90 backdrop-blur-md border-t border-[#282d3d] safe-bottom">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-300 relative ${
                isActive 
                  ? 'text-primary' 
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''}`} />
              <span className="text-[10px] font-bold tracking-wider uppercase">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-[2px] bg-primary rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};