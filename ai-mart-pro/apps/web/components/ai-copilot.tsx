'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Bot,
  ShoppingBag,
  Mic,
  MicOff,
  RotateCcw,
} from 'lucide-react';
import { Product, money, imageSrc } from '@/lib/api';
import { useApp } from '@/lib/app-context';

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  products?: Product[];
  toolCalls?: string[];
  modelBadge?: string;
  timestamp: string;
};

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { user, setToast, addToCart } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getInitialMessage = (): Message => ({
    id: 'msg-welcome',
    sender: 'ai',
    text:
      user?.role === 'VENDOR'
        ? "Greetings Merchant! I am Nova v2, your Store Intelligence Copilot. Ask me to check low-stock risks, summarize today's sales, or inspect demand forecasts."
        : 'Assalam-o-Alaikum! I am Nova v2, your AI Shopping Assistant. Ask me in English or Roman Urdu ("ANC headphones under 25k", "bohat sasta smart watch", "track my order", "compare products").',
    timestamp: 'Just now',
    modelBadge: 'Nova LLM + Tool Calling',
  });

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleReset = () => {
    setMessages([getInitialMessage()]);
    setToast('Nova conversation reset');
  };

  const handleVoiceToggle = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToast('Web Speech API is not supported in this browser.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onstart = () => {
        setIsListening(true);
        setToast('Listening... Speak now.');
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        void handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const quickPrompts =
    user?.role === 'VENDOR'
      ? [
          'Which products are low stock?',
          "Summarize today's store sales",
          'Check demand forecasting model',
          'Compare catalog pricing',
        ]
      : [
          'ANC headphones under 25k',
          'bohat sasta smart watch',
          'Track my order',
          'Compare flagship audio',
          'What is your return policy?',
        ];

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/backend/api/nova/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: textToSend }),
      });

      if (!res.ok) throw new Error('Nova service unavailable');
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: data.reply || 'I processed your request against the live catalog.',
          products: data.products || [],
          toolCalls: data.toolCalls || [],
          modelBadge: data.toolCalls?.length ? `Tool: ${data.toolCalls[0]}` : 'Nova V2',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: 'Nova AI service is temporarily unreachable. Normal marketplace browsing and checkout remain 100% operational.',
          modelBadge: 'Fallback Mode',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Global Floating Teal & Yellow AI Launcher matching Marketplace Theme */}
      <div className="fixed bottom-[86px] md:bottom-6 right-4 md:right-6 z-[65]">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'linear-gradient(135deg, #0B7A6C, #075E54)',
            boxShadow: '0 10px 28px -4px rgba(11, 122, 108, 0.55)',
          }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full text-white border border-white/20 cursor-pointer"
          aria-label="Toggle Nova AI Assistant"
        >
          <div className="relative flex items-center">
            <Sparkles size={18} className="text-[#FFC531]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFC531] animate-ping" />
          </div>
          <span className="text-xs font-extrabold tracking-wide">Nova AI</span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFC531] text-[#1B1F23]">
            v2.0
          </span>
        </motion.button>
      </div>

      {/* Slide-Up Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[144px] md:bottom-22 right-3 sm:right-6 z-[80] w-[calc(100vw-24px)] sm:w-[430px] h-[580px] max-h-[75vh] bg-white border border-[#E5E7EB] rounded-[20px] shadow-[0_24px_64px_rgba(0,0,0,0.22)] flex flex-col overflow-hidden"
          >
            {/* Teal & Yellow Theme Header */}
            <div
              style={{ background: 'linear-gradient(135deg, #0B7A6C, #075E54)' }}
              className="p-4 text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-[#FFC531] border border-white/25">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Nova AI Assistant</h3>
                    <span className="text-[10px] font-extrabold bg-[#FFC531] text-[#1B1F23] px-2 py-0.5 rounded-full">
                      {user?.role === 'VENDOR' ? 'Vendor Mode' : 'Shopper Mode'}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/85">
                    English · اردو · Roman Urdu · Live Catalog Tools
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset Conversation"
                  aria-label="Reset Conversation"
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Nova Assistant"
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F5F7F8]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#0B7A6C] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-[#1B1F23] border border-[#E5E7EB] rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {msg.sender === 'ai' && msg.modelBadge && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E6F4F1] text-[#0B7A6C] border border-[#0B7A6C]/25">
                          {msg.modelBadge}
                        </span>
                        <span className="text-[9.5px] text-[#6B7280]">Estimate</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Product Mini Cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2 w-full space-y-2">
                      {msg.products.slice(0, 3).map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs"
                        >
                          <img
                            src={imageSrc(prod)}
                            alt={prod.name}
                            className="w-11 h-11 rounded-lg object-cover bg-[#F5F7F8] flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/product/${prod.slug || prod.id}`}
                              onClick={() => setIsOpen(false)}
                              className="text-xs font-bold text-[#1B1F23] hover:text-[#0B7A6C] truncate block"
                            >
                              {prod.name}
                            </Link>
                            <span className="text-xs font-extrabold text-[#0B7A6C]">
                              {money(prod.price)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => addToCart(prod, 1)}
                            className="px-3 py-1.5 rounded-full bg-[#0B7A6C] hover:bg-[#09665A] text-white text-[11px] font-bold flex items-center gap-1 flex-shrink-0 cursor-pointer"
                          >
                            <ShoppingBag size={12} />
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-[#6B7280] mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-[#0B7A6C] font-semibold bg-white border border-[#0B7A6C]/25 px-3 py-2 rounded-xl w-fit">
                  <span className="w-2 h-2 rounded-full bg-[#0B7A6C] animate-ping" />
                  Nova is querying live catalog...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Chips */}
            <div className="px-3 py-2 bg-white border-t border-[#E5E7EB] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void handleSend(q)}
                  className="px-2.5 py-1 rounded-full bg-[#E6F4F1] hover:bg-[#0B7A6C] text-[#0B7A6C] hover:text-white border border-[#0B7A6C]/25 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="p-3 bg-white border-t border-[#E5E7EB] flex items-center gap-2"
            >
              <button
                type="button"
                onClick={handleVoiceToggle}
                aria-label="Voice input"
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-[#FEE2E2] border-[#E53935] text-[#E53935]'
                    : 'bg-[#F5F7F8] border-[#E5E7EB] text-[#6B7280] hover:text-[#0B7A6C]'
                }`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Nova anything in English or Roman Urdu..."
                className="flex-1 h-9 px-3 rounded-xl bg-[#F5F7F8] border border-[#E5E7EB] text-xs text-[#1B1F23] focus:outline-none focus:border-[#0B7A6C]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{ background: 'linear-gradient(135deg, #0B7A6C, #075E54)' }}
                className="h-9 px-3.5 rounded-xl text-white text-xs font-bold flex items-center gap-1 disabled:opacity-45 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
