import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatMoney } from '../utils/formatters';
import { CreditCard, QrCode, Receipt, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isFinished, setIsFinished] = useState(false);

  const handleFinish = async (e) => {
    e.preventDefault();
    
    // Objeto para o seu futuro OrderController no Java
    const orderData = {
      user_id: user.id,
      total: total,
      status: 'CONFIRMED',
      payment_method: paymentMethod,
      items: items.map(i => ({
        product_id: i.id,
        quantity: i.quantity,
        unit_price: i.price,
        subtotal: i.price * i.quantity
      }))
    };

    console.log("Enviando para o Banco Java:", orderData);
    // Aqui você faria: await fetch('.../api/orders', { method: 'POST', body: JSON.stringify(orderData) });
    
    setIsFinished(true);
    clearCart();
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md animate-fade-in">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="font-moura text-2xl font-black text-moura-blue italic uppercase mb-4">Compra Realizada!</h2>
          <button onClick={() => navigate('/minhas-compras')} className="w-full py-4 bg-moura-blue text-white font-moura font-black rounded-xl uppercase italic">Ver minhas compras</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="font-moura font-black text-moura-blue uppercase mb-6 italic">Dados de Pagamento</h2>
          <form onSubmit={handleFinish} className="space-y-4">
            <input required placeholder="Nome no Cartão" className="w-full p-3 bg-gray-50 border rounded-xl outline-none" />
            <input required placeholder="Número do Cartão" className="w-full p-3 bg-gray-50 border rounded-xl outline-none" />
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Validade" className="w-full p-3 bg-gray-50 border rounded-xl outline-none" />
              <input required placeholder="CVV" className="w-full p-3 bg-gray-50 border rounded-xl outline-none" />
            </div>
            <button type="submit" className="w-full py-4 bg-moura-yellow text-moura-blue font-moura font-black rounded-xl uppercase italic text-lg shadow-lg">Finalizar e Pagar</button>
          </form>
        </div>

        <div className="bg-moura-blue p-6 rounded-2xl shadow-lg text-white">
          <h2 className="font-moura font-black text-moura-yellow uppercase mb-4 italic">Resumo</h2>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm border-b border-white/10 pb-2">
                <span>{item.quantity}x {item.name}</span>
                <span>{formatMoney(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xl font-black font-moura italic uppercase">
            <span>Total:</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}