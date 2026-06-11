import { useState, useEffect } from 'react';
import { DeckTheme, ManaColor } from '@/types/deck';
import { db } from '@/integrations/firebase/client';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';

const DEFAULT_THEMES = [
  { name: 'Cats', description: 'Focado em criaturas felinas e suas sinergias', manaColor: 'white' as ManaColor },
  { name: 'Healing', description: 'Focado em ganhar pontos de vida', manaColor: 'white' as ManaColor },
  { name: 'Wizards', description: 'Com ênfase em criaturas Mago e feitiços', manaColor: 'blue' as ManaColor },
  { name: 'Pirates', description: 'Centrado em criaturas piratas e suas travessuras', manaColor: 'blue' as ManaColor },
  { name: 'Vampires', description: 'Focado em criaturas vampiras e drenar a vida do oponente', manaColor: 'black' as ManaColor },
  { name: 'Undead', description: 'Com foco em zumbis e outras criaturas mortas-vivas', manaColor: 'black' as ManaColor },
  { name: 'Goblins', description: 'Decks rápidos e agressivos com muitas criaturas Goblins', manaColor: 'red' as ManaColor },
  { name: 'Inferno', description: 'Focado em feitiços de dano direto (queimar)', manaColor: 'red' as ManaColor },
  { name: 'Elves', description: 'Gira em torno de criaturas Elfo e acelerar mana', manaColor: 'green' as ManaColor },
  { name: 'Primal', description: 'Focado em criaturas grandes e poderosas da natureza', manaColor: 'green' as ManaColor }
];

export const useDeckThemes = () => {
  const [themes, setThemes] = useState<DeckTheme[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThemes = async () => {
    try {
      const q = query(collection(db, 'deck_themes'), orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);
      const mappedThemes: DeckTheme[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        mappedThemes.push({
          id: doc.id,
          name: data.name,
          description: data.description || '',
          manaColor: data.manaColor as ManaColor,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      if (mappedThemes.length === 0) {
        console.log('Nenhum tema encontrado no Firestore. Semeando temas padrões...');
        const promises = DEFAULT_THEMES.map(theme => 
          addDoc(collection(db, 'deck_themes'), {
            ...theme,
            createdAt: new Date()
          })
        );
        await Promise.all(promises);
        
        // Refetch after seeding
        const reSnapshot = await getDocs(q);
        const reMappedThemes: DeckTheme[] = [];
        reSnapshot.forEach((doc) => {
          const data = doc.data();
          reMappedThemes.push({
            id: doc.id,
            name: data.name,
            description: data.description || '',
            manaColor: data.manaColor as ManaColor,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
        setThemes(reMappedThemes);
      } else {
        setThemes(mappedThemes);
      }
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
      await addDoc(collection(db, 'deck_themes'), {
        name: theme.name,
        description: theme.description,
        manaColor: theme.manaColor,
        createdAt: new Date(),
      });
      await fetchThemes();
    } catch (error) {
      console.error('Error adding theme:', error);
      throw error;
    }
  };

  const removeTheme = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'deck_themes', id));
      await fetchThemes();
    } catch (error) {
      console.error('Error removing theme:', error);
      throw error;
    }
  };

  const updateTheme = async (id: string, updates: Partial<Omit<DeckTheme, 'id' | 'createdAt'>>) => {
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