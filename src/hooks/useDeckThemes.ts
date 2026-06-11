import { useState, useEffect } from 'react';
import { DeckTheme, ManaColor } from '@/types/deck';
import { db } from '@/integrations/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';

export const useDeckThemes = () => {
  const { user } = useAuth();
  const [themes, setThemes] = useState<DeckTheme[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThemes = async () => {
    if (!user) {
      setThemes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, 'deck_themes'),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const mappedThemes: DeckTheme[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        mappedThemes.push({
          id: docSnapshot.id,
          name: data.name,
          description: data.description || '',
          manaColor: data.manaColor as ManaColor,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      // Ordena em memória por data de criação de forma ascendente
      mappedThemes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      setThemes(mappedThemes);
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [user]);

  const addTheme = async (theme: Omit<DeckTheme, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await addDoc(collection(db, 'deck_themes'), {
        name: theme.name,
        description: theme.description,
        manaColor: theme.manaColor,
        userId: user.uid,
        createdAt: new Date(),
      });
      await fetchThemes();
    } catch (error) {
      console.error('Error adding theme:', error);
      throw error;
    }
  };

  const removeTheme = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await deleteDoc(doc(db, 'deck_themes', id));
      await fetchThemes();
    } catch (error) {
      console.error('Error removing theme:', error);
      throw error;
    }
  };

  const updateTheme = async (id: string, updates: Partial<Omit<DeckTheme, 'id' | 'createdAt'>>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await updateDoc(doc(db, 'deck_themes', id), {
        name: updates.name,
        description: updates.description,
        manaColor: updates.manaColor,
      });
      await fetchThemes();
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