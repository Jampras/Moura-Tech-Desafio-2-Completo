import { useEffect, useState, useMemo } from 'react';
import api from '../services/api'; 
import { Trash2, Plus, Package, Pencil, Search, Car, Bike, Truck, Anchor, Zap, Tag, Filter, X, Eraser } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatMoney } from '../utils/formatters';

// --- CONFIGURAÇÃO SINCRONIZADA ---
const CATEGORIES = [
  "Automotiva (Carros)",
  "Motos",
  "Pesados (Caminhões/Ônibus)",
  "Náutica / Boats",
  "Estacionária / Solar / Nobreak"
];

const AMPERAGE_RULES = {
    "Motos": ["3Ah", "4Ah", "5Ah", "6Ah", "7Ah", "8Ah", "9Ah", "10Ah", "11Ah", "12Ah", "14Ah", "18Ah", "30Ah"],
    "Automotiva (Carros)": ["40Ah", "45Ah", "48Ah", "50Ah", "60Ah", "70Ah", "72Ah", "75Ah", "78Ah", "80Ah", "90Ah", "95Ah"],
    "Pesados (Caminhões/Ônibus)": ["100Ah", "105Ah", "110Ah", "135Ah", "150Ah", "170Ah", "180Ah", "200Ah", "220Ah", "225Ah"],
    "Náutica / Boats": ["40Ah", "55Ah", "60Ah", "70Ah", "90Ah", "100Ah", "105Ah", "150Ah", "220Ah"],
    "Estacionária / Solar / Nobreak": ["7Ah", "9Ah", "12Ah", "18Ah", "26Ah", "30Ah", "40Ah", "45Ah", "50Ah", "60Ah", "63Ah", "70Ah", "80Ah", "90Ah", "100Ah", "105Ah", "150Ah", "220Ah"]
};

const TECHNOLOGY_RULES = {
    "Motos": ["Ventilada", "AGM/VRLA"],
    "Automotiva (Carros)": ["Convencional", "EFB", "AGM"],
    "Pesados (Caminhões/Ônibus)": ["Convencional", "EFB"],
    "Náutica / Boats": ["Dual Purpose", "AGM"],
    "Estacionária / Solar / Nobreak": ["VRLA", "Ventilada", "AGM"]
};

const getCategoryStyle = (catName) => {
    if (!catName) return { icon: Tag, label: 'Sem Categoria', style: 'bg-gray-100 text-gray-600 border-gray-200' };
    if (catName.includes("Carros")) return { icon: Car, label: 'Automotiva', style: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (catName.includes("Motos")) return { icon: Bike, label: 'Moto', style: 'bg-orange-100 text-orange-700 border-orange-200' };
    if (catName.includes("Pesados")) return { icon: Truck, label: 'Pesados', style: 'bg-slate-100 text-slate-700 border-slate-200' };
    if (catName.includes("Boats")) return { icon: Anchor, label: 'Náutica', style: 'bg-cyan-100 text-cyan-700 border-cyan-200' };
    if (catName.includes("Solar") || catName.includes("Estacionária")) return { icon: Zap, label: 'Estacionária', style: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { icon: Tag, label: catName, style: 'bg-gray-100 text-gray-600 border-gray-200' };
};

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    category: 'Todos',
    amperage: '',
    technology: ''
  });

  const [availableAmperages, setAvailableAmperages] = useState([]);
  const [availableTechnologies, setAvailableTechnologies] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (filters.category && filters.category !== 'Todos') {
        setAvailableAmperages(AMPERAGE_RULES[filters.category] || []);
        setAvailableTechnologies(TECHNOLOGY_RULES[filters.category] || []);
        
        if (filters.amperage && !AMPERAGE_RULES[filters.category]?.includes(filters.amperage)) {
            setFilters(prev => ({ ...prev, amperage: '' }));
        }
        if (filters.technology && !TECHNOLOGY_RULES[filters.category].some(t => t.includes(filters.technology))) {
             setFilters(prev => ({ ...prev, technology: '' }));
        }
    } else {
        const allAmps = [...new Set(Object.values(AMPERAGE_RULES).flat())].sort((a, b) => parseInt(a) - parseInt(b));
        setAvailableAmperages(allAmps);
        const allTechs = [...new Set(Object.values(TECHNOLOGY_RULES).flat())].sort();
        setAvailableTechnologies(allTechs);
    }
  }, [filters.category]);

  async function loadProducts() {
    try {
      const response = await api.get('/products');
      const data = response.data.content || response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar:", error);
      setProducts([]);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
        const nameLower = product.name.toLowerCase();
        const searchLower = filters.search.toLowerCase();

        const matchesSearch = nameLower.includes(searchLower) || product.id.toString().includes(searchLower);
        const matchesCategory = filters.category === 'Todos' ? true : product.category === filters.category;
        
        const matchesAmp = !filters.amperage ? true : (
            nameLower.includes(filters.amperage.toLowerCase()) || 
            nameLower.includes(` ${filters.amperage.replace('Ah', '')} `)
        );

        const matchesTech = !filters.technology ? true : (
            nameLower.includes(filters.technology.split(' ')[0].toLowerCase())
        );

        return matchesSearch && matchesCategory && matchesAmp && matchesTech;
    });
  }, [products, filters]);

  const clearFilters = () => setFilters({ search: '', category: 'Todos', amperage: '', technology: '' });

  function confirmDelete(product) {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete.id}`);
      loadProducts();
      setProductToDelete(null);
    } catch (error) {
       // Tratamento de erro
    }
  }

  // Verifica se tem algum filtro ativo para mostrar o botão
  const hasActiveFilters = filters.search || filters.category !== 'Todos' || filters.amperage || filters.technology;

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
          <p className="text-gray-500">Gestão de Estoque Moura</p>
        </div>
        
        <button 
          onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
          className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition border-b-4 border-yellow-400 active:border-b-0 active:translate-y-1"
        >
          <Plus size={20} className="text-yellow-400" />
          Nova Bateria
        </button>
      </div>

      {/* --- BARRA DE FILTROS AVANÇADA --- */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
        
        {/* Cabeçalho do Filtro com o Botão Bonitão */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-lg">
                <Filter size={20} />
                <h2>Filtros de Estoque</h2>
            </div>

            {hasActiveFilters && (
                <button 
                    onClick={clearFilters} 
                    className="group flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-full transition-all duration-300 shadow-sm hover:shadow-md border border-red-100 font-bold text-sm"
                >
                    <Eraser size={16} className="transition-transform group-hover:-rotate-12"/> 
                    Limpar Filtros
                </button>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 1. Busca Livre */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                    placeholder="Buscar por nome ou ID..." 
                    value={filters.search}
                    onChange={e => setFilters(prev => ({...prev, search: e.target.value}))}
                    className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm"
                />
            </div>

            {/* 2. Categoria */}
            <select 
                value={filters.category}
                onChange={e => setFilters(prev => ({...prev, category: e.target.value}))}
                className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 cursor-pointer shadow-sm"
            >
                <option value="Todos">Todas as Categorias</option>
                {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            {/* 3. Amperagem */}
            <select 
                value={filters.amperage}
                onChange={e => setFilters(prev => ({...prev, amperage: e.target.value}))}
                className={`p-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 cursor-pointer shadow-sm transition ${
                    !filters.amperage ? 'bg-gray-50 text-gray-500' : 'bg-blue-50 text-blue-700 font-bold border-blue-200'
                }`}
            >
                <option value="">Amperagem (Todas)</option>
                {availableAmperages.map(amp => (
                    <option key={amp} value={amp}>{amp}</option>
                ))}
            </select>

            {/* 4. Tecnologia */}
            <select 
                value={filters.technology}
                onChange={e => setFilters(prev => ({...prev, technology: e.target.value}))}
                className={`p-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 cursor-pointer shadow-sm transition ${
                    !filters.technology ? 'bg-gray-50 text-gray-500' : 'bg-blue-50 text-blue-700 font-bold border-blue-200'
                }`}
            >
                <option value="">Tecnologia (Todas)</option>
                {availableTechnologies.map(tech => (
                    <option key={tech} value={tech}>{tech.split(' (')[0]}</option>
                ))}
            </select>
        </div>
      </div>

      {/* --- TABELA DE PRODUTOS --- */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                <tr>
                    <th className="p-4 pl-6">Produto</th>
                    <th className="p-4">Aplicação</th>
                    <th className="p-4">Preço</th>
                    <th className="p-4">Estoque</th>
                    <th className="p-4 text-center">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="p-12 text-center text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                                <Search size={40} className="opacity-20"/>
                                <p>Nenhum produto encontrado com esses filtros.</p>
                                <button onClick={clearFilters} className="text-blue-600 font-bold hover:underline">Limpar busca</button>
                            </div>
                        </td>
                    </tr>
                ) : filteredProducts.map((product) => {
                    const catStyle = getCategoryStyle(product.category);
                    return (
                        <tr key={product.id} className="hover:bg-blue-50/40 transition group">
                            <td className="p-4 pl-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                      {product.image ? (
                                        <img src={product.image} className="w-full h-full object-contain p-1"/>
                                      ) : (
                                        <Package className="text-gray-300"/>
                                      )}
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-800 block line-clamp-1">{product.name}</span>
                                        <span className="text-xs text-gray-400 font-mono">ID: {product.id}</span>
                                    </div>
                                </div>
                            </td>

                            <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${catStyle.style}`}>
                                    <catStyle.icon size={14} strokeWidth={2.5} />
                                    {catStyle.label}
                                </span>
                            </td>
                            
                            <td className="p-4 text-gray-700 font-bold whitespace-nowrap">
                                {formatMoney(product.price)}
                            </td>
                            
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${
                                        (product.stock || 0) < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                                    }`}></div>
                                    <span className={`text-sm font-bold ${
                                        (product.stock || 0) < 5 ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                        {product.stock || 0} un.
                                    </span>
                                </div>
                            </td>

                            <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}
                                        className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition"
                                        title="Editar"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    <button 
                                        onClick={() => confirmDelete(product)}
                                        className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            </table>
        </div>
      </div>

      {isFormOpen && (
        <ProductForm 
          product={editingProduct}
          onCancel={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); loadProducts(); }} 
        />
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Remover Bateria"
        message={`Tem certeza que deseja excluir "${productToDelete?.name}" do catálogo?`}
        confirmText="Sim, Excluir"
        isDanger={true}
      />
    </div>
  );
}