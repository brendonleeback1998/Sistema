/**
 * MOCK PAYMENT GATEWAY SERVICE
 * 
 * Em produção, este serviço faria chamadas para o seu Backend Node.js
 * que por sua vez comunicaria com Stripe, Mercado Pago, Pagar.me, etc.
 */

import { Payment, PaymentStatus, PaymentMethod } from '../types';

export interface CardData {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

export interface PixResponse {
  qrCode: string;
  copyPaste: string;
  expiresIn: number; // seconds
}

// Simula a geração de um PIX
export const generatePixPayment = async (payment: Payment): Promise<PixResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simula dados reais do PIX Estático/Dinâmico
      const randomId = Math.random().toString(36).substring(7);
      resolve({
        qrCode: `00020126360014BR.GOV.BCB.PIX0114+551199999999520400005303986540${payment.amount.toFixed(2).replace('.', '')}5802BR5913SHOGUKANKARATE6008SAOPAULO62070503***6304${randomId.toUpperCase()}`,
        copyPaste: `00020126360014BR.GOV.BCB.PIX0114+551199999999520400005303986540${payment.amount.toFixed(2).replace('.', '')}5802BR5913SHOGUKANKARATE...`,
        expiresIn: 300 // 5 minutos
      });
    }, 1000);
  });
};

// Simula o processamento do cartão
export const processCreditCardPayment = async (payment: Payment, card: CardData): Promise<{ success: boolean; transactionId?: string; message?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Validação fake básica
      const cleanNum = card.number.replace(/\D/g, '');
      if (cleanNum.length < 13) {
        resolve({ success: false, message: 'Número de cartão inválido.' });
        return;
      }

      // Simula sucesso em 90% dos casos
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        resolve({
          success: true,
          transactionId: `tx_${Math.random().toString(36).substring(2)}`
        });
      } else {
        resolve({
          success: false,
          message: 'Transação recusada pela operadora (Saldo insuficiente ou bloqueio).'
        });
      }
    }, 2000);
  });
};

// Simula Webhook / Polling de status do pagamento
export const checkPaymentStatus = async (transactionId: string): Promise<PaymentStatus> => {
  return new Promise((resolve) => {
    // Em um app real, isso bateria no backend para ver se o webhook do banco chegou
    setTimeout(() => {
      resolve(PaymentStatus.Paid);
    }, 1500);
  });
};