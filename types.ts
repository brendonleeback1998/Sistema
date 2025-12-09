export enum BeltColor {
  White = 'Branca',
  Yellow = 'Amarela',
  Red = 'Vermelha',
  Orange = 'Laranja',
  Green = 'Verde',
  Purple = 'Roxa',
  Brown = 'Marrom',
  Black = 'Preta'
}

export enum PaymentStatus {
  Paid = 'Pago',
  Pending = 'Pendente',
  Overdue = 'Atrasado',
  Processing = 'Processando',
  Failed = 'Falhou'
}

export enum PaymentMethod {
  CreditCard = 'Cartão de Crédito',
  PIX = 'PIX',
  Cash = 'Dinheiro',
  Boleto = 'Boleto'
}

export enum StudentStatus {
  Active = 'Ativo',
  Inactive = 'Inativo',
  Paused = 'Pausado'
}

export interface Plan {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface BeltHistory {
  belt: BeltColor;
  date: string;
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  birthDate: string; 
  cpf: string;       
  email: string;
  phone: string;
  emergencyContact: string; 
  fatherName?: string;      
  motherName?: string;      
  belt: BeltColor;
  status: StudentStatus;
  joinDate: string;
  photoUrl: string;
  planId?: string;
  lastExamDate?: string;
  notes?: string;
  beltHistory?: BeltHistory[];
  // Novos campos para Login Personalizado
  customLogin?: string;
  password?: string;
}

// Interface para Conteúdo Educacional (Novo)
export interface BeltContent {
  id: string;
  title: string;
  description: string;
  belt: BeltColor;
  videoUrl?: string; // URL do YouTube ou Vimeo
  daysToUnlock: number; // Dias após o exame dessa faixa para liberar o conteúdo
  createdAt: string;
}

// Interface para Administradores do Sistema
export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password?: string; // Opcional apenas na listagem segura
  role: 'admin' | 'manager';
  active: boolean;
  lastLogin?: string;
}

// Interface para Mensagens do Chat (Novo)
export interface ChatMessage {
  id: string;
  senderId: string; // ID do aluno ou 'admin'
  receiverId: string; // ID do aluno ou 'admin'
  content: string;
  timestamp: string;
  read: boolean;
  studentContextId: string; // ID do aluno relacionado à conversa (para agrupar no admin)
}

export type PaymentType = 'tuition' | 'product' | 'service';

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  type: PaymentType;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  description: string;
  productId?: string;
  method?: PaymentMethod;
  transactionId?: string; // ID da transação (agrupa parcelas)
  installmentNumber?: number; // Número da parcela (ex: 1)
  totalInstallments?: number; // Total de parcelas (ex: 12)
}

export type TransactionType = 'income' | 'expense';

export interface FinancialRecord {
  id: string;
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  date: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  monthlyRevenue: number;
  pendingRevenue: number;
}