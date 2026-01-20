import api from './api';

/**
 * Serviço para operações com produtos.
 * 
 * Endpoints:
 * - GET /products (paginado) - retorna Page<Product>
 * - GET /products/all - retorna List<Product> (sem paginação)
 * - GET /products/search (paginado)
 */
const ProductService = {
    /**
     * Busca todos os produtos (versão lista, sem paginação).
     * Usa endpoint /products/all para compatibilidade com frontend atual.
     */
    getProducts: async () => {
        const response = await api.get('/products/all');
        return response.data;
    },

    /**
     * Busca produtos com paginação.
     * @param {number} page - Número da página (começa em 0)
     * @param {number} size - Itens por página
     * @param {string} sort - Ordenação (ex: "name,asc" ou "price,desc")
     * @returns {Promise<Page>} Objeto Page com content, totalElements, totalPages, etc.
     */
    getProductsPaginated: async (page = 0, size = 10, sort = 'name,asc') => {
        const response = await api.get('/products', {
            params: { page, size, sort }
        });
        return response.data;
    },

    /**
     * Busca um produto por ID.
     */
    getProductById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    /**
     * Busca produtos por nome (paginado).
     * @param {string} name - Termo de busca
     * @param {number} page - Número da página
     * @param {number} size - Itens por página
     */
    searchProducts: async (name, page = 0, size = 10) => {
        const response = await api.get('/products/search', {
            params: { name, page, size }
        });
        return response.data;
    },

    /**
     * Cria um novo produto.
     */
    createProduct: async (product) => {
        const response = await api.post('/products', product);
        return response.data;
    },

    /**
     * Atualiza um produto existente.
     */
    updateProduct: async (id, product) => {
        const response = await api.put(`/products/${id}`, product);
        return response.data;
    },

    /**
     * Remove um produto.
     */
    deleteProduct: async (id) => {
        await api.delete(`/products/${id}`);
    },
};

export default ProductService;
