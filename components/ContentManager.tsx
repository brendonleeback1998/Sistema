import React, { useState } from 'react';
import { BeltContent, BeltColor } from '../types';
import { Plus, Trash2, Edit, Save, X, Video, FileText, Lock } from 'lucide-react';
import { BELT_COLORS_MAP } from '../constants';

interface ContentManagerProps {
  contents: BeltContent[];
  onAddContent: (content: BeltContent) => void;
  onUpdateContent: (content: BeltContent) => void;
  onDeleteContent: (id: string) => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({ contents, onAddContent, onUpdateContent, onDeleteContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBeltFilter, setSelectedBeltFilter] = useState<string>('all');

  const [formData, setFormData] = useState<Partial<BeltContent>>({
    title: '',
    description: '',
    belt: BeltColor.White,
    videoUrl: '',
    daysToUnlock: 0
  });

  const handleOpenModal = (content?: BeltContent) => {
    if (content) {
      setEditingId(content.id);
      setFormData({
        title: content.title,
        description: content.description,
        belt: content.belt,
        videoUrl: content.videoUrl,
        daysToUnlock: content.daysToUnlock
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        belt: BeltColor.White,
        videoUrl: '',
        daysToUnlock: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    const contentData = {
        ...formData,
        daysToUnlock: Number(formData.daysToUnlock) || 0
    } as BeltContent;

    if (editingId) {
      onUpdateContent({ ...contentData, id: editingId, createdAt: new Date().toISOString() });
    } else {
      onAddContent({ ...contentData, id: Date.now().toString(), createdAt: new Date().toISOString() });
    }
    setIsModalOpen(false);
  };

  const filteredContents = selectedBeltFilter === 'all' 
    ? contents 
    : contents.filter(c => c.belt === selectedBeltFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Conteúdo Educacional (Syllabus)</h2>
           <p className="text-sm text-slate-500">Gerencie vídeos e textos de cada graduação.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Novo Conteúdo
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
         <button 
            onClick={() => setSelectedBeltFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedBeltFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
         >
            Todas
         </button>
         {Object.values(BeltColor).map(belt => (
            <button 
                key={belt}
                onClick={() => setSelectedBeltFilter(belt)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 border ${selectedBeltFilter === belt ? 'ring-2 ring-slate-800' : ''} ${BELT_COLORS_MAP[belt]}`}
            >
                {belt}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContents.map(content => (
            <div key={content.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className={`h-2 w-full ${BELT_COLORS_MAP[content.belt].split(' ')[0]}`}></div>
                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${BELT_COLORS_MAP[content.belt]}`}>
                            Faixa {content.belt}
                        </span>
                        {content.daysToUnlock > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                <Lock size={10} /> +{content.daysToUnlock} dias
                            </span>
                        )}
                    </div>
                    
                    <h3 className="font-bold text-slate-900 mb-1">{content.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">{content.description}</p>
                    
                    {content.videoUrl && (
                        <div className="text-xs text-blue-600 flex items-center gap-1 mb-4 bg-blue-50 p-2 rounded">
                            <Video size={14} /> Contém Vídeo
                        </div>
                    )}

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                         <button onClick={() => handleOpenModal(content)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit size={16} />
                         </button>
                         <button 
                            onClick={() => {
                                if(window.confirm('Excluir este conteúdo?')) onDeleteContent(content.id);
                            }} 
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                         >
                            <Trash2 size={16} />
                         </button>
                    </div>
                </div>
            </div>
        ))}
        {filteredContents.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                Nenhum conteúdo cadastrado para este filtro.
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
              <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                 <h3 className="font-bold flex items-center gap-2">
                    <FileText size={20} />
                    {editingId ? 'Editar Conteúdo' : 'Novo Conteúdo'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1 rounded">
                    <X size={20} />
                 </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                    <input 
                        type="text" required 
                        className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-slate-400"
                        placeholder="Ex: Kata Heian Shodan"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Graduação</label>
                        <select 
                            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            value={formData.belt}
                            onChange={e => setFormData({...formData, belt: e.target.value as BeltColor})}
                        >
                            {Object.values(BeltColor).map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bloqueio (Dias após Exame)</label>
                        <input 
                            type="number" min="0"
                            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            value={formData.daysToUnlock}
                            onChange={e => setFormData({...formData, daysToUnlock: Number(e.target.value)})}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">0 = Liberado imediatamente</p>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Link do Vídeo (YouTube)</label>
                    <input 
                        type="url" 
                        className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-slate-400"
                        placeholder="https://youtube.com/..."
                        value={formData.videoUrl}
                        onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição / Texto</label>
                    <textarea 
                        required
                        rows={4}
                        className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-slate-400"
                        placeholder="Descreva o conteúdo técnico..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-slate-300 bg-white rounded-lg text-slate-600">Cancelar</button>
                    <button type="submit" className="flex-1 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800">Salvar</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};