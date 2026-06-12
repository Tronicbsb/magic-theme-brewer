/**
 * Converte um base64 DataURL ou um objeto File em um Blob compactado em JPEG.
 * Mantém a proporção e define limites máximos (padrão 5:7 de MTG - ex: 450x630px).
 */
export async function compressImage(
  source: File | string,
  maxWidth = 450,
  maxHeight = 630
): Promise<Blob> {
  // Se a fonte for um File, usamos o arquivo original como fallback
  const sourceFile = source instanceof File ? source : null;

  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      const processImageSrc = (src: string) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          // Validação: se a imagem for muito pequena, retornamos o original
          if (img.width < 10 || img.height < 10) {
            if (sourceFile) {
              resolve(sourceFile);
            } else {
              reject(new Error('Imagem muito pequena para processamento.'));
            }
            return;
          }

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

          // Garantir dimensões mínimas válidas
          if (width < 1) width = 1;
          if (height < 1) height = 1;

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback: retornar arquivo original se canvas não estiver disponível
            if (sourceFile) {
              resolve(sourceFile);
            } else {
              reject(new Error('Não foi possível obter o contexto 2D do Canvas.'));
            }
            return;
          }

          // Desenhar com fundo preto para preencher possíveis transparências em PNGs
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);

          try {
            ctx.drawImage(img, 0, 0, width, height);
          } catch (drawErr) {
            // Fallback: se drawImage falhar, retornar original
            console.error('drawImage failed:', drawErr);
            if (sourceFile) {
              resolve(sourceFile);
            } else {
              reject(new Error('Erro ao desenhar imagem no canvas.'));
            }
            return;
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else if (sourceFile) {
                // Fallback: se toBlob retornar null, usar arquivo original
                resolve(sourceFile);
              } else {
                reject(new Error('Erro ao converter Canvas em Blob.'));
              }
            },
            'image/jpeg',
            0.8 // 80% qualidade JPEG (cria arquivos levíssimos ~50KB!)
          );
        };
        img.onerror = (err) => {
          console.error('Image load error:', err);
          // Fallback: retornar arquivo original se a imagem falhar ao carregar
          if (sourceFile) {
            resolve(sourceFile);
          } else {
            reject(err instanceof Error ? err : new Error('Erro ao carregar imagem.'));
          }
        };
      };

      if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            processImageSrc(event.target.result as string);
          } else {
            // Fallback: retornar arquivo original
            if (sourceFile) {
              resolve(sourceFile);
            } else {
              reject(new Error('Erro ao ler arquivo.'));
            }
          }
        };
        reader.onerror = () => {
          // Fallback: retornar arquivo original
          if (sourceFile) {
            resolve(sourceFile);
          } else {
            reject(new Error('Erro ao ler arquivo de imagem.'));
          }
        };
        reader.readAsDataURL(source);
      } else if (typeof source === 'string') {
        processImageSrc(source);
      } else {
        reject(new Error('Formato de entrada inválido para compressão.'));
      }
    });

    return blob;
  } catch (err) {
    // Último fallback: se tudo falhar, retorna o arquivo original
    if (sourceFile) {
      console.error('compressImage failed, returning original file:', err);
      return sourceFile;
    }
    throw err;
  }
}
