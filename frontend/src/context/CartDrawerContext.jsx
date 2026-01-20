import { createContext, useContext, useState } from 'react';

/**
 * Context para controlar abertura/fechamento do drawer do carrinho.
 * Separado do Cart.jsx para evitar dependência circular.
 */
const CartDrawerContext = createContext();

export function CartDrawerProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const toggle = () => setIsOpen((prev) => !prev);

    return (
        <CartDrawerContext.Provider value={{ isOpen, open, close, toggle }}>
            {children}
        </CartDrawerContext.Provider>
    );
}

export function useCartDrawer() {
    const context = useContext(CartDrawerContext);
    if (!context) {
        throw new Error('useCartDrawer deve ser usado dentro de CartDrawerProvider');
    }
    return context;
}
