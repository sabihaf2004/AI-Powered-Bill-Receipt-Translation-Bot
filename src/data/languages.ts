import { SupportedLanguage } from '../types/receipt';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी', code: 'hi-IN', script: 'Devanagari', popularIn: 'India (National)' },
  { id: 'ta', name: 'Tamil', nativeName: 'தமிழ்', code: 'ta-IN', script: 'Tamil', popularIn: 'Tamil Nadu, Sri Lanka, Singapore' },
  { id: 'te', name: 'Telugu', nativeName: 'తెలుగు', code: 'te-IN', script: 'Telugu', popularIn: 'Andhra Pradesh, Telangana' },
  { id: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn-IN', script: 'Kannada', popularIn: 'Karnataka' },
  { id: 'bn', name: 'Bengali', nativeName: 'বাংলা', code: 'bn-IN', script: 'Bengali', popularIn: 'West Bengal, Bangladesh' },
  { id: 'mr', name: 'Marathi', nativeName: 'मराठी', code: 'mr-IN', script: 'Devanagari', popularIn: 'Maharashtra' },
  { id: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', code: 'gu-IN', script: 'Gujarati', popularIn: 'Gujarat' },
  { id: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', code: 'ml-IN', script: 'Malayalam', popularIn: 'Kerala' },
  { id: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', code: 'pa-IN', script: 'Gurmukhi', popularIn: 'Punjab, Delhi' },
  { id: 'ur', name: 'Urdu', nativeName: 'اردو', code: 'ur-IN', script: 'Arabic-Nastaliq', popularIn: 'India, Pakistan' },
  { id: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', code: 'or-IN', script: 'Odia', popularIn: 'Odisha' },
  { id: 'es', name: 'Spanish', nativeName: 'Español', code: 'es-ES', script: 'Latin', popularIn: 'Spain, Latin America' },
  { id: 'fr', name: 'French', nativeName: 'Français', code: 'fr-FR', script: 'Latin', popularIn: 'France, Canada, Africa' },
  { id: 'ar', name: 'Arabic', nativeName: 'العربية', code: 'ar-SA', script: 'Arabic', popularIn: 'Middle East, North Africa' },
  { id: 'de', name: 'German', nativeName: 'Deutsch', code: 'de-DE', script: 'Latin', popularIn: 'Germany, Austria, Switzerland' },
  { id: 'zh', name: 'Chinese', nativeName: '简体中文', code: 'zh-CN', script: 'Han', popularIn: 'China, Singapore' },
  { id: 'ja', name: 'Japanese', nativeName: '日本語', code: 'ja-JP', script: 'Kana & Kanji', popularIn: 'Japan' },
];
