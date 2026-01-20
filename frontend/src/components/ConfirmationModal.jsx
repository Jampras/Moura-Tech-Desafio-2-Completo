import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Tem certeza?", 
  message = "Essa ação não poderá ser desfeita.",
  confirmText = "Sim, confirmar",
  cancelText = "Cancelar",
  isDanger = false // Se for true, o botão fica vermelho (para exclusões)
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Fundo Escuro */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Caixa do Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        
        {/* Cabeçalho */}
        <div className={`p-6 flex items-center gap-4 border-b border-gray-100 ${isDanger ? 'bg-red-50' : 'bg-blue-50'}`}>
          <div className={`p-3 rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDanger ? 'text-red-900' : 'text-blue-900'}`}>
              {title}
            </h3>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 text-gray-600">
          <p>{message}</p>
        </div>

        {/* Rodapé com Botões */}
        <div className="p-4 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-bold hover:bg-gray-200 rounded-lg transition"
          >
            {cancelText}
          </button>
          
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2 text-white font-bold rounded-lg shadow-md transition transform active:scale-95 ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}