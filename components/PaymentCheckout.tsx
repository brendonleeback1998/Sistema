import React, { useState, useEffect } from 'react';
import { Payment, PaymentMethod, PaymentStatus } from '../types';
import { generatePixPayment, processCreditCardPayment, PixResponse, CardData } from '../services/paymentGateway';
import { CreditCard, QrCode, Lock, CheckCircle, AlertCircle, Loader2, Copy, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';

interface PaymentCheckoutProps {
  payment: Payment;
  onSuccess: (payment: Payment) => void;
  onCancel: () => void;
}

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({ payment, onSuccess, onCancel }) => {
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CreditCard);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // PIX State
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  
  // Card State
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  });

  // Init PIX if selected
  useEffect(() => {
    if (method === PaymentMethod.PIX && !pixData) {
      loadPix();
    }
  }, [method]);

  const loadPix = async () => {
    setLoading(true);
    try {
      const data = await generatePixPayment(payment);
      setPixData(data);
      const url = await QRCode.toDataURL(data.qrCode);
      setQrCodeDataUrl(url);
      
      // Simula o webhook de confirmação automática após 10 segundos
      setTimeout(() => {
        handleSuccess('PIX', `pix_${Date.now()}`);
      }, 10000);

    } catch (e) {
      setError("Erro ao gerar PIX. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await processCreditCardPayment(payment, cardData);
      if (result.success) {
        handleSuccess('CREDIT_CARD', result.transactionId);
      } else {
        setError(result.message || "Erro no processamento.");
      }
    } catch (e) {
      setError("Erro de conexão com a operadora.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (payMethod: string, txId?: string) => {
    setSuccess(true);
    // Delay para usuário ver a tela de sucesso
    setTimeout(() => {
      const updatedPayment: Payment = {
        ...payment,
        status: PaymentStatus.Paid,
        paidDate: new Date().toISOString().split('T')[0],
        method: payMethod === 'PIX' ? PaymentMethod.PIX : PaymentMethod.CreditCard,
        transactionId: txId
      };
      onSuccess(updatedPayment);
    }, 2500);
  };

  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
  };

  const formatExpiry = (val: string) => {
    return val.replace(/\D/g, '').replace(/(.{2})/, '$1/').substring(0, 5);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Pagamento Aprovado!</h2>
        <p className="text-slate-500">Sua mensalidade foi quitada com sucesso.</p>
        <p className="text-sm text-slate-400 mt-4">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 border-b border-slate-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Checkout Seguro</h3>
            <p className="text-sm text-slate-500">Shogukan Karate Pagamentos</p>
          </div>
          <div className="text-right">
             <p className="text-xs text-slate-500 uppercase font-bold">Total a Pagar</p>
             <p className="text-2xl font-bold text-slate-900">R$ {payment.amount.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Method Selector */}
        <div className="flex gap-3">
          <button 
            onClick={() => setMethod(PaymentMethod.CreditCard)}
            className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all ${
              method === PaymentMethod.CreditCard 
                ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CreditCard size={18} />
            Cartão de Crédito
          </button>
          <button 
            onClick={() => setMethod(PaymentMethod.PIX)}
            className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all ${
              method === PaymentMethod.PIX 
                ? 'bg-green-600 text-white border-green-600 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="w-4 h-4 bg-current rounded-sm rotate-45 flex items-center justify-center">
                <div className="w-2 h-2 bg-current rounded-full invert"></div>
            </div>
            PIX
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        {method === PaymentMethod.CreditCard && (
          <form onSubmit={handleCardSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
             <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-4">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Cartão de Crédito</span>
                    <div className="flex gap-2">
                        <div className="w-8 h-5 bg-slate-200 rounded"></div>
                        <div className="w-8 h-5 bg-slate-200 rounded"></div>
                        <div className="w-8 h-5 bg-slate-200 rounded"></div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Número do Cartão</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                                placeholder="0000 0000 0000 0000"
                                value={formatCardNumber(cardData.number)}
                                onChange={e => setCardData({...cardData, number: e.target.value})}
                                required
                                maxLength={19}
                            />
                            <CreditCard className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Nome no Cartão</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-none uppercase"
                            placeholder="COMO NO CARTÃO"
                            value={cardData.holder}
                            onChange={e => setCardData({...cardData, holder: e.target.value.toUpperCase()})}
                            required
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Validade</label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-none text-center"
                                placeholder="MM/AA"
                                value={formatExpiry(cardData.expiry)}
                                onChange={e => setCardData({...cardData, expiry: e.target.value})}
                                required
                                maxLength={5}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-500 mb-1">CVV</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                    placeholder="123"
                                    value={cardData.cvv}
                                    onChange={e => setCardData({...cardData, cvv: e.target.value.replace(/\D/g,'')})}
                                    required
                                    maxLength={4}
                                />
                                <Lock className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             {error && (
               <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                 <AlertCircle size={16} />
                 {error}
               </div>
             )}

             <button 
               type="submit" 
               disabled={loading}
               className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
             >
               {loading ? <Loader2 className="animate-spin" /> : <Lock size={18} />}
               {loading ? 'Processando...' : `Pagar R$ ${payment.amount.toFixed(2)}`}
             </button>
             
             <div className="flex justify-center items-center gap-2 text-xs text-slate-400 mt-2">
                <Lock size={12} /> Pagamento criptografado e seguro
             </div>
          </form>
        )}

        {method === PaymentMethod.PIX && (
          <div className="flex flex-col items-center animate-in slide-in-from-right-4 duration-300">
             {loading && !pixData ? (
               <div className="py-20 flex flex-col items-center gap-4 text-slate-500">
                 <Loader2 className="animate-spin text-green-600" size={40} />
                 <p>Gerando QR Code PIX...</p>
               </div>
             ) : (
               <>
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col items-center">
                    {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR Code PIX" className="w-48 h-48 mix-blend-multiply" />}
                 </div>

                 <div className="w-full bg-slate-100 p-3 rounded-lg flex items-center gap-2 border border-slate-200 mb-6 relative group">
                    <p className="text-xs font-mono text-slate-600 truncate flex-1 px-2">
                        {pixData?.copyPaste}
                    </p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(pixData?.copyPaste || '');
                        alert("Código PIX copiado!");
                      }}
                      className="bg-white text-slate-700 hover:text-green-600 p-2 rounded shadow-sm border border-slate-200 transition-colors"
                    >
                        <Copy size={16} />
                    </button>
                 </div>

                 <div className="text-center space-y-2 mb-6">
                    <h4 className="font-bold text-slate-900">Como pagar?</h4>
                    <ol className="text-sm text-slate-600 text-left space-y-2 list-decimal list-inside bg-white p-4 rounded-lg border border-slate-200">
                        <li>Abra o aplicativo do seu banco</li>
                        <li>Escolha <strong>PIX</strong> e depois <strong>Ler QR Code</strong></li>
                        <li>Escaneie a imagem acima ou use o Copia e Cola</li>
                        <li>Confirme o valor de <strong>R$ {payment.amount.toFixed(2)}</strong></li>
                    </ol>
                 </div>

                 <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-pulse">
                    <Smartphone size={16} />
                    Aguardando confirmação do banco...
                 </div>
               </>
             )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <button 
          onClick={onCancel}
          className="w-full py-2 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors"
        >
          Cancelar e Voltar
        </button>
      </div>
    </div>
  );
};