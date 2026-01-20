import { useLocation, useNavigate } from 'react-router-dom';
import { formatMoney } from '../utils/formatters';
import { Printer, ArrowLeft, CheckCircle, Battery, Download } from 'lucide-react';
import { useEffect } from 'react';

export default function ReceiptPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Recupera os dados enviados pelo Carrinho
    const { items, total } = location.state || { items: [], total: 0 };
    const date = new Date().toLocaleDateString('pt-BR');
    const time = new Date().toLocaleTimeString('pt-BR');
    // Gera um número aleatório fixo para o "documento"
    const randomOrderNumber = Math.floor(100000 + Math.random() * 900000);

    // Se tentar acessar a pagina direto sem itens, volta pra simulação
    useEffect(() => {
        if (!items || items.length === 0) {
            navigate('/simulacao');
        }
    }, [items, navigate]);

    if (!items || items.length === 0) return null;

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center">
            
            {/* Header de Ação (Some na hora de imprimir/salvar PDF) */}
            <div className="w-full max-w-3xl flex justify-between items-center mb-6 print:hidden">
                <button 
                    onClick={() => navigate('/simulacao')}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-900 font-bold transition"
                >
                    <ArrowLeft size={20}/> Voltar para Venda
                </button>
                <button 
                    onClick={() => window.print()}
                    className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 shadow-lg border-b-4 border-blue-950 active:border-b-0 active:translate-y-1 transition-all"
                >
                    <Download size={20}/> Salvar PDF / Imprimir
                </button>
            </div>

            {/* O RECIBO (Folha A4) */}
            {/* A classe 'print:print-color-adjust-exact' força as cores a saírem no PDF */}
            <div className="bg-white w-full max-w-3xl p-10 md:p-14 shadow-2xl rounded-sm print:shadow-none print:w-full print:p-0 print:m-0 print:print-color-adjust-exact">
                
                {/* Cabeçalho do Recibo */}
                <div className="border-b-2 border-gray-100 pb-8 mb-8 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 text-blue-900 mb-2">
                            <div className="bg-yellow-400 p-1.5 rounded text-blue-900">
                                <Battery size={28} fill="currentColor" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter">MOURA</h1>
                        </div>
                        <p className="text-gray-500 text-sm font-medium pl-1">Revendedor Autorizado</p>
                        <p className="text-gray-400 text-xs mt-1 pl-1">CNPJ: 12.345.678/0001-90</p>
                    </div>
                    <div className="text-right">
                        <div className="inline-block bg-gray-100 px-3 py-1 rounded text-gray-600 font-bold text-xs uppercase tracking-widest mb-2">
                            Orçamento
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">#{randomOrderNumber}</h2>
                        <div className="mt-2 text-sm text-gray-500">
                            <p>{date}</p>
                            <p>{time}</p>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-green-700 uppercase mb-0.5">Status do Documento</p>
                        <p className="text-green-900 font-medium text-sm">Orçamento Válido</p>
                    </div>
                    <CheckCircle size={24} className="text-green-600" />
                </div>

                {/* Tabela de Itens */}
                <table className="w-full text-left mb-10">
                    <thead>
                        <tr className="border-b-2 border-gray-100 text-gray-400 text-[10px] uppercase tracking-wider">
                            <th className="py-3 font-bold w-1/2">Descrição do Produto</th>
                            <th className="py-3 font-bold text-center">Qtd.</th>
                            <th className="py-3 font-bold text-right">Valor Unit.</th>
                            <th className="py-3 font-bold text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td className="py-4 pr-4">
                                    <span className="font-bold text-blue-900 block text-base">{item.name}</span>
                                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold uppercase">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="py-4 text-center font-bold text-gray-600">{item.quantity}</td>
                                <td className="py-4 text-right text-gray-600">{formatMoney(item.price)}</td>
                                <td className="py-4 text-right font-bold text-gray-900 text-base">
                                    {formatMoney(item.price * item.quantity)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totais */}
                <div className="flex justify-end">
                    <div className="w-72 bg-blue-50 p-6 rounded-xl space-y-3 print:bg-gray-50">
                        <div className="flex justify-between text-blue-800/70 text-sm">
                            <span>Subtotal</span>
                            <span>{formatMoney(total)}</span>
                        </div>
                        <div className="flex justify-between text-blue-800/70 text-sm">
                            <span>Descontos</span>
                            <span>R$ 0,00</span>
                        </div>
                        <div className="h-px bg-blue-200 my-2"></div>
                        <div className="flex justify-between text-2xl font-black text-blue-900">
                            <span>TOTAL</span>
                            <span>{formatMoney(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Rodapé do Recibo */}
                <div className="mt-16 pt-8 border-t border-gray-200 text-center">
                    <p className="text-gray-400 text-xs mb-2">
                        Este documento é apenas uma simulação de venda para fins de conferência.
                    </p>
                    <p className="text-blue-900 font-bold text-sm flex items-center justify-center gap-2">
                        <Battery size={16} className="text-yellow-500"/> Energia que move o futuro.
                    </p>
                </div>

            </div>
        </div>
    );
}