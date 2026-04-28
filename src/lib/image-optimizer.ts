/**
 * Otimiza uma imagem antes do upload:
 * 1. Redimensiona para no máximo 800px (mantendo proporção)
 * 2. Converte para o formato WebP
 * 3. Aplica compressão de qualidade
 */
export async function optimizeImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Se o arquivo não for imagem, rejeita
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcula novas dimensões mantendo o aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto do canvas.'));
          return;
        }

        // Desenha a imagem no canvas com as novas dimensões
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converte para Blob no formato WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Erro na conversão da imagem para Blob.'));
            }
          },
          'image/webp',
          quality
        );
      };
    };
    reader.onerror = (error) => reject(error);
  });
}
