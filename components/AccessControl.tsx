import React, { useState } from 'react';
import { Student, AdminUser, StudentStatus } from '../types';
import { storage } from '../services/storage';
import { User, Shield, Lock, Power, Trash2, Plus, Save, Key, Search, X } from 'lucide-react';

interface AccessControlProps {
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
}

export const AccessControl: React.FC<AccessControlProps> = ({ students, onUpdateStudents }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'admins'>('admins');
  const [admins, setAdmins] = useState<AdminUser[]>(() => storage.getAdmins());
  
  // Student Search
  const [studentSearch, setStudentSearch] = useState('');

  // Admin Form
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState<Partial<AdminUser>>({
    name: '', username: '', password: '', role: 'admin', active: true
  });

  // Student Access Edit Form
  const [isEditingStudentAccess, setIsEditingStudentAccess] = useState(false);
  const [studentAccessForm, setStudentAccessForm] = useState({
      id: '',
      name: '',
      customLogin: '',
      password: ''
  });

  // --- ADMIN LOGIC ---
  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.username || !adminForm.name) return;

    if (adminForm.id) {
      // Edit
      const updated = storage.updateAdmin(adminForm as AdminUser);
      setAdmins(updated);
    } else {
      // Create
      if (!adminForm.password) {
        alert("Senha é obrigatória para novos usuários.");
        return;
      }
      
      // Destructure to remove potential undefined 'id' from form and avoid TS2783 (duplicate property)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...adminData } = adminForm as AdminUser;
      
      const newAdmin: AdminUser = {
        id: Date.now().toString(),
        ...adminData
      };
      const updated = storage.addAdmin(newAdmin);
      setAdmins(updated);
    }
    setIsEditingAdmin(false);
    setAdminForm({ name: '', username: '', password: '', role: 'admin', active: true });
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setAdminForm({ ...admin }); // Password stays hidden or optional on edit
    setIsEditingAdmin(true);
  };

  const handleDeleteAdmin = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Tem certeza? Este usuário perderá acesso ao sistema.")) {
      const updated = storage.deleteAdmin(id);
      setAdmins(updated);
    }
  };

  const handleToggleAdminStatus = (admin: AdminUser) => {
    const updated = storage.updateAdmin({ ...admin, active: !admin.active });
    setAdmins(updated);
  };

  // --- STUDENT LOGIC ---
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const getStudentPassword = (student: Student) => {
    if (student.password) return "******** (Personalizada)";
    // Logic from LoginScreen: DDMMAAAA based on birthDate
    if (!student.birthDate) return "Data Nasc. não cadastrada";
    const [year, month, day] = student.birthDate.split('-');
    return `${day}${month}${year}`;
  };

  const getStudentLogin = (student: Student) => {
      if (student.customLogin) return `${student.customLogin}`;
      return student.name;
  };

  const toggleStudentStatus = (student: Student) => {
    const newStatus = student.status === StudentStatus.Active ? StudentStatus.Inactive : StudentStatus.Active;
    const updatedList = storage.updateStudent({ ...student, status: newStatus });
    onUpdateStudents(updatedList);
  };

  const handleOpenStudentAccess = (student: Student) => {
    setStudentAccessForm({
        id: student.id,
        name: student.name,
        customLogin: student.customLogin || '',
        password: student.password || ''
    });
    setIsEditingStudentAccess(true);
  };

  const handleSaveStudentAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === studentAccessForm.id);
    if (!student) return;

    // Atualiza apenas os campos de acesso
    // Se a senha estiver vazia, remove a propriedade (undefined) para voltar ao padrão
    const updatedStudent = {
        ...student,
        customLogin: studentAccessForm.customLogin || undefined, 
        password: studentAccessForm.password || undefined 
    };

    const updatedList = storage.updateStudent(updatedStudent);
    onUpdateStudents(updatedList);
    setIsEditingStudentAccess(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Controle de Acesso & Permissões</h2>
          <p className="text-sm text-slate-500">Gerencie quem pode acessar o sistema e o aplicativo.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'admins' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Administradores
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Alunos (App)
          </button>
        </div>
      </div>

      {activeTab === 'admins' && (
        <div className="space-y-6">
          {/* Admin List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {admins.map(admin => (
               <div key={admin.id} className={`bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between transition-all ${!admin.active ? 'opacity-70 bg-slate-50' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${admin.role === 'admin' ? 'bg-slate-900' : 'bg-slate-500'}`}>
                           {admin.name.charAt(0)}
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-800">{admin.name}</h3>
                           <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Shield size={10} /> {admin.role === 'admin' ? 'Acesso Total' : 'Gerente (Limitado)'}
                           </p>
                        </div>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${admin.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {admin.active ? 'Ativo' : 'Inativo'}
                     </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                     <p className="text-xs text-slate-400 uppercase font-bold mb-1">Credenciais de Acesso</p>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-700">Login: <strong>{admin.username}</strong></span>
                        <div className="flex items-center gap-1 text-slate-400" title="Senha oculta">
                           <Key size={14} /> ******
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 pt-4">
                     <button 
                        onClick={() => handleEditAdmin(admin)}
                        className="flex-1 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                     >
                        Editar
                     </button>
                     <button 
                        onClick={() => handleToggleAdminStatus(admin)}
                        className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg border border-slate-200"
                        title={admin.active ? "Desativar Usuário" : "Ativar Usuário"}
                     >
                        <Power size={18} />
                     </button>
                     <button 
                        type="button"
                        onClick={(e) => handleDeleteAdmin(admin.id, e)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200"
                        title="Excluir Usuário"
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
               </div>
             ))}

             {/* Card Adicionar Novo */}
             <button 
                onClick={() => {
                  setAdminForm({ name: '', username: '', password: '', role: 'admin', active: true });
                  setIsEditingAdmin(true);
                }}
                className="bg-slate-50 hover:bg-white border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-slate-600 transition-all min-h-[200px]"
             >
                <div className="bg-white p-3 rounded-full shadow-sm">
                   <Plus size={24} />
                </div>
                <span className="font-medium">Adicionar Administrador</span>
             </button>
          </div>

          {/* Modal Edit/Create Admin */}
          {isEditingAdmin && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border border-slate-200">
                   <div className="bg-slate-900 p-4 text-white flex justify-between items-center border-b border-slate-800">
                      <h3 className="font-bold flex items-center gap-2">
                         <Shield size={18} />
                         {adminForm.id ? 'Editar Usuário' : 'Novo Usuário Admin'}
                      </h3>
                   </div>
                   <form onSubmit={handleSaveAdmin} className="p-6 space-y-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">Nome Completo</label>
                         <input 
                           type="text" required 
                           className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 placeholder-slate-400"
                           value={adminForm.name}
                           onChange={e => setAdminForm({...adminForm, name: e.target.value})}
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">Login (Usuário)</label>
                         <input 
                           type="text" required 
                           className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 placeholder-slate-400"
                           value={adminForm.username}
                           onChange={e => setAdminForm({...adminForm, username: e.target.value})}
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">
                            {adminForm.id ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                         </label>
                         <div className="relative">
                            <input 
                              type="password"
                              className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 placeholder-slate-400"
                              value={adminForm.password}
                              onChange={e => setAdminForm({...adminForm, password: e.target.value})}
                              placeholder="******"
                            />
                            <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                         </div>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">Permissões</label>
                         <select 
                           className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900"
                           value={adminForm.role}
                           onChange={e => setAdminForm({...adminForm, role: e.target.value as any})}
                         >
                            <option value="admin">Administrador (Total)</option>
                            <option value="manager">Gerente (Limitado)</option>
                         </select>
                      </div>

                      <div className="pt-4 flex gap-3">
                         <button 
                           type="button" 
                           onClick={() => setIsEditingAdmin(false)}
                           className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                         >
                            Cancelar
                         </button>
                         <button 
                           type="submit" 
                           className="flex-1 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                         >
                            <Save size={18} /> Salvar
                         </button>
                      </div>
                   </form>
                </div>
             </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                   type="text" 
                   placeholder="Buscar aluno para gerenciar acesso..."
                   className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-slate-900 placeholder-slate-400"
                   value={studentSearch}
                   onChange={e => setStudentSearch(e.target.value)}
                />
             </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs border-b border-slate-200">
                   <tr>
                      <th className="px-6 py-4">Aluno</th>
                      <th className="px-6 py-4">Login (Nome)</th>
                      <th className="px-6 py-4">Senha</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                            <img src={student.photoUrl} className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
                            {student.name}
                         </td>
                         <td className="px-6 py-4 text-slate-600">
                            {getStudentLogin(student)}
                            {student.customLogin && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Personalizado</span>}
                         </td>
                         <td className="px-6 py-4 text-slate-500 font-mono bg-slate-50 w-fit">
                            {getStudentPassword(student)}
                         </td>
                         <td className="px-6 py-4">
                             <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${student.status === StudentStatus.Active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {student.status}
                             </span>
                         </td>
                         <td className="px-6 py-4 text-right flex justify-end gap-2">
                             <button
                                onClick={() => handleOpenStudentAccess(student)}
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                                title="Editar Credenciais (Login/Senha)"
                             >
                                <Key size={14} />
                             </button>
                             <button 
                                onClick={() => toggleStudentStatus(student)}
                                className={`p-2 rounded-lg border transition-colors flex items-center gap-2 text-xs font-medium
                                   ${student.status === StudentStatus.Active 
                                      ? 'border-red-200 text-red-700 hover:bg-red-50' 
                                      : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                                title={student.status === StudentStatus.Active ? 'Bloquear' : 'Liberar'}
                             >
                                <Power size={14} />
                             </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
             {filteredStudents.length === 0 && (
                <div className="p-8 text-center text-slate-400">Nenhum aluno encontrado.</div>
             )}
          </div>

          {/* Modal Edit Student Access */}
          {isEditingStudentAccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border border-slate-200">
                   <div className="bg-slate-900 p-4 text-white flex justify-between items-center border-b border-slate-800">
                      <h3 className="font-bold flex items-center gap-2">
                         <Key size={18} />
                         Credenciais do Aluno
                      </h3>
                      <button onClick={() => setIsEditingStudentAccess(false)} className="hover:bg-slate-800 p-1 rounded text-white">
                         <X size={18} />
                      </button>
                   </div>
                   <form onSubmit={handleSaveStudentAccess} className="p-6 space-y-4">
                      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-2 border border-slate-200">
                         Editando acesso para: <strong className="text-slate-900">{studentAccessForm.name}</strong>
                      </div>

                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">Login Personalizado</label>
                         <input 
                           type="text" 
                           className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none text-slate-900 placeholder-slate-400"
                           placeholder="Deixe em branco para usar o Nome"
                           value={studentAccessForm.customLogin}
                           onChange={e => setStudentAccessForm({...studentAccessForm, customLogin: e.target.value})}
                         />
                         <p className="text-xs text-slate-500 mt-1">Padrão: Nome Completo</p>
                      </div>

                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">Senha de Acesso</label>
                         <input 
                           type="text" 
                           className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none text-slate-900 placeholder-slate-400"
                           placeholder="Deixe em branco para usar Data Nasc."
                           value={studentAccessForm.password}
                           onChange={e => setStudentAccessForm({...studentAccessForm, password: e.target.value})}
                         />
                         <p className="text-xs text-slate-500 mt-1">Padrão: DDMMAAAA (Data Nascimento). <br/>Deixe vazio para restaurar o padrão.</p>
                      </div>

                      <div className="pt-4 flex gap-3">
                         <button 
                           type="button" 
                           onClick={() => setIsEditingStudentAccess(false)}
                           className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                         >
                            Cancelar
                         </button>
                         <button 
                           type="submit" 
                           className="flex-1 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                         >
                            <Save size={18} /> Salvar
                         </button>
                      </div>
                   </form>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};