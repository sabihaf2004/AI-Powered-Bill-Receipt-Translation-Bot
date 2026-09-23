export interface ReceiptItem {
  id: string;
  originalName: string;
  translatedName: string;
  transliteration?: string;
  category: string;
  quantity: number | string;
  unit: string;
  unitPrice: number | string;
  totalPrice: number | string;
  notes?: string;
  plainExplanation?: string;
}

export interface TaxBreakdown {
  label: string;
  translatedLabel: string;
  simpleMeaning: string;
  ratePercent?: string;
  amount: string | number;
}

export interface OtherCharge {
  label: string;
  translatedLabel: string;
  amount: string | number;
}

export interface FinancialSummary {
  subtotal: string | number;
  subtotalTranslated: string;
  discountTotal?: string | number;
  discountTranslated?: string;
  taxBreakdowns: TaxBreakdown[];
  otherCharges: OtherCharge[];
  grandTotal: string | number;
  grandTotalTranslatedWords: string;
  paymentMethod: string;
  paymentMethodTranslated: string;
  savingsSummary?: string;
}

export interface MerchantInfo {
  name: string;
  translatedName: string;
  address?: string;
  phone?: string;
  taxId?: string;
  date?: string;
  time?: string;
  receiptNo?: string;
  cashier?: string;
}

export interface ReceiptPolicy {
  original: string;
  translated: string;
  simpleExplanation: string;
  category: 'return' | 'tax' | 'warning' | 'general';
}

export interface BillHealthCheck {
  isMathCorrect: boolean;
  mathNotes: string;
  suspiciousOrConfusingItems: string[];
}

export interface ReceiptData {
  merchant: MerchantInfo;
  currency: {
    symbol: string;
    code: string;
    name: string;
  };
  items: ReceiptItem[];
  financials: FinancialSummary;
  policiesAndNotes: ReceiptPolicy[];
  billHealthCheck: BillHealthCheck;
  overallSummary: string;
  targetLanguage: string;
  rawExtractedText?: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestedAction?: string;
}

export interface SupportedLanguage {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  script: string;
  popularIn: string;
}
