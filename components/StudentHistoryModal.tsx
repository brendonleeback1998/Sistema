import React, { useState, useRef } from 'react';
import { Student, Payment, Product, PaymentStatus, PaymentType, PaymentMethod } from '../types';
import { BELT_COLORS_MAP } from '../constants';
import { X, Calendar, DollarSign, CheckCircle, AlertCircle, ShoppingBag, Plus, Trash2, Tag, CreditCard, FileText, Printer, MapPin, Phone, Mail, Shield, ArrowRight, User } from 'lucide-react';
import { PaymentCheckout } from './PaymentCheckout';

interface StudentHistoryModalProps {
  student: Student;
  payments: Payment[];
  products: Product[];
  initialTab?: 'history' | 'sell' | 'tuition' | 'report';
  onClose: () => void;
  onAddPayment: (payment: Payment) => void;
  onUpdatePayment: (payment: Payment) => void;
  onDeletePayment: (id: string) => void;
}

export const StudentHistoryModal: React.FC<StudentHistoryModalProps> = ({
  student,
  payments,
  products,
  initialTab = 'history',
  onClose,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'sell' | 'tuition' | 'report'>(initialTab);
  const [paymentInCheckout, setPaymentInCheckout] = useState<Payment | null>(null);
  
  // State for Product Sale
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPaidNow, setIsPaidNow] = useState(true);

  // State for Manual Tuition
  const [tuitionAmount, setTuitionAmount] = useState('');
  const [tuitionDesc, setTuitionDesc] = useState('');
  const [tuitionDate, setTuitionDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter payments for this student
  const studentPayments = payments.filter(p => p.studentId === student.id).sort((a, b) => 
    new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );

  const handleSellProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const newPayment: Payment = {
      id: Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      type: 'product',
      amount: product.price,
      dueDate: saleDate,
      paidDate: isPaidNow ? saleDate : undefined,
      status: isPaidNow ? PaymentStatus.Paid : PaymentStatus.Pending,
      description: product.name,
      productId: product.id,
      method: isPaidNow ? PaymentMethod.Cash : undefined
    };

    onAddPayment(newPayment);
    setActiveTab('history');
    setSelectedProduct('');
  };

  const handleAddTuition = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(tuitionAmount.replace(',', '.'));
    if (isNaN(amountVal)) return;

    const newPayment: Payment = {
      id: Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      type: 'tuition',
      amount: amountVal,
      dueDate: tuitionDate,
      status: PaymentStatus.Pending,
      description: tuitionDesc || 'Mensalidade Avulsa'
    };

    onAddPayment(newPayment);
    setActiveTab('history');
    setTuitionAmount('');
    setTuitionDesc('');
  };

  // Configuração do Botão de Receber Manualmente
  const handleReceive = (payment: Payment) => {
    if (confirm(`Confirmar recebimento manual (Dinheiro) de R$ ${payment.amount.toFixed(2)}?\n\nReferente a: ${payment.description}`)) {
      onUpdatePayment({
        ...payment,
        status: PaymentStatus.Paid,
        paidDate: new Date().toISOString().split('T')[0],
        method: PaymentMethod.Cash
      });
    }
  };

  // Configuração do Botão de Excluir
  const handleDelete = (payment: Payment, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja remover permanentemente: ${payment.description}?`)) {
      onDeletePayment(payment.id);
    }
  };

  const handleOnlinePaymentSuccess = (updatedPayment: Payment) => {
    onUpdatePayment(updatedPayment);
    setPaymentInCheckout(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // Stats for Report
  const totalPaid = studentPayments.filter(p => p.status === PaymentStatus.Paid).reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = studentPayments.filter(p => p.status !== PaymentStatus.Paid).reduce((acc, curr) => acc + curr.amount, 0);

  // If checkout is open, render only checkout overlay inside modal
  if (paymentInCheckout) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 h-[600px]">
          <PaymentCheckout 
            payment={paymentInCheckout}
            onSuccess={handleOnlinePaymentSuccess}
            onCancel={() => setPaymentInCheckout(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:p-0 print:bg-white print:static">
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: 100%; 
            background: white; 
            padding: 40px;
            z-index: 9999;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 print:h-auto print:shadow-none print:w-full">
        
        {/* Header - Hidden on Print */}
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0 no-print">
          <div className="flex items-center gap-4">
             <img src={student.photoUrl} alt={student.name} className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-800 object-cover" />
             <div>
                <h3 className="font-bold text-lg">{student.name}</h3>
                <p className="text-slate-400 text-xs">Ficha do Aluno</p>
             </div>
          </div>
          <button onClick={onClose} className="hover:bg-slate-700 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs & Content */}
        <div className="flex flex-1 overflow-hidden print:overflow-visible print:block">
          
          {/* Sidebar Menu - Hidden on Print */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-2 shrink-0 hidden md:block no-print">
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              <Calendar size={18} /> Extrato Financeiro
            </button>
            <button 
              onClick={() => setActiveTab('sell')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${activeTab === 'sell' ? 'bg-white text-red-700 shadow-sm border border-red-100' : 'text-slate-500 hover:text-red-700 hover:bg-red-50'}`}
            >
              <ShoppingBag size={18} /> Vender Produto
            </button>
            <button 
              onClick={() => setActiveTab('tuition')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${activeTab === 'tuition' ? 'bg-white text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50'}`}
            >
              <DollarSign size={18} /> Lançar Mensalidade
            </button>
            <div className="my-2 border-t border-slate-200"></div>
            <button 
              onClick={() => setActiveTab('report')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${activeTab === 'report' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
            >
              <FileText size={18} /> Relatório & Ficha
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto print:p-0 print:overflow-visible">
             
             {/* Mobile Tabs - Hidden on Print */}
             <div className="flex gap-2 mb-6 md:hidden overflow-x-auto pb-2 no-print">
                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'history' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Extrato</button>
                <button onClick={() => setActiveTab('sell')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'sell' ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-600'}`}>Vender</button>
                <button onClick={() => setActiveTab('tuition')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'tuition' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Mensalidade</button>
                <button onClick={() => setActiveTab('report')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'report' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Ficha</button>
             </div>

             {/* HISTORY TAB */}
             {activeTab === 'history' && (
               <div className="space-y-4 animate-in fade-in duration-300">
                 <h2 className="text-xl font-bold text-slate-800 mb-4">Extrato Financeiro</h2>
                 {studentPayments.length === 0 ? (
                   <div className="text-center py-10 text-slate-500 border border-dashed rounded-lg">
                     Nenhum registro financeiro encontrado para este aluno.
                   </div>
                 ) : (
                   <div className="space-y-3">
                     {studentPayments.map(payment => (
                       <div key={payment.id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-colors">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`p-3 rounded-full ${payment.type === 'product' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                              {payment.type === 'product' ? <ShoppingBag size={20} /> : <CreditCard size={20} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900">{payment.description}</h4>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                  payment.status === PaymentStatus.Paid ? 'bg-green-100 text-green-700' :
                                  payment.status === PaymentStatus.Overdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {payment.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500">
                                Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')} 
                                {payment.paidDate && <span className="text-green-600 ml-2">• Pago em: {new Date(payment.paidDate).toLocaleDateString('pt-BR')}</span>}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-lg font-bold text-slate-700">R$ {payment.amount.toFixed(2)}</span>
                            
                            <div className="flex items-center gap-2">
                              {/* Botões de Ação */}
                              {payment.status !== PaymentStatus.Paid && (
                                <>
                                  <button 
                                    onClick={() => setPaymentInCheckout(payment)}
                                    className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-sm"
                                    title="Pagar Online (Link ou Checkout)"
                                  >
                                    <CreditCard size={12} /> Pagar Online
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleReceive(payment)}
                                    className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors border border-transparent hover:border-green-200" 
                                    title="Marcar como Pago (Dinheiro/Manual)"
                                  >
                                    <CheckCircle size={20} />
                                  </button>
                                </>
                              )}
                              
                              <button 
                                type="button"
                                onClick={(e) => handleDelete(payment, e)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-200"
                                title="Excluir Permanentemente"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             )}

             {/* SELL PRODUCT TAB */}
             {activeTab === 'sell' && (
               <div className="max-w-md mx-auto animate-in fade-in duration-300">
                 <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                   <ShoppingBag className="text-red-700"/>
                   Nova Venda
                 </h2>
                 <p className="text-slate-500 mb-6">Registre a venda de um produto ou serviço para o aluno.</p>

                 <form onSubmit={handleSellProduct} className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Produto / Serviço</label>
                      <select 
                        required
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                        value={selectedProduct}
                        onChange={e => setSelectedProduct(e.target.value)}
                      >
                        <option value="">Selecione um item...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - R$ {p.price.toFixed(2)}</option>
                        ))}
                      </select>
                      {products.length === 0 && <p className="text-xs text-red-500 mt-1">Nenhum produto cadastrado no catálogo.</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Data da Venda</label>
                      <input 
                        type="date" 
                        required
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                        value={saleDate}
                        onChange={e => setSaleDate(e.target.value)}
                      />
                    </div>

                    {/* Novo Seletor: Receber Agora vs Pendência */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsPaidNow(true)}
                          className={`py-3 rounded-lg border font-medium text-sm flex flex-col items-center justify-center gap-1 transition-all 
                            ${isPaidNow 
                                ? 'bg-white text-black border-green-600 ring-1 ring-green-600' 
                                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <CheckCircle size={18} />
                            Receber Agora
                        </button>
                         <button
                          type="button"
                          onClick={() => setIsPaidNow(false)}
                          className={`py-3 rounded-lg border font-medium text-sm flex flex-col items-center justify-center gap-1 transition-all 
                            ${!isPaidNow 
                                ? 'bg-white text-black border-orange-500 ring-1 ring-orange-500' 
                                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <AlertCircle size={18} />
                            Lançar Pendência
                        </button>
                    </div>

                    <button 
                      type="submit" 
                      className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${isPaidNow ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                      disabled={!selectedProduct}
                    >
                      <ShoppingBag size={20} />
                      {isPaidNow ? 'Confirmar Venda (Pago)' : 'Confirmar Venda (A Pagar)'}
                    </button>
                 </form>
               </div>
             )}

             {/* MANUAL TUITION TAB */}
             {activeTab === 'tuition' && (
               <div className="max-w-md mx-auto animate-in fade-in duration-300">
                 <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                   <DollarSign className="text-blue-700"/>
                   Lançar Mensalidade Avulsa
                 </h2>
                 <p className="text-slate-500 mb-6">Crie uma cobrança manual de mensalidade ou taxa extra.</p>

                 <form onSubmit={handleAddTuition} className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
                      <input 
                        required
                        type="text"
                        placeholder="Ex: Mensalidade Junho/2024"
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={tuitionDesc}
                        onChange={e => setTuitionDesc(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Valor (R$)</label>
                      <input 
                        required
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={tuitionAmount}
                        onChange={e => setTuitionAmount(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Data de Vencimento</label>
                      <input 
                        type="date" 
                        required
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={tuitionDate}
                        onChange={e => setTuitionDate(e.target.value)}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus size={20} />
                      Gerar Cobrança
                    </button>
                 </form>
               </div>
             )}

             {/* REPORT & FICHA TAB */}
             {activeTab === 'report' && (
               <div id="printable-area" className="animate-in fade-in duration-300 h-full flex flex-col">
                 <div className="flex justify-between items-start mb-6 no-print">
                   <div>
                     <h2 className="text-xl font-bold text-slate-800">Ficha Cadastral & Relatório</h2>
                     <p className="text-slate-500 text-sm">Documento pronto para impressão</p>
                   </div>
                   <button 
                    onClick={handlePrint}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
                   >
                     <Printer size={18} />
                     Imprimir
                   </button>
                 </div>

                 {/* Printable Content Container */}
                 <div className="bg-white border border-slate-200 p-8 rounded-lg shadow-sm print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto w-full">
                    
                    {/* Header Report */}
                    <div className="flex items-center justify-between border-b-2 border-red-700 pb-6 mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-red-700 rounded-lg flex items-center justify-center text-white font-bold text-3xl print:text-black print:bg-transparent print:border-2 print:border-black">S</div>
                          <div>
                             <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Shogukan Karate</h1>
                             <p className="text-sm text-slate-500">Escola de Artes Marciais</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm text-slate-500">Relatório Gerado em</p>
                          <p className="font-mono font-bold text-slate-900">{new Date().toLocaleDateString('pt-BR')}</p>
                       </div>
                    </div>

                    {/* Student Info Grid */}
                    <div className="flex gap-8 mb-8">
                       <div className="shrink-0">
                          <img src={student.photoUrl} alt="Foto Aluno" className="w-32 h-32 rounded-lg object-cover border border-slate-200 print:grayscale" />
                       </div>
                       <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-8">
                          <div>
                             <p className="text-xs text-slate-400 uppercase font-bold mb-1">Nome Completo</p>
                             <p className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-1">{student.name}</p>
                          </div>
                          <div>
                             <p className="text-xs text-slate-400 uppercase font-bold mb-1">CPF</p>
                             <p className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-1">{student.cpf || '-'}</p>
                          </div>
                          <div>
                             <p className="text-xs text-slate-400 uppercase font-bold mb-1">Status</p>
                             <p className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-1">{student.status}</p>
                          </div>
                           <div>
                             <p className="text-xs text-slate-400 uppercase font-bold mb-1">Data de Nascimento</p>
                             <p className="text-base text-slate-800">{student.birthDate ? new Date(student.birthDate).toLocaleDateString('pt-BR') : '-'}</p>
                          </div>
                          <div>
                             <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex items-center gap-1"><Mail size={12}/> Email</p>
                             <p className="text-base text-slate-800">{student.email}</p>
                          </div>
                          <div>
                             <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex items-center gap-1"><Phone size={12}/> Telefone</p>
                             <p className="text-base text-slate-800">{student.phone}</p>
                          </div>
                          <div>
                             <p className="text-xs text-slate-400 uppercase font-bold mb-1">Data de Matrícula</p>
                             <p className="text-base text-slate-800">{new Date(student.joinDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                             <p className="text-xs text-slate-400 uppercase font-bold mb-1">Último Exame</p>
                             <p className="text-base text-slate-800">{student.lastExamDate ? new Date(student.lastExamDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                       <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex items-center gap-1"><User size={12}/> Filiação</p>
                            <p className="text-sm text-slate-800">
                                <strong>Mãe:</strong> {student.motherName || 'Não informado'} <br/>
                                <strong>Pai:</strong> {student.fatherName || 'Não informado'}
                            </p>
                       </div>
                       <div className="bg-red-50 p-3 rounded border border-red-100">
                            <p className="text-xs text-red-700 uppercase font-bold mb-1 flex items-center gap-1"><AlertCircle size={12}/> Emergência</p>
                            <p className="text-base font-bold text-red-900">
                                {student.emergencyContact || 'Sem contato de emergência registrado'}
                            </p>
                       </div>
                    </div>

                    {/* Belt History Section */}
                    <div className="mb-8">
                       <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                          <Shield size={16} /> Histórico de Graduação
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                          {student.beltHistory && student.beltHistory.length > 0 ? (
                             [...student.beltHistory].reverse().map((hist, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100 print:border-slate-300 print:bg-white">
                                   <div className={`w-4 h-4 rounded-full border border-slate-300 ${BELT_COLORS_MAP[hist.belt]} print:bg-gray-200`}></div>
                                   <div>
                                      <p className="font-bold text-sm text-slate-900">Faixa {hist.belt}</p>
                                      <p className="text-xs text-slate-500">{new Date(hist.date).toLocaleDateString('pt-BR')}</p>
                                   </div>
                                </div>
                             ))
                          ) : (
                             <p className="text-slate-400 italic text-sm">Sem histórico registrado.</p>
                          )}
                       </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="mb-8">
                       <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                          <DollarSign size={16} /> Resumo Financeiro
                       </h3>
                       <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="p-4 bg-slate-50 rounded border border-slate-100 print:bg-white print:border-slate-300">
                             <p className="text-xs text-slate-500 mb-1">Total Pago</p>
                             <p className="text-xl font-bold text-green-700">R$ {totalPaid.toFixed(2)}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded border border-slate-100 print:bg-white print:border-slate-300">
                             <p className="text-xs text-slate-500 mb-1">Total Pendente</p>
                             <p className="text-xl font-bold text-red-700">R$ {totalPending.toFixed(2)}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded border border-slate-100 print:bg-white print:border-slate-300">
                             <p className="text-xs text-slate-500 mb-1">Mensalidade Atual</p>
                             {/* Buscar o valor do plano atual se possível, ou mostrar N/A */}
                             <p className="text-xl font-bold text-slate-800">
                                {payments.find(p => p.studentId === student.id && p.type === 'tuition' && new Date(p.dueDate).getMonth() === new Date().getMonth())?.amount.toFixed(2) || '-'}
                             </p>
                          </div>
                       </div>

                       <table className="w-full text-left text-sm">
                          <thead>
                             <tr className="border-b border-slate-200">
                                <th className="py-2 font-semibold text-slate-700">Descrição</th>
                                <th className="py-2 font-semibold text-slate-700">Vencimento</th>
                                <th className="py-2 font-semibold text-slate-700">Pagamento</th>
                                <th className="py-2 font-semibold text-right text-slate-700">Valor</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {studentPayments.slice(0, 10).map(p => (
                                <tr key={p.id}>
                                   <td className="py-2 text-slate-800">{p.description}</td>
                                   <td className="py-2 text-slate-600">{new Date(p.dueDate).toLocaleDateString('pt-BR')}</td>
                                   <td className="py-2 text-slate-600">{p.paidDate ? new Date(p.paidDate).toLocaleDateString('pt-BR') : '-'}</td>
                                   <td className="py-2 text-right font-mono">{p.amount.toFixed(2)}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                       {studentPayments.length > 10 && (
                          <p className="text-xs text-slate-400 mt-2 text-center italic">Mostrando últimos 10 registros...</p>
                       )}
                    </div>

                    {/* Footer Signature */}
                    <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-400 print:flex hidden">
                        <div className="text-center w-64">
                           <div className="border-b border-slate-300 mb-2 h-8"></div>
                           <p>Assinatura do Responsável</p>
                        </div>
                        <div className="text-center w-64">
                           <div className="border-b border-slate-300 mb-2 h-8"></div>
                           <p>Assinatura do Aluno</p>
                        </div>
                    </div>
                 </div>
               </div>
             )}

          </div>
        </div>
      </div>
    </div>
  );
};