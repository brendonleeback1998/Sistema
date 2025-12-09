import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { Financials } from './components/Financials';
import { AIAssistant } from './components/AIAssistant';
import { PlanManager } from './components/PlanManager';
import { ProductManager } from './components/ProductManager';
import { ContentManager } from './components/ContentManager';
import { LoginScreen } from './components/LoginScreen';
import { StudentPortal } from './components/StudentPortal';
import { POS } from './components/POS';
import { AccessControl } from './components/AccessControl';
import { ChatSystem } from './components/ChatSystem';
import { storage } from './services/storage';
import { Student, Payment, Plan, FinancialRecord, Product, BeltContent } from './types';
import { LayoutDashboard, Users, CreditCard, Sparkles, LogOut, Menu, X, Tag, ShoppingBag, ShoppingCart, Lock, BookOpen, MessageCircle } from 'lucide-react';

enum Tab {
  Dashboard,
  Students,
  Financials,
  POS,
  Plans,
  Products,
  Content,
  Messages,
  AI,
  Access
}

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'student' | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null); // Aluno logado

  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dashboard Navigation State (Deep Linking)
  const [dashboardFilters, setDashboardFilters] = useState({
      studentFilter: 'all',
      financialView: 'cashflow' as 'cashflow' | 'receivables'
  });

  // State initialized from the "Database" (Storage Service)
  const [students, setStudents] = useState<Student[]>(() => storage.getStudents());
  const [payments, setPayments] = useState<Payment[]>(() => storage.getPayments());
  const [plans, setPlans] = useState<Plan[]>(() => storage.getPlans());
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(() => storage.getFinancialRecords());
  const [contents, setContents] = useState<BeltContent[]>(() => storage.getContent());

  const handleLogin = (role: 'admin' | 'student', userData?: any) => {
    setIsAuthenticated(true);
    setUserRole(role);
    
    if (role === 'student' && userData) {
        setCurrentStudent(userData);
    } else {
        setActiveTab(Tab.Dashboard);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentStudent(null);
  };

  const handleDashboardNavigation = (destination: 'students' | 'financials', filter?: string) => {
    if (destination === 'students') {
        setDashboardFilters(prev => ({ ...prev, studentFilter: filter || 'all' }));
        setActiveTab(Tab.Students);
    } else if (destination === 'financials') {
        setDashboardFilters(prev => ({ ...prev, financialView: (filter as 'cashflow' | 'receivables') || 'cashflow' }));
        setActiveTab(Tab.Financials);
    }
  };

  // Student Actions
  const handleAddStudent = (newStudent: Student) => {
    const updatedList = storage.addStudent(newStudent);
    setStudents(updatedList);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updatedList = storage.updateStudent(updatedStudent);
    setStudents(updatedList);
    
    // Se o aluno atualizado for o que está logado agora, atualiza o estado da sessão
    if (currentStudent && currentStudent.id === updatedStudent.id) {
        setCurrentStudent(updatedStudent);
    }
  };
  
  // Wrapper especifico para update em massa vindo do AccessControl
  const handleUpdateStudentsList = (updatedList: Student[]) => {
      // Como o storage é síncrono neste mock, salvamos e setamos
      updatedList.forEach(s => storage.updateStudent(s)); // Ineficiente no mock real, mas ok aqui
      setStudents(storage.getStudents());
  };

  const handleDeleteStudent = (id: string) => {
    const updatedList = storage.deleteStudent(id);
    setStudents(updatedList);
  };

  // Plan Actions
  const handleAddPlan = (newPlan: Plan) => {
    const updatedList = storage.addPlan(newPlan);
    setPlans(updatedList);
  };

  const handleUpdatePlan = (updatedPlan: Plan) => {
    const updatedList = storage.updatePlan(updatedPlan);
    setPlans(updatedList);
  };

  const handleDeletePlan = (id: string) => {
    const updatedList = storage.deletePlan(id);
    setPlans(updatedList);
  };

  // Product Actions
  const handleAddProduct = (newProduct: Product) => {
    const updatedList = storage.addProduct(newProduct);
    setProducts(updatedList);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updatedList = storage.updateProduct(updatedProduct);
    setProducts(updatedList);
  };

  const handleDeleteProduct = (id: string) => {
    const updatedList = storage.deleteProduct(id);
    setProducts(updatedList);
  };

  // Content Actions
  const handleAddContent = (newContent: BeltContent) => {
    const updatedList = storage.addContent(newContent);
    setContents(updatedList);
  };

  const handleUpdateContent = (updatedContent: BeltContent) => {
    const updatedList = storage.updateContent(updatedContent);
    setContents(updatedList);
  };

  const handleDeleteContent = (id: string) => {
    const updatedList = storage.deleteContent(id);
    setContents(updatedList);
  };

  // Payment Actions
  const handleAddPayment = (newPayment: Payment) => {
    const updatedList = storage.addPayment(newPayment);
    setPayments(updatedList);
  };

  const handleUpdatePayment = (updatedPayment: Payment) => {
    const updatedList = storage.updatePayment(updatedPayment);
    setPayments(updatedList);
  };

  const handleDeletePayment = (id: string) => {
    const updatedList = storage.deletePayment(id);
    setPayments(updatedList);
  };

  // Financial Record Actions
  const handleAddFinancialRecord = (record: FinancialRecord) => {
    const updatedList = storage.addFinancialRecord(record);
    setFinancialRecords(updatedList);
  };

  const handleDeleteFinancialRecord = (id: string) => {
    const updatedList = storage.deleteFinancialRecord(id);
    setFinancialRecords(updatedList);
  };

  const NavItem = ({ tab, label, icon: Icon }: { tab: Tab, label: string, icon: any }) => (
    <button
      onClick={() => {
        // Reset filters when clicking nav items manually
        if (tab === Tab.Students) setDashboardFilters(prev => ({...prev, studentFilter: 'all'}));
        if (tab === Tab.Financials) setDashboardFilters(prev => ({...prev, financialView: 'cashflow'}));
        
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        activeTab === tab 
          ? 'bg-red-50 text-red-700 font-semibold shadow-sm' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} className={activeTab === tab ? 'text-red-600' : 'text-slate-400'} />
      {label}
    </button>
  );

  // VIEW 1: Login Screen (se não autenticado)
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} students={students} />;
  }

  // VIEW 2: Student Portal (se for aluno)
  if (userRole === 'student' && currentStudent) {
    return (
        <StudentPortal 
            student={currentStudent} 
            payments={payments}
            onLogout={handleLogout}
            onUpdatePayment={handleUpdatePayment}
            onUpdateStudent={handleUpdateStudent}
        />
    );
  }

  // VIEW 3: Admin Dashboard (se for admin)
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 h-full">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md transform rotate-3">
            S
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight">Shogukan Karate</h1>
            <p className="text-xs text-slate-400 font-medium">Administrador</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem tab={Tab.Dashboard} label="Dashboard" icon={LayoutDashboard} />
          <NavItem tab={Tab.Students} label="Alunos" icon={Users} />
          <NavItem tab={Tab.Messages} label="Mensagens" icon={MessageCircle} />
          <NavItem tab={Tab.Financials} label="Financeiro" icon={CreditCard} />
          <NavItem tab={Tab.POS} label="Vendas (PDV)" icon={ShoppingCart} />
          <NavItem tab={Tab.Plans} label="Planos" icon={Tag} />
          <NavItem tab={Tab.Products} label="Produtos" icon={ShoppingBag} />
          <NavItem tab={Tab.Content} label="Gestão de Conteúdo" icon={BookOpen} />
          
          <div className="pt-4 pb-2">
             <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Administração</p>
             <NavItem tab={Tab.Access} label="Usuários & Acesso" icon={Lock} />
             <NavItem tab={Tab.AI} label="Assistente IA" icon={Sparkles} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)}><X /></button>
             </div>
             <nav className="space-y-2">
                <NavItem tab={Tab.Dashboard} label="Dashboard" icon={LayoutDashboard} />
                <NavItem tab={Tab.Students} label="Alunos" icon={Users} />
                <NavItem tab={Tab.Messages} label="Mensagens" icon={MessageCircle} />
                <NavItem tab={Tab.Financials} label="Financeiro" icon={CreditCard} />
                <NavItem tab={Tab.POS} label="Vendas (PDV)" icon={ShoppingCart} />
                <NavItem tab={Tab.Plans} label="Planos" icon={Tag} />
                <NavItem tab={Tab.Products} label="Produtos" icon={ShoppingBag} />
                <NavItem tab={Tab.Content} label="Gestão de Conteúdo" icon={BookOpen} />
                <NavItem tab={Tab.Access} label="Usuários & Acesso" icon={Lock} />
                <NavItem tab={Tab.AI} label="Assistente IA" icon={Sparkles} />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-medium"
                >
                  <LogOut size={20} />
                  Sair
                </button>
             </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - Mobile Only */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-700 rounded flex items-center justify-center text-white font-bold">S</div>
              <span className="font-bold text-slate-800">Shogukan Karate</span>
           </div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600">
             <Menu />
           </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === Tab.Dashboard && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
                  <p className="text-slate-500">Bem-vindo de volta, Sensei.</p>
                </div>
                <Dashboard 
                    students={students} 
                    payments={payments} 
                    onNavigate={handleDashboardNavigation}
                />
              </div>
            )}
            
            {activeTab === Tab.Students && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <StudentList 
                    students={students} 
                    plans={plans}
                    payments={payments}
                    products={products}
                    initialFilter={dashboardFilters.studentFilter}
                    onAddStudent={handleAddStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onDeleteStudent={handleDeleteStudent}
                    onAddPayment={handleAddPayment}
                    onUpdatePayment={handleUpdatePayment}
                    onDeletePayment={handleDeletePayment}
                  />
               </div>
            )}
            
            {activeTab === Tab.Messages && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Mensagens</h1>
                    <p className="text-slate-500">Comunicação direta com alunos.</p>
                  </div>
                  <ChatSystem 
                    currentUserRole="admin" 
                    students={students} 
                  />
               </div>
            )}

            {activeTab === Tab.Financials && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Financials 
                    payments={payments} 
                    financialRecords={financialRecords}
                    initialView={dashboardFilters.financialView}
                    onAddRecord={handleAddFinancialRecord}
                    onDeleteRecord={handleDeleteFinancialRecord}
                  />
               </div>
            )}

            {activeTab === Tab.POS && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <POS 
                    students={students} 
                    products={products}
                    onAddPayment={handleAddPayment}
                  />
               </div>
            )}

            {activeTab === Tab.Access && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <AccessControl 
                    students={students} 
                    onUpdateStudents={handleUpdateStudentsList}
                  />
               </div>
            )}

            {activeTab === Tab.Plans && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <PlanManager 
                    plans={plans}
                    onAddPlan={handleAddPlan}
                    onUpdatePlan={handleUpdatePlan}
                    onDeletePlan={handleDeletePlan}
                  />
               </div>
            )}

            {activeTab === Tab.Products && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ProductManager 
                    products={products}
                    onAddProduct={handleAddProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                  />
               </div>
            )}

            {activeTab === Tab.Content && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ContentManager 
                    contents={contents}
                    onAddContent={handleAddContent}
                    onUpdateContent={handleUpdateContent}
                    onDeleteContent={handleDeleteContent}
                  />
               </div>
            )}
            
            {activeTab === Tab.AI && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Assistente Inteligente</h1>
                    <p className="text-slate-500">Use a IA para analisar dados e gerar comunicados.</p>
                  </div>
                  <AIAssistant students={students} payments={payments} />
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;