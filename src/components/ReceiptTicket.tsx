import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  Columns2, 
  Receipt, 
  Search, 
  Store, 
  Calendar, 
  User, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Share2
} from 'lucide-react';
import { ReceiptData } from '../types/receipt';
import { ItemCard } from './ItemCard';
import { TaxDecoder } from './TaxDecoder';
import { PolicyDecoder } from './PolicyDecoder';
import { speakWithBrowser } from '../utils/audio';

interface ReceiptTicketProps {
  receipt: ReceiptData;
  rawInputText?: string;
  inputImagePreview?: string | null;
  langCode: string;
  onAskBot: (question: string) => void;
  onPrint: () => void;
}

export const ReceiptTicket: React.FC<ReceiptTicketProps> = ({
  receipt,
  rawInputText,
  inputImagePreview,
  langCode,
  onAskBot,
  onPrint,
}) => {
  const [viewMode, setViewMode] = useState<'translated' | 'side-by-side' | 'explorer'>('translated');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSpeakingAll, setIsSpeakingAll] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(receipt.items.map((i) => i.category || 'General').filter(Boolean)))];

  const filteredItems = receipt.items.filter((item) => {
    const matchesSearch =
      item.translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.transliteration && item.transliteration.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleReadFullBill = async () => {
    if (isSpeakingAll) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeakingAll(false);
      return;
    }

    setIsSpeakingAll(true);
    try {
      const summaryText = `${receipt.merchant.translatedName} का बिल। कुल राशि: ${receipt.currency.symbol} ${receipt.financials.grandTotal}, ${receipt.financials.grandTotalTranslatedWords}। कुल सामान: ${receipt.items.length} वस्तुएं। ${receipt.overallSummary}`;
      await speakWithBrowser(summaryText, langCode);
    } catch (e) {
      console.warn('Speech error:', e);
    } finally {
      setIsSpeakingAll(false);
    }
  };

  const handleCopyText = () => {
    const formatted = `🧾 ${receipt.merchant.translatedName} (${receipt.merchant.name})
📅 दिनांक: ${receipt.merchant.date || 'N/A'} | बिल सं: ${receipt.merchant.receiptNo || 'N/A'}
------------------------------------
सामान विवरण (Items):
${receipt.items.map((it, idx) => `${idx + 1}. ${it.translatedName} (${it.originalName}) - ${it.quantity} ${it.unit || ''} = ${receipt.currency.symbol}${it.totalPrice}`).join('\n')}
------------------------------------
उप-कुल (Subtotal): ${receipt.currency.symbol}${receipt.financials.subtotal}
${receipt.financials.discountTotal ? `छूट (Discount): -${receipt.currency.symbol}${receipt.financials.discountTotal}\n` : ''}कर (Taxes): ${receipt.financials.taxBreakdowns.map((t) => `${t.translatedLabel}: ${receipt.currency.symbol}${t.amount}`).join(', ')}
------------------------------------
कुल देय राशि (Grand Total): ${receipt.currency.symbol}${receipt.financials.grandTotal}
शब्दों में: ${receipt.financials.grandTotalTranslatedWords}
भुगतान: ${receipt.financials.paymentMethodTranslated || receipt.financials.paymentMethod}
------------------------------------
अनुवाद: BhashaBill AI Translation Bot`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* View Switcher & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 no-print">
        {/* Mode Pills */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setViewMode('translated')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'translated'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Translated Bill</span>
          </button>

          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            onClick={() => setViewMode('explorer')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'explorer'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Item Explorer ({receipt.items.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReadFullBill}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isSpeakingAll
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800 hover:border-amber-500/30'
            }`}
            title="Listen to full bill summary"
          >
            {isSpeakingAll ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeakingAll ? 'Stop Audio' : 'Read Aloud'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Copy for WhatsApp or SMS"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={onPrint}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side View Mode */}
      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Original Receipt Preview / Raw text */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Original English Receipt
              </span>
              <span className="text-[11px] text-slate-500">Source input</span>
            </div>

            {inputImagePreview ? (
              <div className="flex-1 min-h-[400px] flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden p-2">
                <img
                  src={inputImagePreview}
                  alt="Original receipt"
                  className="max-h-[600px] w-full object-contain rounded"
                />
              </div>
            ) : (
              <pre className="flex-1 bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-slate-300 overflow-auto whitespace-pre-wrap max-h-[600px] border border-slate-800/80">
                {rawInputText || receipt.rawExtractedText || 'No original text available'}
              </pre>
            )}
          </div>

          {/* Right: Translated Receipt Ticket */}
          <div className="receipt-container bg-slate-900/95 border-2 border-slate-800 rounded-2xl p-5 shadow-2xl">
            <ReceiptContent
              receipt={receipt}
              langCode={langCode}
              onAskBot={onAskBot}
              filteredItems={receipt.items}
            />
          </div>
        </div>
      )}

      {/* Explorer View Mode */}
      {viewMode === 'explorer' && (
        <div className="space-y-4 mb-6">
          {/* Search & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item in English or regional script (e.g. Atta, Milk, दाल)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category selector */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat === 'all' ? 'All Items' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                currencySymbol={receipt.currency.symbol}
                langCode={langCode}
                onAskBot={onAskBot}
              />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-10 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 text-xs">
              No items match your search.
            </div>
          )}
        </div>
      )}

      {/* Default Translated Ticket View */}
      {viewMode === 'translated' && (
        <div className="receipt-container bg-slate-900/95 border-2 border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Jagged / Dashed Receipt Tear Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 opacity-80" />

          <ReceiptContent
            receipt={receipt}
            langCode={langCode}
            onAskBot={onAskBot}
            filteredItems={receipt.items}
          />
        </div>
      )}
    </div>
  );
};

// Subcomponent for the thermal receipt layout
interface ReceiptContentProps {
  receipt: ReceiptData;
  langCode: string;
  onAskBot: (question: string) => void;
  filteredItems: ReceiptData['items'];
}

const ReceiptContent: React.FC<ReceiptContentProps> = ({
  receipt,
  langCode,
  onAskBot,
  filteredItems,
}) => {
  return (
    <div>
      {/* Store Merchant Header */}
      <div className="text-center pb-5 border-b border-dashed border-slate-700/80">
        <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold">
          ★ TRANSLATED BILL / भाषा रसीद ★
        </span>
        <h2 className="font-regional text-2xl sm:text-3xl font-extrabold text-white mt-1">
          {receipt.merchant.translatedName}
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          {receipt.merchant.name}
        </p>
        {receipt.merchant.address && (
          <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
            {receipt.merchant.address}
          </p>
        )}

        {/* Metadata pills */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-mono">
          {receipt.merchant.date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {receipt.merchant.date} {receipt.merchant.time || ''}
            </span>
          )}
          {receipt.merchant.receiptNo && (
            <span>Bill: <strong className="text-slate-200">#{receipt.merchant.receiptNo}</strong></span>
          )}
          {receipt.merchant.cashier && (
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              {receipt.merchant.cashier}
            </span>
          )}
          {receipt.merchant.taxId && (
            <span>GSTIN/Tax: {receipt.merchant.taxId}</span>
          )}
        </div>
      </div>

      {/* Grand Total Hero Banner */}
      <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Grand Total / कुल देय राशि
            </span>
            <div className="font-mono text-3xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
              {receipt.currency.symbol}{receipt.financials.grandTotal}
            </div>
            <p className="font-regional text-xs font-bold text-amber-300 mt-1">
              {receipt.financials.grandTotalTranslatedWords}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            {/* Math Check Verification Badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              receipt.billHealthCheck.isMathCorrect
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {receipt.billHealthCheck.isMathCorrect ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              <span>
                {receipt.billHealthCheck.isMathCorrect ? 'Math Verified 100%' : 'Audit Note'}
              </span>
            </div>

            {receipt.financials.savingsSummary && (
              <span className="text-xs text-emerald-400 font-semibold">
                🎉 {receipt.financials.savingsSummary}
              </span>
            )}
          </div>
        </div>

        {receipt.billHealthCheck.mathNotes && (
          <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-amber-500/20">
            ℹ️ {receipt.billHealthCheck.mathNotes}
          </p>
        )}
      </div>

      {/* AI Overall Summary */}
      {receipt.overallSummary && (
        <div className="mb-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="font-regional leading-relaxed">
            {receipt.overallSummary}
          </p>
        </div>
      )}

      {/* Itemized Table Header */}
      <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
        <span>Item Details (वस्तु विवरण)</span>
        <span>Amount (रकम)</span>
      </div>

      {/* Line Items List */}
      <div className="space-y-2.5 mb-6">
        {filteredItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            currencySymbol={receipt.currency.symbol}
            langCode={langCode}
            onAskBot={onAskBot}
          />
        ))}
      </div>

      {/* Financials & Subtotals Breakdown */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs mb-6">
        <div className="flex justify-between text-slate-300">
          <span>उप-कुल (Subtotal)</span>
          <span className="font-mono font-semibold">{receipt.currency.symbol}{receipt.financials.subtotal}</span>
        </div>

        {receipt.financials.discountTotal && (
          <div className="flex justify-between text-emerald-400 font-medium">
            <span>छूट / डिस्काउंट (Discount)</span>
            <span className="font-mono">-{receipt.currency.symbol}{receipt.financials.discountTotal}</span>
          </div>
        )}

        {/* Taxes in Financials */}
        {receipt.financials.taxBreakdowns?.map((tax, i) => (
          <div key={i} className="flex justify-between text-slate-400">
            <span>{tax.translatedLabel} ({tax.label}) {tax.ratePercent ? `@ ${tax.ratePercent}` : ''}</span>
            <span className="font-mono">{receipt.currency.symbol}{tax.amount}</span>
          </div>
        ))}

        {receipt.financials.otherCharges?.map((chg, i) => (
          <div key={`c-${i}`} className="flex justify-between text-amber-400/90">
            <span>{chg.translatedLabel} ({chg.label})</span>
            <span className="font-mono">{receipt.currency.symbol}{chg.amount}</span>
          </div>
        ))}

        <div className="pt-2 border-t border-dashed border-slate-800 flex justify-between text-sm font-bold text-white">
          <span>कुल देय (Net Payable)</span>
          <span className="font-mono text-base text-amber-400">{receipt.currency.symbol}{receipt.financials.grandTotal}</span>
        </div>

        <div className="text-[11px] text-slate-400 pt-1 flex justify-between">
          <span>भुगतान माध्यम (Payment Mode):</span>
          <span className="font-semibold text-slate-200">{receipt.financials.paymentMethodTranslated || receipt.financials.paymentMethod}</span>
        </div>
      </div>

      {/* Tax Decoder Card */}
      <div className="mb-6">
        <TaxDecoder
          taxBreakdowns={receipt.financials.taxBreakdowns}
          otherCharges={receipt.financials.otherCharges}
          currencySymbol={receipt.currency.symbol}
          onAskBot={onAskBot}
        />
      </div>

      {/* Store Policies & Legal Decoder */}
      {receipt.policiesAndNotes && receipt.policiesAndNotes.length > 0 && (
        <div className="mb-6">
          <PolicyDecoder
            policies={receipt.policiesAndNotes}
            onAskBot={onAskBot}
          />
        </div>
      )}

      {/* Receipt Footer note */}
      <div className="text-center pt-4 border-t border-dashed border-slate-800 text-[11px] text-slate-500 font-mono">
        <p>*** BhashaBill AI Translation Bot • Verified Multilingual Bill ***</p>
        <p className="mt-1">Powered by Gemini 3.8 Multimodal AI</p>
      </div>
    </div>
  );
};
