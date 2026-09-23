import React from 'react';
import { Percent, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react';
import { TaxBreakdown, OtherCharge } from '../types/receipt';

interface TaxDecoderProps {
  taxBreakdowns: TaxBreakdown[];
  otherCharges: OtherCharge[];
  currencySymbol: string;
  onAskBot: (question: string) => void;
}

export const TaxDecoder: React.FC<TaxDecoderProps> = ({
  taxBreakdowns,
  otherCharges,
  currencySymbol,
  onAskBot,
}) => {
  if ((!taxBreakdowns || taxBreakdowns.length === 0) && (!otherCharges || otherCharges.length === 0)) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Tax & Charges Explained in Plain Words
            </h4>
            <p className="text-[11px] text-slate-400">
              Where does your money go? (करों की आसान व्याख्या)
            </p>
          </div>
        </div>

        <button
          onClick={() => onAskBot('Please explain the taxes and any extra charges on this bill in detail.')}
          className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Ask Bot</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {taxBreakdowns.map((tax, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-xs text-white">
                  {tax.label}
                </span>
                <span className="text-xs font-regional text-amber-300 font-medium">
                  ({tax.translatedLabel})
                </span>
                {tax.ratePercent && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {tax.ratePercent}
                  </span>
                )}
              </div>
              <p className="font-regional text-[11px] text-slate-400 mt-0.5">
                💡 {tax.simpleMeaning}
              </p>
            </div>

            <div className="font-mono font-bold text-xs text-slate-200 shrink-0 text-right">
              {currencySymbol}{tax.amount}
            </div>
          </div>
        ))}

        {otherCharges.map((charge, idx) => (
          <div
            key={`other-${idx}`}
            className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-amber-300">
                  {charge.label}
                </span>
                <span className="text-xs font-regional text-amber-400 font-medium">
                  ({charge.translatedLabel})
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Note: In many restaurants, service charges are voluntary/discretionary under consumer guidelines.
              </p>
            </div>

            <div className="font-mono font-bold text-xs text-amber-300 shrink-0 text-right">
              {currencySymbol}{charge.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
