import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializa a API do Gemini se a chave estiver configurada
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

interface ScanResult {
  themeName: string;
  manaColor: 'white' | 'blue' | 'black' | 'red' | 'green';
}

/**
 * Envia uma imagem base64 para a API do Gemini 1.5 Flash para ler as informações
 * do cartão de tema JumpStart do Magic: The Gathering.
 */
export async function scanThemeCard(base64DataUrl: string): Promise<ScanResult> {
  if (!apiKey || !genAI) {
    throw new Error('Chave VITE_GEMINI_API_KEY não encontrada nas variáveis de ambiente (.env). Configure-a para utilizar o escaneamento.');
  }

  // Separar o cabeçalho base64 do conteúdo real (ex: "data:image/jpeg;base64,/9j/..." -> "/9j/...")
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
Identify two things:
1. The theme name (usually written in a large font at the bottom center, in the semi-transparent black banner).
2. The mana color associated with the theme card (based on the mana icon symbol shown below the theme name: Plains/White, Island/Blue, Swamp/Black, Mountain/Red, Forest/Green).

Return ONLY a JSON object with this exact format:
{
  "themeName": "Name of the theme in title case (e.g. Vehicles, Goblins, Minotaurs, etc.)",
  "manaColor": "one of: white, blue, black, red, green"
}
Do not include any other text, markdown formatting, or explanation.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text().trim();

    // Limpar marcações de código markdown se o modelo responder como ```json ... ```
    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(text);
    
    if (!parsed.themeName || !parsed.manaColor) {
      throw new Error('Resposta da IA incompleta.');
    }

    // Normalizar cores de mana retornadas pela IA
    const allowedColors = ['white', 'blue', 'black', 'red', 'green'];
    let manaColor = parsed.manaColor.toLowerCase();
    
    // Mapeamento simples caso a IA retorne nomes em português ou errados
    if (manaColor === 'branco' || manaColor === 'plains') manaColor = 'white';
    if (manaColor === 'azul' || manaColor === 'island') manaColor = 'blue';
    if (manaColor === 'preto' || manaColor === 'swamp') manaColor = 'black';
    if (manaColor === 'vermelho' || manaColor === 'mountain') manaColor = 'red';
    if (manaColor === 'verde' || manaColor === 'forest') manaColor = 'green';

    if (!allowedColors.includes(manaColor)) {
      throw new Error(`Cor de mana inválida retornada pela IA: ${parsed.manaColor}`);
    }

    return {
      themeName: parsed.themeName,
      manaColor: manaColor as ScanResult['manaColor']
    };
  } catch (error) {
    console.error('Gemini scanning failed:', error);
    throw new Error('Falha ao identificar a carta. Verifique a qualidade da foto e tente novamente.');
  }
}
