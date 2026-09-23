import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  MessageSquare,
  CornerDownLeft,
  RotateCcw
} from 'lucide-react';
import { ReceiptData, ChatMessage } from '../types/receipt';
import { speakWithBrowser } from '../utils/audio';

interface ChatBotProps {
  receipt: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
  langCode: string;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({
  receipt,
  isOpen,
  onClose,
  langCode,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const defaultSuggestions = [
    'Explain the taxes and charges on this bill',
    'Can I return or exchange any item from this receipt?',
    'Is the restaurant service charge mandatory?',
    'Which item on this bill was the most expensive?',
    'Explain the medicines and dosage warnings',
  ];

  // Initialize greeting on open or receipt change
  useEffect(() => {
    if (messages.length === 0 && receipt) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `नमस्ते! मैं आपका **BhashaBill AI असिस्टेंट** हूँ। मैंने **${receipt.merchant.translatedName}** की रसीद का विश्लेषण किया है (कुल: ${receipt.currency.symbol}${receipt.financials.grandTotal})। \n\nआप इस बिल के किसी भी सामान, टैक्स, छूट या रिटर्न पॉलिसी के बारे में मुझसे अपनी भाषा में कुछ भी पूछ सकते हैं!`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [receipt]);

  // Handle external question triggers (e.g. clicking "Ask Bot" on an item)
  useEffect(() => {
    if (externalPrompt && externalPrompt.trim()) {
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputMessage).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptData: receipt,
          targetLanguage: receipt?.targetLanguage || 'Hindi',
          messages: [...messages, userMsg],
          question: text,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || 'Failed to receive response');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `क्षमा करें, आपके प्रश्न का उत्तर देने में समस्या हुई: ${err.message || 'कृपया दोबारा प्रयास करें।'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSpeak = async (msgId: string, text: string) => {
    if (playingMsgId === msgId) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setPlayingMsgId(null);
      return;
    }

    setPlayingMsgId(msgId);
    try {
      // Remove markdown asterisks for clean speech
      const cleanText = text.replace(/[*#_`]/g, '');
      await speakWithBrowser(cleanText, langCode);
    } finally {
      setPlayingMsgId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md h-[550px] max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
      {/* Bot Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-amber-500/20 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white">BhashaBill Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400">
              Ask any doubt about this receipt in your language
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMessages([])}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-regional leading-relaxed shadow-md ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-slate-950 font-semibold rounded-br-none'
                  : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.role === 'assistant' && (
                <div className="mt-2 pt-1 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-[10px] text-amber-400/90 font-medium">BhashaBot</span>
                  <button
                    onClick={() => handleSpeak(msg.id, msg.content)}
                    className="p-1 hover:text-amber-400 transition-colors"
                    title="Read aloud in regional language"
                  >
                    {playingMsgId === msg.id ? (
                      <VolumeX className="w-3 h-3 text-amber-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-amber-400 font-regional bg-slate-800/50 p-2.5 rounded-xl w-fit border border-slate-700">
            <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>असिस्टेंट रसीद समझकर उत्तर लिख रहा है...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      {messages.length < 5 && (
        <div className="px-3 py-1.5 bg-slate-950/40 border-t border-slate-800/60 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          {defaultSuggestions.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 whitespace-nowrap transition-colors border border-slate-700/60 text-[10px]"
            >
              💬 {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question about this bill in your language..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold disabled:opacity-40 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
