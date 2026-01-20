import { useState, useMemo, useEffect } from 'react';
import { Loader2, Package, Search, SearchX, Filter, Car, Bike, Truck, Anchor, Zap, LayoutGrid, BatteryCharging, Cpu } from 'lucide-react';
import ProductCard from './ProductCard';

// --- CONFIGURAÇÃO SINCRONIZADA COM O CADASTRO MOURA ---
const CATEGORIES = [
  { name: "Todos", icon: LayoutGrid },
  { name: "Automotiva (Carros)", icon: Car },
  { name: "Motos", icon: Bike },
  { name: "Pesados (Caminhões/Ônibus)", icon: Truck },
  { name: "Náutica / Boats", icon: Anchor },
  { name: "Estacionária / Solar / Nobreak", icon: Zap },
];

// REGRAS COMPLETAS (Mesmas do ProductForm)
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

function Sidebar({ filters, onFilterChange }) {
    const [visibleAmperages, setVisibleAmperages] = useState([]);
    const [visibleTechnologies, setVisibleTechnologies] = useState([]);

    useEffect(() => {
        if (filters.categoria && filters.categoria !== 'Todos') {
            // Se tem categoria selecionada, mostra só o específico
            setVisibleAmperages(AMPERAGE_RULES[filters.categoria] || []);
            setVisibleTechnologies(TECHNOLOGY_RULES[filters.categoria] || []);
        } else {
            // --- MODO "TODOS": MOSTRAR TUDO (ORDENADO) ---
            
            // 1. Pega todas as amperagens de todas as categorias
            const allAmps = Object.values(AMPERAGE_RULES).flat();
            // 2. Remove duplicadas usando Set
            const uniqueAmps = [...new Set(allAmps)];
            // 3. Ordena NUMERICAMENTE (importante para 100Ah vir depois de 90Ah)
            uniqueAmps.sort((a, b) => parseInt(a) - parseInt(b));
            setVisibleAmperages(uniqueAmps);

            // 1. Pega todas as tecnologias
            const allTechs = Object.values(TECHNOLOGY_RULES).flat();
            // 2. Remove duplicadas
            const uniqueTechs = [...new Set(allTechs)];
            // 3. Ordena Alfabeticamente
            uniqueTechs.sort();
            setVisibleTechnologies(uniqueTechs);
        }
    }, [filters.categoria]);

    return (
        <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-6">
                
                {/* 1. Busca */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4 border-l-blue-700">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Modelo
                    </h3>
                    <div className="relative">
                        <input
                            type="text"
                            value={filters.searchTerm}
                            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                            placeholder="Ex: M60GD..."
                            className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                {/* 2. Categorias */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-blue-900 mb-4">Aplicação</h3>
                    <ul className="space-y-2">
                        {CATEGORIES.map((cat) => (
                            <li key={cat.name}>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="categoria"
                                        checked={filters.categoria === cat.name}
                                        onChange={() => onFilterChange('resetTech', cat.name)}
                                        className="w-4 h-4 text-blue-700 focus:ring-yellow-400 border-gray-300"
                                    />
                                    <cat.icon size={18} className={filters.categoria === cat.name ? "text-yellow-500" : "text-gray-400"} />
                                    <span className={`text-sm transition-colors ${filters.categoria === cat.name ? 'text-blue-800 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                        {cat.name.split(' (')[0]}
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 3. Amperagem (Agora mostra TUDO em 'Todos') */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all animate-fade-in">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <BatteryCharging className="w-4 h-4 text-yellow-500" />
                        Amperagem
                    </h3>
                    {/* Max Height + Scroll para não ficar uma lista gigante na tela */}
                    <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin pr-2">
                        {visibleAmperages.map((amp) => (
                             <label key={amp} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={filters.amperagem.includes(amp)}
                                    onChange={(e) => {
                                        const newAmps = e.target.checked 
                                            ? [...filters.amperagem, amp]
                                            : filters.amperagem.filter(a => a !== amp);
                                        onFilterChange('amperagem', newAmps);
                                    }}
                                    className="w-4 h-4 text-blue-700 focus:ring-yellow-400 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-blue-800">{amp}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 4. Tecnologia */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-yellow-500" />
                        Tecnologia
                    </h3>
                    <div className="space-y-2">
                        {visibleTechnologies.map((tech) => (
                             <label key={tech} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={filters.tecnologia.includes(tech)}
                                    onChange={(e) => {
                                        const newTechs = e.target.checked 
                                            ? [...filters.tecnologia, tech]
                                            : filters.tecnologia.filter(t => t !== tech);
                                        onFilterChange('tecnologia', newTechs);
                                    }}
                                    className="w-4 h-4 text-blue-700 focus:ring-yellow-400 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-600">{tech.split(' (')[0]}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => onFilterChange('reset', null)}
                    className="w-full py-2.5 text-sm font-bold text-blue-900 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-colors shadow-md"
                >
                    Limpar Filtros
                </button>
            </div>
        </aside>
    );
}

function ProductList({ products, loading, error, onRetry }) {
    const [filters, setFilters] = useState({
        searchTerm: '',
        categoria: 'Todos',
        amperagem: [],
        tecnologia: [],
    });

    const handleFilterChange = (field, value) => {
        if (field === 'reset') {
            setFilters({ searchTerm: '', categoria: 'Todos', amperagem: [], tecnologia: [] });
        } else if (field === 'resetTech') {
            setFilters({ ...filters, categoria: value, amperagem: [], tecnologia: [] });
        } else {
            setFilters(prev => ({ ...prev, [field]: value }));
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const nameLower = product.name.toLowerCase();
            const searchLower = filters.searchTerm.toLowerCase();
            
            const categoryMatch = filters.categoria === 'Todos' ? true : product.category === filters.categoria;
            const searchMatch = nameLower.includes(searchLower);

            // Filtro de Amperagem (Procura "60Ah" ou "60" no nome)
            const ampMatch = filters.amperagem.length === 0 
                ? true 
                : filters.amperagem.some(amp => {
                    const cleanAmp = amp.toLowerCase();
                    const numberOnly = amp.replace('Ah', '').trim();
                    // Verifica se tem "60Ah" OU " 60 " (espaçado) para evitar falsos positivos
                    return nameLower.includes(cleanAmp) || nameLower.includes(` ${numberOnly} `) || nameLower.includes(`-${numberOnly}`);
                });

            // Filtro de Tecnologia
            const techMatch = filters.tecnologia.length === 0 
                ? true 
                : filters.tecnologia.some(tech => {
                    const core = tech.split(' ')[0].toLowerCase(); // Pega "AGM" de "AGM (Premium)"
                    return nameLower.includes(core);
                });

            return categoryMatch && searchMatch && ampMatch && techMatch;
        });
    }, [products, filters]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-yellow-500 w-10 h-10"/></div>;

    if (products.length === 0) return (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
            <h3 className="font-bold text-blue-900">Estoque Vazio</h3>
            <p className="text-gray-500">Cadastre produtos no painel administrativo.</p>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <Sidebar filters={filters} onFilterChange={handleFilterChange} />
            <div className="flex-1">
                <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-blue-900">
                            {filters.categoria === 'Todos' ? 'Catálogo Completo' : filters.categoria}
                        </h2>
                        <p className="text-sm text-blue-600 font-medium">
                            {filteredProducts.length} produtos encontrados
                        </p>
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
                        <h3 className="font-bold text-gray-800">Nenhum resultado</h3>
                        <p className="text-gray-500 mb-4">Tente ajustar os filtros.</p>
                        <button onClick={() => handleFilterChange('reset')} className="text-blue-600 font-bold hover:underline">Limpar tudo</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductList;