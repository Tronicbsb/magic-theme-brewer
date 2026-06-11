/**
 * Converte um base64 DataURL ou um objeto File em um Blob compactado em JPEG.
 * Mantém a proporção e define limites máximos (padrão 5:7 de MTG - ex: 450x630px).
 */
export function compressImage(
  source: File | string,
  maxWidth = 450,
  maxHeight = 630
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const processImageSrc = (src: string) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Mantém a proporção calculando baseados nos limites de largura e altura
        const ratio = width / height;
        const targetRatio = maxWidth / maxHeight; // ~0.714 (proporção 5:7)

        if (width > maxWidth || height > maxHeight) {
          if (ratio > targetRatio) {
            // A imagem é mais larga que a proporção alvo
            width = maxWidth;
            height = Math.round(maxWidth / ratio);
          } else {
            // A imagem é mais alta que a proporção alvo
            height = maxHeight;
            width = Math.round(maxHeight * ratio);
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto 2D do Canvas.'));
          return;
        }

        // Desenhar com fundo preto para preencher possíveis transparências em PNGs
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Erro ao converter Canvas em Blob.'));
            }
          },
          'image/jpeg',
          0.8 // 80% qualidade JPEG (cria arquivos levíssimos ~50KB!)
        );
      };
      img.onerror = (err) => reject(err);
    };

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImageSrc(event.target.result as string);
        } else {
          reject(new Error('Erro ao ler arquivo.'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(source);
    } else if (typeof source === 'string') {
      processImageSrc(source);
    } else {
      reject(new Error('Formato de entrada inválido para compressão.'));
    }
  });
}
