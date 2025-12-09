import React, { useState, useEffect, useMemo } from 'react';
import { Student, Product, Payment, PaymentStatus, PaymentMethod } from '../types';
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CheckCircle, CreditCard, DollarSign, X, Package, ShoppingBag, CalendarClock, ListOrdered, Calendar, AlertCircle } from 'lucide-react';

interface POSProps {
  students: Student[];
  products: Product[];
  onAddPayment: (payment: Payment) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const POS: React.FC<POSProps> = ({ students, products, onAddPayment }) => {
  // Estados de Busca de Aluno
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentResults, setShowStudentResults] = useState(false);

  // Estados do Carrinho
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Estados de Pagamento e Parcelamento
  const [paymentMode, setPaymentMode] = useState<'cash' | 'installments'>('cash');
  const [isPaidNow, setIsPaidNow] = useState(true); // Novo estado: Pago Agora ou Pendente
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [numberOfInstallments, setNumberOfInstallments] = useState(1);
  const [firstDueDate, setFirstDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Estado de Sucesso
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtro de Alunos (Pesquisa)
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return [];
    const lower = searchTerm.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(lower) || 
      (s.cpf && s.cpf.includes(lower))
    ).slice(0, 5);
  }, [searchTerm, students]);

  const availableProducts = products;

  // --- Lógica do Aluno ---
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchTerm('');
    setShowStudentResults(false);
  };

  const clearStudent = () => {
    setSelectedStudent(null);
    setSearchTerm('');
  };

  // --- Lógica do Carrinho ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cart]);

  // --- Lógica de Parcelas ---
  const installmentsPreview = useMemo(() => {
    if (paymentMode === 'cash' || numberOfInstallments <= 1) return [];

    const amountPerInstallment = cartTotal / numberOfInstallments;
    const installments = [];
    const baseDate = new Date(firstDueDate);

    for (let i = 0; i < numberOfInstallments; i++) {
      const date = new Date(baseDate);
      date.setMonth(baseDate.getMonth() + i);
      
      installments.push({
        number: i + 1,
        amount: amountPerInstallment,
        dueDate: date.toISOString().split('T')[0]
      });
    }
    return installments;
  }, [cartTotal, numberOfInstallments, firstDueDate, paymentMode]);


  // --- Finalização ---
  const handleFinishSale = () => {
    if (!selectedStudent || cart.length === 0) return;

    const transactionId = `tx_${Date.now()}`;
    const descriptionBase = cart.map(i => `${i.product.name} (x${i.quantity})`).join(', ');

    if (paymentMode === 'cash') {
       // Pagamento Único (À vista)
       const newPayment: Payment = {
        id: `pay_${Date.now()}`,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        type: 'product',
        amount: cartTotal,
        dueDate: firstDueDate,
        paidDate: isPaidNow ? firstDueDate : undefined, 
        status: isPaidNow ? PaymentStatus.Paid : PaymentStatus.Pending,
        description: descriptionBase,
        method: isPaidNow ? paymentMethod : undefined,
        transactionId: transactionId
      };
      onAddPayment(newPayment);

    } else {
      // Parcelado
      installmentsPreview.forEach((inst) => {
        const newPayment: Payment = {
          id: `pay_${Date.now()}_${inst.number}`,
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          type: 'product',
          amount: inst.amount,
          dueDate: inst.dueDate,
          status: PaymentStatus.Pending, // Parcelas futuras nascem Pendentes
          description: `${descriptionBase} - Parc. ${inst.number}/${numberOfInstallments}`,
          method: paymentMethod, // Método acordado (ex: Cartão recorrente ou Boleto)
          transactionId: transactionId,
          installmentNumber: inst.number,
          totalInstallments: numberOfInstallments
        };
        onAddPayment(newPayment);
      });
    }

    // Resetar e mostrar sucesso
    setSuccessMessage(`Venda realizada com sucesso para ${selectedStudent.name}!`);
    setCart([]);
    setSelectedStudent(null);
    setPaymentMode('cash');
    setIsPaidNow(true);
    setNumberOfInstallments(1);
    // Reset date to today for next sale
    setFirstDueDate(new Date().toISOString().split('T')[0]);
    
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b; 
        }
      `}</style>

      {/* Coluna da Esquerda: Seleção e Catálogo */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* Header e Busca de Aluno */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-sm flex-shrink-0">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="text-red-500" />
            Nova Venda / Lançamento
          </h2>
          
          {selectedStudent ? (
            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-600 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-full border border-slate-500">
                    <img src={selectedStudent.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-white">{selectedStudent.name}</p>
                  <p className="text-xs text-slate-400">Matrícula Ativa • Faixa {selectedStudent.belt}</p>
                </div>
              </div>
              <button onClick={clearStudent} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Buscar aluno por nome..."
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none placeholder-slate-400"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowStudentResults(true);
                  }}
                  onFocus={() => setShowStudentResults(true)}
                />
              </div>
              
              {showStudentResults && searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                  {filteredStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 last:border-0"
                    >
                      <User size={16} className="text-slate-400" />
                      <span className="font-medium text-slate-700">{student.name}</span>
                    </button>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="p-3 text-sm text-slate-400 text-center">Nenhum aluno encontrado.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Catálogo de Produtos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-white">
                <h3 className="font-bold text-slate-700 text-sm uppercase">Catálogo de Produtos e Serviços</h3>
            </div>
            <div className="p-4 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-3">
                {availableProducts.map(product => (
                    <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="flex flex-col items-start p-3 rounded-lg border border-slate-200 hover:border-black hover:bg-slate-50 transition-all text-left group"
                    >
                        <span className="text-xs font-semibold text-slate-400 mb-1">{product.category}</span>
                        <span className="font-bold text-slate-800 text-sm line-clamp-2">{product.name}</span>
                        <div className="mt-2 flex justify-between w-full items-end">
                            <span className="font-bold text-slate-900">R$ {product.price.toFixed(2)}</span>
                            <div className="bg-white p-1 rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus size={14} className="text-black" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Coluna da Direita: Carrinho e Checkout */}
      <div className="w-full md:w-96 flex flex-col gap-6">
        <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-sm flex-1 flex flex-col overflow-hidden h-full">
            <div className="p-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
                <h3 className="font-bold flex items-center gap-2">
                    <ShoppingCart size={18} /> Carrinho
                </h3>
                <span className="bg-slate-800 text-xs px-2 py-1 rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)} itens</span>
            </div>

            {/* Lista de Itens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900 min-h-[150px] custom-scrollbar">
                {cart.map((item) => (
                    <div key={item.product.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-sm flex justify-between items-center">
                        <div className="flex-1">
                            <p className="text-sm font-bold text-white line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-slate-400">R$ {item.product.price.toFixed(2)} un.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1 border border-slate-600">
                                <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:bg-slate-600 rounded text-white transition-all"><Minus size={12} /></button>
                                <span className="text-xs font-bold w-4 text-center text-white">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:bg-slate-600 rounded text-white transition-all"><Plus size={12} /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.product.id)} className="text-slate-500 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                        <ShoppingCart size={48} className="mb-2" />
                        <p className="text-sm">Carrinho vazio</p>
                    </div>
                )}
            </div>

            {/* Configuração de Pagamento (Instalação/Checkout) */}
            <div className="p-5 bg-slate-800 border-t border-slate-700 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold text-white border-b border-slate-700 pb-4">
                    <span>Total</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                </div>

                <div className="space-y-3">
                    <div className="flex bg-slate-900 p-1 rounded-lg mb-2 gap-2 border border-slate-700">
                        <button 
                            onClick={() => { setPaymentMode('cash'); setIsPaidNow(true); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-2 transition-all 
                                ${paymentMode === 'cash' 
                                    ? 'bg-white text-black border-white shadow' 
                                    : 'bg-transparent text-slate-400 border-transparent hover:text-white'}`}
                        >
                            <DollarSign size={14} className={paymentMode === 'cash' ? 'text-green-600' : 'text-slate-400'} /> À Vista
                        </button>
                        <button 
                            onClick={() => { setPaymentMode('installments'); setIsPaidNow(false); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-2 transition-all 
                                ${paymentMode === 'installments' 
                                    ? 'bg-white text-black border-white shadow' 
                                    : 'bg-transparent text-slate-400 border-transparent hover:text-white'}`}
                        >
                            <CalendarClock size={14} className={paymentMode === 'installments' ? 'text-blue-600' : 'text-slate-400'} /> Parcelado
                        </button>
                    </div>

                    {paymentMode === 'cash' ? (
                        <div className="animate-in slide-in-from-top-2 space-y-3">
                            {/* Novo Seletor: Receber Agora vs Lançar Pendência */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsPaidNow(true)}
                                  className={`py-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1 transition-all 
                                    ${isPaidNow 
                                        ? 'bg-green-600 text-white border-green-500 shadow-md' 
                                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-white'}`}
                                >
                                    <CheckCircle size={14} className={isPaidNow ? 'text-white' : 'text-slate-500'} />
                                    Receber Agora
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsPaidNow(false)}
                                  className={`py-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1 transition-all 
                                    ${!isPaidNow 
                                        ? 'bg-orange-600 text-white border-orange-500 shadow-md' 
                                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-white'}`}
                                >
                                    <AlertCircle size={14} className={!isPaidNow ? 'text-white' : 'text-slate-500'} />
                                    Lançar Pendência
                                </button>
                            </div>
                            
                            {/* Configuração de Vencimento para Pendências */}
                            {!isPaidNow && (
                                <div className="animate-in fade-in">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Vencimento da Pendência</label>
                                    <input 
                                        type="date" 
                                        className="w-full text-sm p-2 border border-slate-600 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-orange-600 focus:outline-none"
                                        value={firstDueDate}
                                        onChange={e => setFirstDueDate(e.target.value)}
                                    />
                                </div>
                            )}

                            {isPaidNow && (
                                <div className="grid grid-cols-3 gap-2 animate-in fade-in">
                                     {[PaymentMethod.Cash, PaymentMethod.PIX, PaymentMethod.CreditCard].map(m => (
                                        <button 
                                            key={m}
                                            onClick={() => setPaymentMethod(m)}
                                            className={`py-2 text-[10px] font-bold rounded border transition-all ${paymentMethod === m ? 'bg-white text-black border-white' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'}`}
                                        >
                                            {m}
                                        </button>
                                     ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-top-2 space-y-3">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Qtd. Parcelas</label>
                                    <select 
                                        className="w-full text-sm p-2 border border-slate-600 rounded bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                        value={numberOfInstallments}
                                        onChange={e => setNumberOfInstallments(Number(e.target.value))}
                                    >
                                        {[2,3,4,5,6,10,12].map(n => <option key={n} value={n}>{n}x</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">1º Vencimento</label>
                                    <input 
                                        type="date" 
                                        className="w-full text-sm p-2 border border-slate-600 rounded bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                        value={firstDueDate}
                                        onChange={e => setFirstDueDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {/* Installments Preview Table */}
                            <div className="bg-slate-900 rounded border border-slate-700 overflow-hidden max-h-32 overflow-y-auto custom-scrollbar">
                                <table className="w-full text-[10px]">
                                    <thead className="bg-slate-950 text-slate-400">
                                        <tr><th className="p-1 text-left">#</th><th className="p-1 text-left">Data</th><th className="p-1 text-right">Valor</th></tr>
                                    </thead>
                                    <tbody className="text-slate-300">
                                        {installmentsPreview.map((inst) => (
                                            <tr key={inst.number} className="border-t border-slate-800 hover:bg-slate-800">
                                                <td className="p-1">{inst.number}x</td>
                                                <td className="p-1">{new Date(inst.dueDate).toLocaleDateString('pt-BR')}</td>
                                                <td className="p-1 text-right">R$ {inst.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleFinishSale}
                        disabled={!selectedStudent || cart.length === 0}
                        className={`w-full py-3.5 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2
                            ${!selectedStudent || cart.length === 0 
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600' 
                                : paymentMode === 'cash' 
                                    ? isPaidNow ? 'bg-green-600 hover:bg-green-500' : 'bg-orange-600 hover:bg-orange-500'
                                    : 'bg-blue-600 hover:bg-blue-500'
                            }`}
                    >
                        {(!selectedStudent || cart.length === 0) ? (
                            <span>Selecione um aluno</span>
                        ) : (
                            <>
                                {paymentMode === 'cash' 
                                    ? isPaidNow ? <CheckCircle size={20} /> : <AlertCircle size={20} />
                                    : <CalendarClock size={20} />
                                }
                                {paymentMode === 'cash' 
                                    ? isPaidNow ? 'Finalizar Venda (Pago)' : 'Lançar Pendência' 
                                    : `Confirmar ${numberOfInstallments} Parcelas`
                                }
                            </>
                        )}
                    </button>
                    
                    {(!selectedStudent && cart.length > 0) && (
                         <p className="text-xs text-red-400 text-center mt-2 font-medium animate-pulse">
                            * Selecione um aluno para continuar
                         </p>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Toast de Sucesso */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50 border border-slate-700">
            <CheckCircle className="text-green-400" size={24} />
            <div>
                <h4 className="font-bold">Sucesso!</h4>
                <p className="text-sm text-slate-300">{successMessage}</p>
            </div>
        </div>
      )}
    </div>
  );
};