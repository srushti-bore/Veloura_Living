'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShoppingBag,
  ArrowRight,
  Compass,
  Layers,
  Palette
} from 'lucide-react';

export const AIShoppingAssistantDrawer: React.FC = () => {
  const {
    aiMessages,
    isAIOpen,
    setIsAIOpen,
    isAIThinking,
    sendAIMessage,
    addToCart,
    navigate
  } = useStore();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAIOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAIOpen, isAIThinking]);

  if (!isAIOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isAIThinking) return;
    const text = inputVal;
    setInputVal('');
    sendAIMessage(text);
  };

  const quickPrompts = [
    'Pair a coffee table & rug with my bouclé sofa',
    'Curate a warm minimalist bedroom under ₹2 lakh',
    'Recommend an 8-seater dining table in solid walnut',
    'Ergonomic executive desk setup for home study'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsAIOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-[#FCFAF7] shadow-2xl flex flex-col justify-between border-l border-[#4A2C1A]/10 animate-slideLeft">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-[#4A2C1A] to-[#332E29] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#8B5A2B] flex items-center justify-center text-[#F5E6D3] shadow-inner">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-[#F5E6D3] flex items-center gap-1.5">
                  Veloura Spatial Consultant
                </h3>
                <p className="text-[11px] text-[#C6BDB1]">
                  AI Architecture, Proportions & Palette Intelligence
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAIOpen(false)}
              className="p-1.5 text-[#C6BDB1] hover:text-white rounded-full hover:bg-white/10 hover:rotate-90 transition-transform duration-300 active:scale-90 cursor-pointer"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#8B5A2B] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-3`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-soft-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#4A2C1A] text-white rounded-br-none'
                        : 'bg-white text-[#211E1B] border border-[#EEE9E1] rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Room Proportions Tip if present */}
                  {msg.roomTip && (
                    <div className="bg-[#F5E6D3]/60 border border-[#8B5A2B]/20 rounded-xl p-3 text-xs text-[#4A2C1A] flex items-start gap-2">
                      <Compass className="w-4 h-4 text-[#8B5A2B] flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{msg.roomTip}</span>
                    </div>
                  )}

                  {/* Suggested Palette Chips */}
                  {msg.paletteSuggestion && msg.paletteSuggestion.length > 0 && (
                    <div className="bg-white rounded-xl p-3 border border-[#EEE9E1] shadow-soft-sm">
                      <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8B5A2B] mb-2">
                        <Palette className="w-3.5 h-3.5" />
                        Harmonious Material Palette
                      </div>
                      <div className="flex items-center gap-2">
                        {msg.paletteSuggestion.map((hex, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-1">
                            <span
                              className="w-7 h-7 rounded-lg shadow-sm border border-black/10"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-[9px] text-[#9C9287] font-mono">{hex}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Product Cards */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#746B61] flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#8B5A2B]" />
                        Architectural Recommendations ({msg.recommendedProducts.length})
                      </div>
                      {msg.recommendedProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="interactive-card bg-white rounded-xl p-3 border border-[#EEE9E1] shadow-sm flex items-center justify-between gap-3 group"
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F7F4EF] flex-shrink-0">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B]">
                              {prod.room.replace('-', ' ')}
                            </div>
                            <h5 className="font-display font-semibold text-xs text-[#211E1B] truncate">
                              {prod.name}
                            </h5>
                            <div className="text-xs font-bold text-[#4A2C1A] mt-0.5">
                              ₹{(prod.salePrice || prod.price).toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                addToCart(prod);
                              }}
                              className="btn-primary-shimmer text-white p-2 rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                              title="Add to Cart"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setIsAIOpen(false);
                                navigate(`/products/${prod.slug}`);
                              }}
                              className="bg-[#F7F4EF] hover:bg-[#EEE9E1] text-[#4A2C1A] p-1.5 rounded-lg text-[10px] text-center active:scale-95 cursor-pointer transition-colors"
                              title="View Details"
                            >
                              <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#4A2C1A] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isAIThinking && (
              <div className="flex gap-3 items-center text-xs text-[#8B5A2B] animate-pulse">
                <Bot className="w-4 h-4" />
                <span>Veloura Spatial Intelligence is reasoning through proportions and finishes...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Rail */}
          <div className="px-4 py-2 bg-white border-t border-[#EEE9E1] overflow-x-auto whitespace-nowrap space-x-2 flex items-center">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendAIMessage(prompt)}
                className="interactive-pill inline-block text-[11px] bg-[#FCFAF7] hover:bg-[#F5E6D3] text-[#514A43] hover:text-[#4A2C1A] px-3 py-1.5 rounded-full border border-[#DED7CD] cursor-pointer active:scale-95 flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-[#EEE9E1] flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about dimensions, lighting, walnut finishes, or styling..."
              className="flex-1 bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] transition-colors"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isAIThinking}
              className="btn-primary-shimmer disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AIShoppingAssistantDrawer;
