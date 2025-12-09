import { Student, Payment, BeltColor, StudentStatus, PaymentStatus, Plan, FinancialRecord, Product, BeltContent } from './types';

export const MOCK_PLANS: Plan[] = [
  { id: '1', name: 'Mensal - 2x Semana', price: 150.00 },
  { id: '2', name: 'Mensal - Livre', price: 200.00 },
  { id: '3', name: 'Plano Semestral', price: 1000.00 },
  { id: '4', name: 'Plano Anual', price: 1800.00 },
  { id: '5', name: 'Karate Kids', price: 120.00 }
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Kimono Iniciante (M)', price: 180.00, category: 'Uniforme' },
  { id: 'p2', name: 'Faixa Bordada', price: 45.00, category: 'Uniforme' },
  { id: 'p3', name: 'Protetor Bucal', price: 25.00, category: 'Equipamento' },
  { id: 'p4', name: 'Luvas de Kumite', price: 120.00, category: 'Equipamento' },
  { id: 'p5', name: 'Camiseta do Dojo', price: 60.00, category: 'Vestuário' }
];

export const MOCK_CONTENT: BeltContent[] = [
  {
    id: 'c1',
    title: 'Kihon Básico - Posturas',
    description: 'Aprenda as bases Zenkutsu-dachi e Kokutsu-dachi corretamente.',
    belt: BeltColor.White,
    videoUrl: 'https://www.youtube.com/watch?v=xyz123',
    daysToUnlock: 0,
    createdAt: '2024-01-01'
  },
  {
    id: 'c2',
    title: 'Kata Heian Shodan',
    description: 'Passo a passo do primeiro Kata.',
    belt: BeltColor.White,
    videoUrl: 'https://www.youtube.com/watch?v=abc456',
    daysToUnlock: 15, // Libera 15 dias após o início
    createdAt: '2024-01-01'
  },
  {
    id: 'c3',
    title: 'Kata Heian Nidan',
    description: 'Detalhes técnicos e Bunkai.',
    belt: BeltColor.Yellow,
    videoUrl: '',
    daysToUnlock: 0,
    createdAt: '2024-01-01'
  },
  {
    id: 'c4',
    title: 'Combinação de Kumite #1',
    description: 'Sequência de ataque e contra-ataque para exame.',
    belt: BeltColor.Red,
    videoUrl: '',
    daysToUnlock: 30,
    createdAt: '2024-01-01'
  }
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Aluno Modelo',
    birthDate: '1995-05-15',
    cpf: '123.456.789-00',
    fatherName: 'Pai do Aluno',
    motherName: 'Mãe do Aluno',
    email: 'aluno@shogukan.com',
    phone: '(11) 99999-9999',
    emergencyContact: '(11) 98888-8888 (Mãe)',
    belt: BeltColor.Purple,
    status: StudentStatus.Active,
    joinDate: '2022-02-10',
    photoUrl: 'https://ui-avatars.com/api/?name=Aluno+Modelo&background=random&color=fff',
    planId: '2',
    lastExamDate: '2024-01-20',
    notes: 'Aluno dedicado, foco em Kumite.',
    beltHistory: [
      { belt: BeltColor.White, date: '2022-02-10', notes: 'Início' },
      { belt: BeltColor.Yellow, date: '2022-08-15' },
      { belt: BeltColor.Red, date: '2023-02-20' },
      { belt: BeltColor.Orange, date: '2023-08-10' },
      { belt: BeltColor.Green, date: '2024-01-20' }
    ],
    // Login personalizado solicitado
    customLogin: 'aluno',
    password: '1234'
  }
];

export const MOCK_PAYMENTS: Payment[] = [];

export const MOCK_FINANCIAL_RECORDS: FinancialRecord[] = [];

export const BELT_COLORS_MAP: Record<BeltColor, string> = {
  [BeltColor.White]: 'bg-slate-100 border-slate-300 text-slate-700',
  [BeltColor.Yellow]: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  [BeltColor.Red]: 'bg-red-100 border-red-300 text-red-800',
  [BeltColor.Orange]: 'bg-orange-100 border-orange-300 text-orange-800',
  [BeltColor.Green]: 'bg-green-100 border-green-300 text-green-800',
  [BeltColor.Purple]: 'bg-purple-100 border-purple-300 text-purple-800',
  [BeltColor.Brown]: 'bg-amber-800 border-amber-900 text-white',
  [BeltColor.Black]: 'bg-slate-900 border-slate-950 text-white'
};