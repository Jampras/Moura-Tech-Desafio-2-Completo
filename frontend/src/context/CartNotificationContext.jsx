import { createContext, useContext, useState, useCallback, useMemo } from 'react';

/**
 * Contexto de Notificações do Carrinho.
 * 
 * Gerencia notificações flutuantes separadas do drawer do carrinho.
 * O toast aparece no canto inferior esquerdo para não interferir com o drawer.
 */
const CartNotificationContext = createContext();

/**
 * Provider de Notificações do Carrinho.
 */
export function CartNotificationProvider({ children }) {
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success', // 'success' | 'error' | 'info'
        productName: '',
    });

    /**
     * Exibe uma notificação e a fecha automaticamente após 3 segundos.
     */
    const showNotification = useCallback((message, type = 'success', productName = '') => {
        setNotification({
            show: true,
            message,
            type,
            productName,
        });

        // Auto-fecha após 3 segundos
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    }, []);

    /**
     * Notificação específica para adicionar ao carrinho.
     */
    const notifyAddToCart = useCallback((productName, isIncrement = false) => {
        const message = isIncrement
            ? 'Quantidade aumentada!'
            : 'Item adicionado ao carrinho!';
        showNotification(message, 'success', productName);
    }, [showNotification]);

    /**
     * Notificação de remoção.
     */
    const notifyRemoveFromCart = useCallback((productName) => {
        showNotification('Item removido', 'info', productName);
    }, [showNotification]);

    /**
     * Fecha a notificação manualmente.
     */
    const closeNotification = useCallback(() => {
        setNotification(prev => ({ ...prev, show: false }));
    }, []);

    const value = useMemo(() => ({
        notification,
        showNotification,
        notifyAddToCart,
        notifyRemoveFromCart,
        closeNotification,
    }), [notification, showNotification, notifyAddToCart, notifyRemoveFromCart, closeNotification]);

    return (
        <CartNotificationContext.Provider value={value}>
            {children}
        </CartNotificationContext.Provider>
    );
}

/**
 * Hook para acessar o contexto de notificações.
 */
export function useCartNotification() {
    const context = useContext(CartNotificationContext);

    if (!context) {
        throw new Error('useCartNotification deve ser usado dentro de CartNotificationProvider');
    }

    return context;
}
