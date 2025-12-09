import { GoogleGenAI } from "@google/genai";
import { Student, Payment } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateSchoolInsights = async (
  students: Student[],
  payments: Payment[],
  query: string
): Promise<string> => {
  if (!ai) {
    return "A funcionalidade de IA requer uma chave API do Google Gemini. Configure a variável de ambiente API_KEY para habilitar este recurso.";
  }
  
  try {
    const studentSummary = JSON.stringify(students.map(s => ({
      name: s.name,
      belt: s.belt,
      status: s.status,
      joinDate: s.joinDate
    })));

    const paymentSummary = JSON.stringify(payments.map(p => ({
      student: p.studentName,
      amount: p.amount,
      status: p.status,
      dueDate: p.dueDate,
      desc: p.description
    })));

    const prompt = `
      Você é um assistente administrativo inteligente de uma escola de Karate chamada "Shogukan Karate".
      
      Aqui estão os dados atuais da escola:
      ALUNOS: ${studentSummary}
      FINANCEIRO: ${paymentSummary}
      
      Pergunta do usuário: "${query}"
      
      Instruções:
      1. Responda de forma concisa e profissional, em Português.
      2. Se for uma análise financeira, forneça números.
      3. Se for sobre alunos, mencione nomes e graduações.
      4. Use formatação Markdown simples (negrito, listas) para facilitar a leitura.
      5. Não invente dados que não estão no contexto fornecido.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Desculpe, não consegui gerar uma resposta no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Ocorreu um erro ao processar sua solicitação. Verifique a chave API.";
  }
};

export const draftCommunication = async (
  studentName: string,
  type: 'LATE_PAYMENT' | 'CONGRATS_BELT' | 'WELCOME'
): Promise<string> => {
  if (!ai) {
    return "A funcionalidade de IA requer uma chave API do Google Gemini. Configure a variável de ambiente API_KEY para habilitar este recurso.";
  }
  
  try {
    let context = "";
    if (type === 'LATE_PAYMENT') context = "Cobrança amigável de mensalidade atrasada.";
    if (type === 'CONGRATS_BELT') context = "Parabenização por troca de faixa.";
    if (type === 'WELCOME') context = "Boas vindas ao dojo.";

    const prompt = `Escreva uma mensagem curta e profissional (email ou whatsapp) para o aluno de Karate ${studentName}.
    Contexto: ${context}.
    Tom de voz: Respeitoso, encorajador (estilo Osu!), mas profissional.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Erro ao gerar mensagem.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Erro de conexão com a IA.";
  }
};