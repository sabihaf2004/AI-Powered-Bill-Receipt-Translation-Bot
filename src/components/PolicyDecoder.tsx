import React from 'react';
import { FileText, AlertTriangle, RotateCcw, ShieldCheck } from 'lucide-react';
import { ReceiptPolicy } from '../types/receipt';

interface PolicyDecoderProps {
  policies: ReceiptPolicy[];
  onAskBot: (question: string) => void;
}

export const PolicyDecoder: React.FC<PolicyDecoderProps> = ({ policies, onAskBot }) => {
  if (!policies || policies.length === 0) return null;

  const getPolicyIcon = (category: string) => {
    switch (category) {
      case 'return':
        return <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Store Terms & Return Policy Decoded
            </h4>
            <p className="text-[11px] text-slate-400">
              Your customer rights explained simply (नियम व वापसी की शर्तें)
            </p>
          </div>
        </div>

        <button
          onClick={() => onAskBot('Can I return or exchange items from this bill? What are the rules?')}
          className="text-xs text-amber-400 hover:text-amber-300 font-medium"
        >
          Ask Bot About Return
        </button>
      </div>

      <div className="space-y-2">
        {policies.map((policy, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5"
          >
            <div className="mt-0.5">{getPolicyIcon(policy.category)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-regional font-semibold text-xs text-slate-200">
                {policy.translated}
              </p>
              <p className="font-regional text-[11px] text-amber-300/90 mt-0.5">
                💡 {policy.simpleExplanation}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 italic">
                Original text: "{policy.original}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
