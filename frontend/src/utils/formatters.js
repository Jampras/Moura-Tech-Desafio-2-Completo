/**
 * Utilitários de formatação compartilhados.
 * 
 * Centraliza funções de formatação para evitar duplicação
 * e garantir consistência em toda a aplicação.
 */

/**
 * Formata um valor numérico como moeda brasileira (BRL).
 * 
 * @param {number} price - Valor a ser formatado
 * @returns {string} Valor formatado (ex: "R$ 99,90")
 * 
 * @example
 * formatPrice(99.9) // "R$ 99,90"
 * formatPrice(1500) // "R$ 1.500,00"
 */
// O segredo é ter o "export" antes do "const"
export const formatMoney = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata uma data para exibição no padrão brasileiro.
 * 
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada (ex: "16/01/2026")
 */
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

/**
 * Formata uma data com hora para exibição.
 * 
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data e hora formatadas (ex: "16/01/2026 às 14:30")
 */
export const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(date));
};
