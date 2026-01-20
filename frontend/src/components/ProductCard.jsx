import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import { ShoppingCart, Plus, Minus, AlertCircle, Eye } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const toast = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const hasStock = product.stock > 0;

  const handleIncrement = () => {
    if (typeof quantity === 'number' && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else {
      toast.warning(`Máximo disponível: ${product.stock}`);
    }
  };

  const handleDecrement = () => {
    if (typeof quantity === 'number' && quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAddToCart = () => {
    if (!hasStock) return;
    const finalQuantity = (quantity === '' || quantity < 1) ? 1 : quantity;
    addToCart(product, finalQuantity);
    toast.success(`${finalQuantity}x ${product.name} adicionado!`);
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group overflow-hidden">
      
      {/* --- ÁREA DA IMAGEM --- */}
      {/* Mudamos para h-64 para dar destaque à foto e usamos object-contain para não cortar produtos altos */}
      <div className="relative h-64 bg-white p-4 flex items-center justify-center overflow-hidden border-b border-gray-50">
        <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
        />

        {/* Categoria (Tag flutuante) */}
        {product.category && (
            <span className="absolute top-3 left-3 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold px-2 py-1 rounded tracking-wider">
                {product.category}
            </span>
        )}

        {/* Badge de Estoque */}
        {!hasStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
              <AlertCircle size={16} /> ESGOTADO
            </span>
          </div>
        )}
      </div>

      {/* --- INFORMAÇÕES --- */}
      <div className="p-5 flex flex-col flex-1 bg-gray-50/30">
        <h3 className="text-md font-medium text-gray-700 mb-1 line-clamp-2 min-h-[2.5rem]" title={product.name}>
          {product.name}
        </h3>
        
        <p className="text-2xl font-bold text-blue-900 mb-4">
          R$ {product.price?.toFixed(2)}
        </p>

        <div className="mt-auto space-y-3">
          
          {hasStock ? (
            <div className="flex items-center justify-between bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
              <button onClick={handleDecrement} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                <Minus size={16} />
              </button>
              
              <input 
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || '')}
                className="w-12 text-center bg-transparent font-bold text-gray-800 outline-none"
              />
              
              <button onClick={handleIncrement} disabled={quantity >= product.stock} className="w-9 h-9 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-30">
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <div className="h-11 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm font-medium border border-gray-200">
              Indisponível
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!hasStock}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
              hasStock
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={18} />
            {hasStock ? 'Comprar' : 'Sem Estoque'}
          </button>
        </div>
      </div>
    </div>
    
  );
}