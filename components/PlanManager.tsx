import React, { useState } from 'react';
import { Plan } from '../types';
import { Plus, Trash2, Tag, DollarSign, X, Check, Edit } from 'lucide-react';

interface PlanManagerProps {
  plans: Plan[];
  onAddPlan: (plan: Plan) => void;
  onUpdatePlan: (plan: Plan) => void;
  onDeletePlan: (id: string) => void;
}

export const PlanManager: React.FC<PlanManagerProps> = ({ plans, onAddPlan, onUpdatePlan, onDeletePlan }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: ''
  });

  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      setEditingId(plan.id);
      setFormData({
        name: plan.name,
        price: plan.price.toFixed(2)
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '' });
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
      // Edit Mode
      const updatedPlan: Plan = {
        id: editingId,
        name: formData.name,
        price: priceValue
      };
      onUpdatePlan(updatedPlan);
    } else {
      // Add Mode
      const newPlan: Plan = {
        id: Date.now().toString(),
        name: formData.name,
        price: priceValue
      };
      onAddPlan(newPlan);
    }

    setFormData({ name: '', price: '' });
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Garante que o clique não propague para o card
    if (window.confirm(`Tem certeza que deseja excluir o plano "${name}"?\nIsso não afetará os alunos que já possuem este plano vinculado.`)) {
      onDeletePlan(id);
    }
  };

  const handleEdit = (plan: Plan, e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenModal(plan);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Planos & Modalidades</h2>
           <p className="text-sm text-slate-500">Configure os valores das mensalidades</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-red-200 transition-colors group">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                    <Tag size={20} />
                 </div>
                 <h3 className="font-bold text-lg text-slate-800">{plan.name}</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-4">
                <span className="text-lg font-normal text-slate-500">R$ </span>
                {plan.price.toFixed(2)}
                <span className="text-sm font-normal text-slate-400"> /mês</span>
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button 
                type="button"
                onClick={(e) => handleEdit(plan, e)}
                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                title="Editar Plano"
              >
                <Edit size={20} />
              </button>
              <button 
                type="button"
                onClick={(e) => handleDelete(plan.id, plan.name, e)}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                title="Excluir Plano"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Tag className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">Nenhum plano cadastrado</h3>
            <p className="text-slate-500">Clique em "Novo Plano" para começar.</p>
          </div>
        )}
      </div>

      {/* Modal Novo/Editar Plano */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-red-700 p-4 flex justify-between items-center text-white rounded-t-xl">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Tag size={20} />
                {editingId ? 'Editar Plano' : 'Novo Plano'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-red-800 p-1 rounded transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Plano</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400"
                  placeholder="Ex: Mensal - 2x Semana"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor Mensal (R$)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">R$</span>
                  </div>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400"
                    placeholder="150.00"
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