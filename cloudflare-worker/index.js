export default {
  async fetch(request, env, ctx) {
    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Trata requisições OPTIONS (Preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { image } = await request.json();
      if (!image) {
        return new Response(JSON.stringify({ error: 'A imagem é obrigatória' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Extrai a parte base64 e o tipo mime
      const parts = image.split(',');
      const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const base64Data = parts[1] || parts[0];

      // URL da API do Gemini (a chave GEMINI_API_KEY vem das variáveis seguras do Cloudflare)
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
      
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Analyze this image which is a card representing a Magic: The Gathering Jumpstart theme.
Identify two things:
1. The theme name (usually written in a large font at the bottom center, in the semi-transparent black banner).
2. The mana color associated with the theme card (based on the mana icon symbol shown below the theme name: Plains/White, Island/Blue, Swamp/Black, Mountain/Red, Forest/Green).

Return ONLY a JSON object with this exact format:
{
  "themeName": "Name of the theme in title case (e.g. Vehicles, Goblins, Minotaurs, etc.)",
  "manaColor": "one of: white, blue, black, red, green"
}
Do not include any other text, markdown formatting, or explanation.`
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ]
      };

      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        return new Response(JSON.stringify({ error: `Erro na API do Gemini: ${errorText}` }), {
          status: geminiResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const resultData = await geminiResponse.json();
      let responseText = resultData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      // Limpa marcações de código markdown se o modelo responder com ```json ... ```
      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(responseText);

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
