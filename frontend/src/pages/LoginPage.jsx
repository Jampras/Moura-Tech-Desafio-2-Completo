import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redireciona se já estiver logado
  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/' : '/simulacao');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Chama a API real de login
      const response = await axios.post('/auth/login', { username, password });
      login(response.data);
      navigate(response.data.role === 'ADMIN' ? '/' : '/simulacao');
    } catch (err) {
      alert('Usuário ou senha inválidos!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-moura-blue flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl w-full max-w-md border-b-[10px] border-moura-yellow animate-slide-up">
        <img src="https://logodownload.org/wp-content/uploads/2017/08/moura-logo.png" className="h-10 mx-auto mb-10" alt="Moura" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-300" size={20} />
            <input
              required placeholder="Usuário"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-moura-blue focus:ring-2 focus:ring-moura-yellow transition-all"
              value={username} onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-300" size={20} />
            <input
              required type="password" placeholder="Senha"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-moura-blue focus:ring-2 focus:ring-moura-yellow transition-all"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-5 bg-moura-yellow text-moura-blue font-moura font-black text-xl uppercase italic rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" /> : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}