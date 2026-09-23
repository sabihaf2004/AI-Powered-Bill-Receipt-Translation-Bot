/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ReceiptInput } from './components/ReceiptInput';
import { ReceiptTicket } from './components/ReceiptTicket';
import { ChatBot } from './components/ChatBot';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SUPPORTED_LANGUAGES } from './data/languages';
import { ReceiptData, SupportedLanguage } from './types/receipt';
import { AlertCircle, X } from 'lucide-react';

const STORAGE_KEY = 'bhashabill_saved_receipts_v1';

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(SUPPORTED_LANGUAGES[0]);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);
  const [rawInputText, setRawInputText] = useState<string>('');
  const [inputImagePreview, setInputImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ReceiptData[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isBotOpen, setIsBotOpen] = useState<boolean>(false);
  const [botExternalPrompt, setBotExternalPrompt] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load history from localStorage:', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (newReceipt: ReceiptData) => {
    try {
      const updated = [newReceipt, ...history.filter((h) => h.timestamp !== newReceipt.timestamp)].slice(0, 20);
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save history to localStorage:', e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleTranslate = async (params: {
    image?: { mimeType: string; base64: string };
    rawText?: string;
    targetLanguage: string;
    dialectNotes?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Save inputs for side-by-side comparison
    if (params.image) {
      setInputImagePreview(`data:${params.image.mimeType};base64,${params.image.base64}`);
      setRawInputText('');
    } else if (params.rawText) {
      setRawInputText(params.rawText);
      setInputImagePreview(null);
    }

    try {
      const response = await fetch('/api/translate-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to translate receipt. Please check clarity and try again.');
      }

      const receiptResult: ReceiptData = resData.data;
      setActiveReceipt(receiptResult);
      saveToHistory(receiptResult);
    } catch (err: any) {
      console.error('Translation error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while translating the receipt.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskBot = (question: string) => {
    setBotExternalPrompt(question);
    setIsBotOpen(true);
  };

  const handleReset = () => {
    setActiveReceipt(null);
    setRawInputText('');
    setInputImagePreview(null);
    setErrorMessage(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        currentLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onReset={handleReset}
        hasActiveReceipt={!!activeReceipt}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        isBotOpen={isBotOpen}
        onToggleBot={() => setIsBotOpen(!isBotOpen)}
        onPrint={handlePrint}
      />

      {/* Main Container */}
      <main className="flex-1">
        {/* Error Alert */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto px-4 mt-6 no-print">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-200">
                    Translation Issue
                  </h4>
                  <p className="text-xs text-rose-300 mt-0.5">{errorMessage}</p>
                </div>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="p-1 text-rose-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* View Selection: Input Screen or Receipt Ticket */}
        {!activeReceipt ? (
          <ReceiptInput
            onTranslate={handleTranslate}
            isLoading={isLoading}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        ) : (
          <ReceiptTicket
            receipt={activeReceipt}
            rawInputText={rawInputText}
            inputImagePreview={inputImagePreview}
            langCode={selectedLanguage.code}
            onAskBot={handleAskBot}
            onPrint={handlePrint}
          />
        )}
      </main>

      {/* Interactive AI Translation Bot Drawer */}
      <ChatBot
        receipt={activeReceipt}
        isOpen={isBotOpen}
        onClose={() => setIsBotOpen(false)}
        langCode={selectedLanguage.code}
        externalPrompt={botExternalPrompt}
        onClearExternalPrompt={() => setBotExternalPrompt(null)}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectReceipt={(rec) => {
          setActiveReceipt(rec);
          const matchedLang = SUPPORTED_LANGUAGES.find((l) => l.name.toLowerCase() === rec.targetLanguage?.toLowerCase());
          if (matchedLang) setSelectedLanguage(matchedLang);
        }}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
