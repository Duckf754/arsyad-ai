
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Role } from './types';
import ChatBubble from './components/ChatBubble';
import ChatInput from './components/ChatInput';
import { getGeminiResponse } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.BOT,
      text: 'Halo! Saya Arsyad AI. Ada yang bisa saya bantu hari ini? 😊',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const botResponseText = await getGeminiResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.BOT,
        text: botResponseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.BOT,
        text: 'Maaf, sepertinya ada masalah teknis. Coba lagi nanti ya!',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-inner">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-none">Arsyad AI</h1>
            <p className="text-xs text-slate-400 mt-1">arsyad dev</p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Status</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-slate-300 font-medium">Online</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 to-slate-950"
      >
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-md">
                <div className="flex gap-1.5 py-1">
                  <span className="typing-dot w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span className="typing-dot w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="typing-dot w-2 h-2 bg-blue-600 rounded-full"></span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center p-2 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm my-4">
              {error}
            </div>
          )}
        </div>
      </main>

      {/* Footer / Input */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      
      {/* Info Panel */}
      <div className="bg-slate-900 text-[10px] text-slate-500 py-2 px-4 text-center border-t border-slate-800">
        Dibuat oleh <strong>Arsyad</strong> • Support Kiki ❤️
      </div>
    </div>
  );
};

export default App;
