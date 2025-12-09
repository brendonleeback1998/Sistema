import React, { useState, useEffect, useRef } from 'react';
import { Student, StudentStatus, BeltColor, Plan, Payment, Product, BeltHistory, PaymentStatus } from '../types';
import { BELT_COLORS_MAP } from '../constants';
import { Search, Plus, User, MoreVertical, Shield, X, Check, Edit, Trash2, Power, Camera, Upload, Tag, DollarSign, Award, Calendar, FileText, Save, Contact, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { StudentHistoryModal } from './StudentHistoryModal';

interface StudentListProps {
  students: Student[];
  plans: Plan[];
  payments: Payment[];
  products: Product[];
  initialFilter?: string; // New prop for dashboard navigation
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddPayment: (payment: Payment) => void;
  onUpdatePayment: (payment: Payment) => void;
  onDeletePayment: (id: string) => void;
}

export const StudentList: React.FC<StudentListProps> = ({ 
  students, 
  plans,
  payments,
  products,
  initialFilter = 'all',
  onAddStudent, 
  onUpdateStudent, 
  onDeleteStudent,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(initialFilter);

  // Update filter if initialFilter changes (e.g. navigation from dashboard)
  useEffect(() => {
    setFilterStatus(initialFilter);
  }, [initialFilter]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Financial History Modal State
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);
  const [historyModalInitialTab, setHistoryModalInitialTab] = useState<'history' | 'sell' | 'tuition' | 'report'>('history');

  // Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Belt History Form State
  const [newBeltRecord, setNewBeltRecord] = useState({
    belt: BeltColor.White,
    date: '',
    notes: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    cpf: '',
    email: '',
    phone: '',
    emergencyContact: '',
    fatherName: '',
    motherName: '',
    belt: BeltColor.White,
    joinDate: new Date().toISOString().split('T')[0],
    status: StudentStatus.Active,
    photoUrl: '',
    planId: '',
    beltHistory: [] as BeltHistory[]
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeMenuId]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPlanName = (planId?: string) => {
    if (!planId) return <span className="text-slate-400 italic">Sem plano</span>;
    const plan = plans.find(p => p.id === planId);
    return plan ? (
        <span className="text-slate-600 text-xs font-medium bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
            {plan.name}
        </span>
    ) : <span className="text-red-400 text-xs">Plano excluído</span>;
  };

  const getTuitionStatus = (studentId: string) => {
    // 1. Check for ANY overdue tuition (highest priority)
    const hasOverdue = payments.some(p => 
      p.studentId === studentId && 
      p.type === 'tuition' && 
      p.status === PaymentStatus.Overdue
    );

    if (hasOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">
          <AlertCircle size={10} /> Atrasado
        </span>
      );
    }

    // 2. Check current month status
    const today = new Date();
    const currentMonthPayment = payments.find(p => 
      p.studentId === studentId && 
      p.type === 'tuition' && 
      new Date(p.dueDate).getMonth() === today.getMonth() &&
      new Date(p.dueDate).getFullYear() === today.getFullYear()
    );

    if (currentMonthPayment) {
      if (currentMonthPayment.status === PaymentStatus.Paid) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle size={10} /> Pago
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
            <Clock size={10} /> Pendente
          </span>
        );
      }
    }

    // 3. No info for current month
    return <span className="text-slate-400 text-xs">---</span>;
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setIsEditMode(true);
      setEditingId(student.id);
      setFormData({
        name: student.name,
        birthDate: student.birthDate || '',
        cpf: student.cpf || '',
        email: student.email,
        phone: student.phone,
        emergencyContact: student.emergencyContact || '',
        fatherName: student.fatherName || '',
        motherName: student.motherName || '',
        belt: student.belt,
        joinDate: student.joinDate,
        status: student.status,
        photoUrl: student.photoUrl || '',
        planId: student.planId || '',
        beltHistory: student.beltHistory || []
      });
      // Reset new record form
      setNewBeltRecord({ belt: BeltColor.White, date: new Date().toISOString().split('T')[0], notes: '' });
    } else {
      setIsEditMode(false);
      setEditingId(null);
      setFormData({
        name: '',
        birthDate: '',
        cpf: '',
        email: '',
        phone: '',
        emergencyContact: '',
        fatherName: '',
        motherName: '',
        belt: BeltColor.White,
        joinDate: new Date().toISOString().split('T')[0],
        status: StudentStatus.Active,
        photoUrl: '',
        planId: plans.length > 0 ? plans[0].id : '',
        beltHistory: [{ belt: BeltColor.White, date: new Date().toISOString().split('T')[0], notes: 'Matrícula Inicial' }]
      });
    }
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleOpenHistoryModal = (student: Student, tab: 'history' | 'sell' | 'tuition' | 'report' = 'history') => {
      setSelectedStudentForHistory(student);
      setHistoryModalInitialTab(tab);
      setActiveMenuId(null);
  };

  const handleToggleStatus = (student: Student) => {
    const newStatus = student.status === StudentStatus.Active ? StudentStatus.Inactive : StudentStatus.Active;
    onUpdateStudent({ ...student, status: newStatus });
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.')) {
      onDeleteStudent(id);
    }
    setActiveMenuId(null);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Belt History Management ---

  const handleAddBeltRecord = () => {
      if (!newBeltRecord.date) {
          alert("Selecione uma data para o exame.");
          return;
      }

      const newHistory = [...formData.beltHistory, { ...newBeltRecord }];
      // Sort by date ascending (oldest first)
      newHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setFormData({ ...formData, beltHistory: newHistory });
      setNewBeltRecord({ ...newBeltRecord, notes: '' }); // clear notes, keep date handy
  };

  const handleRemoveBeltRecord = (index: number) => {
      const newHistory = [...formData.beltHistory];
      newHistory.splice(index, 1);
      setFormData({ ...formData, beltHistory: newHistory });
  };

  const handleUpdateBeltRecordDate = (index: number, newDate: string) => {
      const newHistory = [...formData.beltHistory];
      newHistory[index].date = newDate;
      // Re-sort to keep order correct
      newHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setFormData({ ...formData, beltHistory: newHistory });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use uploaded photo OR generate default avatar based on name
    const finalPhotoUrl = formData.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff`;
    
    let updatedHistory = formData.beltHistory ? [...formData.beltHistory] : [];

    // Check if Belt Changed (in Edit Mode) to record history if not already in list
    // This is a safety check to ensure current belt is recorded
    if (isEditMode && editingId) {
        const previousStudent = students.find(s => s.id === editingId);
        // If the belt in the dropdown is different from previous, AND we haven't manually added it to history yet
        if (previousStudent && previousStudent.belt !== formData.belt) {
            // Check if this specific belt/date combo already exists to avoid dupes
            const exists = updatedHistory.some(h => h.belt === formData.belt && h.date === new Date().toISOString().split('T')[0]);
            if (!exists) {
                updatedHistory.push({
                    belt: formData.belt,
                    date: new Date().toISOString().split('T')[0],
                    notes: 'Promoção registrada via sistema.'
                });
            }
        }
    }
    // Always ensure history is sorted ascending
    updatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (isEditMode && editingId) {
      const updatedStudent: Student = {
        id: editingId,
        ...formData,
        beltHistory: updatedHistory,
        photoUrl: finalPhotoUrl
      };
      onUpdateStudent(updatedStudent);
    } else {
      const newStudent: Student = {
        id: Date.now().toString(),
        ...formData,
        beltHistory: updatedHistory,
        photoUrl: finalPhotoUrl
      };
      onAddStudent(newStudent);
    }

    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Alunos</h2>
            <p className="text-sm text-slate-500">Gerencie os membros do Dojo</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleOpenModal()}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              Novo Aluno
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value={StudentStatus.Active}>Ativos</option>
            <option value={StudentStatus.Inactive}>Inativos</option>
            <option value={StudentStatus.Paused}>Pausados</option>
          </select>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4">Faixa</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Mensalidade</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors relative">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.photoUrl} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">Desde {new Date(student.joinDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${BELT_COLORS_MAP[student.belt]}`}>
                      <Shield size={12} />
                      {student.belt}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     {getPlanName(student.planId)}
                  </td>
                  <td className="px-6 py-4">
                     {getTuitionStatus(student.id)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${student.status === StudentStatus.Active ? 'bg-green-100 text-green-800' : 
                        student.status === StudentStatus.Inactive ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex flex-col">
                      <span>{student.email}</span>
                      <span className="text-xs text-slate-400">{student.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <div className="relative inline-block text-left">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === student.id ? null : student.id);
                        }}
                        className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === student.id && (
                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100">
                          <div className="py-1">
                            <button
                               onClick={() => handleOpenHistoryModal(student, 'history')}
                               className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-700 flex items-center gap-2"
                            >
                               <DollarSign size={16} />
                               Financeiro & Vendas
                            </button>
                            <button
                               onClick={() => handleOpenHistoryModal(student, 'report')}
                               className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-700 flex items-center gap-2"
                            >
                               <FileText size={16} />
                               Relatório / Ficha
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                              onClick={() => handleOpenModal(student)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-700 flex items-center gap-2"
                            >
                              <Edit size={16} />
                              Editar Cadastro
                            </button>
                            <button
                              onClick={() => handleToggleStatus(student)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-700 flex items-center gap-2"
                            >
                              <Power size={16} />
                              {student.status === StudentStatus.Active ? 'Desativar' : 'Ativar'}
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Excluir
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Nenhum aluno encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="bg-red-700 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <User size={20} />
                {isEditMode ? 'Editar Aluno & Graduações' : 'Novo Aluno'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-red-800 p-1 rounded transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Photo Upload Section */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center relative">
                        {formData.photoUrl ? (
                        <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                        <User size={40} className="text-slate-300" />
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-red-700 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                        <Camera size={14} />
                    </div>
                    </div>
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    />
                    <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-red-700 font-medium hover:text-red-800 flex items-center gap-1"
                    >
                    <Upload size={14} />
                    Foto
                    </button>
                </div>

                <div className="flex-1 space-y-4">
                    {/* DADOS BÁSICOS */}
                    <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-2 text-sm uppercase flex items-center gap-2">
                        <User size={16} className="text-red-600"/> Dados Pessoais
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                            <input
                            required
                            type="text"
                            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400"
                            placeholder="Ex: João da Silva"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                            <input
                                required
                                type="text"
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400"
                                placeholder="000.000.000-00"
                                value={formData.cpf}
                                onChange={e => setFormData({...formData, cpf: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                            <input
                                required
                                type="date"
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                value={formData.birthDate}
                                onChange={e => setFormData({...formData, birthDate: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* CONTATO */}
                     <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-2 mt-4 text-sm uppercase flex items-center gap-2">
                        <Contact size={16} className="text-red-600"/> Contatos
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            required
                            type="email"
                            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400"
                            placeholder="joao@email.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                        <input
                            required
                            type="tel"
                            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400"
                            placeholder="(11) 99999-9999"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                        </div>
                    </div>

                    {/* FILIAÇÃO & EMERGENCIA */}
                    <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-2 mt-4 text-sm uppercase flex items-center gap-2">
                        <Users size={16} className="text-red-600"/> Família & Emergência
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Pai</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400"
                                value={formData.fatherName}
                                onChange={e => setFormData({...formData, fatherName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Mãe</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400"
                                value={formData.motherName}
                                onChange={e => setFormData({...formData, motherName: e.target.value})}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                             <label className="block text-sm font-medium text-slate-700 mb-1">Contato de Emergência (Nome e Telefone)</label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: Maria (Esposa) - (11) 98888-7777"
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400 bg-red-50"
                                value={formData.emergencyContact}
                                onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
              </div>

              {/* DADOS DO DOJO */}
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-2 mt-6 text-sm uppercase flex items-center gap-2">
                   <Shield size={16} className="text-red-600"/> Dados do Dojo
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Faixa Atual</label>
                  <select
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={formData.belt}
                    onChange={e => setFormData({...formData, belt: e.target.value as BeltColor})}
                  >
                    {Object.values(BeltColor).map(belt => (
                      <option key={belt} value={belt}>{belt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <Tag size={14} className="text-slate-500"/> 
                    Plano/Modalidade
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={formData.planId}
                    onChange={e => setFormData({...formData, planId: e.target.value})}
                  >
                    <option value="">Selecione um plano</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - R$ {plan.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Matrícula</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={formData.joinDate}
                    onChange={e => setFormData({...formData, joinDate: e.target.value})}
                  />
                </div>
              </div>

               {isEditMode && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as StudentStatus})}
                    >
                      <option value={StudentStatus.Active}>Ativo</option>
                      <option value={StudentStatus.Inactive}>Inativo</option>
                      <option value={StudentStatus.Paused}>Pausado</option>
                    </select>
                  </div>
                )}

              {/* Seção de Gestão de Graduações (Belt History Management) */}
              {isEditMode && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                    <div className="flex justify-between items-end mb-4">
                        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <Award size={18} className="text-yellow-600" />
                            Gestão de Graduações (Exames)
                        </h4>
                    </div>
                    
                    {/* Add New History Record Form */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 flex flex-col md:flex-row gap-3 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Graduação</label>
                            <select 
                                className="w-full text-sm p-2 rounded border border-slate-300"
                                value={newBeltRecord.belt}
                                onChange={e => setNewBeltRecord({...newBeltRecord, belt: e.target.value as BeltColor})}
                            >
                                {Object.values(BeltColor).map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Data do Exame</label>
                            <input 
                                type="date" 
                                className="w-full text-sm p-2 rounded border border-slate-300"
                                value={newBeltRecord.date}
                                onChange={e => setNewBeltRecord({...newBeltRecord, date: e.target.value})}
                            />
                        </div>
                        <div className="flex-[2] w-full">
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Notas</label>
                            <input 
                                type="text" 
                                placeholder="Ex: Exame de inverno"
                                className="w-full text-sm p-2 rounded border border-slate-300"
                                value={newBeltRecord.notes}
                                onChange={e => setNewBeltRecord({...newBeltRecord, notes: e.target.value})}
                            />
                        </div>
                        <button 
                            type="button"
                            onClick={handleAddBeltRecord}
                            className="bg-slate-800 text-white p-2 rounded hover:bg-slate-900 transition-colors flex items-center gap-1 text-sm font-medium w-full md:w-auto justify-center"
                        >
                            <Plus size={16} /> Adicionar
                        </button>
                    </div>

                    {/* History List with Edit/Delete */}
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-2">Faixa</th>
                                    <th className="px-4 py-2">Data do Exame</th>
                                    <th className="px-4 py-2">Notas</th>
                                    <th className="px-4 py-2 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[...(formData.beltHistory || [])].reverse().map((hist, index) => {
                                    // Calculate actual index in original array (since we reversed for display)
                                    const originalIndex = formData.beltHistory.length - 1 - index;
                                    
                                    return (
                                        <tr key={index} className="hover:bg-slate-50">
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full border border-slate-300 ${BELT_COLORS_MAP[hist.belt]}`}></div>
                                                    {hist.belt}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input 
                                                    type="date" 
                                                    className="bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:outline-none focus:border-red-500 text-slate-700 w-32"
                                                    value={hist.date}
                                                    onChange={(e) => handleUpdateBeltRecordDate(originalIndex, e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-slate-500">{hist.notes || '-'}</td>
                                            <td className="px-4 py-2 text-right">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveBeltRecord(originalIndex)}
                                                    className="text-slate-400 hover:text-red-600 p-1"
                                                    title="Remover Registro"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {(!formData.beltHistory || formData.beltHistory.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                                            Nenhum histórico registrado. Adicione graduações acima.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
              )}

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
                  <Save size={18} />
                  {isEditMode ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Histórico Financeiro & Relatório */}
      {selectedStudentForHistory && (
        <StudentHistoryModal
          student={selectedStudentForHistory}
          payments={payments}
          products={products}
          initialTab={historyModalInitialTab}
          onClose={() => setSelectedStudentForHistory(null)}
          onAddPayment={onAddPayment}
          onUpdatePayment={onUpdatePayment}
          onDeletePayment={onDeletePayment}
        />
      )}
    </>
  );
};