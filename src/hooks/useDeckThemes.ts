import { useState, useEffect } from 'react';
import { DeckTheme, ManaColor } from '@/types/deck';
import { supabase } from '@/integrations/supabase/client';

export const useDeckThemes = () => {
  const [themes, setThemes] = useState<DeckTheme[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('deck_themes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mappedThemes: DeckTheme[] = data.map(theme => ({
        id: theme.id,
        name: theme.name,
        description: theme.description || '',
        manaColor: theme.mana_color as ManaColor,
        createdAt: new Date(theme.created_at),
      }));

      setThemes(mappedThemes);
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const addTheme = async (theme: Omit<DeckTheme, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('deck_themes')
        .insert({
          name: theme.name,
          description: theme.description,
          mana_color: theme.manaColor,
        })
        .select()
        .single();

      if (error) throw error;

      const newTheme: DeckTheme = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        manaColor: data.mana_color as ManaColor,
        createdAt: new Date(data.created_at),
      };

      setThemes(prev => [...prev, newTheme]);
    } catch (error) {
      console.error('Error adding theme:', error);
      throw error;
    }
  };

  const removeTheme = async (id: string) => {
    try {
      const { error } = await supabase
        .from('deck_themes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setThemes(prev => prev.filter(theme => theme.id !== id));
    } catch (error) {
      console.error('Error removing theme:', error);
      throw error;
    }
  };

  const updateTheme = async (id: string, updates: Partial<Omit<DeckTheme, 'id' | 'createdAt'>>) => {
    try {
      const { data, error } = await supabase
        .from('deck_themes')
        .update({
          name: updates.name,
          description: updates.description,
          mana_color: updates.manaColor,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTheme: DeckTheme = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        manaColor: data.mana_color as ManaColor,
        createdAt: new Date(data.created_at),
      };

      setThemes(prev => prev.map(theme => 
        theme.id === id ? updatedTheme : theme
      ));
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  };

  return {
    themes,
    loading,
    addTheme,
    removeTheme,
    updateTheme,
  };
};