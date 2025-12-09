/**
 * BACKEND SERVER EXAMPLE (Node.js + Express + Mercado Pago)
 * 
 * Este código não roda no navegador. Ele serve como guia para você
 * criar seu servidor backend real para processar pagamentos de verdade.
 * 
 * Instalação:
 * npm install express mercadopago cors body-parser dotenv
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mercadopago = require('mercadopago');

const app = express();
app.use(express.json());
app.use(cors());

// Configuração do Mercado Pago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN // Seu Access Token de Produção
});

// Rota para Criar Preferência de Pagamento (PIX, Cartão, Boleto)
app.post('/api/create_payment', async (req, res) => {
  try {
    const { items, payer } = req.body;

    // Estrutura do pagamento
    const paymentData = {
      transaction_amount: items[0].unit_price,
      description: items[0].title,
      payment_method_id: req.body.paymentMethodId, // 'pix', 'master', 'visa'
      payer: {
        email: payer.email,
        first_name: payer.name.split(' ')[0],
        last_name: payer.name.split(' ').slice(1).join(' '),
        identification: {
          type: 'CPF',
          number: payer.cpf
        }
      }
    };

    // Se for cartão, precisa do token gerado no frontend
    if (req.body.token) {
      paymentData.token = req.body.token;
      paymentData.installments = 1;
    }

    const payment = await mercadopago.payment.create(paymentData);

    // Retorna QR Code (para PIX) ou Status (para Cartão)
    res.json({
      id: payment.body.id,
      status: payment.body.status,
      qr_code: payment.body.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: payment.body.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: payment.body.transaction_details?.external_resource_url
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});

// Webhook para receber notificações do Mercado Pago
app.post('/api/webhook', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'payment') {
    try {
      const payment = await mercadopago.payment.get(data.id);
      
      // Aqui você atualiza seu banco de dados
      // Ex: db.payments.update({ remoteId: data.id }, { status: payment.body.status });
      
      console.log(`Pagamento ${data.id} atualizado para: ${payment.body.status}`);
      
      // Se aprovado, envie notificação (WhatsApp/Email)
      if (payment.body.status === 'approved') {
        // sendNotification(payment.body.payer.email, "Pagamento Aprovado!");
      }

    } catch (error) {
      console.error(error);
    }
  }

  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});