import React, { useState, useEffect, useRef } from 'react';
import { Student, ChatMessage } from '../types';
import { storage } from '../services/storage';
import { Send, User, Search, MessageSquare, Check, Clock } from 'lucide-react';

interface ChatSystemProps {
  currentUserRole: 'admin' | 'student';
  currentStudentId?: string; // Se for aluno, o ID dele. Se admin, undefined.
  students?: Student[]; // Necessário apenas para o admin ver a lista
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ 
  currentUserRole, 
  currentStudentId, 
  students = [] 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => storage.getMessages());
  const [activeChatStudentId, setActiveChatStudentId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Atualizar mensagens periodicamente (simulando tempo real)
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = storage.getMessages();
      // Verifica se houve mudança real antes de setar estado para evitar re-render desnecessário
      if (JSON.stringify(updated) !== JSON.stringify(messages)) {
        setMessages(updated);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [messages]);

  // Se for aluno, o chat ativo é sempre o dele mesmo com o admin
  useEffect(() => {
    if (currentUserRole === 'student' && currentStudentId) {
      setActiveChatStudentId(currentStudentId);
    }
  }, [currentUserRole, currentStudentId]);

  // Scroll para o fim ao receber msg
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatStudentId]);

  // Marcar como lidas ao abrir o chat
  useEffect(() => {
    if (activeChatStudentId) {
      storage.markMessagesAsRead(activeChatStudentId, currentUserRole);
      // Atualiza estado local
      const updated = storage.getMessages();
      setMessages(updated);
    }
  }, [activeChatStudentId, currentUserRole]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatStudentId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      studentContextId: activeChatStudentId,
      senderId: currentUserRole === 'admin' ? 'admin' : activeChatStudentId,
      receiverId: currentUserRole === 'admin' ? activeChatStudentId : 'admin',
      content: inputText,
      timestamp: new Date().toISOString(),
      read: false
    };

    const updatedList = storage.addMessage(newMessage);
    setMessages(updatedList);
    setInputText('');
  };

  // Filtragem de Alunos (Admin View)
  const filteredContactList = students.filter(s => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase())
  ).sort((a, b) => {
    // Ordenar por msg mais recente
    const lastMsgA = messages.filter(m => m.studentContextId === a.id).pop()?.timestamp || '';
    const lastMsgB = messages.filter(m => m.studentContextId === b.id).pop()?.timestamp || '';
    return lastMsgB.localeCompare(lastMsgA);
  });

  // Mensagens do chat atual
  const currentChatMessages = messages.filter(
    m => m.studentContextId === activeChatStudentId
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // --- RENDERIZAÇÃO ---

  // Se for Admin e nenhum chat selecionado (mobile/desktop logic)
  // Para simplificar, desktop sempre mostra sidebar. Mobile alterna.
  
  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-xl border border-slate-200 shadow-sm flex overflow-hidden">
      
      {/* SIDEBAR (Apenas Admin) */}
      {currentUserRole === 'admin' && (
        <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar aluno..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredContactList.map(student => {
              const studentMsgs = messages.filter(m => m.studentContextId === student.id);
              const lastMsg = studentMsgs[studentMsgs.length - 1];
              const unreadCount = studentMsgs.filter(m => !m.read && m.senderId !== 'admin').length;

              return (
                <button
                  key={student.id}
                  onClick={() => setActiveChatStudentId(student.id)}
                  className={`w-full text-left p-4 border-b border-slate-100 flex items-center gap-3 hover:bg-white transition-colors ${activeChatStudentId === student.id ? 'bg-white border-l-4 border-l-red-600 shadow-sm' : ''}`}
                >
                  <div className="relative">
                    <img src={student.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {student.name}
                      </h4>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${unreadCount > 0 ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                      {lastMsg ? (lastMsg.senderId === 'admin' ? 'Você: ' : '') + lastMsg.content : 'Iniciar conversa'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-slate-100 relative">
        {activeChatStudentId ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                {currentUserRole === 'admin' ? (
                  <>
                    <img 
                      src={students.find(s => s.id === activeChatStudentId)?.photoUrl} 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {students.find(s => s.id === activeChatStudentId)?.name}
                      </h3>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-red-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
                    <div>
                      <h3 className="font-bold text-slate-800">Sensei / Administração</h3>
                      <span className="text-xs text-slate-500">Shogukan Karate Dojo</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5]/10">
              {currentChatMessages.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={24} className="text-slate-400" />
                  </div>
                  <p className="text-sm">Nenhuma mensagem ainda.</p>
                  <p className="text-xs">Envie um "Oss!" para iniciar.</p>
                </div>
              )}
              
              {currentChatMessages.map(msg => {
                const isMe = msg.senderId === (currentUserRole === 'admin' ? 'admin' : currentStudentId);
                
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm relative text-sm ${
                      isMe 
                        ? 'bg-red-700 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}>
                      <p className="mb-1">{msg.content}</p>
                      <div className={`text-[10px] flex items-center justify-end gap-1 ${isMe ? 'text-red-200' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {isMe && (
                          msg.read ? <Check size={12} className="text-blue-300" /> : <Clock size={12} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 bg-slate-100 border-0 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-slate-400 text-slate-800"
                  placeholder="Digite uma mensagem..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:hover:bg-red-700 text-white p-3 rounded-lg transition-all flex items-center justify-center shadow-sm"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Selecione um aluno para conversar.</p>
          </div>
        )}
      </div>
    </div>
  );
};