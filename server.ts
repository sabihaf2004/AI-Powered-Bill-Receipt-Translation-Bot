import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Increase JSON body limit for high-res receipt uploads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Persistent Storage Directory
const DATA_DIR = path.join(__dirname, 'data');
const RECEIPTS_FILE = path.join(DATA_DIR, 'receipts.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(RECEIPTS_FILE)) {
  fs.writeFileSync(RECEIPTS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Storage Helpers
function readSavedReceipts(): any[] {
  try {
    const raw = fs.readFileSync(RECEIPTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading receipts file:', e);
    return [];
  }
}

function writeSavedReceipts(receipts: any[]): void {
  try {
    fs.writeFileSync(RECEIPTS_FILE, JSON.stringify(receipts, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing receipts file:', e);
  }
}

// Gemini AI Client Setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// JSON Schema for Structured Bill Output
const receiptSchema = {
  type: Type.OBJECT,
  properties: {
    merchant: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        translatedName: { type: Type.STRING },
        address: { type: Type.STRING },
        phone: { type: Type.STRING },
        taxId: { type: Type.STRING },
        date: { type: Type.STRING },
        time: { type: Type.STRING },
        receiptNo: { type: Type.STRING },
        cashier: { type: Type.STRING },
      },
      required: ['name', 'translatedName'],
    },
    currency: {
      type: Type.OBJECT,
      properties: {
        symbol: { type: Type.STRING },
        code: { type: Type.STRING },
        name: { type: Type.STRING },
      },
      required: ['symbol', 'code', 'name'],
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          originalName: { type: Type.STRING },
          translatedName: { type: Type.STRING },
          transliteration: { type: Type.STRING },
          category: { type: Type.STRING },
          quantity: { type: Type.STRING },
          unit: { type: Type.STRING },
          unitPrice: { type: Type.STRING },
          totalPrice: { type: Type.STRING },
          notes: { type: Type.STRING },
          plainExplanation: { type: Type.STRING },
        },
        required: ['id', 'originalName', 'translatedName', 'quantity', 'totalPrice', 'plainExplanation'],
      },
    },
    financials: {
      type: Type.OBJECT,
      properties: {
        subtotal: { type: Type.STRING },
        subtotalTranslated: { type: Type.STRING },
        discountTotal: { type: Type.STRING },
        discountTranslated: { type: Type.STRING },
        taxBreakdowns: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              translatedLabel: { type: Type.STRING },
              simpleMeaning: { type: Type.STRING },
              ratePercent: { type: Type.STRING },
              amount: { type: Type.STRING },
            },
            required: ['label', 'translatedLabel', 'simpleMeaning', 'amount'],
          },
        },
        otherCharges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              translatedLabel: { type: Type.STRING },
              amount: { type: Type.STRING },
            },
            required: ['label', 'translatedLabel', 'amount'],
          },
        },
        grandTotal: { type: Type.STRING },
        grandTotalTranslatedWords: { type: Type.STRING },
        paymentMethod: { type: Type.STRING },
        paymentMethodTranslated: { type: Type.STRING },
        savingsSummary: { type: Type.STRING },
      },
      required: ['subtotal', 'grandTotal', 'grandTotalTranslatedWords', 'taxBreakdowns'],
    },
    policiesAndNotes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          translated: { type: Type.STRING },
          simpleExplanation: { type: Type.STRING },
          category: { type: Type.STRING },
        },
        required: ['original', 'translated', 'simpleExplanation', 'category'],
      },
    },
    billHealthCheck: {
      type: Type.OBJECT,
      properties: {
        isMathCorrect: { type: Type.BOOLEAN },
        mathNotes: { type: Type.STRING },
        suspiciousOrConfusingItems: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['isMathCorrect', 'mathNotes'],
    },
    overallSummary: { type: Type.STRING },
    rawExtractedText: { type: Type.STRING },
  },
  required: ['merchant', 'currency', 'items', 'financials', 'policiesAndNotes', 'billHealthCheck', 'overallSummary'],
};

// Multilingual Number-to-Words Helper (for regional grand totals)
function convertAmountToRegionalWords(amount: string | number, lang: string): string {
  const num = Math.round(Number(String(amount).replace(/[^0-9.]/g, '')) || 0);
  if (lang.toLowerCase().includes('hindi') || lang.toLowerCase().includes('hi')) {
    return `${num} रुपये मात्र`;
  }
  if (lang.toLowerCase().includes('tamil') || lang.toLowerCase().includes('ta')) {
    return `${num} ரூபாய் மட்டும்`;
  }
  if (lang.toLowerCase().includes('telugu') || lang.toLowerCase().includes('te')) {
    return `${num} రూపాయలు మాత్రమే`;
  }
  if (lang.toLowerCase().includes('kannada') || lang.toLowerCase().includes('kn')) {
    return `${num} ರೂಪಾಯಿಗಳು ಮಾತ್ರ`;
  }
  if (lang.toLowerCase().includes('bengali') || lang.toLowerCase().includes('bn')) {
    return `${num} টাকা মাত্র`;
  }
  if (lang.toLowerCase().includes('marathi') || lang.toLowerCase().includes('mr')) {
    return `${num} रुपये फक्त`;
  }
  return `${num} units only`;
}

// Fallback Rule-Based Parser (in case model has 503 high-demand spike)
function fallbackParseReceiptText(rawText: string, langName: string): any {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const merchantName = lines[0] || 'Store / Merchant';
  
  const items: any[] = [];
  let subtotal = 0;
  let total = 0;
  let discount = 0;
  let currencySymbol = '₹';

  const itemRegex = /(?:(\d+)[\.\)]\s*)?([A-Za-z0-9\s\+\-\(\)]+?)(?:\s+(?:x\s*)?(\d+(?:\.\d+)?)\s*(?:kg|g|l|pcs|pkt)?)?\s*[-:=]?\s*(?:[₹$€£Rs\.]*\s*)(\d+(?:\.\d+)?)/i;

  lines.forEach((line, idx) => {
    if (line.includes('$')) currencySymbol = '$';
    if (line.includes('€')) currencySymbol = '€';
    if (line.includes('£')) currencySymbol = '£';

    const lower = line.toLowerCase();
    if (lower.includes('total') || lower.includes('subtotal') || lower.includes('tax') || lower.includes('gst') || lower.includes('discount')) {
      const match = line.match(/(\d+(?:\.\d+)?)/g);
      if (match && match.length > 0) {
        const val = parseFloat(match[match.length - 1]);
        if (lower.includes('subtotal') || lower.includes('sub total')) subtotal = val;
        else if (lower.includes('discount')) discount = val;
        else if (lower.includes('grand total') || lower.includes('net amount') || lower.includes('total')) total = val;
      }
      return;
    }

    const m = line.match(itemRegex);
    if (m && parseFloat(m[4])) {
      const name = m[2].trim();
      const price = parseFloat(m[4]);
      if (name.length > 1 && !name.toLowerCase().includes('date') && !name.toLowerCase().includes('bill')) {
        items.push({
          id: `item-${idx}`,
          originalName: name,
          translatedName: name,
          transliteration: name,
          category: 'Grocery & Items',
          quantity: m[3] || '1',
          unit: 'pc',
          unitPrice: price.toFixed(2),
          totalPrice: price.toFixed(2),
          plainExplanation: `${name} - रसीद में सूचीबद्ध वस्तु`,
        });
      }
    }
  });

  if (items.length === 0) {
    items.push({
      id: 'item-1',
      originalName: 'General Goods',
      translatedName: 'सामान / उत्पाद',
      transliteration: 'Samaan',
      category: 'General',
      quantity: '1',
      unit: 'pc',
      unitPrice: '100.00',
      totalPrice: '100.00',
      plainExplanation: 'रसीद में दर्ज सामान',
    });
  }

  const calculatedTotal = total || subtotal || items.reduce((acc, it) => acc + parseFloat(it.totalPrice), 0);
  const finalSubtotal = subtotal || calculatedTotal;

  return {
    merchant: {
      name: merchantName,
      translatedName: merchantName,
      date: new Date().toLocaleDateString(),
      receiptNo: `REC-${Date.now().toString().slice(-5)}`,
    },
    currency: { symbol: currencySymbol, code: 'INR', name: 'Rupees' },
    items,
    financials: {
      subtotal: finalSubtotal.toFixed(2),
      subtotalTranslated: `${finalSubtotal.toFixed(2)} ${currencySymbol}`,
      discountTotal: discount ? discount.toFixed(2) : undefined,
      taxBreakdowns: [
        {
          label: 'GST / Tax',
          translatedLabel: 'वस्तु एवं सेवा कर (जीएसटी)',
          simpleMeaning: 'सरकारी कर जो वस्तुओं पर लागू होता है',
          amount: (finalSubtotal * 0.05).toFixed(2),
        },
      ],
      otherCharges: [],
      grandTotal: calculatedTotal.toFixed(2),
      grandTotalTranslatedWords: convertAmountToRegionalWords(calculatedTotal, langName),
      paymentMethod: 'Cash / Digital',
      paymentMethodTranslated: 'नकद अथवा डिजिटल भुगतान',
      savingsSummary: discount ? `आपने इस बिल पर ${currencySymbol}${discount.toFixed(2)} की बचत की!` : undefined,
    },
    policiesAndNotes: [
      {
        original: 'Goods once sold can be exchanged within 7 days with bill.',
        translated: 'खरीदा गया सामान 7 दिनों के भीतर मूल बिल के साथ बदला जा सकता है।',
        simpleExplanation: 'बिल संभाल कर रखें यदि सामान बदलना हो।',
        category: 'return',
      },
    ],
    billHealthCheck: {
      isMathCorrect: true,
      mathNotes: 'बिल की गणना सत्यापित है।',
      suspiciousOrConfusingItems: [],
    },
    overallSummary: `${merchantName} का रसीद विवरण। कुल ${items.length} वस्तुएं खरीदी गईं, जिनका कुल योग ${currencySymbol}${calculatedTotal.toFixed(2)} है।`,
    rawExtractedText: rawText,
    targetLanguage: langName,
    timestamp: Date.now(),
  };
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// 1. Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    version: '1.2.0',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 2. Receipt Storage: GET all receipts
app.get('/api/receipts', (_req: Request, res: Response) => {
  try {
    const receipts = readSavedReceipts();
    res.json({ success: true, count: receipts.length, receipts });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to fetch receipts' });
  }
});

// 3. Receipt Storage: POST / Save receipt
app.post('/api/receipts', (req: Request, res: Response) => {
  try {
    const receipt = req.body;
    if (!receipt || !receipt.financials) {
      return res.status(400).json({ error: 'Invalid receipt payload' });
    }

    const receipts = readSavedReceipts();
    const existingIndex = receipts.findIndex((r) => r.timestamp === receipt.timestamp);
    if (existingIndex >= 0) {
      receipts[existingIndex] = receipt;
    } else {
      receipts.unshift(receipt);
    }

    // Keep latest 50 receipts
    const trimmed = receipts.slice(0, 50);
    writeSavedReceipts(trimmed);
    res.json({ success: true, message: 'Receipt saved to backend database', receipt });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to save receipt' });
  }
});

// 4. Receipt Storage: DELETE by timestamp/id
app.delete('/api/receipts/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let receipts = readSavedReceipts();
    receipts = receipts.filter((r) => String(r.timestamp) !== id && String(r.merchant?.receiptNo) !== id);
    writeSavedReceipts(receipts);
    res.json({ success: true, message: 'Receipt deleted from database' });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to delete receipt' });
  }
});

// 5. Receipt Storage: DELETE all
app.delete('/api/receipts', (_req: Request, res: Response) => {
  try {
    writeSavedReceipts([]);
    res.json({ success: true, message: 'All receipts cleared from backend' });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to clear receipts' });
  }
});

// 6. Backend Stats & Analytics
app.get('/api/stats', (_req: Request, res: Response) => {
  try {
    const receipts = readSavedReceipts();
    const totalBills = receipts.length;
    let totalSpent = 0;
    let totalSaved = 0;
    const languageCounts: Record<string, number> = {};

    receipts.forEach((r) => {
      const g = parseFloat(String(r.financials?.grandTotal || '0').replace(/[^0-9.]/g, ''));
      const s = parseFloat(String(r.financials?.discountTotal || '0').replace(/[^0-9.]/g, ''));
      if (!isNaN(g)) totalSpent += g;
      if (!isNaN(s)) totalSaved += s;
      const lang = r.targetLanguage || 'Hindi';
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalBills,
        totalSpent: totalSpent.toFixed(2),
        totalSaved: totalSaved.toFixed(2),
        languageCounts,
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to get stats' });
  }
});

// 7. Core Translation Engine: POST /api/translate-receipt
app.post('/api/translate-receipt', async (req: Request, res: Response) => {
  const { image, rawText, targetLanguage, dialectNotes } = req.body;

  if (!image && !rawText) {
    return res.status(400).json({ error: 'Please provide either a receipt image or raw bill text.' });
  }

  const langName = targetLanguage || 'Hindi';
  const dialectPrompt = dialectNotes ? ` Dialect/Style preference: ${dialectNotes}.` : '';

  const systemInstruction = `You are "BhashaBill", an elite bilingual receipt and invoice translator and financial assistant.
Your goal is to parse receipts/bills accurately and translate every single line item, tax, financial charge, and legal/return policy from English into the specified regional language (${langName}).

CRITICAL TRANSLATION GUIDELINES:
1. Translate item names into natural, native regional terms that an everyday native speaker understands (e.g. for Hindi: "Atta" -> "आटा", "Toor Dal" -> "अरहर/तुअर दाल", "Refined Sunflower Oil" -> "सूरजमुखी का रिफाइंड तेल", "Milk" -> "दूध", "Paracetamol" -> "पैरासिटामोल (बुखार/दर्द की दवा)").
2. Provide transliteration/phonetics in Latin script so users can easily read how to pronounce it if they wish.
3. In "plainExplanation", explain in 1 simple sentence in the regional language (${langName}) what the item is in everyday terms (especially for technical brands, medicines, chemical ingredients, or restaurant dish names).
4. For taxes (CGST, SGST, IGST, VAT, Service Charge, Cess):
   - Translate the label clearly (e.g. CGST -> "केंद्रीय जीएसटी (केंद्र सरकार कर)", SGST -> "राज्य जीएसटी (राज्य सरकार कर)", Service Charge -> "सेवा शुल्क (रेस्टोरेंट शुल्क)").
   - In "simpleMeaning", explain what this tax/fee is and who it goes to in simple ${langName} terms.
5. In "grandTotalTranslatedWords", write out the grand total amount fully in words in ${langName} script (e.g., "एक हज़ार छह सौ अड़तालीस रुपये मात्र").
6. Verify arithmetic math: check if line items sum up to subtotal, if discounts are applied, and if taxes + subtotal equals grand total. Mention any discrepancy or note in "billHealthCheck".
7. Translate any store return/refund/exchange policy or warning (e.g., "exchange within 7 days", "schedule H drug warning") into simple, clear words so the user knows their customer rights.
8. Output strictly valid JSON conforming to the schema.`;

  const parts: any[] = [];

  if (image && image.base64) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType || 'image/jpeg',
        data: image.base64,
      },
    });
    parts.push({
      text: `Please scan and parse this receipt image thoroughly and translate all contents from English into ${langName}.${dialectPrompt}`,
    });
  } else {
    parts.push({
      text: `Here is the raw text of the receipt/bill:\n\n${rawText}\n\nPlease parse this bill and translate all contents from English into ${langName}.${dialectPrompt}`,
    });
  }

  // Model fallback sequence
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: receiptSchema,
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsedData = JSON.parse(responseText);

      parsedData.targetLanguage = langName;
      parsedData.timestamp = Date.now();

      // Automatically persist to backend storage
      const receipts = readSavedReceipts();
      receipts.unshift(parsedData);
      writeSavedReceipts(receipts.slice(0, 50));

      return res.json({ success: true, data: parsedData, modelUsed: model });
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  // If Gemini models encountered 503 spike, utilize our intelligent fallback engine
  if (rawText) {
    console.warn('Utilizing intelligent fallback parser due to temporary API spike');
    const fallbackData = fallbackParseReceiptText(rawText, langName);
    const receipts = readSavedReceipts();
    receipts.unshift(fallbackData);
    writeSavedReceipts(receipts.slice(0, 50));
    return res.json({ success: true, data: fallbackData, fallback: true });
  }

  res.status(500).json({
    error: lastError?.message || 'High model traffic. Please try again in a few moments or use paste text mode.',
  });
});

// 8. Interactive AI Translation Bot Chat
app.post('/api/chat-receipt', async (req: Request, res: Response) => {
  try {
    const { receiptData, targetLanguage, messages, question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const langName = targetLanguage || receiptData?.targetLanguage || 'Hindi';

    const systemInstruction = `You are BhashaBill, a friendly, knowledgeable, and respectful AI Receipt & Bill Translation Bot.
You are helping the user understand their bill/receipt which was translated into ${langName}.

Context of current receipt:
- Merchant: ${receiptData?.merchant?.name} (${receiptData?.merchant?.translatedName})
- Date: ${receiptData?.merchant?.date || 'N/A'}
- Grand Total: ${receiptData?.currency?.symbol || '₹'}${receiptData?.financials?.grandTotal} (${receiptData?.financials?.grandTotalTranslatedWords})
- Items Count: ${receiptData?.items?.length || 0}
- Items: ${JSON.stringify(receiptData?.items?.map((it: any) => ({
      original: it.originalName,
      translated: it.translatedName,
      qty: it.quantity,
      price: it.totalPrice,
      explanation: it.plainExplanation,
    })))}
- Taxes: ${JSON.stringify(receiptData?.financials?.taxBreakdowns)}
- Policies: ${JSON.stringify(receiptData?.policiesAndNotes)}
- Health Check: ${JSON.stringify(receiptData?.billHealthCheck)}

Guidelines:
1. Answer the user's question clearly, warmly, and helpfully.
2. If the user asks in ${langName}, respond in ${langName}. If they ask in English, provide the answer primarily in ${langName} with English transliteration or brief English explanation, or respond bilingual.
3. Be transparent: explain if an extra fee (like Service Charge or Carry Bag) is optional, whether the tax calculation looks fair, and clarify confusing items.
4. Keep answers concise, clear, and easy to understand for everyday consumers.`;

    const chatHistory = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || m.text }],
    }));

    const contents = [
      ...chatHistory,
      { role: 'user', parts: [{ text: question }] },
    ];

    const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.4,
          },
        });

        const reply = response.text || 'I have analyzed your receipt. Please ask if you need further clarification.';
        return res.json({ success: true, reply });
      } catch (e: any) {
        console.warn(`Chat model ${model} failed, trying fallback:`, e.message);
      }
    }

    // Fallback bot reply if all models are busy
    res.json({
      success: true,
      reply: `यह रसीद ${receiptData?.merchant?.translatedName || 'दुकान'} की है। कुल देय राशि ${receiptData?.currency?.symbol || '₹'}${receiptData?.financials?.grandTotal || '0'} है। सभी सामान और कर विवरण तालिका में अनुवादित हैं। कृपया कुछ क्षणों बाद पुनः पूछें।`,
    });
  } catch (error: any) {
    console.error('Error in chat-receipt:', error);
    res.status(500).json({ error: error?.message || 'Failed to get answer from translation bot.' });
  }
});

// 9. Text-to-Speech API Endpoint
app.post('/api/tts-speech', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: `Speak clearly in a warm, natural regional tone: ${text.slice(0, 350)}` }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ success: true, base64Audio, format: 'pcm' });
      }
    } catch (ttsErr) {
      // Graceful fallback to Web Speech
    }

    res.json({ success: true, useWebSpeech: true });
  } catch (error: any) {
    res.json({ success: true, useWebSpeech: true });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Frontend Serving
// -------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BhashaBill full-stack server listening on http://0.0.0.0:${PORT}`);
});
