import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Package, ImagePlus, Trash2, AlertCircle, Upload } from 'lucide-react';
import { useToast } from './Toast';
import ProductService from '../services/ProductService';
import { compressImage, formatFileSize, getBase64Size } from '../utils/imageUtils';

// Constante para quantidade mínima de estoque
const MIN_STOCK = 5;

/**
 * Modal de cadastro/edição de produtos com upload de imagem.
 * 
 * Funcionalidades:
 * - Upload de imagem com conversão Base64
 * - Preview thumbnail da imagem
 * - Validação de estoque mínimo (5 unidades)
 * - Botão de salvar bloqueado enquanto houver erros ou sem imagem
 */
function ProductModal({ isOpen, onClose, product = null, onSuccess }) {
    const toast = useToast();
    const fileInputRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        image: '',
    });
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageSize, setImageSize] = useState(null);

    const isEditing = !!product;

    // Preenche o form quando edita
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                price: product.price.toString(),
                stock: product.stock.toString(),
                image: product.image || '',
            });
            setImagePreview(product.image || null);
        } else {
            setFormData({ name: '', price: '', stock: '', image: '' });
            setImagePreview(null);
        }
        setErrors({});
    }, [product, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Valida em tempo real para estoque
        if (name === 'stock') {
            const stockValue = parseInt(value, 10);
            if (!isNaN(stockValue) && stockValue < MIN_STOCK && stockValue >= 0) {
                setErrors((prev) => ({
                    ...prev,
                    stock: `A quantidade mínima para cadastro é ${MIN_STOCK} unidades`
                }));
            } else if (errors.stock) {
                setErrors((prev) => ({ ...prev, stock: null }));
            }
        } else if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    /**
     * Comprime e converte arquivo de imagem para Base64.
     * Usa Canvas HTML5 para redimensionar (max 800px) e comprimir (70% qualidade).
     */
    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Valida tipo de arquivo
        if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
            toast.error('Apenas imagens JPG ou PNG são permitidas');
            return;
        }

        // Valida tamanho original (max 10MB antes da compressão)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('A imagem original deve ter no máximo 10MB');
            return;
        }

        setImageLoading(true);

        try {
            // Comprime a imagem: max 800px, qualidade 70%
            const compressedBase64 = await compressImage(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.7
            });

            const compressedSize = getBase64Size(compressedBase64);
            setImageSize(compressedSize);

            setFormData((prev) => ({ ...prev, image: compressedBase64 }));
            setImagePreview(compressedBase64);

            if (errors.image) {
                setErrors((prev) => ({ ...prev, image: null }));
            }

            // Feedback de compressão
            const originalSize = file.size;
            const savings = Math.round((1 - compressedSize / originalSize) * 100);
            if (savings > 0) {
                toast.success(`Imagem otimizada: ${formatFileSize(compressedSize)} (${savings}% menor)`);
            }
        } catch (error) {
            toast.error(error.message || 'Erro ao processar imagem');
        } finally {
            setImageLoading(false);
        }
    };

    /**
     * Remove a imagem selecionada
     */
    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, image: '' }));
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'O nome é obrigatório';
        }

        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) {
            newErrors.price = 'O preço deve ser maior que zero';
        }

        const stock = parseInt(formData.stock, 10);
        if (isNaN(stock)) {
            newErrors.stock = 'Informe um valor válido';
        } else if (stock < MIN_STOCK) {
            newErrors.stock = `A quantidade mínima para cadastro é ${MIN_STOCK} unidades`;
        }

        // Imagem obrigatória para novo produto
        if (!isEditing && !formData.image) {
            newErrors.image = 'A imagem do produto é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Corrija os erros do formulário');
            return;
        }

        setSubmitting(true);
        try {
            const productData = {
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10),
                image: formData.image || null,
            };

            if (isEditing) {
                await ProductService.updateProduct(product.id, productData);
                toast.success('Produto atualizado com sucesso!');
            } else {
                await ProductService.createProduct(productData);
                toast.success('Produto cadastrado com sucesso!');
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Erro ao salvar produto');
        } finally {
            setSubmitting(false);
        }
    };

    // Verifica se o formulário tem erros ou está incompleto
    const hasErrors = Object.values(errors).some(e => e);
    const isFormIncomplete = !formData.name || !formData.price || !formData.stock || (!isEditing && !formData.image);
    const isSubmitDisabled = submitting || hasErrors || isFormIncomplete;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop com blur */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal Centralizado */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform animate-fade-in max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header do Modal */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Package className="w-5 h-5 text-indigo-500" />
                            {isEditing ? 'Editar Produto' : 'Novo Produto'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">

                        {/* Upload de Imagem */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Imagem do Produto {!isEditing && '*'}
                            </label>

                            {/* Preview da Imagem */}
                            <div className="flex items-start gap-4">
                                <div className={`w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${errors.image
                                    ? 'border-red-300 bg-red-50'
                                    : imagePreview
                                        ? 'border-indigo-300 bg-indigo-50'
                                        : 'border-gray-200 bg-gray-50'
                                    }`}>
                                    {imageLoading ? (
                                        <div className="flex flex-col items-center text-indigo-500">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span className="text-xs mt-1">Otimizando...</span>
                                        </div>
                                    ) : imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ImagePlus className={`w-8 h-8 ${errors.image ? 'text-red-300' : 'text-gray-300'}`} />
                                    )}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="product-image"
                                    />
                                    <label
                                        htmlFor="product-image"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-lg cursor-pointer transition-colors text-sm"
                                    >
                                        <ImagePlus className="w-4 h-4" />
                                        {imagePreview ? 'Trocar imagem' : 'Selecionar imagem'}
                                    </label>

                                    {imagePreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Remover
                                        </button>
                                    )}

                                    <p className="text-xs text-gray-400">
                                        JPG ou PNG, máximo 5MB
                                    </p>
                                </div>
                            </div>

                            {errors.image && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.image}
                                </p>
                            )}
                        </div>

                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nome do Produto *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ex: Teclado Mecânico RGB"
                                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all focus:outline-none ${errors.name
                                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                    : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                                    }`}
                            />
                            {errors.name && (
                                <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Preço e Estoque */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Preço */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Preço (R$) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="99.90"
                                    step="0.01"
                                    min="0.01"
                                    className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all focus:outline-none ${errors.price
                                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                                        }`}
                                />
                                {errors.price && (
                                    <p className="mt-1.5 text-sm text-red-500">{errors.price}</p>
                                )}
                            </div>

                            {/* Estoque */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Estoque * <span className="text-gray-400 font-normal">(mín. {MIN_STOCK})</span>
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder={MIN_STOCK.toString()}
                                    min={MIN_STOCK}
                                    className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all focus:outline-none ${errors.stock
                                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                                        }`}
                                />
                                {errors.stock && (
                                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.stock}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-gray-600 font-medium hover:text-gray-900 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className={`px-6 py-2.5 font-semibold rounded-xl flex items-center gap-2 transition-all ${isSubmitDisabled
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25'
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Produto'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ProductModal;
