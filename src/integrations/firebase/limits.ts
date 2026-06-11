import { doc, runTransaction } from 'firebase/firestore';
import { db } from './client';

/**
 * Obtém a data atual no formato YYYY-MM-DD no fuso horário local.
 */
function getLocalDateString(): string {
  return new Date().toLocaleDateString('sv'); // 'sv' (Suécia) usa formato ISO 8601 (YYYY-MM-DD)
}

/**
 * Verifica se o usuário e o aplicativo ainda possuem cota de escaneamento para o dia atual.
 * Se houver cota, incrementa os contadores atômica e simultaneamente.
 * 
 * Limite Individual: 10 escaneamentos por dia.
 * Limite Global: 50 escaneamentos por dia.
 */
export async function checkAndIncrementUsage(userId: string): Promise<void> {
  const dateStr = getLocalDateString();
  const globalDocRef = doc(db, 'usage', `global_${dateStr}`);
  const userDocRef = doc(db, 'usage', `user_${userId}_${dateStr}`);

  await runTransaction(db, async (transaction) => {
    const globalDoc = await transaction.get(globalDocRef);
    const userDoc = await transaction.get(userDocRef);

    const globalCount = globalDoc.exists() ? (globalDoc.data().count || 0) : 0;
    const userCount = userDoc.exists() ? (userDoc.data().count || 0) : 0;

    if (userCount >= 10) {
      throw new Error('Você atingiu o limite individual de 10 escaneamentos por dia.');
    }

    if (globalCount >= 50) {
      throw new Error('O limite global de 50 escaneamentos diários do aplicativo foi atingido. Tente novamente amanhã.');
    }

    // Se as cotas estiverem OK, incrementa no banco de dados
    transaction.set(globalDocRef, { count: globalCount + 1, date: dateStr }, { merge: true });
    transaction.set(userDocRef, { count: userCount + 1, userId, date: dateStr }, { merge: true });
  });
}

/**
 * Decrementa os contadores de uso. Deve ser chamado se a chamada da API do Gemini falhar
 * após os contadores já terem sido incrementados, para não penalizar o usuário por erros técnicos.
 */
export async function decrementUsage(userId: string): Promise<void> {
  const dateStr = getLocalDateString();
  const globalDocRef = doc(db, 'usage', `global_${dateStr}`);
  const userDocRef = doc(db, 'usage', `user_${userId}_${dateStr}`);

  try {
    await runTransaction(db, async (transaction) => {
      const globalDoc = await transaction.get(globalDocRef);
      const userDoc = await transaction.get(userDocRef);

      const globalCount = globalDoc.exists() ? (globalDoc.data().count || 0) : 0;
      const userCount = userDoc.exists() ? (userDoc.data().count || 0) : 0;

      transaction.set(globalDocRef, { count: Math.max(0, globalCount - 1) }, { merge: true });
      transaction.set(userDocRef, { count: Math.max(0, userCount - 1) }, { merge: true });
    });
  } catch (error) {
    console.error('Falha ao estornar cota de escaneamento:', error);
  }
}
