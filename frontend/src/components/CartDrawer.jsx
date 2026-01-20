import { useState } from 'react';
import { X, Trash2, FileText, ArrowRight, Eraser, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  if (!isOpen) return null;

  const handleGenerateReceipt = () => {
    onClose();
    navigate('/recibo', { state: { items, total } });
  };

  const handleDecrease = (item) => {
    if (item.quantity === 1) {
        removeFromCart(item.id);
    } else {
        updateQuantity(item.id, item.quantity - 1);
    }
  };

  const confirmClearCart = () => {
      clearCart();
      setIsConfirmingClear(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Cabeçalho */}
        <div className="p-5 bg-moura-blue text-white flex justify-between items-center shadow-md border-b-4 border-moura-yellow shrink-0">
            <div>
                <h2 className="text-xl font-moura italic font-black flex items-center gap-2">
                    <FileText className="text-moura-yellow"/> SIMULAÇÃO
                </h2>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Itens: {items.length}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-blue-800 rounded-lg text-blue-100 transition">
                <X size={24} />
            </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <FileText size={64} className="opacity-20" />
                <p className="font-medium font-moura">Carrinho vazio</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 animate-fade-in hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                    {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    ) : (
                        <FileText className="text-gray-200"/>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-moura font-black text-moura-blue text-sm leading-tight uppercase line-clamp-1">{item.name}</h3>
                    
                    {/* EXIBIÇÃO DO TIPO ESPECÍFICO (CATEGORIA) */}
                    <div className="mt-1">
                        <span className="text-[9px] font-moura font-black bg-blue-50 text-moura-blue px-2 py-0.5 rounded uppercase border border-blue-100 inline-block italic">
                            {item.category || 'Não especificado'}
                        </span>
                    </div>

                    <p className="text-gray-500 font-bold text-xs mt-1">{formatMoney(item.price)}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                            <button 
                                onClick={() => handleDecrease(item)}
                                className={`w-6 h-6 rounded flex items-center justify-center font-bold transition ${
                                    item.quantity === 1 ? 'text-red-500' : 'text-gray-500'
                                }`}
                            >
                                {item.quantity === 1 ? <Trash2 size={12}/> : '-'}
                            </button>
                            <span className="text-xs font-moura font-black text-moura-blue w-6 text-center">{item.quantity}</span>
                            <button 
                                 onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                 className="w-6 h-6 rounded text-moura-blue flex items-center justify-center font-bold"
                            >+</button>
                        </div>
                    </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 self-start p-1 transition-colors">
                    <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        {items.length > 0 && (
            <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                {!isConfirmingClear ? (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest font-moura">Total Simulado</span>
                            <span className="text-2xl font-black text-moura-blue font-moura italic uppercase">{formatMoney(total)}</span>
                        </div>
                        
                        <button 
                            onClick={handleGenerateReceipt}
                            className="w-full py-4 bg-moura-yellow hover:bg-yellow-400 text-moura-blue font-moura font-black text-lg rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 mb-3 italic uppercase"
                        >
                            Gerar Recibo <ArrowRight size={20} />
                        </button>

                        <button 
                            onClick={() => setIsConfirmingClear(true)}
                            className="w-full py-2 text-gray-400 hover:text-red-500 font-bold text-[11px] uppercase tracking-tighter transition flex items-center justify-center gap-2 font-moura"
                        >
                            <Eraser size={14} /> Esvaziar Carrinho
                        </button>
                    </div>
                ) : (
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-slide-up">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertTriangle size={20} />
                            <p className="text-xs font-bold font-moura">Deseja remover todos os itens?</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsConfirmingClear(false)} className="flex-1 py-2 bg-white text-gray-600 font-bold rounded-lg border border-gray-200 text-xs">Voltar</button>
                            <button onClick={confirmClearCart} className="flex-1 py-2 bg-red-500 text-white font-bold rounded-lg text-xs shadow-md">Limpar</button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}