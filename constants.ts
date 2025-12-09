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
    name: 'Carlos Silva',
    birthDate: '1995-05-10',
    cpf: '123.456.789-00',
    fatherName: 'Roberto Silva',
    motherName: 'Maria Silva',
    email: 'carlos.silva@email.com',
    phone: '(11) 99999-1234',
    emergencyContact: '(11) 99999-0000 (Mãe)',
    belt: BeltColor.Brown,
    status: StudentStatus.Active,
    joinDate: '2020-03-15',
    photoUrl: 'https://picsum.photos/100/100?random=1',
    planId: '2',
    lastExamDate: '2023-11-20',
    beltHistory: [
      { belt: BeltColor.White, date: '2020-03-15', notes: 'Início' },
      { belt: BeltColor.Yellow, date: '2020-09-10' },
      { belt: BeltColor.Red, date: '2021-04-15' },
      { belt: BeltColor.Orange, date: '2021-11-20' },
      { belt: BeltColor.Green, date: '2022-06-15' },
      { belt: BeltColor.Purple, date: '2023-02-10' },
      { belt: BeltColor.Brown, date: '2023-11-20', notes: 'Exame excepcional' }
    ]
  },
  {
    id: '2',
    name: 'Mariana Souza',
    birthDate: '1998-08-22',
    cpf: '234.567.890-11',
    motherName: 'Ana Souza',
    email: 'mari.souza@email.com',
    phone: '(11) 98888-5678',
    emergencyContact: '(11) 98888-1111 (Marido)',
    belt: BeltColor.Green,
    status: StudentStatus.Active,
    joinDate: '2021-06-10',
    photoUrl: 'https://picsum.photos/100/100?random=2',
    planId: '1',
    lastExamDate: '2023-08-15',
    beltHistory: [
      { belt: BeltColor.White, date: '2021-06-10' },
      { belt: BeltColor.Yellow, date: '2021-12-05' },
      { belt: BeltColor.Red, date: '2022-07-20' },
      { belt: BeltColor.Orange, date: '2023-01-15' },
      { belt: BeltColor.Green, date: '2023-08-15' }
    ]
  },
  {
    id: '3',
    name: 'Pedro Santos',
    birthDate: '2010-02-15',
    cpf: '345.678.901-22',
    fatherName: 'João Santos',
    motherName: 'Carla Santos',
    email: 'pedro.santos@email.com',
    phone: '(11) 97777-4321',
    emergencyContact: '(11) 97777-0000 (Pai)',
    belt: BeltColor.White,
    status: StudentStatus.Active,
    joinDate: '2024-01-10',
    planId: '1',
    photoUrl: 'https://picsum.photos/100/100?random=3',
    beltHistory: [
      { belt: BeltColor.White, date: '2024-01-10', notes: 'Matrícula realizada' }
    ]
  },
  {
    id: '4',
    name: 'Ana Oliveira',
    birthDate: '1990-11-30',
    cpf: '456.789.012-33',
    email: 'ana.oli@email.com',
    phone: '(11) 96666-9876',
    emergencyContact: '(11) 96666-1111 (Irmã)',
    belt: BeltColor.Black,
    status: StudentStatus.Inactive,
    joinDate: '2018-02-01',
    photoUrl: 'https://picsum.photos/100/100?random=4',
    lastExamDate: '2022-12-10',
    beltHistory: []
  },
  {
    id: '5',
    name: 'Lucas Pereira',
    birthDate: '2015-07-07',
    cpf: '567.890.123-44',
    fatherName: 'Marcos Pereira',
    motherName: 'Juliana Pereira',
    email: 'lucas.p@email.com',
    phone: '(11) 95555-1122',
    emergencyContact: '(11) 95555-0000 (Mãe)',
    belt: BeltColor.Yellow,
    status: StudentStatus.Paused,
    joinDate: '2023-05-20',
    photoUrl: 'https://picsum.photos/100/100?random=5',
    planId: '5',
    lastExamDate: '2023-09-01',
    beltHistory: [
      { belt: BeltColor.White, date: '2023-05-20' },
      { belt: BeltColor.Yellow, date: '2023-09-01' }
    ]
  },
  {
    id: '6',
    name: 'Brendon',
    birthDate: '1998-06-23',
    cpf: '000.000.000-00',
    fatherName: 'Pai do Brendon',
    motherName: 'Mãe do Brendon',
    email: 'brendon@email.com',
    phone: '(11) 99999-8888',
    emergencyContact: '(11) 97777-6666',
    belt: BeltColor.White,
    status: StudentStatus.Active,
    joinDate: '2024-05-20',
    photoUrl: 'https://ui-avatars.com/api/?name=Brendon&background=random',
    planId: '1',
    beltHistory: [
      { belt: BeltColor.White, date: '2024-05-20', notes: 'Matrícula Inicial' }
    ]
  }
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: '101',
    studentId: '1',
    studentName: 'Carlos Silva',
    amount: 150.00,
    dueDate: '2024-05-10',
    paidDate: '2024-05-08',
    status: PaymentStatus.Paid,
    description: 'Mensalidade Maio/2024',
    type: 'tuition'
  },
  {
    id: '102',
    studentId: '2',
    studentName: 'Mariana Souza',
    amount: 150.00,
    dueDate: '2024-05-10',
    status: PaymentStatus.Overdue,
    description: 'Mensalidade Maio/2024',
    type: 'tuition'
  },
  {
    id: '103',
    studentId: '3',
    studentName: 'Pedro Santos',
    amount: 150.00,
    dueDate: '2024-05-10',
    paidDate: '2024-05-05',
    status: PaymentStatus.Paid,
    description: 'Mensalidade Maio/2024',
    type: 'tuition'
  },
  {
    id: '104',
    studentId: '1',
    studentName: 'Carlos Silva',
    amount: 120.00,
    dueDate: '2024-04-10',
    paidDate: '2024-04-10',
    status: PaymentStatus.Paid,
    description: 'Mensalidade Abril/2024',
    type: 'tuition'
  },
  {
    id: '105',
    studentId: '2',
    studentName: 'Mariana Souza',
    amount: 80.00,
    dueDate: '2024-05-15',
    status: PaymentStatus.Pending,
    description: 'Exame de Faixa',
    type: 'service'
  },
  {
    id: '106',
    studentId: '5',
    studentName: 'Lucas Pereira',
    amount: 150.00,
    dueDate: '2024-05-10',
    status: PaymentStatus.Pending,
    description: 'Mensalidade Maio/2024',
    type: 'tuition'
  },
  {
    id: '107',
    studentId: '1',
    studentName: 'Carlos Silva',
    amount: 180.00,
    dueDate: '2024-05-05',
    paidDate: '2024-05-05',
    status: PaymentStatus.Paid,
    description: 'Kimono Iniciante (M)',
    type: 'product',
    productId: 'p1'
  },
  {
    id: '108',
    studentId: '6',
    studentName: 'Brendon',
    amount: 150.00,
    dueDate: new Date().toISOString().split('T')[0],
    status: PaymentStatus.Pending,
    description: 'Mensalidade Atual',
    type: 'tuition'
  }
];

export const MOCK_FINANCIAL_RECORDS: FinancialRecord[] = [
  {
    id: 'f1',
    type: 'expense',
    description: 'Aluguel do Espaço',
    category: 'Infraestrutura',
    amount: 1200.00,
    date: '2024-05-05'
  },
  {
    id: 'f2',
    type: 'expense',
    description: 'Conta de Luz',
    category: 'Utilidades',
    amount: 180.50,
    date: '2024-05-10'
  },
  {
    id: 'f3',
    type: 'income',
    description: 'Venda de Kimono',
    category: 'Loja',
    amount: 250.00,
    date: '2024-05-12'
  },
  {
    id: 'f4',
    type: 'expense',
    description: 'Material de Limpeza',
    category: 'Manutenção',
    amount: 45.90,
    date: '2024-05-15'
  }
];

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