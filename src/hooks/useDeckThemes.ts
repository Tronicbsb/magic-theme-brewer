import { useState, useEffect } from 'react';
import { DeckTheme, ManaColor } from '@/types/deck';

const DEFAULT_THEMES: DeckTheme[] = [
  // Branco
  { id: '1', name: 'Cats', description: 'Focado em criaturas felinas e suas sinergias', manaColor: 'white', createdAt: new Date() },
  { id: '2', name: 'Healing', description: 'Focado em ganhar pontos de vida', manaColor: 'white', createdAt: new Date() },
  
  // Azul
  { id: '3', name: 'Wizards', description: 'Com ênfase em criaturas Mago e feitiços', manaColor: 'blue', createdAt: new Date() },
  { id: '4', name: 'Pirates', description: 'Centrado em criaturas piratas e suas travessuras', manaColor: 'blue', createdAt: new Date() },
  
  // Preto
  { id: '5', name: 'Vampires', description: 'Focado em criaturas vampiras e drenar a vida do oponente', manaColor: 'black', createdAt: new Date() },
  { id: '6', name: 'Undead', description: 'Com foco em zumbis e outras criaturas mortas-vivas', manaColor: 'black', createdAt: new Date() },
  
  // Vermelho
  { id: '7', name: 'Goblins', description: 'Decks rápidos e agressivos com muitas criaturas Goblins', manaColor: 'red', createdAt: new Date() },
  { id: '8', name: 'Inferno', description: 'Focado em feitiços de dano direto (queimar)', manaColor: 'red', createdAt: new Date() },
  
  // Verde
  { id: '9', name: 'Elves', description: 'Gira em torno de criaturas Elfo e acelerar mana', manaColor: 'green', createdAt: new Date() },
  { id: '10', name: 'Primal', description: 'Focado em criaturas grandes e poderosas da natureza', manaColor: 'green', createdAt: new Date() },
];

export const useDeckThemes = () => {
  const [themes, setThemes] = useState<DeckTheme[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('magic-deck-themes');
    if (stored) {
      const parsedThemes = JSON.parse(stored).map((theme: any) => ({
        ...theme,
        createdAt: new Date(theme.createdAt)
      }));
      setThemes(parsedThemes);
    } else {
      setThemes(DEFAULT_THEMES);
      localStorage.setItem('magic-deck-themes', JSON.stringify(DEFAULT_THEMES));
    }
  }, []);

  const addTheme = (theme: Omit<DeckTheme, 'id' | 'createdAt'>) => {
    const newTheme: DeckTheme = {
      ...theme,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    const updatedThemes = [...themes, newTheme];
    setThemes(updatedThemes);
    localStorage.setItem('magic-deck-themes', JSON.stringify(updatedThemes));
  };

  const removeTheme = (id: string) => {
    const updatedThemes = themes.filter(theme => theme.id !== id);
    setThemes(updatedThemes);
    localStorage.setItem('magic-deck-themes', JSON.stringify(updatedThemes));
  };

  const updateTheme = (id: string, updates: Partial<Omit<DeckTheme, 'id' | 'createdAt'>>) => {
    const updatedThemes = themes.map(theme => 
      theme.id === id ? { ...theme, ...updates } : theme
    );
    setThemes(updatedThemes);
    localStorage.setItem('magic-deck-themes', JSON.stringify(updatedThemes));
  };

  return {
    themes,
    addTheme,
    removeTheme,
    updateTheme,
  };
};