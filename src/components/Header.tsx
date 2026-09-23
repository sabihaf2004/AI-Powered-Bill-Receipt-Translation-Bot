import React from 'react';
import { Languages, ReceiptText, History, Printer, Bot, Sparkles, RefreshCw } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { SupportedLanguage } from '../types/receipt';

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onReset: () => void;
  hasActiveReceipt: boolean;
  historyCount: number;
  onOpenHistory: () => void;
  isBotOpen: boolean;
  onToggleBot: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onReset,
  hasActiveReceipt,
  historyCount,
  onOpenHistory,
  isBotOpen,
  onToggleBot,
  onPrint,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-all no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <ReceiptText className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">Bhasha<span className="text-amber-400">Bill</span></span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">
                AI Bot
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              English Receipts → Regional Languages
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1.5 transition-colors">
              <Languages className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 leading-tight">Translate to</span>
                <select
                  value={currentLanguage.id}
                  onChange={(e) => {
                    const selected = SUPPORTED_LANGUAGES.find((l) => l.id === e.target.value);
                    if (selected) onLanguageChange(selected);
                  }}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-4"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id} className="bg-slate-900 text-slate-100">
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
            title="Saved Receipts History"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* If Active Receipt: Print Button */}
          {hasActiveReceipt && (
            <button
              onClick={onPrint}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors hidden sm:flex items-center gap-1.5 text-xs"
              title="Print or Save PDF"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="font-medium">Print</span>
            </button>
          )}

          {/* If Active Receipt: New Scan Button */}
          {hasActiveReceipt && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Bill</span>
            </button>
          )}

          {/* Bot Toggle Button */}
          <button
            onClick={onToggleBot}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              isBotOpen
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span className="hidden xs:inline">Translation Bot</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
