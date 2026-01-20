import api from './api';

/**
 * Serviço para operações de carrinho e checkout.
 */
const CartService = {
    /**
     * Realiza o checkout do carrinho.
     * @param {Array} items - Lista de itens [{productId, quantity}]
     */
    checkout: async (items) => {
        const response = await api.post('/cart/checkout', { items });
        return response.data;
    },

    /**
     * Busca todos os pedidos.
     */
    getOrders: async () => {
        const response = await api.get('/cart/orders');
        return response.data;
    },

    /**
     * Busca um pedido por ID.
     */
    getOrderById: async (id) => {
        const response = await api.get(`/cart/orders/${id}`);
        return response.data;
    },

    /**
     * Cancela um pedido.
     */
    cancelOrder: async (id) => {
        const response = await api.post(`/cart/orders/${id}/cancel`);
        return response.data;
    },
};

export default CartService;
