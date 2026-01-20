import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute({ children, onlyAdmin = false }) {
  const { user } = useAuth();

  // Se ainda está carregando o usuário (opcional, evita "pulo" de tela)
  // if (loading) return <div>Carregando...</div>;

  // 1. Se não tem usuário logado, manda pro Login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 2. Se a rota exige Admin e o usuário NÃO é Admin, manda pra Home
  if (onlyAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  // 3. Se passou pelos guardas, mostra a página
  return children;
}