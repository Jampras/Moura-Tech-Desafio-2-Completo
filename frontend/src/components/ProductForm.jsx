import { useState, useRef, useEffect } from 'react';
import { useToast } from './Toast';
import ProductService from '../services/ProductService';
import { X, Save, AlertCircle, Upload, Image as ImageIcon, Tag, Battery, Zap, Gauge, Cpu } from 'lucide-react';

// --- CATEGORIAS OFICIAIS MOURA ---
const CATEGORIES = [
    "Automotiva (Carros)",
    "Motos",
    "Pesados (Caminhões/Ônibus)",
    "Náutica / Boats",
    "Estacionária / Solar / Nobreak"
];

// --- MAPAS DE REGRAS DE NEGÓCIO (CORRIGIDO PELO CATÁLOGO) ---

const AMPERAGE_RULES = {
    "Motos": [
        // Do catálogo Moura Moto: 3Ah até 30Ah
        "3Ah", "4Ah", "5Ah", "6Ah", "7Ah", "8Ah", "9Ah", "10Ah", "11Ah", "12Ah", "14Ah", "18Ah", "30Ah"
    ],
    "Automotiva (Carros)": [
        // Linha Leve (M40 a M90) + Pickups
        "40Ah", "45Ah", "48Ah", "50Ah", "60Ah", "70Ah", "72Ah", "75Ah", "78Ah", "80Ah", "90Ah", "95Ah"
    ],
    "Pesados (Caminhões/Ônibus)": [
        // Linha Pesada e Log Diesel
        "100Ah", "105Ah", "110Ah", "135Ah", "150Ah", "170Ah", "180Ah", "200Ah", "220Ah", "225Ah"
    ],
    "Náutica / Boats": [
        // Linha Moura Boat
        "40Ah", "55Ah", "60Ah", "70Ah", "90Ah", "100Ah", "105Ah", "150Ah", "220Ah"
    ],
    "Estacionária / Solar / Nobreak": [
        // Linha VRLA (Pequenas) + Linha Nobreak/Clean (Grandes)
        "7Ah", "9Ah", "12Ah", "18Ah", "26Ah", "30Ah", "40Ah", "45Ah", "50Ah", "60Ah", "63Ah", "70Ah", "80Ah", "90Ah", "100Ah", "105Ah", "150Ah", "220Ah"
    ]
};

const TECHNOLOGY_RULES = {
    "Motos": [
        "Ventilada (Com manutenção)",
        "AGM/VRLA (Selada)"
    ],
    "Automotiva (Carros)": [
        "Convencional (Flooded)",
        "EFB (Start-Stop)",
        "AGM (Premium)"
    ],
    "Pesados (Caminhões/Ônibus)": [
        "Convencional (Flooded)",
        "EFB (Start-Stop Heavy)" // Nova linha para caminhões modernos
    ],
    "Náutica / Boats": [
        "Dual Purpose (Partida+Serviço)",
        "AGM (Premium)"
    ],
    "Estacionária / Solar / Nobreak": [
        "VRLA (Nobreak Pequeno)",
        "Ventilada (Clean/Solar)",
        "AGM (Telecom)"
    ]
};

export default function ProductForm({ product = null, onSuccess, onCancel }) {
    const toast = useToast();
    const fileInputRef = useRef(null);
    const isEditing = !!product;

    const [formData, setFormData] = useState({
        model: isEditing ? product.name.split(' - ')[0] : '',
        price: product?.price?.toString() || '',
        stock: product?.stock?.toString() || '',
        category: product?.category || '',
        image: product?.image || '',
        amperage: '',
        technology: ''
    });

    const [availableAmperages, setAvailableAmperages] = useState([]);
    const [availableTechnologies, setAvailableTechnologies] = useState([]);

    // Efeito 1: Carregar dados ao editar
    useEffect(() => {
        if (isEditing && product.name) {
            const name = product.name;

            // Lógica mais robusta para achar a amperagem exata
            let foundAmp = '';
            // Ordenamos do maior para o menor para evitar que "100Ah" seja confundido com "10Ah"
            const allAmps = Object.values(AMPERAGE_RULES).flat().sort((a, b) => b.length - a.length);

            for (const amp of allAmps) {
                if (name.includes(` ${amp}`) || name.includes(`-${amp}`) || name.includes(` ${amp.replace('Ah', '')} `)) {
                    foundAmp = amp;
                    break;
                }
            }

            let foundTech = '';
            const allTechs = Object.values(TECHNOLOGY_RULES).flat();
            for (const tech of allTechs) {
                // Tenta casar a primeira palavra chave (Ex: "VRLA")
                const core = tech.split(' ')[0];
                if (name.includes(core)) {
                    foundTech = tech;
                    break;
                }
            }

            setFormData(prev => ({
                ...prev,
                amperage: foundAmp,
                technology: foundTech
            }));
        }
    }, [isEditing, product]);

    // Efeito 2: Atualização Dinâmica das Listas
    useEffect(() => {
        if (formData.category) {
            const ampRules = AMPERAGE_RULES[formData.category] || [];
            const techRules = TECHNOLOGY_RULES[formData.category] || [];

            setAvailableAmperages(ampRules);
            setAvailableTechnologies(techRules);

            // Reseta se a seleção atual for inválida na nova categoria
            if (formData.amperage && !ampRules.includes(formData.amperage)) {
                setFormData(prev => ({ ...prev, amperage: '' }));
            }
            if (formData.technology && !techRules.includes(formData.technology)) {
                setFormData(prev => ({ ...prev, technology: '' }));
            }
        } else {
            setAvailableAmperages([]);
            setAvailableTechnologies([]);
        }
    }, [formData.category]);

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [preview, setPreview] = useState(product?.image || null);

    // --- Compressão de Imagem (Otimizada) ---
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500;
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                    const height = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
            };
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) return toast.error("Imagem máx 5MB.");
            try {
                const compressedBase64 = await compressImage(file);
                setPreview(compressedBase64);
                setFormData(prev => ({ ...prev, image: compressedBase64 }));
                setErrors(prev => ({ ...prev, image: null }));
            } catch (error) {
                toast.error("Erro na imagem.");
            }
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.model.trim()) newErrors.model = 'Informe o modelo comercial.';
        if (!formData.category) newErrors.category = 'Selecione a aplicação.';
        if (!formData.amperage) newErrors.amperage = 'Selecione a amperagem.';
        if (!formData.technology) newErrors.technology = 'Selecione a tecnologia.';
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Preço inválido.';
        if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Estoque inválido.';
        // Imagem agora é OPCIONAL - removida validação obrigatória

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.warning("Preencha todos os dados técnicos.");
            return;
        }

        setSubmitting(true);

        try {
            // NOME PADRÃO OFICIAL: "Moura M60GD - 60Ah EFB"
            // Pega apenas a sigla da tecnologia para o nome não ficar gigante
            const techAcronym = formData.technology.split(' ')[0];
            const fullName = `${formData.model} - ${formData.amperage} ${techAcronym}`;

            const productData = {
                name: fullName,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10),
                category: formData.category,
                image: formData.image
            };

            if (isEditing) {
                await ProductService.updateProduct(product.id, productData);
                toast.success('Produto atualizado!');
            } else {
                await ProductService.createProduct(productData);
                toast.success('Bateria cadastrada!');
            }

            if (onSuccess) onSuccess();

        } catch (err) {
            console.error(err);
            toast.error('Erro ao salvar.');
        } finally {
            setSubmitting(false);
        }
    };

    const FieldError = ({ msg }) => msg ? <p className="text-xs text-red-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} /> {msg}</p> : null;

    return (
        <div className="fixed inset-0 bg-blue-900/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border-2 border-yellow-400">

                {/* Header */}
                <div className="bg-blue-800 p-4 flex justify-between items-center text-white shrink-0 shadow-md">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <Battery size={20} className="text-yellow-400" />
                        {isEditing ? 'Editar Ficha Técnica' : 'Cadastro Técnico Moura'}
                    </h2>
                    <button onClick={onCancel} className="hover:bg-blue-700 p-1.5 rounded-lg transition text-blue-100 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 scrollbar-thin">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* COLUNA 1: FOTO */}
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-blue-900 mb-2">Foto do Produto</label>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className={`w-full aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition overflow-hidden bg-gray-50 hover:bg-blue-50 relative group ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                                        }`}
                                >
                                    {preview ? (
                                        <>
                                            <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                                            <div className="absolute inset-0 bg-blue-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="text-yellow-400 mb-2" size={24} />
                                                <span className="text-white font-bold text-xs">Alterar</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400 p-2">
                                            <ImageIcon className="mx-auto mb-2 w-8 h-8 text-gray-300" />
                                            <span className="text-xs font-medium">Clique para enviar</span>
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                <FieldError msg={errors.image} />
                            </div>

                            {/* COLUNA 2 e 3: DADOS */}
                            <div className="md:col-span-2 space-y-4">
                                {/* Modelo e Aplicação */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-blue-900 mb-1">Modelo Comercial</label>
                                        <input
                                            value={formData.model}
                                            onChange={e => setFormData({ ...formData, model: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder-gray-400"
                                            placeholder="Ex: Moura M60GD"
                                        />
                                        <FieldError msg={errors.model} />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-blue-900 mb-1">Aplicação</label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                                            <select
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full pl-10 p-3 border border-gray-300 rounded-lg outline-none appearance-none bg-white cursor-pointer focus:border-blue-500"
                                            >
                                                <option value="">Selecione primeiro...</option>
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                        <FieldError msg={errors.category} />
                                    </div>
                                </div>

                                {/* ESPECIFICAÇÕES TÉCNICAS (BLOQUEADO ATÉ SELECIONAR CAT) */}
                                <div className={`p-4 rounded-xl border transition-all ${formData.category ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
                                    <h3 className={`text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 ${formData.category ? 'text-blue-800' : 'text-gray-400'}`}>
                                        <Zap size={14} /> Especificações Técnicas
                                    </h3>

                                    {!formData.category ? (
                                        <div className="text-center py-2 text-sm text-gray-400 italic">
                                            Selecione a aplicação acima.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                            {/* AMPERAGEM */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">Amperagem</label>
                                                <div className="relative">
                                                    <Gauge className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={16} />
                                                    <select
                                                        value={formData.amperage}
                                                        onChange={e => setFormData({ ...formData, amperage: e.target.value })}
                                                        className="w-full pl-9 p-2.5 text-sm border border-gray-300 rounded-lg outline-none appearance-none bg-white cursor-pointer focus:border-yellow-400"
                                                    >
                                                        <option value="">-- Ah --</option>
                                                        {availableAmperages.map(a => <option key={a} value={a}>{a}</option>)}
                                                    </select>
                                                </div>
                                                <FieldError msg={errors.amperage} />
                                            </div>

                                            {/* TECNOLOGIA */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">Tecnologia</label>
                                                <div className="relative">
                                                    <Cpu className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={16} />
                                                    <select
                                                        value={formData.technology}
                                                        onChange={e => setFormData({ ...formData, technology: e.target.value })}
                                                        className="w-full pl-9 p-2.5 text-sm border border-gray-300 rounded-lg outline-none appearance-none bg-white cursor-pointer focus:border-yellow-400"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {availableTechnologies.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                                <FieldError msg={errors.technology} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* PREÇO E ESTOQUE */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-blue-900 mb-1">Preço (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                                            placeholder="0,00"
                                        />
                                        <FieldError msg={errors.price} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-blue-900 mb-1">Estoque</label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                                            placeholder="0"
                                        />
                                        <FieldError msg={errors.stock} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOTÕES */}
                        <div className="pt-4 flex gap-3 border-t border-gray-100">
                            <button type="button" onClick={onCancel} className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-black uppercase tracking-wide rounded-lg shadow-md transition disabled:opacity-70"
                            >
                                {submitting ? 'Salvando...' : 'Salvar Bateria'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}