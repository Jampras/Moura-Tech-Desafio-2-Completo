import { ShoppingCart, User, LogOut, Sun, Moon, LayoutDashboard, Calculator } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

export default function Header({ onCartClick }) {
    const { items } = useCart();
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const safeItems = items || [];
    const cartCount = safeItems.reduce((acc, item) => acc + item.quantity, 0);
    const isSimulationMode = location.pathname === '/simulacao';

    // Saudação baseada na hora
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return { text: 'Bom dia', icon: Sun };
        if (hour >= 12 && hour < 18) return { text: 'Boa tarde', icon: Sun };
        return { text: 'Boa noite', icon: Moon };
    }, []);

    // Nome do usuário para exibição
    const displayName = user?.name || 'Visitante';
    const isAdmin = user?.role === 'ADMIN';

    // Função de logout com redirecionamento
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 bg-moura-blue text-white shadow-xl border-b-[6px] border-moura-yellow">
            <div className="container mx-auto px-4 h-24 flex items-center justify-between">
                <Link to="/" className="flex flex-col group shrink-0">
                    <div className="flex items-center gap-3 group-hover:scale-105 transition-transform duration-300">
                        <img
                            src="https://logodownload.org/wp-content/uploads/2017/08/moura-logo.png"
                            alt="Moura"
                            className="h-14 w-auto object-contain"
                        />
                    </div>
                    <span className="text-[16px] font-moura text-moura-yellow tracking-[0.2em] uppercase pl-1 mt-1 opacity-90">
                        Revenda Oficial
                    </span>
                </Link>

                <nav className="hidden lg:flex items-center bg-black/20 p-1.5 rounded-full backdrop-blur-sm">
                    <Link
                        to="/"
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${location.pathname === '/'
                                ? 'bg-moura-yellow text-moura-blue shadow-md'
                                : 'text-blue-100 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <LayoutDashboard size={16} /> Estoque
                    </Link>

                    <Link
                        to="/simulacao"
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${location.pathname === '/simulacao'
                                ? 'bg-moura-yellow text-moura-blue shadow-md'
                                : 'text-blue-100 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <Calculator size={16} /> Simular Venda
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    {isSimulationMode && (
                        <button
                            onClick={onCartClick}
                            className="relative p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition border border-white/10"
                        >
                            <ShoppingCart size={22} className="text-moura-yellow" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-moura-blue animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    )}

                    <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10 ml-2">
                        <div className="text-right">
                            <p className="text-[10px] text-blue-200 uppercase font-bold flex items-center justify-end gap-1 leading-tight">
                                <greeting.icon size={10} /> {greeting.text}
                            </p>
                            <p className="font-moura text-white text-lg leading-none">
                                Olá, {displayName}!
                                {isAdmin && <span className="text-moura-yellow text-xs ml-1">(Admin)</span>}
                            </p>
                        </div>
                        <div className="w-11 h-11 bg-moura-yellow rounded-full flex items-center justify-center text-moura-blue shadow-md border-2 border-moura-blue">
                            <User size={22} strokeWidth={3} />
                        </div>
                        {/* Botão de Logout - Agora funcional! */}
                        <button
                            onClick={handleLogout}
                            className="text-blue-300 hover:text-red-400 transition p-2 hover:bg-white/10 rounded-lg"
                            title="Sair do sistema"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}