import { GoogleGenerativeAI } from '@google/generative-ai';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

/**
 * Obtém as configurações do Gemini do Firestore (compartilhada).
 */
export async function getGeminiConfig(): Promise<{ apiKey?: string; workerUrl?: string }> {
  try {
    const docRef = doc(db, 'config', 'gemini');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        apiKey: data.apiKey,
        workerUrl: data.workerUrl
      };
    }
  } catch (error) {
    console.warn('Não foi possível ler as configurações do Firestore:', error);
  }
  return {};
}

interface ScanResult {
  themeName: string;
  manaColor?: 'white' | 'blue' | 'black' | 'red' | 'green';
  manaDetected: boolean;
}

/**
 * Envia uma imagem base64 para identificação do tema do JumpStart, 
 * priorizando o Cloudflare Worker proxy para segurança da chave.
 */
export async function scanThemeCard(base64DataUrl: string): Promise<ScanResult> {
  // 1. Verificamos se o próprio usuário configurou uma chave local no dispositivo
  const localKey = localStorage.getItem('custom_gemini_api_key');
  if (localKey) {
    const genAI = new GoogleGenerativeAI(localKey);
    return callGeminiClientSide(genAI, base64DataUrl);
  }

  // 2. Buscamos as configurações do Firestore
  const config = await getGeminiConfig();
  const workerUrl = config.workerUrl || import.meta.env.VITE_CLOUDFLARE_WORKER_URL;

  if (workerUrl) {
    // Se tiver o Worker configurado, fazemos a chamada segura pelo proxy do Cloudflare
    return callGeminiProxy(workerUrl, base64DataUrl);
  }

  // 3. Fallback para variáveis de ambiente locais (.env)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey) {
    const genAI = new GoogleGenerativeAI(envKey);
    return callGeminiClientSide(genAI, base64DataUrl);
  }

  // 4. Fallback legada de chave compartilhada direto no Firestore
  if (config.apiKey) {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    return callGeminiClientSide(genAI, base64DataUrl);
  }

  throw new Error('Nenhuma chave de API ou URL do Cloudflare Worker configurada para escaneamento.');
}

/**
 * Faz a chamada direta ao Gemini do lado do cliente (expõe a chave na rede).
 */
async function callGeminiClientSide(genAI: GoogleGenerativeAI, base64DataUrl: string): Promise<ScanResult> {
  const parts = base64DataUrl.split(',');
  const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const base64Data = parts[1];

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType
    },
  };

  const prompt = `Analyze this image which is a card representing a Magic: The Gathering Jumpstart theme.
Identify these things:
1. The theme name (usually written in a large font at the bottom center, in the semi-transparent black banner).
2. If visible, the mana color symbol shown below the theme name (Plains/White, Island/Blue, Swamp/Black, Mountain/Red, Forest/Green). If no mana symbol is visible, set manaColor to null.

Return ONLY a JSON object with this exact format:
{
  "themeName": "Name of the theme in title case (e.g. Vehicles, Goblins, Minotaurs, etc.)",
  "manaColor": "white" or "blue" or "black" or "red" or "green" or null
}
Do not include any other text, markdown formatting, or explanation.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text().trim();

    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(text);
    return parseAndNormalizeResult(parsed);
  } catch (error) {
    console.error('Client-side Gemini failed:', error);
    throw new Error('Falha ao identificar a carta via cliente. Verifique sua chave de API e tente novamente.');
  }
}

/**
 * Faz a chamada segura através de um Cloudflare Worker proxy (esconde a chave do cliente).
 */
async function callGeminiProxy(workerUrl: string, base64DataUrl: string): Promise<ScanResult> {
  try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: base64DataUrl })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    return parseAndNormalizeResult(data);
  } catch (error: any) {
    console.error('Proxy Gemini failed:', error);
    throw new Error(error.message || 'Erro ao processar imagem através do servidor proxy.');
  }
}

/**
 * Normaliza e valida a resposta da IA.
 */
function parseAndNormalizeResult(parsed: any): ScanResult {
  if (!parsed.themeName || typeof parsed.themeName !== 'string' || !parsed.themeName.trim()) {
    throw new Error('Não foi possível identificar o nome do tema na imagem.');
  }

  // Se manaColor for null ou undefined, significa que não havia símbolo visível
  if (parsed.manaColor === null || parsed.manaColor === undefined || parsed.manaColor === '') {
    return {
      themeName: parsed.themeName.trim(),
      manaDetected: false
    };
  }

  const allowedColors = ['white', 'blue', 'black', 'red', 'green'];
  let manaColor = String(parsed.manaColor).toLowerCase();

  if (manaColor === 'branco' || manaColor === 'plains') manaColor = 'white';
  if (manaColor === 'azul' || manaColor === 'island') manaColor = 'blue';
  if (manaColor === 'preto' || manaColor === 'swamp') manaColor = 'black';
  if (manaColor === 'vermelho' || manaColor === 'mountain') manaColor = 'red';
  if (manaColor === 'verde' || manaColor === 'forest') manaColor = 'green';

  if (!allowedColors.includes(manaColor)) {
    // Cor não reconhecida — retorna sem mana, usuário escolhe manualmente
    return {
      themeName: parsed.themeName.trim(),
      manaDetected: false
    };
  }

  return {
    themeName: parsed.themeName.trim(),
    manaColor: manaColor as ScanResult['manaColor'],
    manaDetected: true
  };
}
