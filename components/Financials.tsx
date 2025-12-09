import React, { useState, useEffect } from 'react';
import { Payment, PaymentStatus, FinancialRecord, TransactionType } from '../types';
import { DollarSign, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Plus, Wallet, FileText, ArrowUpCircle, ArrowDownCircle, X, Check, Trash2, ShoppingBag, MessageCircle, Send, Lock, Filter } from 'lucide-react';
import { draftCommunication } from '../services/geminiService';
import { storage } from '../services/storage';

type FinancialView = 'cashflow' | 'receivables';
type ReceivablesFilter = 'all' | 'unpaid' | 'pending' | 'overdue';
type CashFlowFilter = 'all' | 'income' | 'expense';

interface FinancialsProps {
  payments: Payment[];
  financialRecords: FinancialRecord[];
  initialView?: FinancialView; // New prop for dashboard navigation
  onAddRecord: (record: FinancialRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const Financials: React.FC<FinancialsProps> = ({ 
  payments, 
  financialRecords,
  initialView = 'cashflow',
  onAddRecord,
  onDeleteRecord
}) => {
  const [currentView, setCurrentView] = useState<FinancialView>(initialView);
  const [receivablesFilter, setReceivablesFilter] = useState<ReceivablesFilter>('all');
  const [cashFlowFilter, setCashFlowFilter] = useState<CashFlowFilter>('all');

  // Sync with prop change (dashboard navigation)
  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState<string | null>(null);
  
  // State to hold student phone number when drafting message
  const [currentStudentPhone, setCurrentStudentPhone] = useState<string | null>(null);
  const [draftedMessage, setDraftedMessage] = useState<string | null>(null);

  // Form State for new Record
  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // --- LOGIC: RECEIVABLES (MENSALIDADES) ---
  const handleRemind = async (studentName: string, studentId: string) => {
    // Buscar o telefone do aluno no storage (ou poderia vir via props se otimizado)
    const students = storage.getStudents();
    const student = students.find(s => s.id === studentId);
    
    if (student) {
        setCurrentStudentPhone(student.phone);
    } else {
        setCurrentStudentPhone(null);
    }

    setLoadingMsg(studentName);
    const msg = await draftCommunication(studentName, 'LATE_PAYMENT');
    setDraftedMessage(msg);
    setLoadingMsg(null);
  };

  const sendWhatsApp = () => {
      if (!currentStudentPhone || !draftedMessage) return;
      
      // Limpar numero (remover caracteres nao numericos)
      const cleanPhone = currentStudentPhone.replace(/\D/g, '');
      // Se não tiver código do país, assumir 55 (Brasil)
      const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
      
      const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(draftedMessage)}`;
      window.open(url, '_blank');
      setDraftedMessage(null); // Fechar modal após envio
  };

  const totalReceivables = payments
    .filter(p => p.status === PaymentStatus.Pending || p.status === PaymentStatus.Overdue)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingCount = payments.filter(p => p.status === PaymentStatus.Pending).length;
  const overdueCount = payments.filter(p => p.status === PaymentStatus.Overdue).length;

  // Filtered List based on Card Selection
  const filteredPayments = payments.filter(p => {
    if (receivablesFilter === 'all') return true;
    if (receivablesFilter === 'unpaid') return p.status === PaymentStatus.Pending || p.status === PaymentStatus.Overdue;
    if (receivablesFilter === 'pending') return p.status === PaymentStatus.Pending;
    if (receivablesFilter === 'overdue') return p.status === PaymentStatus.Overdue;
    return true;
  });

  // --- LOGIC: CASH FLOW (FLUXO DE CAIXA) ---
  
  // Combine Paid Payments (Income) + Manual Records for a unified ledger
  const unifiedLedger = [
    ...financialRecords,
    ...payments
      .filter(p => p.status === PaymentStatus.Paid && p.paidDate)
      .map(p => ({
        id: `payment-${p.id}`,
        type: 'income' as TransactionType,
        description: `${p.studentName} - ${p.description}`,
        category: p.type === 'product' ? 'Venda Produto' : 'Mensalidade',
        amount: p.amount,
        date: p.paidDate as string,
        isSystemGenerated: true // Flag to prevent deletion of system payments from this view
      }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filtered Ledger based on Card Selection
  const filteredLedger = unifiedLedger.filter(record => {
    if (cashFlowFilter === 'all') return true;
    return record.type === cashFlowFilter;
  });

  const totalIncome = unifiedLedger
    .filter(r => r.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = unifiedLedger
    .filter(r => r.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(formData.amount.replace(',', '.'));
    if(isNaN(amountVal) || amountVal <= 0) {
      alert("Valor inválido");
      return;
    }

    const newRecord: FinancialRecord = {
      id: Date.now().toString(),
      type: formData.type,
      description: formData.description,
      category: formData.category,
      amount: amountVal,
      date: formData.date
    };

    onAddRecord(newRecord);
    setFormData({
      type: 'expense',
      description: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(false);
  };

  const handleDeleteRecord = (record: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (record.isSystemGenerated) {
      alert("Este lançamento é vinculado a um pagamento de aluno.\nPara excluir, vá até a aba 'Alunos' ou 'Contas a Receber' e altere o pagamento original.");
      return;
    }

    const confirmMsg = `Tem certeza que deseja excluir este lançamento?\n\nDescrição: ${record.description}\nValor: R$ ${record.amount.toFixed(2)}\n\nO saldo será recalculado imediatamente.`;

    if (window.confirm(confirmMsg)) {
      onDeleteRecord(record.id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Tabs */}
      <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit">
        <button
          onClick={() => setCurrentView('cashflow')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            currentView === 'cashflow' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wallet size={16} />
          Fluxo de Caixa
        </button>
        <button
          onClick={() => setCurrentView('receivables')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            currentView === 'receivables' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={16} />
          Contas a Receber
        </button>
      </div>

      {currentView === 'cashflow' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
          <div className="flex justify-between items-center">
             <div>
                <h2 className="text-xl font-bold text-slate-800">Fluxo de Caixa</h2>
                <p className="text-slate-500 text-sm">Entradas e Saídas realizadas</p>
             </div>
             <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
             >
                <Plus size={18} />
                Lançar Movimentação
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* CARD: ENTRADAS */}
             <div 
               onClick={() => setCashFlowFilter(cashFlowFilter === 'income' ? 'all' : 'income')}
               className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col cursor-pointer transition-all hover:shadow-md ${cashFlowFilter === 'income' ? 'border-green-500 ring-1 ring-green-500 bg-green-50' : 'border-slate-200 hover:border-green-200'}`}
             >
                <div className="flex justify-between items-start">
                    <span className="text-slate-500 text-sm font-medium flex items-center gap-1">
                       <ArrowUpCircle size={16} className="text-green-500" /> Entradas
                    </span>
                    {cashFlowFilter === 'income' && <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">Filtrado</span>}
                </div>
                <span className="text-2xl font-bold text-slate-900 mt-2">R$ {totalIncome.toFixed(2)}</span>
             </div>

             {/* CARD: SAÍDAS */}
             <div 
               onClick={() => setCashFlowFilter(cashFlowFilter === 'expense' ? 'all' : 'expense')}
               className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col cursor-pointer transition-all hover:shadow-md ${cashFlowFilter === 'expense' ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}`}
             >
                <div className="flex justify-between items-start">
                    <span className="text-slate-500 text-sm font-medium flex items-center gap-1">
                       <ArrowDownCircle size={16} className="text-red-500" /> Saídas
                    </span>
                    {cashFlowFilter === 'expense' && <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-bold">Filtrado</span>}
                </div>
                <span className="text-2xl font-bold text-slate-900 mt-2">R$ {totalExpense.toFixed(2)}</span>
             </div>

             {/* CARD: SALDO (Reset Filter) */}
             <div 
               onClick={() => setCashFlowFilter('all')}
               className={`bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col text-white cursor-pointer transition-all hover:bg-slate-800 ${cashFlowFilter === 'all' ? 'ring-2 ring-slate-400' : 'opacity-90'}`}
             >
                <div className="flex justify-between items-start">
                    <span className="text-slate-400 text-sm font-medium">Saldo Atual</span>
                    {cashFlowFilter === 'all' && <span className="text-xs bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full">Ver Tudo</span>}
                </div>
                <span className={`text-2xl font-bold mt-2 ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                   R$ {balance.toFixed(2)}
                </span>
             </div>
          </div>

          {/* Banner de Filtro Ativo */}
          {cashFlowFilter !== 'all' && (
             <div className="bg-slate-800 text-white px-4 py-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                   <Filter size={18} />
                   <span className="text-sm">
                      Exibindo apenas: <strong>
                         {cashFlowFilter === 'income' ? 'Entradas (Receitas)' : 'Saídas (Despesas)'}
                      </strong>
                   </span>
                </div>
                <button 
                  onClick={() => setCashFlowFilter('all')}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                >
                   <X size={14} /> Limpar Filtro
                </button>
             </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLedger.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {new Date(record.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {record.description}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                          {record.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-medium ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {record.type === 'income' ? '+' : '-'} R$ {record.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {!(record as any).isSystemGenerated ? (
                          <button 
                            type="button"
                            onClick={(e) => handleDeleteRecord(record, e)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Excluir Lançamento"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          <div className="flex justify-center text-slate-300" title="Registro automático (Gerenciar em Alunos)">
                            <Lock size={16} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredLedger.length === 0 && (
                    <tr>
                       <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">
                          {cashFlowFilter !== 'all' 
                            ? "Nenhuma movimentação encontrada para este filtro." 
                            : "Nenhuma movimentação registrada."}
                       </td>
                    </tr>
                  )}
                </tbody>
              </table>
             </div>
          </div>
        </div>
      )}

      {currentView === 'receivables' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
           <div className="flex justify-between items-center">
             <div>
                <h2 className="text-xl font-bold text-slate-800">Contas a Receber</h2>
                <p className="text-slate-500 text-sm">Gestão de mensalidades e vendas pendentes</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* CARD: VALOR PENDENTE (Filtra tudo que não está pago) */}
             <div 
               onClick={() => setReceivablesFilter(receivablesFilter === 'unpaid' ? 'all' : 'unpaid')}
               className={`bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${receivablesFilter === 'unpaid' ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}`}
             >
                <div>
                   <p className="text-sm font-medium text-slate-500">Valor Pendente (Total)</p>
                   <h3 className="text-2xl font-bold text-red-600 mt-1">R$ {totalReceivables.toFixed(2)}</h3>
                   {receivablesFilter === 'unpaid' && <p className="text-xs text-red-500 font-medium mt-1">Filtro Ativo</p>}
                </div>
                <div className={`p-3 rounded-lg ${receivablesFilter === 'unpaid' ? 'bg-red-200 text-red-700' : 'bg-red-50 text-red-600'}`}>
                   <AlertCircle size={24} />
                </div>
             </div>

             {/* CARD: CONTAS EM ABERTO (Filtra Status Pending) */}
             <div 
               onClick={() => setReceivablesFilter(receivablesFilter === 'pending' ? 'all' : 'pending')}
               className={`bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${receivablesFilter === 'pending' ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-200'}`}
             >
                <div>
                   <p className="text-sm font-medium text-slate-500">Contas em Aberto</p>
                   <h3 className="text-2xl font-bold text-orange-600 mt-1">{pendingCount}</h3>
                   {receivablesFilter === 'pending' && <p className="text-xs text-orange-600 font-medium mt-1">Filtro Ativo</p>}
                </div>
                <div className={`p-3 rounded-lg ${receivablesFilter === 'pending' ? 'bg-orange-200 text-orange-700' : 'bg-orange-50 text-orange-600'}`}>
                   <TrendingDown size={24} />
                </div>
             </div>

             {/* CARD: CONTAS ATRASADAS (Filtra Status Overdue) */}
             <div 
               onClick={() => setReceivablesFilter(receivablesFilter === 'overdue' ? 'all' : 'overdue')}
               className={`bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${receivablesFilter === 'overdue' ? 'border-red-700 ring-1 ring-red-700 bg-red-50' : 'border-slate-200 hover:border-red-300'}`}
             >
                <div>
                   <p className="text-sm font-medium text-slate-500">Contas Atrasadas</p>
                   <h3 className="text-2xl font-bold text-red-700 mt-1">{overdueCount}</h3>
                   {receivablesFilter === 'overdue' && <p className="text-xs text-red-700 font-medium mt-1">Filtro Ativo</p>}
                </div>
                <div className={`p-3 rounded-lg ${receivablesFilter === 'overdue' ? 'bg-red-200 text-red-800' : 'bg-red-100 text-red-700'}`}>
                   <AlertCircle size={24} />
                </div>
             </div>
          </div>

          {/* Banner de Filtro Ativo */}
          {receivablesFilter !== 'all' && (
             <div className="bg-slate-800 text-white px-4 py-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                   <Filter size={18} />
                   <span className="text-sm">
                      Exibindo apenas: <strong>
                         {receivablesFilter === 'unpaid' && 'Pendentes e Atrasados'}
                         {receivablesFilter === 'pending' && 'Apenas Pendentes (No Prazo)'}
                         {receivablesFilter === 'overdue' && 'Apenas Atrasados'}
                      </strong>
                   </span>
                </div>
                <button 
                  onClick={() => setReceivablesFilter('all')}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                >
                   <X size={14} /> Limpar Filtro
                </button>
             </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                    <th className="px-6 py-4">Aluno</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Vencimento</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Notificar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{payment.studentName}</td>
                      <td className="px-6 py-4">
                        {payment.type === 'product' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded">
                             <ShoppingBag size={12} /> Produto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                             <FileText size={12} /> Mensalidade
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{payment.description}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 font-mono text-slate-700">R$ {payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${payment.status === PaymentStatus.Paid ? 'bg-green-100 text-green-800' : 
                            payment.status === PaymentStatus.Overdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {payment.status === PaymentStatus.Paid && <CheckCircle size={12} />}
                          {payment.status === PaymentStatus.Overdue && <AlertCircle size={12} />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(payment.status === PaymentStatus.Overdue || payment.status === PaymentStatus.Pending) && (
                          <button 
                            type="button"
                            onClick={() => handleRemind(payment.studentName, payment.studentId)}
                            disabled={loadingMsg === payment.studentName}
                            className="inline-flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            <MessageCircle size={14} />
                            {loadingMsg === payment.studentName ? '...' : 'WhatsApp'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                     <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                           {receivablesFilter !== 'all' 
                              ? "Nenhum registro encontrado para este filtro." 
                              : "Nenhuma conta a receber encontrada."}
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Movimentação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white rounded-t-xl">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Wallet size={20} />
                Nova Movimentação
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1 rounded transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitRecord} className="p-6 space-y-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Movimentação</label>
                 <div className="grid grid-cols-2 gap-2">
                    <button
                       type="button"
                       onClick={() => setFormData({...formData, type: 'income'})}
                       className={`py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                          formData.type === 'income' 
                             ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' 
                             : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                       }`}
                    >
                       <ArrowUpCircle size={16} /> Entrada
                    </button>
                    <button
                       type="button"
                       onClick={() => setFormData({...formData, type: 'expense'})}
                       className={`py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                          formData.type === 'expense' 
                             ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' 
                             : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                       }`}
                    >
                       <ArrowDownCircle size={16} /> Saída
                    </button>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none"
                  placeholder={formData.type === 'income' ? 'Ex: Venda de Camiseta' : 'Ex: Conta de Luz'}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input
                  required
                  type="text"
                  list="categories"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none"
                  placeholder="Ex: Infraestrutura, Loja, Manutenção"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
                <datalist id="categories">
                   <option value="Infraestrutura" />
                   <option value="Manutenção" />
                   <option value="Loja" />
                   <option value="Equipamentos" />
                   <option value="Marketing" />
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                   <input
                     required
                     type="number"
                     step="0.01"
                     className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none"
                     placeholder="0.00"
                     value={formData.amount}
                     onChange={e => setFormData({...formData, amount: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                   <input
                     required
                     type="date"
                     className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none"
                     value={formData.date}
                     onChange={e => setFormData({...formData, date: e.target.value})}
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
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium flex justify-center items-center gap-2"
                >
                  <Check size={18} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Draft Modal Overlay */}
      {draftedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="text-green-600" />
              Notificar Aluno
            </h3>
            <p className="text-sm text-slate-500 mb-2">Mensagem gerada pela IA:</p>
            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap mb-4 border border-slate-200">
              {draftedMessage}
            </div>
            
            <div className="flex flex-col gap-2">
                <button 
                  onClick={sendWhatsApp}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 font-bold transition-colors"
                >
                  <Send size={18} />
                  Enviar via WhatsApp
                </button>
                
                <div className="flex gap-2">
                    <button 
                    onClick={() => {
                        // Simulação de envio "In-App" (apenas log/toast)
                        alert("Notificação enviada para o aplicativo do aluno com sucesso!");
                        setDraftedMessage(null);
                    }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm"
                    >
                    Enviar no App
                    </button>
                    <button 
                    onClick={() => setDraftedMessage(null)}
                    className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm border border-slate-200"
                    >
                    Cancelar
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};