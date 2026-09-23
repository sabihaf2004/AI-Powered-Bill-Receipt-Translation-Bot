import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Image as ImageIcon, 
  X,
  ShoppingCart,
  UtensilsCrossed,
  Pill,
  Laptop
} from 'lucide-react';
import { SAMPLE_RECEIPTS, SampleReceipt } from '../data/sampleReceipts';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { SupportedLanguage } from '../types/receipt';
import { CameraCapture } from './CameraCapture';

interface ReceiptInputProps {
  onTranslate: (params: {
    image?: { mimeType: string; base64: string };
    rawText?: string;
    targetLanguage: string;
    dialectNotes?: string;
  }) => void;
  isLoading: boolean;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const ReceiptInput: React.FC<ReceiptInputProps> = ({
  onTranslate,
  isLoading,
  selectedLanguage,
  onLanguageChange,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'paste'>('upload');
  const [imageFile, setImageFile] = useState<{ base64: string; mimeType: string; preview: string; name: string } | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [dialectNotes, setDialectNotes] = useState<string>('Simple spoken regional terms with English transliteration');
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setImageFile({
        base64,
        mimeType: file.type,
        preview: dataUrl,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleReceipt) => {
    setPastedText(sample.text);
    setImageFile(null);
    setActiveTab('paste');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'upload' && imageFile) {
      onTranslate({
        image: { base64: imageFile.base64, mimeType: imageFile.mimeType },
        targetLanguage: selectedLanguage.name,
        dialectNotes,
      });
    } else if (activeTab === 'paste' && pastedText.trim()) {
      onTranslate({
        rawText: pastedText.trim(),
        targetLanguage: selectedLanguage.name,
        dialectNotes,
      });
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingCart': return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-4 h-4 text-amber-400" />;
      case 'Pill': return <Pill className="w-4 h-4 text-rose-400" />;
      case 'Laptop': return <Laptop className="w-4 h-4 text-cyan-400" />;
      default: return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Intro */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multilingual Bill & Invoice Scanner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Translate Any English Receipt to{' '}
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
            {selectedLanguage.nativeName} ({selectedLanguage.name})
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Scan grocery bills, restaurant receipts, medical prescriptions, and retail invoices.
          Understand every item, tax calculation, and return policy in your own mother tongue.
        </p>
      </div>

      {/* Target Language Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 mb-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Regional Target Language
            </h3>
            <p className="text-xs text-slate-300">
              Active: <span className="font-bold text-amber-400">{selectedLanguage.name} ({selectedLanguage.nativeName})</span> • {selectedLanguage.popularIn}
            </p>
          </div>
          
          <select
            value={selectedLanguage.id}
            onChange={(e) => {
              const lang = SUPPORTED_LANGUAGES.find((l) => l.id === e.target.value);
              if (lang) onLanguageChange(lang);
            }}
            className="w-full sm:w-auto bg-slate-800 text-slate-100 text-xs font-medium border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nativeName} - {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick pills for major regional languages */}
        <div className="flex flex-wrap gap-1.5">
          {SUPPORTED_LANGUAGES.slice(0, 10).map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => onLanguageChange(lang)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedLanguage.id === lang.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
              }`}
            >
              <span>{lang.nativeName}</span>
              <span className="ml-1 opacity-75 text-[10px]">({lang.name})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Box with Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-amber-400 text-amber-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              setShowCamera(true);
            }}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'camera'
                ? 'border-amber-400 text-amber-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'paste'
                ? 'border-amber-400 text-amber-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Bill Text</span>
          </button>
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* TAB 1: Upload Photo */}
          {activeTab === 'upload' && (
            <div>
              {imageFile ? (
                <div className="relative rounded-xl border border-slate-700 bg-slate-950 p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-32 h-36 shrink-0 rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                    <img
                      src={imageFile.preview}
                      alt="Uploaded receipt"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Receipt photo ready to scan</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-mono truncate">{imageFile.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Gemini OCR will read the merchant details, line items, taxes, and translate them to {selectedLanguage.name}.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="px-3 py-1 text-xs rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    isDragOver
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Click to upload receipt photo or drag and drop
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports JPG, PNG, WebP • Paper receipts, supermarket bills, invoices
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
            </div>
          )}

          {/* TAB 2: Camera View */}
          {activeTab === 'camera' && (
            <div className="text-center py-6">
              {imageFile ? (
                <div className="relative rounded-xl border border-slate-700 bg-slate-950 p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-32 h-36 shrink-0 rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                    <img
                      src={imageFile.preview}
                      alt="Captured receipt"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Photo captured successfully</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Ready to translate into {selectedLanguage.name}.</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="px-3 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                      >
                        Retake Photo
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Camera className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    Capture a physical paper bill with your phone or webcam
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Camera className="w-4 h-4" />
                    Open Camera Viewfinder
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Paste Text */}
          {activeTab === 'paste' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Paste receipt / e-bill text (from SMS, WhatsApp, PDF, or email)
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the bill details here:
Reliance Fresh Supermarket
Date: 18-Sep-2026
1. Aashirvaad Atta 5kg - ₹265.00
2. Amul Milk 1L - ₹56.00
Subtotal: ₹321.00
CGST @ 2.5%: ₹8.02
SGST @ 2.5%: ₹8.02
Total: ₹337.00"
                rows={7}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                <span>{pastedText.length} characters</span>
                {pastedText && (
                  <button
                    type="button"
                    onClick={() => setPastedText('')}
                    className="text-rose-400 hover:underline"
                  >
                    Clear Text
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dialect / Translation Preference Pill */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Style:</span>
              <span className="text-amber-400 font-medium">Bilingual & Conversational</span>
              <span className="text-slate-500">• (Includes English transliteration & simple explanations)</span>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading || (activeTab === 'upload' && !imageFile) || (activeTab === 'camera' && !imageFile) || (activeTab === 'paste' && !pastedText.trim())}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning & Translating into {selectedLanguage.nativeName}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Translate Bill to {selectedLanguage.nativeName} ({selectedLanguage.name})</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 1-Click Realistic Sample Receipts Gallery */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>Or Try A Realistic Sample Bill With 1 Click</span>
          </h3>
          <span className="text-[11px] text-amber-400/80">Instant test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_RECEIPTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="group p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-amber-500/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="p-2 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors">
                    {getCategoryIcon(sample.icon)}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 px-2 py-0.5 rounded bg-slate-800/50">
                    {sample.category}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                  {sample.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {sample.subtitle}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Load & Translate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={(base64) => {
            setImageFile({
              base64,
              mimeType: 'image/jpeg',
              preview: `data:image/jpeg;base64,${base64}`,
              name: 'camera_receipt_capture.jpg',
            });
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};
