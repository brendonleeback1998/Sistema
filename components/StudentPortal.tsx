import React, { useState, useMemo } from 'react';
import { Student, Payment, PaymentStatus, BeltColor, PaymentMethod, BeltContent } from '../types';
import { User, Shield, CreditCard, LogOut, MapPin, Phone, Mail, Calendar, AlertCircle, CheckCircle, ShoppingBag, Clock, CheckSquare, Square, ChevronRight, Lock, Save, Key, BookOpen, PlayCircle, MessageCircle } from 'lucide-react';
import { BELT_COLORS_MAP } from '../constants';
import { PaymentCheckout } from './PaymentCheckout';
import { ChatSystem } from './ChatSystem';
import { storage } from '../services/storage';

interface StudentPortalProps {
  student: Student;
  payments: Payment[];
  onLogout: () => void;
  onUpdatePayment: (payment: Payment) => void;
  onUpdateStudent: (student: Student) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ 
  student, 
  payments, 
  onLogout,
  onUpdatePayment,
  onUpdateStudent
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'belts' | 'financial' | 'content' | 'chat'>('financial');
  const [checkoutPayment, setCheckoutPayment] = useState<Payment | null>(null);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  
  // Security Form State
  const [securityForm, setSecurityForm] = useState({
      customLogin: student.customLogin || '',
      password: '',
      confirmPassword: ''
  });
  const [showSecuritySuccess, setShowSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState('');

  // Content State
  const allContent = storage.getContent();

  // Filtrar pagamentos do aluno
  const myPayments = payments.filter(p => p.studentId === student.id).sort((a, b) => 
    new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );

  const pendingPayments = myPayments.filter(p => p.status === PaymentStatus.Pending || p.status === PaymentStatus.Overdue);
  const paidPayments = myPayments.filter(p => p.status === PaymentStatus.Paid);

  // Calcula o total selecionado
  const totalSelected = useMemo(() => {
    return pendingPayments
      .filter(p => selectedPaymentIds.includes(p.id))
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [pendingPayments, selectedPaymentIds]);

  const togglePaymentSelection = (id: string) => {
    setSelectedPaymentIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPaymentIds.length === pendingPayments.length) {
      setSelectedPaymentIds([]);
    } else {
      setSelectedPaymentIds(pendingPayments.map(p => p.id));
    }
  };

  const handleBulkCheckout = () => {
    if (selectedPaymentIds.length === 0) return;

    // Cria um objeto de pagamento "Virtual" que representa o pacote
    const bulkPayment: Payment = {
        id: `bulk_${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        type: 'tuition', // Genérico para o checkout
        amount: totalSelected,
        dueDate: new Date().toISOString().split('T')[0],
        status: PaymentStatus.Pending,
        description: `Pagamento de ${selectedPaymentIds.length} item(s)`
    };

    setCheckoutPayment(bulkPayment);
  };

  const handlePaymentSuccess = (resultPayment: Payment) => {
    const today = new Date().toISOString().split('T')[0];

    // Verifica se é um pagamento em lote (ID começa com 'bulk_') ou individual
    if (resultPayment.id.startsWith('bulk_')) {
        // Atualiza todos os pagamentos originais selecionados
        selectedPaymentIds.forEach(id => {
            const originalPayment = payments.find(p => p.id === id);
            if (originalPayment) {
                onUpdatePayment({
                    ...originalPayment,
                    status: PaymentStatus.Paid,
                    paidDate: today,
                    method: resultPayment.method,
                    transactionId: resultPayment.transactionId
                });
            }
        });
        setSelectedPaymentIds([]);
    } else {
        // Atualiza pagamento individual (caso tenha vindo de um fluxo unitário direto, se houver)
        onUpdatePayment(resultPayment);
    }

    setCheckoutPayment(null);
    alert("Pagamento confirmado com sucesso!");
  };

  const handleUpdateSecurity = (e: React.FormEvent) => {
      e.preventDefault();
      setSecurityError('');
      
      if (securityForm.password && securityForm.password !== securityForm.confirmPassword) {
          setSecurityError("As senhas não conferem.");
          return;
      }

      if (securityForm.password && securityForm.password.length < 4) {
          setSecurityError("A senha deve ter pelo menos 4 caracteres.");
          return;
      }

      const updatedStudent = {
          ...student,
          customLogin: securityForm.customLogin || undefined,
          password: securityForm.password || student.password // Se vazio, mantem a atual
      };

      // Persistir no storage
      storage.updateStudent(updatedStudent);
      onUpdateStudent(updatedStudent);
      
      setShowSecuritySuccess(true);
      setTimeout(() => setShowSecuritySuccess(false), 3000);
      setSecurityForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const formatDate = (dateStr: string) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000).toLocaleDateString('pt-BR');
  };

  // --- LOGIC FOR CONTENT UNLOCKING ---
  const beltOrder = Object.values(BeltColor);
  const currentBeltIndex = beltOrder.indexOf(student.belt);

  const getLockStatus = (content: BeltContent) => {
    const contentBeltIndex = beltOrder.indexOf(content.belt);

    // 1. Se a faixa do conteúdo for superior à faixa atual do aluno, bloqueia.
    if (contentBeltIndex > currentBeltIndex) {
        return { isLocked: true, reason: 'future_belt' };
    }

    // 2. Se a faixa for igual ou inferior, verifica o tempo de carência (daysToUnlock)
    if (content.daysToUnlock > 0) {
        // Encontra a data que o aluno obteve essa faixa no histórico
        const historyEntry = student.beltHistory?.find(h => h.belt === content.belt);
        const beltDateStr = historyEntry ? historyEntry.date : (content.belt === student.belt ? student.joinDate : null);

        if (!beltDateStr) {
             return { isLocked: false }; 
        }

        const beltDate = new Date(beltDateStr);
        const unlockDate = new Date(beltDate);
        unlockDate.setDate(beltDate.getDate() + content.daysToUnlock);
        
        const now = new Date();

        if (now < unlockDate) {
            return { 
                isLocked: true, 
                reason: 'time_lock', 
                unlockDate: unlockDate.toLocaleDateString('pt-BR') 
            };
        }
    }

    return { isLocked: false };
  };


  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar / Mobile Header */}
      <div className="bg-slate-900 text-white md:w-64 flex-shrink-0 flex flex-col justify-between">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center font-bold text-xl shadow-md transform rotate-3">
                <img src="/logo.png" alt="S" className="w-8 h-8 object-contain"/>
            </div>
            <div>
                <h1 className="font-bold text-lg tracking-tight">Shogukan Karate</h1>
                <p className="text-xs text-slate-400">Área do Aluno</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
            <img 
                src={student.photoUrl} 
                alt={student.name} 
                className="w-10 h-10 rounded-full object-cover border border-slate-600"
            />
            <div className="overflow-hidden">
                <p className="font-bold text-sm truncate">{student.name}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full inline-block ${student.belt === 'Preta' ? 'bg-white' : 'bg-current'}`} style={{color: student.belt === 'Marrom' ? '#78350f' : undefined}}></span>
                    Faixa {student.belt}
                </p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 p-4 space-y-2 hidden md:block">
            <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'profile' ? 'bg-red-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
                <User size={20} /> Meus Dados
            </button>
            <button 
                onClick={() => setActiveTab('belts')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'belts' ? 'bg-red-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
                <Shield size={20} /> Minha Evolução
            </button>
            <button 
                onClick={() => setActiveTab('content')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'content' ? 'bg-red-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
                <BookOpen size={20} /> Conteúdo Técnico
            </button>
            <button 
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'chat' ? 'bg-red-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
                <MessageCircle size={20} /> Fale com o Sensei
            </button>
            <button 
                onClick={() => setActiveTab('financial')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'financial' ? 'bg-red-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
                <CreditCard size={20} /> Financeiro
                {pendingPayments.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {pendingPayments.length}
                    </span>
                )}
            </button>
        </nav>

        <div className="p-4 border-t border-slate-800 hidden md:block">
            <button onClick={onLogout} className="w-full flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                <LogOut size={16} /> Sair do Sistema
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto h-[calc(100vh-60px)] md:h-screen pb-20 md:pb-0">
         
         {/* Mobile Tab Bar */}
         <div className="md:hidden flex overflow-x-auto bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm no-scrollbar">
            <button 
                onClick={() => setActiveTab('financial')}
                className={`min-w-[80px] flex-1 py-4 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'financial' ? 'text-red-700 border-b-2 border-red-700' : 'text-slate-500'}`}
            >
                <CreditCard size={20} />
                Financeiro
            </button>
            <button 
                onClick={() => setActiveTab('chat')}
                className={`min-w-[80px] flex-1 py-4 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-red-700 border-b-2 border-red-700' : 'text-slate-500'}`}
            >
                <MessageCircle size={20} />
                Chat
            </button>
            <button 
                onClick={() => setActiveTab('content')}
                className={`min-w-[80px] flex-1 py-4 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'content' ? 'text-red-700 border-b-2 border-red-700' : 'text-slate-500'}`}
            >
                <BookOpen size={20} />
                Conteúdo
            </button>
            <button 
                onClick={() => setActiveTab('belts')}
                className={`min-w-[80px] flex-1 py-4 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'belts' ? 'text-red-700 border-b-2 border-red-700' : 'text-slate-500'}`}
            >
                <Shield size={20} />
                Graduações
            </button>
            <button 
                onClick={() => setActiveTab('profile')}
                className={`min-w-[80px] flex-1 py-4 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-red-700 border-b-2 border-red-700' : 'text-slate-500'}`}
            >
                <User size={20} />
                Perfil
            </button>
            <button 
                onClick={onLogout}
                className="min-w-[80px] flex-1 py-4 text-xs font-medium flex flex-col items-center gap-1 text-slate-500 border-l border-slate-100"
            >
                <LogOut size={20} />
                Sair
            </button>
         </div>

         <div className="p-4 md:p-8 max-w-4xl mx-auto h-full">
            
            {/* PERFIL TAB */}
            {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Meus Dados Cadastrais</h2>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 p-6 flex flex-col md:flex-row items-center gap-6 border-b border-slate-100">
                             <img src={student.photoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                             <div className="text-center md:text-left">
                                <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
                                <p className="text-slate-500 text-sm">Aluno desde {formatDate(student.joinDate)}</p>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mt-2 ${BELT_COLORS_MAP[student.belt]}`}>
                                    <Shield size={12} /> Faixa {student.belt}
                                </span>
                             </div>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Informações Pessoais</h4>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex flex-col">
                                        <span className="text-slate-500 text-xs">CPF</span>
                                        <span className="font-medium text-slate-900">{student.cpf || '-'}</span>
                                    </li>
                                    <li className="flex flex-col">
                                        <span className="text-slate-500 text-xs">Data de Nascimento</span>
                                        <span className="font-medium text-slate-900">{formatDate(student.birthDate)}</span>
                                    </li>
                                    <li className="flex flex-col">
                                        <span className="text-slate-500 text-xs">Nome da Mãe</span>
                                        <span className="font-medium text-slate-900">{student.motherName || '-'}</span>
                                    </li>
                                    <li className="flex flex-col">
                                        <span className="text-slate-500 text-xs">Nome do Pai</span>
                                        <span className="font-medium text-slate-900">{student.fatherName || '-'}</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Contatos</h4>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-start gap-3">
                                        <Mail className="text-slate-400 shrink-0 mt-0.5" size={16} />
                                        <div>
                                            <span className="text-slate-500 text-xs block">Email</span>
                                            <span className="font-medium text-slate-900">{student.email}</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Phone className="text-slate-400 shrink-0 mt-0.5" size={16} />
                                        <div>
                                            <span className="text-slate-500 text-xs block">Telefone</span>
                                            <span className="font-medium text-slate-900">{student.phone}</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                                        <div>
                                            <span className="text-slate-500 text-xs block">Emergência</span>
                                            <span className="font-medium text-slate-900">{student.emergencyContact || '-'}</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    {/* Security Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Key size={18} /> Credenciais de Acesso (Login App)
                            </h3>
                        </div>
                        <form onSubmit={handleUpdateSecurity} className="p-6 space-y-6">
                            
                            {/* Layout Grid: Login e Senha lado a lado no Desktop */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Login Personalizado</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                        placeholder={student.name}
                                        value={securityForm.customLogin}
                                        onChange={e => setSecurityForm({...securityForm, customLogin: e.target.value})}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Padrão: Seu Nome Completo</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                            placeholder="******"
                                            value={securityForm.password}
                                            onChange={e => setSecurityForm({...securityForm, password: e.target.value})}
                                        />
                                        <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha</label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                            placeholder="******"
                                            value={securityForm.confirmPassword}
                                            onChange={e => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                                        />
                                        <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                                    </div>
                                </div>
                            </div>
                            
                            {securityError && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={16} />
                                    {securityError}
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                <p className="text-xs text-slate-400 italic text-center md:text-left">
                                    * Ao definir uma senha personalizada, sua data de nascimento não servirá mais como senha.
                                </p>
                                <button 
                                    type="submit"
                                    className="w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-95 duration-200"
                                >
                                    <Save size={18} /> Salvar Alterações
                                </button>
                            </div>
                            
                            {showSecuritySuccess && (
                                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2 animate-in fade-in border border-green-100">
                                    <CheckCircle size={16} />
                                    Credenciais atualizadas com sucesso!
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* CHAT TAB */}
            {activeTab === 'chat' && (
                <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-800">Fale com o Sensei</h2>
                    </div>
                    <div className="flex-1">
                        <ChatSystem 
                            currentUserRole="student" 
                            currentStudentId={student.id} 
                        />
                    </div>
                </div>
            )}

            {/* BELTS TAB */}
            {activeTab === 'belts' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Histórico de Exames</h2>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                            {[...(student.beltHistory || [])].reverse().map((hist, idx) => (
                                <div key={idx} className="relative pl-8">
                                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${BELT_COLORS_MAP[hist.belt]} z-10`}></div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                                Faixa {hist.belt}
                                            </h3>
                                            <p className="text-slate-500 text-sm mt-1">{hist.notes || 'Aprovação em exame técnico.'}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-white px-3 py-1 rounded border border-slate-200 shadow-sm w-fit">
                                            <Calendar size={14} />
                                            {formatDate(hist.date)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!student.beltHistory || student.beltHistory.length === 0) && (
                                <p className="text-slate-500 italic pl-8">Nenhum histórico registrado.</p>
                            )}
                        </div>
                    </div>
                 </div>
            )}

            {/* CONTENT TAB */}
            {activeTab === 'content' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">Conteúdo Técnico (Syllabus)</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${BELT_COLORS_MAP[student.belt]}`}>
                            Sua Faixa: {student.belt}
                        </span>
                    </div>

                    <div className="space-y-6">
                        {/* Agrupar conteúdo por faixa, na ordem da graduação */}
                        {beltOrder.map(belt => {
                            const contentsForBelt = allContent.filter(c => c.belt === belt);
                            if (contentsForBelt.length === 0) return null;

                            // Verificar se o aluno já passou por essa faixa ou está nela
                            const beltIndex = beltOrder.indexOf(belt);
                            
                            // Se o aluno é branca (index 0), ele vê branca.
                            // Se o aluno é preta (index 7), ele vê tudo.
                            // Mas precisamos checar o bloqueio individual também para a faixa atual.
                            
                            return (
                                <div key={belt} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className={`p-3 border-b border-slate-100 flex items-center justify-between ${BELT_COLORS_MAP[belt].split(' ')[0]} bg-opacity-20`}>
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <Shield size={16} /> Faixa {belt}
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {contentsForBelt.map(content => {
                                            const status = getLockStatus(content);
                                            
                                            return (
                                                <div key={content.id} className={`p-4 flex gap-4 ${status.isLocked ? 'bg-slate-50 opacity-70 grayscale' : 'hover:bg-slate-50 transition-colors'}`}>
                                                    <div className="shrink-0 pt-1">
                                                        {status.isLocked ? (
                                                            <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                                                                <Lock size={20} />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                                                                {content.videoUrl ? <PlayCircle size={24} /> : <BookOpen size={24} />}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-900">{content.title}</h4>
                                                        
                                                        {status.isLocked ? (
                                                            <p className="text-sm text-slate-500 italic mt-1 flex items-center gap-1">
                                                                <Clock size={12} />
                                                                {status.reason === 'future_belt' 
                                                                    ? "Disponível ao alcançar esta graduação." 
                                                                    : `Disponível em ${status.unlockDate}`
                                                                }
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-2 mt-1">
                                                                <p className="text-sm text-slate-600">{content.description}</p>
                                                                {content.videoUrl && (
                                                                    <a 
                                                                        href={content.videoUrl} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide"
                                                                    >
                                                                        Assistir Vídeo <ChevronRight size={12} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* FINANCIAL TAB */}
            {activeTab === 'financial' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Financeiro</h2>

                    {/* Pending Payments Section */}
                    {pendingPayments.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide flex items-center gap-2">
                                    <AlertCircle size={16} /> Pendências
                                </h3>
                                <button 
                                    onClick={toggleSelectAll}
                                    className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                                >
                                    {selectedPaymentIds.length === pendingPayments.length ? (
                                        <><CheckSquare size={16} className="text-red-700"/> Desmarcar Todos</>
                                    ) : (
                                        <><Square size={16}/> Selecionar Todos</>
                                    )}
                                </button>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                {pendingPayments.map(payment => {
                                    const isSelected = selectedPaymentIds.includes(payment.id);
                                    return (
                                        <div 
                                            key={payment.id} 
                                            className={`p-4 border-b border-slate-100 last:border-0 flex items-center gap-4 transition-colors cursor-pointer ${isSelected ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}
                                            onClick={() => togglePaymentSelection(payment.id)}
                                        >
                                            <div className="shrink-0">
                                                {isSelected ? (
                                                    <CheckSquare size={24} className="text-red-700" />
                                                ) : (
                                                    <Square size={24} className="text-slate-300" />
                                                )}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${payment.type === 'product' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {payment.type === 'product' ? 'Produto' : 'Mensalidade'}
                                                    </span>
                                                    {payment.status === PaymentStatus.Overdue && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">Atrasado</span>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-slate-900">{payment.description}</h4>
                                                <p className="text-sm text-slate-500">Venceu em: {formatDate(payment.dueDate)}</p>
                                            </div>
                                            
                                            <div className="text-right">
                                                <span className="block text-lg font-bold text-slate-800">R$ {payment.amount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Floating / Sticky Footer for Bulk Payment */}
                            {selectedPaymentIds.length > 0 && (
                                <div className="sticky bottom-4 z-10 bg-slate-900 text-white p-4 rounded-xl shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">{selectedPaymentIds.length} item(s) selecionado(s)</p>
                                        <p className="text-2xl font-bold">R$ {totalSelected.toFixed(2)}</p>
                                    </div>
                                    <button 
                                        onClick={handleBulkCheckout}
                                        className="bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg"
                                    >
                                        Pagar Agora <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                            <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
                            <h3 className="text-green-800 font-bold">Tudo em dia!</h3>
                            <p className="text-green-600 text-sm">Você não possui pagamentos pendentes.</p>
                        </div>
                    )}

                    {/* Paid History Section */}
                    <div className="mt-8">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 mb-4">
                            <Clock size={16} /> Histórico de Pagamentos
                        </h3>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                                        <tr>
                                            <th className="px-6 py-3">Descrição</th>
                                            <th className="px-6 py-3">Data Pagamento</th>
                                            <th className="px-6 py-3">Método</th>
                                            <th className="px-6 py-3 text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paidPayments.map(payment => (
                                            <tr key={payment.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    {payment.description}
                                                    {payment.type === 'product' && <span className="ml-2 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">PRODUTO</span>}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{formatDate(payment.paidDate || '')}</td>
                                                <td className="px-6 py-4 text-slate-600">{payment.method || 'Dinheiro/Outro'}</td>
                                                <td className="px-6 py-4 text-right font-mono text-slate-700">R$ {payment.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        {paidPayments.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                                                    Nenhum pagamento realizado ainda.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* Checkout Modal Overlay */}
      {checkoutPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[600px] overflow-hidden">
                <PaymentCheckout 
                    payment={checkoutPayment}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setCheckoutPayment(null)}
                />
            </div>
        </div>
      )}
    </div>
  );
};