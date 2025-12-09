import React, { useState, useRef, useEffect } from 'react';
import { Student, Payment } from '../types';
import { generateSchoolInsights } from '../services/geminiService';
import { Sparkles, Send, Bot } from 'lucide-react';

interface AIAssistantProps {
  students: Student[];
  payments: Payment[];
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ students, payments }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Olá Sensei! Eu sou a IA da Shogukan Karate. Posso ajudar analisando o financeiro ou sugerindo ações para os alunos. O que deseja saber?' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    const response = await generateSchoolInsights(students, payments, userMsg);
    
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-red-800 to-red-700 text-white flex items-center gap-2 shadow-sm">
        <Sparkles size={20} className="text-yellow-300" />
        <h2 className="font-bold">Sensei AI</h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-white rounded-br-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold mb-1 uppercase tracking-wider">
                  <Bot size={12} />
                  Shogukan AI
                </div>
              )}
              <div className="whitespace-pre-line leading-relaxed">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2 relative">
          <input
            type="text"
            className="flex-1 bg-slate-100 border-0 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none placeholder:text-slate-400"
            placeholder="Pergunte sobre alunos pendentes, receita..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !query.trim()}
            className="bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:hover:bg-red-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-xs text-center text-slate-400 mt-2">
          A IA pode cometer erros. Verifique as informações financeiras.
        </p>
      </div>
    </div>
  );
};