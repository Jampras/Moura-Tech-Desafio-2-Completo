import { useEffect, useState } from 'react';
import { CheckCircle, X, ShoppingCart, Info, AlertTriangle } from 'lucide-react';
import { useCartNotification } from '../context/CartNotificationContext';
import { useCartDrawer } from '../context/CartDrawerContext';

// ========== CONSTANTES (fora do componente para evitar recriação) ==========

/**
 * Configuração de estilos por tipo de notificação.
 * Definido fora do componente para evitar recriação a cada render.
 */
const TYPE_CONFIG = {
    success: {
        bgColor: 'bg-white',
        borderColor: 'border-l-4 border-l-green-500',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        Icon: CheckCircle,
    },
    error: {
        bgColor: 'bg-white',
        borderColor: 'border-l-4 border-l-red-500',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        Icon: AlertTriangle,
    },
    info: {
        bgColor: 'bg-white',
        borderColor: 'border-l-4 border-l-blue-500',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        Icon: Info,
    },
};

/**
 * Componente ToastNotification - Notificação flutuante do carrinho.
 * 
 * POSIÇÃO: Canto inferior esquerdo (para não interferir com o drawer à direita)
 * ANIMAÇÃO: Slide-up + fade-in
 * AUTO-DISMISS: 3 segundos (configurado no contexto)
 */
function ToastNotification() {
    const { notification, closeNotification } = useCartNotification();
    const { open: openDrawer } = useCartDrawer();
    const [isVisible, setIsVisible] = useState(false);

    /**
     * EFEITO: Controla animação de entrada/saída do toast.
     * GATILHO: notification.show (quando muda de true/false)
     * RISCO DE LOOP: Nenhum (deps controladas)
     */
    useEffect(() => {
        if (notification.show) {
            // Pequeno delay para trigger da animação CSS
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
        }
    }, [notification.show]);

    // Não renderiza se não deve mostrar
    if (!notification.show && !isVisible) return null;

    const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.success;
    const { Icon } = config;

    return (
        <div
            className={`fixed bottom-5 left-5 z-[9999] transition-all duration-300 ease-out ${isVisible && notification.show
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
        >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${config.bgColor} ${config.borderColor} min-w-[280px] max-w-sm`}>
                {/* Ícone */}
                <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                    {notification.productName && (
                        <p className="font-semibold text-gray-900 truncate text-sm">
                            {notification.productName}
                        </p>
                    )}
                    <p className="text-gray-600 text-sm">
                        {notification.message}
                    </p>
                </div>

                {/* Ação: Ver carrinho */}
                {notification.type === 'success' && (
                    <button
                        onClick={() => {
                            openDrawer();
                            closeNotification();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                    >
                        <ShoppingCart className="w-3 h-3" />
                        Ver
                    </button>
                )}

                {/* Botão fechar */}
                <button
                    onClick={closeNotification}
                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default ToastNotification;
