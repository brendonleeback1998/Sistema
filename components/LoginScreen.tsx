import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Student } from '../types';
import { authService } from '../services/auth';

interface LoginScreenProps {
  onLogin: (role: 'admin' | 'student', userData?: any) => void;
  students?: Student[]; // Mantido para compatibilidade, mas authService busca do storage
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [role, setRole] = useState<'admin' | 'student'>('admin');
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(identifier, password, role);

      if (response.success && response.user) {
        onLogin(response.role as 'admin' | 'student', response.user);
      } else {
        setError(response.message || 'Erro ao autenticar.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center text-white border-b border-slate-800">
          <div className="w-16 h-16 bg-red-700 rounded-xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 transform rotate-3 shadow-lg">
            S
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Shogukan Karate</h1>
          <p className="text-slate-400 text-sm mt-1">Acesso Restrito</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-white">
          <button 
            onClick={() => { setRole('admin'); setError(''); setIdentifier(''); setPassword(''); }}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${role === 'admin' ? 'text-red-700 border-b-2 border-red-700 bg-red-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            Administração
          </button>
          <button 
            onClick={() => { setRole('student'); setError(''); setIdentifier(''); setPassword(''); }}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${role === 'student' ? 'text-red-700 border-b-2 border-red-700 bg-red-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            Portal do Aluno
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-6 bg-white">
          
          {role === 'student' && (
             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2 text-xs text-blue-800">
                <Shield size={16} className="shrink-0" />
                <p>
                  Primeiro acesso? Use seu <strong>Nome Completo</strong> e sua <strong>Data de Nascimento</strong> (apenas números, ex: 25121990) como senha.
                </p>
             </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {role === 'admin' ? 'Usuário' : 'Login ou Nome Completo'}
              </label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none transition-all placeholder-slate-400"
                  placeholder={role === 'admin' ? 'Seu usuário' : 'Ex: João da Silva'}
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                />
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input 
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none transition-all placeholder-slate-400"
                  placeholder={role === 'admin' ? 'Sua senha' : 'Senha pessoal ou Data Nasc (DDMMAAAA)'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2 animate-in fade-in">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-red-900/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={18} />}
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
        
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-500 border-t border-slate-200">
          &copy; 2024 Shogukan Karate. Segurança e Performance.
        </div>
      </div>
    </div>
  );
};