/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Resident } from '../types';
import { Send, Bot, Sparkles, User, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';

interface AIChatAssistantProps {
  residents: Resident[];
  initialInsight?: string;
  selectedResidentId?: string; // currently selected resident filter (if any)
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatAssistant({ residents, initialInsight, selectedResidentId }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeResidentFilter, setActiveResidentFilter] = useState<string>('all');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on active filter
  const generalQuestions = [
    "Who are the top fall risks based on activity dips?",
    "Summarize the overall medication compliance anomalies.",
    "Which residents are placed in the 'Vulnerable' cluster?",
    "Show clinical guidelines for physical therapy recovery."
  ];

  const residentQuestions = [
    "What statistical anomalies occurred for this resident?",
    "How does sleep quality affect their cognitive performance?",
    "Is their blood pressure trend stable or declining?",
    "Suggest customized daily routines to minimize risks."
  ];

  const activeSuggestions = activeResidentFilter === 'all' ? generalQuestions : residentQuestions;

  // Sync resident filter from props if selectedResidentId changes
  useEffect(() => {
    if (selectedResidentId) {
      setActiveResidentFilter(selectedResidentId);
      // Reset chat history for clean context when switching residents
      setMessages([]);
    }
  }, [selectedResidentId]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const payload = {
        question: text,
        history: messages,
        residentId: activeResidentFilter === 'all' ? undefined : activeResidentFilter
      };

      const res = await fetch('/api/mining/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Server failed to respond");
      const data = await res.json();

      const assistantMsg: Message = { role: 'assistant', content: data.text };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Care Assistant is currently offline. Detail: ${err.message || 'Connection error. Please check your local network or API secrets.'}` 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  // Render markdown lines as simple HTML lists/paragraphs
  const renderFormattedText = (rawText: string) => {
    if (!rawText) return null;
    return rawText.split('\n').map((line, idx) => {
      let content = line.trim();
      if (!content) return <div key={idx} className="h-2" />;

      // Header handling
      if (content.startsWith('###')) {
        return <h5 key={idx} className="font-semibold text-stone-900 text-xs mt-3 mb-1.5 uppercase tracking-wide font-mono">{content.replace('###', '').trim()}</h5>;
      }
      if (content.startsWith('##')) {
        return <h4 key={idx} className="font-bold text-stone-900 text-sm mt-4 mb-2 border-b border-stone-100 pb-1">{content.replace('##', '').trim()}</h4>;
      }
      if (content.startsWith('#')) {
        return <h3 key={idx} className="font-extrabold text-stone-950 text-base mt-4 mb-2">{content.replace('#', '').trim()}</h3>;
      }

      // Bullets
      if (content.startsWith('-') || content.startsWith('*')) {
        const textOnly = content.substring(1).trim();
        // Simple bold parser within bullet
        const parts = textOnly.split('**');
        return (
          <li key={idx} className="text-xs text-stone-600 ml-4 list-disc pl-1 leading-relaxed mb-1">
            {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-stone-800">{p}</strong> : p)}
          </li>
        );
      }

      // Paragraph bold parser
      const parts = content.split('**');
      return (
        <p key={idx} className="text-xs text-stone-600 leading-relaxed mb-2.5">
          {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-stone-800">{p}</strong> : p)}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="chat-component">
      {/* Executive Report Panel */}
      <div className="lg:col-span-7 bg-amber-50/20 border border-amber-200/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
            <h4 className="font-sans font-semibold text-stone-800 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              AI Executive Mining Synthesis
            </h4>
            <span className="text-[10px] text-amber-700 bg-amber-100/50 font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Gemini Pro Expert Report
            </span>
          </div>

          <div className="overflow-y-auto max-h-[380px] pr-2 scrollbar-thin">
            {initialInsight ? (
              <div className="space-y-1">
                {renderFormattedText(initialInsight)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-stone-400 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <p className="text-xs">Compiling data models and querying Gemini Clinical Analyst...</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-[10px] text-stone-500 mt-4 leading-relaxed flex gap-2">
          <AlertCircle className="w-5 h-5 text-stone-400 shrink-0" />
          <span>This clinical-grade executive summary is mined directly from the live facility parameters, performing automated trend regression and association mappings before invoking Gemini. Use these findings to supplement care schedules.</span>
        </div>
      </div>

      {/* Interactive Chat Conversation Panel */}
      <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[510px]">
        {/* Header selection */}
        <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-stone-700" />
            <div>
              <h4 className="font-semibold text-stone-800 text-xs">Conversational Care Assistant</h4>
              <p className="text-[10px] text-stone-400">Ask questions regarding mined parameters</p>
            </div>
          </div>

          {/* Context Filter */}
          <select
            value={activeResidentFilter}
            onChange={(e) => {
              setActiveResidentFilter(e.target.value);
              setMessages([]); // Reset chat context on filter change
            }}
            className="bg-stone-100 hover:bg-stone-200 border-none rounded px-2 py-1 text-[10px] font-medium text-stone-700 focus:outline-none"
            id="chat-resident-filter"
          >
            <option value="all">Facility-wide Context</option>
            {residents.map(r => (
              <option key={r.id} value={r.id}>Focus: {r.name.split(' ')[0]}</option>
            ))}
          </select>
        </div>

        {/* Conversation flow */}
        <div className="flex-grow overflow-y-auto py-4 space-y-3 pr-1 max-h-[300px]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-stone-400 p-4 space-y-2">
              <Bot className="w-8 h-8 text-stone-300" />
              <p className="text-xs font-medium text-stone-700">Chat with Assistant</p>
              <p className="text-[10px] text-stone-500 max-w-[200px]">
                {activeResidentFilter === 'all' 
                  ? "Inquire about global clusters, medication association rules, or clinical alarms."
                  : `Inquire specifically about ${residents.find(r => r.id === activeResidentFilter)?.name}'s trends.`}
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${msg.role === 'user' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'}`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`rounded-2xl px-3 py-2 text-xs border leading-relaxed ${msg.role === 'user' ? 'bg-amber-500 text-white border-amber-600 rounded-tr-none' : 'bg-stone-50 text-stone-700 border-stone-200 rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isSending && (
            <div className="flex gap-2.5 max-w-[80%]">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-stone-100 text-stone-700">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="rounded-2xl px-3 py-2 text-xs bg-stone-50 text-stone-400 border border-stone-200 rounded-tl-none animate-pulse">
                Assistant is formulating care response...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Clickable Quick Queries */}
        <div className="space-y-1.5 pt-2 border-t border-stone-100">
          <p className="text-[9px] uppercase font-mono font-bold text-stone-400 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-stone-400" />
            Quick Clinical Queries
          </p>
          <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto scrollbar-none">
            {activeSuggestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isSending}
                className="text-[10px] bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-2.5 py-1 text-left transition truncate max-w-full"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input area */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
          className="flex gap-2 mt-3 pt-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            placeholder={activeResidentFilter === 'all' ? "Ask about facility analytics..." : "Ask specific resident questions..."}
            className="flex-grow bg-stone-50 focus:bg-white text-xs text-stone-800 rounded-lg px-3 py-2.5 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
            id="chat-text-input"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="bg-stone-900 hover:bg-stone-950 text-white p-2.5 rounded-lg disabled:opacity-40 transition flex items-center justify-center"
            id="chat-send-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
