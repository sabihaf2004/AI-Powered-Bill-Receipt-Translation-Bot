import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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

// Route: Translate Receipt
app.post('/api/translate-receipt', async (req: Request, res: Response) => {
  try {
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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

    // Attach targetLanguage and timestamp
    parsedData.targetLanguage = langName;
    parsedData.timestamp = Date.now();

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error translating receipt:', error);
    res.status(500).json({
      error: error?.message || 'Failed to translate receipt. Please verify image clarity and try again.',
    });
  }
});

// Route: Interactive AI Translation Bot Chat
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
- Items List: ${JSON.stringify(receiptData?.items?.map((it: any) => ({
      original: it.originalName,
      translated: it.translatedName,
      qty: it.quantity,
      price: it.totalPrice,
      explanation: it.plainExplanation
    })))}
- Taxes: ${JSON.stringify(receiptData?.financials?.taxBreakdowns)}
- Policies: ${JSON.stringify(receiptData?.policiesAndNotes)}
- Health Check: ${JSON.stringify(receiptData?.billHealthCheck)}

Guidelines:
1. Answer the user's question clearly, warmly, and helpfully.
2. If the user asks in ${langName}, respond in ${langName}. If they ask in English, provide the answer primarily in ${langName} with English transliteration or brief English explanation, or respond bilingual so they learn the terms!
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const reply = response.text || 'I have analyzed your receipt. Please ask if you need further clarification.';
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Error in chat-receipt:', error);
    res.status(500).json({ error: error?.message || 'Failed to get answer from translation bot.' });
  }
});

// Route: Text-to-Speech audio in regional language
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
      console.warn('Gemini TTS preview not available or error, instructing client to use Web Speech API:', ttsErr);
    }

    // Fallback indicator so client can trigger Web Speech Synthesis API effortlessly
    res.json({ success: true, useWebSpeech: true });
  } catch (error: any) {
    console.error('TTS endpoint error:', error);
    res.json({ success: true, useWebSpeech: true });
  }
});

// Dev vs Prod Vite Integration
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
