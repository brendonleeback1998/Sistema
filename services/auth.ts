import { AdminUser, Student, StudentStatus } from '../types';
import { storage } from './storage';

interface AuthResponse {
  success: boolean;
  user?: AdminUser | Student;
  role?: 'admin' | 'student';
  message?: string;
}

export const authService = {
  /**
   * Autentica um usuário no sistema (Admin ou Aluno)
   */
  login: async (login: string, password: string, type: 'admin' | 'student'): Promise<AuthResponse> => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!login || !password) {
      return { success: false, message: 'Por favor, preencha login e senha.' };
    }

    const cleanLogin = login.trim();

    if (type === 'admin') {
      return authService.authenticateAdmin(cleanLogin, password);
    } else {
      return authService.authenticateStudent(cleanLogin, password);
    }
  },

  /**
   * Lógica de Autenticação de Administrador
   */
  authenticateAdmin: (username: string, password: string): AuthResponse => {
    const admins = storage.getAdmins();
    const admin = admins.find(a => a.username.toLowerCase() === username.toLowerCase());

    if (!admin) {
      return { success: false, message: 'Usuário administrador não encontrado.' };
    }

    if (!admin.active) {
      return { success: false, message: 'Acesso bloqueado. Contate o suporte.' };
    }

    // Em produção, aqui haveria comparação de hash (ex: bcrypt)
    if (admin.password !== password) {
      return { success: false, message: 'Senha incorreta.' };
    }

    return { success: true, user: admin, role: 'admin' };
  },

  /**
   * Lógica de Autenticação de Aluno
   * Regra: Login Personalizado OU Nome. Senha Pessoal OU Data Nasc (DDMMAAAA).
   */
  authenticateStudent: (identifier: string, password: string): AuthResponse => {
    const students = storage.getStudents();
    
    // 1. Busca o aluno pelo Login ou Nome
    const student = students.find(s => {
      const isCustomLogin = s.customLogin && s.customLogin.toLowerCase() === identifier.toLowerCase();
      const isNameMatch = s.name.toLowerCase() === identifier.toLowerCase();
      return isCustomLogin || isNameMatch;
    });

    if (!student) {
      return { success: false, message: 'Aluno não encontrado. Verifique seu login.' };
    }

    // 2. Verifica Status
    if (student.status === StudentStatus.Inactive) {
      return { success: false, message: 'Matrícula inativa. Procure a secretaria.' };
    }

    // 3. Validação de Senha
    let isPasswordValid = false;

    // Caso A: Aluno já definiu senha personalizada
    if (student.password) {
      if (student.password === password) {
        isPasswordValid = true;
      }
    } 
    // Caso B: Senha Padrão (Data de Nascimento DDMMAAAA)
    else if (student.birthDate) {
      // Converte YYYY-MM-DD para DDMMAAAA
      const [year, month, day] = student.birthDate.split('-');
      const defaultPassword = `${day}${month}${year}`;
      
      if (password === defaultPassword) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
       // Se o aluno tentou usar data de nascimento mas já tem senha definida
       if (student.password && student.birthDate) {
          const [year, month, day] = student.birthDate.split('-');
          const defaultPassword = `${day}${month}${year}`;
          if (password === defaultPassword) {
             return { success: false, message: 'Você já definiu uma senha pessoal. Não use mais sua data de nascimento.' };
          }
       }
       return { success: false, message: 'Senha incorreta.' };
    }

    return { success: true, user: student, role: 'student' };
  }
};