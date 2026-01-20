import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import { ToastProvider } from './components/Toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CartDrawer from './components/CartDrawer';
import AdminPage from './pages/AdminPage';
import ProductList from './components/ProductList';
import ReceiptPage from './pages/ReceiptPage';
import LoginPage from './pages/LoginPage';
import api from './services/api';

/**
 * Página de Simulação de Vendas.
 */
function SimulationPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then(res => {
        const data = res.data.content || res.data;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Simulador de Vendas</h1>
          <p className="text-gray-500">Selecione os produtos para gerar um orçamento.</p>
        </div>
        <ProductList products={products} loading={loading} />
      </div>
    </div>
  );
}

/**
 * Rota protegida - redireciona para /login se não autenticado.
 */
function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Layout principal com Header e Cart.
 */
function MainLayout({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  // Se não estiver logado, não mostra header
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header onCartClick={() => setIsCartOpen(true)} />
      {children}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

/**
 * Componente principal da aplicação.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <MainLayout>
              <Routes>
                {/* Rota pública */}
                <Route path="/login" element={<LoginPage />} />

                {/* Rotas protegidas - requerem login */}
                <Route path="/" element={
                  <ProtectedRoute><AdminPage /></ProtectedRoute>
                } />
                <Route path="/simulacao" element={
                  <ProtectedRoute><SimulationPage /></ProtectedRoute>
                } />
                <Route path="/recibo" element={
                  <ProtectedRoute><ReceiptPage /></ProtectedRoute>
                } />
              </Routes>
            </MainLayout>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}