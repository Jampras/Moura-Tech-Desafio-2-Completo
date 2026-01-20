import axios from 'axios';

/**
 * Configuração do cliente HTTP Axios.
 * 
 * PROPÓSITO:
 * - Centralizar a configuração de chamadas HTTP
 * - Definir URL base da API
 * - Configurar headers padrão
 * - Interceptar erros e padronizar respostas
 * 
 * AMBIENTES:
 * - Desenvolvimento: Usa proxy do Vite (/api → localhost:8080)
 * - Produção: Chama diretamente a URL do backend
 */
const api = axios.create({
    // URL base: em dev usa proxy, em prod usa URL direta
    baseURL: import.meta.env.PROD ? 'http://localhost:8080/api' : '/api',

    // Headers padrão para todas as requisições
    headers: {
        'Content-Type': 'application/json',
    },

    // Timeout de 10 segundos
    timeout: 10000,
});

/**
 * INTERCEPTOR DE RESPOSTA
 * 
 * COMO FUNCIONA:
 * - Intercepta TODAS as respostas HTTP antes de chegarem ao código
 * - Respostas de sucesso (2xx): passa direto
 * - Respostas de erro (4xx, 5xx): transforma em objeto de erro padronizado
 * 
 * POR QUE USAR:
 * - Padroniza o formato de erro para toda a aplicação
 * - O componente não precisa saber a estrutura do erro do Axios
 * - Facilita exibir mensagens amigáveis do backend
 */
api.interceptors.response.use(
    // Sucesso: retorna a resposta sem modificação
    (response) => response,

    // Erro: transforma em objeto padronizado
    (error) => {
        /**
         * Extrai informações do erro da resposta do backend.
         * 
         * ESTRUTURA ESPERADA DO BACKEND (ErrorResponseDTO):
         * {
         *   timestamp: "2024-01-16T12:00:00",
         *   status: 400,
         *   error: "Insufficient Stock",
         *   message: "Estoque insuficiente para 'Camiseta'",
         *   path: "/cart/checkout",
         *   validationErrors: ["Campo 'price': deve ser maior que zero"]
         * }
         */
        const data = error.response?.data;

        // Mensagem amigável (usa a do backend ou fallback)
        const message = data?.message || 'Erro ao conectar com o servidor';

        // Lista de erros de validação (se houver)
        const validationErrors = data?.validationErrors || [];

        // Status HTTP
        const status = error.response?.status;

        // Retorna erro padronizado para os componentes
        return Promise.reject({
            message,
            validationErrors,
            status,
            // Mantém erro original para debug se necessário
            originalError: error,
        });
    }
);

export default api;
