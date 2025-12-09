import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Trash2, ShoppingBag, X, Check, Package, Edit } from 'lucide-react';

interface ProductManagerProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: ''
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        price: product.price.toFixed(2),
        category: product.category
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', category: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(formData.price.replace(',', '.'));
    
    if (isNaN(priceValue)) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    if (editingId) {
      // Update
      const updatedProduct: Product = {
        id: editingId,
        name: formData.name,
        price: priceValue,
        category: formData.category
      };
      onUpdateProduct(updatedProduct);
    } else {
      // Create
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        price: priceValue,
        category: formData.category
      };
      onAddProduct(newProduct);
    }

    setFormData({ name: '', price: '', category: '' });
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm(`Deseja realmente excluir o produto "${name}"? Esta ação não pode ser desfeita.`)) {
      onDeleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Produtos & Serviços</h2>
           <p className="text-sm text-slate-500">Catálogo de itens para venda (Kimonos, Equipamentos, etc)</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-red-200 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <ShoppingBag size={20} />
                 </div>
                 <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    {product.category}
                 </span>
              </div>
              <h3 className="font-bold text-lg text-slate-800 mt-2">{product.name}</h3>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                <span className="text-sm font-normal text-slate-500">R$ </span>
                {product.price.toFixed(2)}
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => handleOpenModal(product)}
                className="text-slate-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                title="Editar Produto"
              >
                <Edit size={18} />
              </button>
              <button 
                type="button"
                onClick={(e) => handleDelete(product.id, product.name, e)}
                className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                title="Excluir Produto"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">Nenhum produto cadastrado</h3>
            <p className="text-slate-500">Adicione itens para começar a vender para os alunos.</p>
          </div>
        )}
      </div>

      {/* Modal Novo/Editar Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-red-700 p-4 flex justify-between items-center text-white rounded-t-xl">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Package size={20} />
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-red-800 p-1 rounded transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Item</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400"
                  placeholder="Ex: Kimono Branco M"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input
                  required
                  type="text"
                  list="prodCategories"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400"
                  placeholder="Ex: Uniforme, Equipamento"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
                <datalist id="prodCategories">
                    <option value="Uniforme" />
                    <option value="Equipamento" />
                    <option value="Vestuário" />
                    <option value="Acessórios" />
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">R$</span>
                  </div>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium bg-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium flex justify-center items-center gap-2"
                >
                  <Check size={18} />
                  {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};