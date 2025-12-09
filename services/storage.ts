import { Student, Payment, Plan, FinancialRecord, Product, AdminUser, BeltContent, ChatMessage } from '../types';
import { MOCK_STUDENTS, MOCK_PAYMENTS, MOCK_PLANS, MOCK_FINANCIAL_RECORDS, MOCK_PRODUCTS, MOCK_CONTENT } from '../constants';

// Alterei as chaves para _v3 para forçar um reset nos dados do navegador
const STORAGE_KEYS = {
  STUDENTS: 'dojo_students_db_v3',
  PAYMENTS: 'dojo_payments_db_v3',
  PLANS: 'dojo_plans_db_v3',
  FINANCIAL_RECORDS: 'dojo_financial_records_db_v3',
  PRODUCTS: 'dojo_products_db_v3',
  ADMINS: 'dojo_admins_db_v3',
  CONTENT: 'dojo_content_db_v3',
  MESSAGES: 'dojo_messages_db_v3'
};

// Admin solicitado: Brendon / 1803
const DEFAULT_ADMINS: AdminUser[] = [
  { id: '1', name: 'Brendon', username: 'brendon', password: '1803', role: 'admin', active: true }
];

export const storage = {
  // --- ADMINS ---
  getAdmins: (): AdminUser[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMINS);
      if (stored) return JSON.parse(stored);
    } catch (error) { console.error("Erro admins", error); }
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(DEFAULT_ADMINS));
    return DEFAULT_ADMINS;
  },

  addAdmin: (admin: AdminUser): AdminUser[] => {
    const current = storage.getAdmins();
    const updated = [...current, admin];
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(updated));
    return updated;
  },

  updateAdmin: (updatedAdmin: AdminUser): AdminUser[] => {
    const current = storage.getAdmins();
    const updated = current.map(a => a.id === updatedAdmin.id ? updatedAdmin : a);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(updated));
    return updated;
  },

  deleteAdmin: (id: string): AdminUser[] => {
    const current = storage.getAdmins();
    const updated = current.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(updated));
    return updated;
  },

  // --- CHAT (MENSAGENS) ---
  getMessages: (): ChatMessage[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (stored) return JSON.parse(stored);
    } catch (error) { console.error("Erro messages", error); }
    return [];
  },

  addMessage: (message: ChatMessage): ChatMessage[] => {
    const current = storage.getMessages();
    const updated = [...current, message];
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
    return updated;
  },

  markMessagesAsRead: (studentContextId: string, readerRole: 'admin' | 'student'): ChatMessage[] => {
    const current = storage.getMessages();
    const updated = current.map(msg => {
      // Se o leitor é admin, marca como lidas as mensagens enviadas pelo aluno neste contexto
      if (readerRole === 'admin' && msg.studentContextId === studentContextId && msg.senderId !== 'admin') {
        return { ...msg, read: true };
      }
      // Se o leitor é aluno, marca como lidas as mensagens enviadas pelo admin neste contexto
      if (readerRole === 'student' && msg.studentContextId === studentContextId && msg.senderId === 'admin') {
        return { ...msg, read: true };
      }
      return msg;
    });
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
    return updated;
  },

  // --- CONTEÚDO EDUCACIONAL ---
  getContent: (): BeltContent[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONTENT);
      if (stored) return JSON.parse(stored);
    } catch (error) { console.error("Erro content", error); }
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(MOCK_CONTENT));
    return MOCK_CONTENT;
  },

  addContent: (content: BeltContent): BeltContent[] => {
    const current = storage.getContent();
    const updated = [...current, content];
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(updated));
    return updated;
  },

  updateContent: (updatedContent: BeltContent): BeltContent[] => {
    const current = storage.getContent();
    const updated = current.map(c => c.id === updatedContent.id ? updatedContent : c);
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(updated));
    return updated;
  },

  deleteContent: (id: string): BeltContent[] => {
    const current = storage.getContent();
    const updated = current.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(updated));
    return updated;
  },

  // --- ALUNOS ---
  getStudents: (): Student[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Erro ao carregar banco de dados de alunos:", error);
    }
    
    // Se não houver dados, inicia com o seed (mock)
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(MOCK_STUDENTS));
    return MOCK_STUDENTS;
  },

  // Salva um novo aluno
  addStudent: (student: Student): Student[] => {
    const currentStudents = storage.getStudents();
    const updatedStudents = [...currentStudents, student];
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedStudents));
    return updatedStudents;
  },

  // Atualiza um aluno existente
  updateStudent: (updatedStudent: Student): Student[] => {
    const currentStudents = storage.getStudents();
    const updatedList = currentStudents.map(s => 
      s.id === updatedStudent.id ? updatedStudent : s
    );
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedList));
    return updatedList;
  },

  // Remove um aluno
  deleteStudent: (id: string): Student[] => {
    const currentStudents = storage.getStudents();
    const updatedList = currentStudents.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedList));
    return updatedList;
  },

  // --- PLANOS ---

  getPlans: (): Plan[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLANS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    }
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(MOCK_PLANS));
    return MOCK_PLANS;
  },

  addPlan: (plan: Plan): Plan[] => {
    const current = storage.getPlans();
    const updated = [...current, plan];
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(updated));
    return updated;
  },

  updatePlan: (updatedPlan: Plan): Plan[] => {
    const current = storage.getPlans();
    const updated = current.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(updated));
    return updated;
  },

  deletePlan: (id: string): Plan[] => {
    const current = storage.getPlans();
    const updated = current.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(updated));
    return updated;
  },

  // --- PRODUTOS ---

  getProducts: (): Product[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(MOCK_PRODUCTS));
    return MOCK_PRODUCTS;
  },

  addProduct: (product: Product): Product[] => {
    const current = storage.getProducts();
    const updated = [...current, product];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return updated;
  },

  updateProduct: (updatedProduct: Product): Product[] => {
    const current = storage.getProducts();
    const updated = current.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return updated;
  },

  deleteProduct: (id: string): Product[] => {
    const current = storage.getProducts();
    const updated = current.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return updated;
  },

  // --- FINANCEIRO (MENSALIDADES/VENDAS) ---

  // Carrega pagamentos
  getPayments: (): Payment[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Erro ao carregar banco de dados de financeiro:", error);
    }
    
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(MOCK_PAYMENTS));
    return MOCK_PAYMENTS;
  },

  addPayment: (payment: Payment): Payment[] => {
    const currentPayments = storage.getPayments();
    const updatedPayments = [...currentPayments, payment];
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updatedPayments));
    return updatedPayments;
  },

  updatePayment: (updatedPayment: Payment): Payment[] => {
    const currentPayments = storage.getPayments();
    const updated = currentPayments.map(p => p.id === updatedPayment.id ? updatedPayment : p);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updated));
    return updated;
  },

  deletePayment: (id: string): Payment[] => {
    const currentPayments = storage.getPayments();
    const updated = currentPayments.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updated));
    return updated;
  },

  // --- FLUXO DE CAIXA (RECORDS) ---

  getFinancialRecords: (): FinancialRecord[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FINANCIAL_RECORDS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Erro ao carregar fluxo de caixa:", error);
    }
    localStorage.setItem(STORAGE_KEYS.FINANCIAL_RECORDS, JSON.stringify(MOCK_FINANCIAL_RECORDS));
    return MOCK_FINANCIAL_RECORDS;
  },

  addFinancialRecord: (record: FinancialRecord): FinancialRecord[] => {
    const current = storage.getFinancialRecords();
    const updated = [...current, record];
    localStorage.setItem(STORAGE_KEYS.FINANCIAL_RECORDS, JSON.stringify(updated));
    return updated;
  },

  deleteFinancialRecord: (id: string): FinancialRecord[] => {
    const current = storage.getFinancialRecords();
    const updated = current.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.FINANCIAL_RECORDS, JSON.stringify(updated));
    return updated;
  }
};