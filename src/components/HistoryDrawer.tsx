import React from 'react';
import { X, Trash2, Calendar, Store, ArrowRight, Clock } from 'lucide-react';
import { ReceiptData } from '../types/receipt';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ReceiptData[];
  onSelectReceipt: (receipt: ReceiptData) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectReceipt,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Translated Receipts History</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {history.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
              <p>No translated receipts saved yet.</p>
              <p className="text-[11px] mt-1 text-slate-600">
                Receipts you scan and translate will automatically appear here.
              </p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectReceipt(item);
                  onClose();
                }}
                className="group p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-regional font-bold text-xs text-amber-300 group-hover:text-amber-400">
                      {item.merchant.translatedName}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      {item.currency.symbol}{item.financials.grandTotal}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.merchant.name}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>
                    {new Date(item.timestamp).toLocaleDateString()} • {item.items.length} items
                  </span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>View Bill</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            <button
              onClick={onClearHistory}
              className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Saved History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
