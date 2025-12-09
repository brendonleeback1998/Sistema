import React from 'react';
import { Student, Payment, PaymentStatus, StudentStatus } from '../types';
import { Users, DollarSign, Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  students: Student[];
  payments: Payment[];
  onNavigate: (destination: 'students' | 'financials', filter?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ students, payments, onNavigate }) => {
  // Calculate Stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === StudentStatus.Active).length;
  const currentMonth = new Date().getMonth();
  const currentMonthPayments = payments.filter(p => new Date(p.dueDate).getMonth() === currentMonth);
  const projectedRevenue = currentMonthPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const receivedRevenue = currentMonthPayments
    .filter(p => p.status === PaymentStatus.Paid)
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const overdueCount = payments.filter(p => p.status === PaymentStatus.Overdue).length;

  // Prepare Chart Data
  const chartData = [
    { name: 'Jan', receita: 3200 },
    { name: 'Fev', receita: 3500 },
    { name: 'Mar', receita: 3100 },
    { name: 'Abr', receita: 4000 },
    { name: 'Mai', receita: receivedRevenue }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('students', 'all')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:border-red-200 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider group-hover:text-red-700 transition-colors">Total Alunos</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{totalStudents}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50">
            <p className="text-green-600 text-xs font-medium flex items-center">
                <span className="font-bold mr-1">{activeStudents}</span> Ativos no momento
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('financials', 'cashflow')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:border-green-200 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider group-hover:text-green-700 transition-colors">Receita (Mês)</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">R$ {receivedRevenue}</h3>
            </div>
            <div className="p-2.5 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50">
            <p className="text-slate-400 text-xs">
                De <span className="font-semibold text-slate-600">R$ {projectedRevenue}</span> previstos
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('financials', 'receivables')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:border-red-200 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider group-hover:text-red-700 transition-colors">Pagamentos Atrasados</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{overdueCount}</h3>
            </div>
            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50">
            <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                Ação necessária
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('students', StudentStatus.Active)}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:border-purple-200 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider group-hover:text-purple-700 transition-colors">Taxa de Frequência</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">87%</h3>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50">
            <p className="text-green-600 text-xs font-medium">
                +2.5% vs mês anterior
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Receita Mensal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `R$ ${val}`} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="receita" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#dc2626' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Simple List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Próximos Vencimentos</h3>
          <div className="space-y-4 flex-1">
            {payments
              .filter(p => p.status === PaymentStatus.Pending)
              .slice(0, 5)
              .map(p => (
              <div 
                key={p.id} 
                onClick={() => onNavigate('financials', 'receivables')}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 hover:border-slate-200 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{p.studentName}</p>
                  <p className="text-xs text-slate-500">{new Date(p.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className="text-sm font-medium text-slate-900">R$ {p.amount}</span>
              </div>
            ))}
            {payments.filter(p => p.status === PaymentStatus.Pending).length === 0 && (
                 <p className="text-sm text-slate-500 italic text-center py-4">Nenhum vencimento próximo.</p>
            )}
          </div>
          <button 
            onClick={() => onNavigate('financials', 'receivables')}
            className="w-full mt-4 text-center text-sm text-red-600 font-medium hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            Ver Financeiro Completo <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};