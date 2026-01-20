import { useState, useEffect } from 'react';
import ProductService from '../services/ProductService';
import ProductList from '../components/ProductList';

/**
 * Página inicial com lista de produtos.
 * O carrinho agora é um Drawer global, não precisa estar aqui.
 */
function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * EFEITO: Carrega produtos da API ao montar o componente.
     * GATILHO: [] (array vazio = apenas na montagem)
     * RISCO DE LOOP: Nenhum (dependências vazias)
     */
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ProductService.getProducts();
            setProducts(data);
        } catch (err) {
            setError(err.message || 'Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header da página */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Nossos Produtos
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {products.length} produtos disponíveis
                        </p>
                    </div>

                    {/* Ordenação */}
                    <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option>Mais relevantes</option>
                        <option>Menor preço</option>
                        <option>Maior preço</option>
                        <option>Mais recentes</option>
                    </select>
                </div>

                {/* Lista de produtos com sidebar */}
                <ProductList
                    products={products}
                    loading={loading}
                    error={error}
                    onRetry={loadProducts}
                />
            </div>
        </div>
    );
}

export default HomePage;
