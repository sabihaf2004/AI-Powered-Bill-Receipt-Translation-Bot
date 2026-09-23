import React, { useState } from 'react';
import { Volume2, VolumeX, Info, MessageSquare, Tag } from 'lucide-react';
import { ReceiptItem } from '../types/receipt';
import { speakWithBrowser } from '../utils/audio';

interface ItemCardProps {
  item: ReceiptItem;
  currencySymbol: string;
  langCode: string;
  onAskBot: (question: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  currencySymbol,
  langCode,
  onAskBot,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  const handleSpeak = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const textToSpeak = `${item.translatedName}. ${item.quantity} ${item.unit || ''}. ${currencySymbol} ${item.totalPrice}. ${item.plainExplanation || ''}`;
      await speakWithBrowser(textToSpeak, langCode);
    } catch (e) {
      console.warn('Speech error:', e);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all group">
      <div className="flex items-start justify-between gap-3">
        {/* Left Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-regional font-bold text-sm sm:text-base text-amber-300">
              {item.translatedName}
            </span>
            {item.transliteration && (
              <span className="text-[11px] text-slate-400 font-mono italic">
                ({item.transliteration})
              </span>
            )}
            {item.category && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {item.category}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 font-medium truncate">
            Original: <span className="text-slate-200">{item.originalName}</span>
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Qty: <strong className="text-slate-200">{item.quantity} {item.unit || ''}</strong></span>
            {item.unitPrice && (
              <>
                <span>•</span>
                <span>Rate: {currencySymbol}{item.unitPrice}</span>
              </>
            )}
            {item.notes && (
              <>
                <span>•</span>
                <span className="text-emerald-400 text-[11px] font-medium">{item.notes}</span>
              </>
            )}
          </div>
        </div>

        {/* Right Price & Actions */}
        <div className="text-right shrink-0">
          <div className="font-mono font-bold text-sm sm:text-base text-white">
            {currencySymbol}{item.totalPrice}
          </div>

          <div className="flex items-center justify-end gap-1 mt-2">
            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-lg transition-colors ${
                isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400'
              }`}
              title="Listen pronunciation in regional language"
            >
              {isPlaying ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => onAskBot(`Can you explain item "${item.originalName}" (${item.translatedName}) in detail?`)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
              title="Ask translation bot about this item"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Everyday Plain Explanation */}
      {item.plainExplanation && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-xs text-slate-300 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="font-regional leading-relaxed text-slate-300">
            <span className="text-amber-400/90 font-semibold text-[11px] mr-1">आसान भाषा में / Meaning:</span>
            {item.plainExplanation}
          </p>
        </div>
      )}
    </div>
  );
};
