import { useState, useEffect } from 'react';
import { DeckTheme, ManaColor } from '@/types/deck';
import { db, storage } from '@/integrations/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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
          imageUrl: data.imageUrl || '',
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

  const addTheme = async (theme: Omit<DeckTheme, 'id' | 'createdAt' | 'imageUrl'>, imageBlob?: Blob) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // 1. Adicionar o tema no Firestore primeiro para obter o ID
      const docRef = await addDoc(collection(db, 'deck_themes'), {
        name: theme.name,
        description: theme.description,
        manaColor: theme.manaColor,
        userId: user.uid,
        createdAt: new Date(),
      });

      // 2. Se houver imagem, fazer o upload para o Storage
      if (imageBlob) {
        const storageRef = ref(storage, `users/${user.uid}/themes/${docRef.id}.jpg`);
        await uploadBytes(storageRef, imageBlob, { contentType: 'image/jpeg' });
        const imageUrl = await getDownloadURL(storageRef);

        // Atualizar o documento com a URL final
        await updateDoc(docRef, { imageUrl });
      }

      await fetchThemes();
    } catch (error) {
      console.error('Error adding theme:', error);
      throw error;
    }
  };

  const removeTheme = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // 1. Tentar remover do Storage se existir
      const storageRef = ref(storage, `users/${user.uid}/themes/${id}.jpg`);
      try {
        await deleteObject(storageRef);
      } catch (e) {
        // Ignora erros se o arquivo não existir
        console.log('Sem imagem no Storage ou erro ao apagar:', e);
      }

      // 2. Remover do Firestore
      await deleteDoc(doc(db, 'deck_themes', id));
      await fetchThemes();
    } catch (error) {
      console.error('Error removing theme:', error);
      throw error;
    }
  };

  const updateTheme = async (
    id: string, 
    updates: Partial<Omit<DeckTheme, 'id' | 'createdAt'>>, 
    imageBlob?: Blob | null
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      let imageUrl = updates.imageUrl;

      // Se imageBlob for nulo, indica que queremos remover a imagem
      if (imageBlob === null) {
        const storageRef = ref(storage, `users/${user.uid}/themes/${id}.jpg`);
        try {
          await deleteObject(storageRef);
        } catch (e) {
          console.log('Erro ao apagar imagem do storage:', e);
        }
        imageUrl = '';
      } else if (imageBlob) {
        // Se houver um novo blob, fazer upload/substituir no Storage
        const storageRef = ref(storage, `users/${user.uid}/themes/${id}.jpg`);
        await uploadBytes(storageRef, imageBlob, { contentType: 'image/jpeg' });
        imageUrl = await getDownloadURL(storageRef);
      }

      const docRef = doc(db, 'deck_themes', id);
      await updateDoc(docRef, {
        name: updates.name,
        description: updates.description,
        manaColor: updates.manaColor,
        imageUrl: imageUrl !== undefined ? imageUrl : '',
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