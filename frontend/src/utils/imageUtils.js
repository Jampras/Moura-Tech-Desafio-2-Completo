/**
 * Utilitários para processamento de imagens.
 * 
 * Usa Canvas HTML5 para compressão sem bibliotecas externas.
 */

/**
 * Redimensiona e comprime uma imagem.
 * 
 * @param {File} file - Arquivo de imagem original
 * @param {Object} options - Opções de compressão
 * @param {number} options.maxWidth - Largura máxima (padrão: 800px)
 * @param {number} options.maxHeight - Altura máxima (padrão: 800px)
 * @param {number} options.quality - Qualidade JPEG 0-1 (padrão: 0.7)
 * @returns {Promise<string>} - Imagem comprimida em Base64
 */
export const compressImage = (file, options = {}) => {
    const {
        maxWidth = 800,
        maxHeight = 800,
        quality = 0.7
    } = options;

    return new Promise((resolve, reject) => {
        // Cria elemento de imagem
        const img = new Image();

        img.onload = () => {
            try {
                // Calcula novas dimensões mantendo proporção
                let { width, height } = img;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                // Cria canvas para redimensionar
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                // Desenha imagem redimensionada
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Converte para Base64 com compressão JPEG
                // Para PNGs, mantém transparência se necessário
                const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                const base64 = canvas.toDataURL(mimeType, quality);

                resolve(base64);
            } catch (error) {
                reject(new Error('Erro ao processar imagem'));
            }
        };

        img.onerror = () => {
            reject(new Error('Erro ao carregar imagem'));
        };

        // Carrega a imagem a partir do arquivo
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.onerror = () => {
            reject(new Error('Erro ao ler arquivo'));
        };
        reader.readAsDataURL(file);
    });
};

/**
 * Calcula o tamanho aproximado de uma string Base64 em bytes.
 * 
 * @param {string} base64 - String Base64
 * @returns {number} - Tamanho em bytes
 */
export const getBase64Size = (base64) => {
    if (!base64) return 0;

    // Remove o prefixo "data:image/...;base64,"
    const base64Data = base64.split(',')[1] || base64;

    // Base64 usa ~4 caracteres para representar 3 bytes
    const padding = (base64Data.match(/=/g) || []).length;
    return Math.floor((base64Data.length * 3) / 4) - padding;
};

/**
 * Formata bytes para exibição legível.
 * 
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} - Tamanho formatado (ex: "245 KB")
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
