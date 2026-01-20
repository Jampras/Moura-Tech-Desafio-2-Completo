import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // Carrega o carrinho do localStorage ao iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('moura_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Erro ao carregar carrinho:", e);
        setItems([]);
      }
    }
  }, []);

  // Salva no localStorage sempre que o carrinho mudar
  useEffect(() => {
    localStorage.setItem('moura_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity) => {
    setItems(prevItems => {
      // Verifica se o produto já existe no carrinho (pelo ID)
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        // Se existe, apenas soma a quantidade
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + Number(quantity) }
            : item
        );
      }

      // Se não existe, adiciona o novo item
      return [...prevItems, { 
        ...product, 
        quantity: Number(quantity),
        // Garante que o preço seja um número para evitar erros de cálculo
        price: Number(product.price) 
      }];
    });
  };

  const removeFromCart = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity: Number(quantity) } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('moura_cart');
  };

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      total 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);