import { InventoryItem, VoicePersona } from '../types/inventory';

/**
 * Pure Saraiki numbers and counting system (سرائیکی گنتی)
 */
export function getSaraikiPriceWords(price: number): string {
  const saraikiMap: Record<number, string> = {
    10: 'dah',
    15: 'pandran',
    20: 'veeh',
    25: 'panji',
    30: 'treeh',
    35: 'paintis',
    40: 'chaalis',
    45: 'paintalis',
    50: 'panjah',
    55: 'pachwanjah',
    60: 'sath',
    65: 'painsath',
    70: 'sattar',
    75: 'pachtar',
    80: 'assi',
    85: 'pachasi',
    90: 'nawway',
    95: 'panchanway',
    100: 'hik sau',
    110: 'hik sau dah',
    120: 'hik sau veeh',
    130: 'hik sau treeh',
    140: 'hik sau chaalis',
    150: 'deyrh sau',
    160: 'hik sau sath',
    170: 'hik sau sattar',
    180: 'hik sau assi',
    200: 'do sau',
    250: 'dhaai sau',
    280: 'do sau assi',
    300: 'traye sau',
    340: 'traye sau chaalis',
    350: 'saadhay traye sau',
    380: 'traye sau assi',
    400: 'chaar sau',
    450: 'saadhay chaar sau',
    500: 'panj sau',
  };

  if (saraikiMap[price]) return saraikiMap[price];
  if (price < 100) return `${price}`;

  const hundreds = Math.floor(price / 100);
  const rem = price % 100;
  const hundredWords = ['', 'hik sau', 'do sau', 'traye sau', 'chaar sau', 'panj sau', 'chhey sau', 'satt sau', 'aath sau', 'nau sau'];
  const hWord = hundredWords[hundreds] || `${hundreds} sau`;
  if (rem === 0) return hWord;
  const remWord = saraikiMap[rem] || `${rem}`;
  return `${hWord} ${remWord}`;
}

export function getUrduPriceWords(price: number): string {
  const urduMap: Record<number, string> = {
    10: 'das',
    15: 'pandrah',
    20: 'bees',
    25: 'pachees',
    30: 'tees',
    35: 'paintis',
    40: 'chaalis',
    45: 'paintalis',
    50: 'pachaas',
    55: 'pachpan',
    60: 'saath',
    65: 'painsath',
    70: 'sattar',
    75: 'pachhattar',
    80: 'assi',
    85: 'pachasi',
    90: 'nawway',
    95: 'panchanway',
    100: 'aik sau',
    110: 'aik sau das',
    120: 'aik sau bees',
    130: 'aik sau tees',
    140: 'aik sau chaalis',
    150: 'deyrh sau',
    160: 'aik sau saath',
    170: 'aik sau sattar',
    180: 'aik sau assi',
    200: 'do sau',
    250: 'dhaai sau',
    280: 'do sau assi',
    300: 'teen sau',
    340: 'teen sau chaalis',
    350: 'saarrhe teen sau',
    380: 'teen sau assi',
    400: 'chaar sau',
    450: 'saarrhe chaar sau',
    500: 'paanch sau',
  };
  if (urduMap[price]) return urduMap[price];
  if (price < 100) return `${price}`;
  const hundreds = Math.floor(price / 100);
  const rem = price % 100;
  const hundredWords = ['', 'aik sau', 'do sau', 'teen sau', 'chaar sau', 'paanch sau', 'chhey sau', 'saat sau', 'aath sau', 'nau sau'];
  const hWord = hundredWords[hundreds] || `${hundreds} sau`;
  if (rem === 0) return hWord;
  const remWord = urduMap[rem] || `${rem}`;
  return `${hWord} ${remWord}`;
}

export function getNativeUrduPriceWords(price: number): string {
  const nativeMap: Record<number, string> = {
    10: 'دس',
    15: 'پندرہ',
    20: 'بیس',
    25: 'پچیس',
    30: 'تیس',
    35: 'پینتیس',
    40: 'چالیس',
    45: 'پینتالیس',
    50: 'پچاس',
    55: 'پچپن',
    60: 'ساٹھ',
    65: 'پینسٹھ',
    70: 'ستر',
    75: 'پچھتر',
    80: 'اسی',
    85: 'پچاسی',
    90: 'نوے',
    95: 'پچانوے',
    100: 'ایک سو',
    110: 'ایک سو دس',
    120: 'ایک سو بیس',
    130: 'ایک سو تیس',
    140: 'ایک سو چالیس',
    150: 'ڈیڑھ سو',
    160: 'ایک سو ساٹھ',
    170: 'ایک سو ستر',
    180: 'ایک سو اسی',
    200: 'دو سو',
    250: 'ڈھائی سو',
    280: 'دو سو اسی',
    300: 'تین سو',
    340: 'تین سو چالیس',
    350: 'ساڑھے تین سو',
    380: 'تین سو اسی',
    400: 'چار سو',
    450: 'ساڑھے چار سو',
    500: 'پانچ سو',
  };
  if (nativeMap[price]) return nativeMap[price];
  if (price < 100) return `${price}`;
  const hundreds = Math.floor(price / 100);
  const rem = price % 100;
  const hundredWords = ['', 'ایک سو', 'دو سو', 'تین سو', 'چار سو', 'پانچ سو', 'چھ سو', 'سات سو', 'آٹھ سو', 'نو سو'];
  const hWord = hundredWords[hundreds] || `${hundreds} سو`;
  if (rem === 0) return hWord;
  const remWord = nativeMap[rem] || `${rem}`;
  return `${hWord} ${remWord}`;
}

/**
 * Format weight in kilograms into a user-friendly readable string (grams or kilograms)
 */
export function formatWeight(qtyKg: number): string {
  if (qtyKg < 1) {
    return `${Math.round(qtyKg * 1000)}g`;
  }
  return `${qtyKg} kg`;
}

export interface WeightOption {
  id: string;
  label: string;
  urduLabel: string;
  weightKg: number;
}

export const WEIGHT_OPTIONS: WeightOption[] = [
  { id: '100g', label: '100g', urduLabel: '100 گرام', weightKg: 0.1 },
  { id: '250g', label: '250g', urduLabel: 'پاؤ (250g)', weightKg: 0.25 },
  { id: '500g', label: '500g', urduLabel: 'آدھا کلو (500g)', weightKg: 0.5 },
  { id: '1kg', label: '1kg', urduLabel: '1 کلو', weightKg: 1 },
  { id: '1.5kg', label: '1.5kg', urduLabel: 'ڈیڑھ کلو (1.5kg)', weightKg: 1.5 },
  { id: '2kg', label: '2kg', urduLabel: '2 کلو', weightKg: 2 },
  { id: '5kg', label: '5kg', urduLabel: '5 کلو (بڑا پیک)', weightKg: 5 },
  { id: 'custom', label: 'More Weight...', urduLabel: 'مزید وزن منتخب کریں', weightKg: 0 },
];

export interface BackgroundVoiceState {
  isActive: boolean;
  currentMinute: number;
  totalMinutes: number;
  nextAnnouncementInSec: number;
  isSpeaking: boolean;
  lastSpokenText: string;
}

/**
 * Natural Girl Voiceover Speech Script (لڑکی کی منڈی آواز)
 * Authentic Saraiki & Urdu Market Hawker Calls
 */
export const USER_MANDI_SARAISPEECH = {
  urdu: "ادرک گھنو، ٹماٹر گھنو! پیاز گھنو، ہری مرچ گھنو، لہسن گھنو، ہریا دھنیا گھنو! نویں آلو گھنو، پرانے آلو گھنو، بڑے ودیا صاف ستھرے آلو گھنو! دیسی کریلے گھنو، دیسی کدو گھنو، دیسی ٹنڈے گھنو! بھنڈی گھنو، شملہ مرچ گھنو، روی دیاں پھلیاں گھنو، چٹے شلجم گھنو، پیلے گاجر گھنو! عربی گھنو، بینگنی گھنو، بینگن گھنو! دانیاں نال بھرے مٹر گھنو! آؤ بھائی تازہ سبزیاں منڈی سے لائے ہیں تازہ تازہ!",
  roman: "Adrak ghano, Tamatar ghano! Pyaz ghano, Hari mirch ghano, Lehsan ghano, Harya dhanya ghano! Naveen aalo ghano, Purane aalo ghano, vadde wadiya saaf suthre aalo ghano! Desi karelay ghano, Desi kaddu ghano, Desi tinday ghano! Bhindi ghano, Shimla mirch ghano, Rawan diyan phaliyan ghano, Chitte shaljam ghano, Peelay gajar ghano! Arbi ghano, Baingani ghano, Baingan ghano! Daniyan naal bharay matar ghano! Aao bhai taza taza mandi se laaye hain taza taza!",
};

export const GIRL_MANDI_SPEECH = {
  roman:
    "Adrak ghano, Tamatar ghano! Pyaz ghano, Hari mirch ghano, Lehsan ghano, Harya dhanya ghano! Naveen aalo ghano, vadde wadiya saaf suthre aalo ghano! Taza Ghobi ghano! Desi karelay ghano, Desi kaddu ghano, Desi tinday ghano! Bhindi ghano, Shimla mirch ghano, Rawan diyan phaliyan ghano, Chitte shaljam ghano, Peelay gajar ghano! Arbi ghano, Baingani ghano, Baingan ghano! Daniyan naal bharay matar ghano! Aao bhai taza mandi se laaye hain taza taza! Subah ki tazi tooti hui sabziyan aap ke ghar ki dehleez tak: 100 gram, paao, aadha kilo, aik kilo ya paanch kilo. Free delivery ke sath!",
  urdu:
    "ادرک گھنو، ٹماٹر گھنو! پیاز گھنو، ہری مرچ گھنو، لہسن گھنو، ہریا دھنیا گھنو! نویں آلو گھنو، پرانے آلو گھنو، بڑے ودیا صاف ستھرے آلو گھنو! پھول گوبھی گھنو! دیسی کریلے گھنو، دیسی کدو گھنو، دیسی ٹنڈے گھنو! بھنڈی گھنو، شملہ مرچ گھنو، روی دیاں پھلیاں گھنو، چٹے شلجم گھنو، پیلے گاجر گھنو! عربی گھنو، بینگنی گھنو، بینگن گھنو! دانیاں نال بھرے مٹر گھنو!",
};

export const GIRL_MANDI_CHUNKS = [
  {
    roman: "Adrak ghano, Tamatar ghano! Pyaz ghano, Hari mirch ghano, Lehsan ghano, Harya dhanya ghano!",
    urdu: "ادرک گھنو، ٹماٹر گھنو! پیاز گھنو، ہری مرچ گھنو، لہسن گھنو، ہریا دھنیا گھنو!",
  },
  {
    roman: "Naveen aalo ghano, purane aalo ghano, vadde wadiya saaf suthre aalo ghano!",
    urdu: "نویں آلو گھنو، پرانے آلو گھنو، بڑے ودیا صاف ستھرے آلو گھنو!",
  },
  {
    roman: "Desi karelay ghano, Desi kaddu ghano, Desi tinday ghano!",
    urdu: "دیسی کریلے گھنو، دیسی کدو گھنو، دیسی ٹنڈے گھنو!",
  },
  {
    roman: "Bhindi ghano, Shimla mirch ghano, Rawan diyan phaliyan ghano, Chitte shaljam ghano, Peelay gajar ghano!",
    urdu: "بھنڈی گھنو، شملہ مرچ گھنو، روی دیاں پھلیاں گھنو، چٹے شلجم گھنو، پیلے گاجر گھنو!",
  },
  {
    roman: "Arbi ghano, Baingani ghano, Baingan ghano! Daniyan naal bharay matar ghano!",
    urdu: "عربی گھنو، بینگنی گھنو، بینگن گھنو! دانیاں نال بھرے مٹر گھنو!",
  },
  {
    roman: "Aao bhai behno! Khet aur mandi se laaye hain taza taza! Subah ki tazi tooti hui sabziyan aap ke ghar ki dehleez tak!",
    urdu: "آؤ بھائی بہنو! کھیت اور منڈی سے لائے ہیں تازہ تازہ! صبح کی تازی ٹوٹی ہوئی سبزیاں آپ کے گھر کی دہلیز تک!",
  },
  {
    roman: "Apni marzi ka wazan lein: 100 gram, paao, aadha kilo, aik kilo ya paanch kilo! Free delivery aur cash on delivery ke sath!",
    urdu: "اپنی مرضی کا وزن لیں: سو گرام، پاؤ، آدھا کلو، ایک کلو یا پانچ کلو! فری ڈلیوری اور کیش آن ڈلیوری کے ساتھ!",
  },
];

export const TVC_MALE_MANDI_SPEECH = GIRL_MANDI_SPEECH;
export const SARAIKI_GIRL_ANNOUNCEMENTS: string[] = [GIRL_MANDI_SPEECH.roman];
export const SARAIKI_GIRL_ANNOUNCEMENTS_URDU: string[] = [GIRL_MANDI_SPEECH.urdu];
export const MANDI_RATE_ANNOUNCEMENTS = SARAIKI_GIRL_ANNOUNCEMENTS;
export const MANDI_RATE_ANNOUNCEMENTS_URDU = SARAIKI_GIRL_ANNOUNCEMENTS_URDU;
export const FEMALE_BACKGROUND_ANNOUNCEMENTS = SARAIKI_GIRL_ANNOUNCEMENTS;
export const ELEVENLABS_STYLE_MANDI_SPEECH = GIRL_MANDI_SPEECH;

class AudioVoiceEngine {
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onVoiceStateChangeListeners: ((text: string, isPlaying: boolean, persona: VoicePersona) => void)[] = [];
  private currentPersona: VoicePersona = 'mandi_girl';
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private bgIsSpeaking: boolean = false;
  private bgLastSpokenText: string = '';
  private bgListeners: ((state: BackgroundVoiceState) => void)[] = [];
  private pendingSpeechTimer: any = null;
  private bgChunkIndex: number = 0;
  private bgLoopTimer: any = null;
  private keepAliveInterval: any = null;

  constructor() {
    this.initVoices();
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      this.cachedVoices = window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setPersona(_persona?: VoicePersona): void {
    this.currentPersona = 'mandi_girl';
    this.playProfessionalChime();
  }

  public getPersona(): VoicePersona {
    return 'mandi_girl';
  }

  /**
   * Warm, deep, professional TV commercial opening chord
   * (A3: 220Hz, C#4: 277Hz, E4: 330Hz, A4: 440Hz)
   */
  public playProfessionalChime(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const chord = [220.0, 277.18, 329.63, 440.0];
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.04);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.04 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.04);
        osc.stop(ctx.currentTime + i * 0.04 + 0.46);
      });
    } catch {
      // ignore
    }
  }

  public playSaraikiFolkChime(): void {
    this.playProfessionalChime();
  }

  public playFemaleAnnounceChime(): void {
    this.playProfessionalChime();
  }

  public playScannerBeep(): void {
    this.playProfessionalChime();
  }

  public playStreetHawkerHorn(): void {
    this.playProfessionalChime();
  }

  public playRestockChime(): void {
    this.playProfessionalChime();
  }

  public playLowStockChime(): void {
    this.playProfessionalChime();
  }

  public playErrorBuzz(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // ignore
    }
  }

  /**
   * Finds the best natural girl voice (Urdu / Hindi / South Asian feminine voice)
   */
  public findGirlVoice(): SpeechSynthesisVoice | undefined {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;

    const voices = this.cachedVoices.length > 0
      ? this.cachedVoices
      : window.speechSynthesis.getVoices();

    if (!voices || voices.length === 0) return undefined;

    const femaleKeywords = [
      'female', 'woman', 'girl', 'swara', 'heera', 'kalpana', 'neerja', 'zira', 'samantha',
      'kavya', 'priya', 'aria', 'jenny', 'eva', 'victoria', 'karen', 'moira', 'fiona',
      'veena', 'alva', 'yuna', 'kyoko', 'lekha', 'google हिन्दी', 'google urdu'
    ];

    const maleKeywords = [
      'male', 'david', 'mark', 'george', 'ravi', 'salman', 'tarik', 'guy', 'stefan',
      'richard', 'sean', 'james', 'alex', 'fred', 'daniel', 'oliver', 'thomas', 'man'
    ];

    const isFemale = (v: SpeechSynthesisVoice) => {
      const lower = v.name.toLowerCase();
      return femaleKeywords.some((k) => lower.includes(k)) && !maleKeywords.some((k) => lower.includes(k));
    };

    // Rank 1: Urdu / Hindi / Pakistani regional female voice
    const regionalFemale = voices.find(
      (v) =>
        (v.lang.startsWith('ur') ||
          v.lang.startsWith('hi') ||
          v.lang.startsWith('pa') ||
          v.lang.includes('PK') ||
          v.lang.includes('IN')) &&
        isFemale(v)
    );
    if (regionalFemale) return regionalFemale;

    // Rank 2: Any Urdu / Hindi voice (e.g. Google हिन्दी or ur-PK default)
    const regional = voices.find(
      (v) =>
        v.lang.startsWith('ur') ||
        v.lang.startsWith('hi') ||
        v.name.toLowerCase().includes('urdu') ||
        v.name.toLowerCase().includes('hindi')
    );
    if (regional) return regional;

    // Rank 3: Natural / Neural online female voice
    const naturalFemale = voices.find(
      (v) =>
        (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online')) &&
        isFemale(v)
    );
    if (naturalFemale) return naturalFemale;

    // Rank 4: Any recognized female voice
    const anyFemale = voices.find((v) => isFemale(v));
    if (anyFemale) return anyFemale;

    // Rank 5: Fallback first voice
    return voices[0];
  }

  public findSaraikiGirlVoice(): SpeechSynthesisVoice | undefined {
    return this.findGirlVoice();
  }

  public findOriginalGirlVoice(): SpeechSynthesisVoice | undefined {
    return this.findGirlVoice();
  }

  public findCommercialMaleVoice(): SpeechSynthesisVoice | undefined {
    return this.findGirlVoice();
  }

  private startKeepAlive(): void {
    this.stopKeepAlive();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.keepAliveInterval = setInterval(() => {
        try {
          if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch {
          // ignore
        }
      }, 2000);
    }
  }

  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  /**
   * Primary voice synthesizer: Sweet, cheerful, natural girl voice
   * Pitch: 1.2 (feminine tone) and Rate: 0.98 (natural, clear delivery)
   */
  public speakGirlVoice(
    textRoman: string,
    textNative?: string,
    onEndCallback?: () => void
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.notifyListeners(textRoman, true, 'mandi_girl');
      this.notifyBgListeners(true, textRoman);
      setTimeout(() => {
        this.notifyListeners(textRoman, false, 'mandi_girl');
        this.notifyBgListeners(false, textRoman);
        if (onEndCallback) onEndCallback();
      }, 2500);
      return;
    }

    try {
      this.getAudioContext();
      window.speechSynthesis.cancel();
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }

      const girlVoice = this.findGirlVoice();
      const isUrduVoice = girlVoice && (girlVoice.lang.startsWith('ur') || girlVoice.name.toLowerCase().includes('urdu'));
      const isHindiVoice = girlVoice && (girlVoice.lang.startsWith('hi') || girlVoice.name.toLowerCase().includes('hindi'));

      // If the browser has a true Urdu voice, native script sounds best.
      // If it has a Hindi voice or generic English/multilingual voice, Roman Urdu sounds much clearer and is universally pronounced correctly.
      let textToSpeak = textRoman;
      let langToSet = 'en-US';

      if (isUrduVoice && textNative) {
        textToSpeak = textNative;
        langToSet = girlVoice.lang;
      } else if (isHindiVoice) {
        textToSpeak = textRoman;
        langToSet = girlVoice.lang;
      } else if (girlVoice) {
        textToSpeak = textRoman;
        langToSet = girlVoice.lang;
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      this.currentUtterance = utterance;

      if (girlVoice) {
        utterance.voice = girlVoice;
        utterance.lang = langToSet;
      } else {
        utterance.lang = 'en-US';
      }

      // Natural, pleasant girl voice acoustics
      utterance.pitch = 1.25;
      utterance.rate = 0.95;
      utterance.volume = 1.0;

      this.notifyListeners(textRoman, true, 'mandi_girl');
      this.notifyBgListeners(true, textRoman);
      this.startKeepAlive();

      utterance.onend = () => {
        this.stopKeepAlive();
        this.notifyListeners(textRoman, false, 'mandi_girl');
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = (e: any) => {
        this.stopKeepAlive();
        if (e && (e.error === 'interrupted' || e.error === 'canceled')) {
          return;
        }
        this.notifyListeners(textRoman, false, 'mandi_girl');
        if (onEndCallback) onEndCallback();
      };

      // Directly speak immediately; also wake up speechSynthesis
      try {
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {
        if (onEndCallback) onEndCallback();
      }
    } catch {
      this.stopKeepAlive();
      this.notifyListeners(textRoman, true, 'mandi_girl');
      this.notifyBgListeners(true, textRoman);
      setTimeout(() => {
        this.notifyListeners(textRoman, false, 'mandi_girl');
        this.notifyBgListeners(false, textRoman);
        if (onEndCallback) onEndCallback();
      }, 2000);
    }
  }

  public speakCommercialMaleVoice(
    textRoman: string,
    textNative?: string,
    onEndCallback?: () => void
  ): void {
    this.speakGirlVoice(textRoman, textNative, onEndCallback);
  }

  public speakSaraikiGirlVoice(
    textRomanSaraiki: string,
    textNativeSaraiki?: string,
    onEndCallback?: () => void
  ): void {
    this.speakGirlVoice(textRomanSaraiki, textNativeSaraiki, onEndCallback);
  }

  /**
   * Speak individual vegetable in girl voice:
   * "Aao bhai taza [Sabzi Name] [Price] rupay kilo, mandi se laaye hain taza taza!"
   */
  public speakItem(
    item: InventoryItem,
    _overridePersona?: VoicePersona,
    onEndCallback?: () => void
  ): void {
    const urduPrice = getUrduPriceWords(item.pricePerKg);
    const nativeUrduPrice = getNativeUrduPriceWords(item.pricePerKg);
    const romanText = `Aao bhai taza ${item.commonName} ${urduPrice} rupay kilo, mandi se laaye hain taza taza!`;
    const nativeUrduText = `آؤ بھائی تازہ ${item.urduName} ${nativeUrduPrice} روپے کلو، منڈی سے لائے ہیں تازہ تازہ!`;

    this.playProfessionalChime();
    this.speakGirlVoice(romanText, nativeUrduText, onEndCallback);
  }

  public speakFemaleVoice(
    text: string,
    onEndCallback?: () => void
  ): void {
    this.speakGirlVoice(text, undefined, onEndCallback);
  }

  public speakHawkerVoice(
    text: string,
    onEndCallback?: () => void
  ): void {
    this.speakGirlVoice(text, undefined, onEndCallback);
  }

  public speakRate(
    text: string,
    _langCode: 'ur-PK' | 'hi-IN' | 'en-US' = 'ur-PK',
    onEndCallback?: () => void
  ): void {
    this.speakGirlVoice(text, undefined, onEndCallback);
  }

  public isVoicePlaying(): boolean {
    return this.bgIsSpeaking;
  }

  public isElevenLabsVoicePlaying(): boolean {
    return this.bgIsSpeaking;
  }

  public toggleElevenLabsMandiVoice(): boolean {
    if (this.bgIsSpeaking) {
      this.stopSpeaking();
      return false;
    } else {
      this.playElevenLabsMandiOverview();
      return true;
    }
  }

  public toggleBackgroundRateCycle(): boolean {
    return this.toggleElevenLabsMandiVoice();
  }

  public startFiveMinuteBackgroundRateCycle(): void {
    this.playElevenLabsMandiOverview();
  }

  public stopBackgroundRateCycle(): void {
    this.stopSpeaking();
  }

  public playElevenLabsMandiOverview(onEndCallback?: () => void): void {
    this.stopSpeaking();
    this.bgIsSpeaking = true;
    this.bgChunkIndex = 0;
    this.bgLastSpokenText = GIRL_MANDI_CHUNKS[0].roman;
    this.notifyBgListeners(true, GIRL_MANDI_CHUNKS[0].roman);
    this.playProfessionalChime();

    const playNextChunk = () => {
      if (!this.bgIsSpeaking) return;

      if (this.bgChunkIndex >= GIRL_MANDI_CHUNKS.length) {
        // Complete cycle finished: restart automatically every 1 minute (60 seconds) while website is open
        this.bgChunkIndex = 0;
        this.notifyBgListeners(false, 'Waiting for next 1-minute Mandi rate announcement...');
        this.bgLoopTimer = setTimeout(() => {
          if (this.bgIsSpeaking) {
            this.playProfessionalChime();
            playNextChunk();
          }
        }, 60000);
        return;
      }

      const chunk = GIRL_MANDI_CHUNKS[this.bgChunkIndex];
      this.bgChunkIndex += 1;
      this.bgLastSpokenText = chunk.roman;
      this.notifyBgListeners(true, chunk.roman);

      this.speakGirlVoice(chunk.roman, chunk.urdu, () => {
        if (!this.bgIsSpeaking) return;
        this.bgLoopTimer = setTimeout(() => {
          playNextChunk();
        }, 250);
        if (onEndCallback && this.bgChunkIndex >= GIRL_MANDI_CHUNKS.length) {
          onEndCallback();
        }
      });
    };

    playNextChunk();
  }

  public getBackgroundVoiceState(): BackgroundVoiceState {
    return {
      isActive: this.bgIsSpeaking,
      currentMinute: 1,
      totalMinutes: 1,
      nextAnnouncementInSec: 0,
      isSpeaking: this.bgIsSpeaking,
      lastSpokenText: this.bgLastSpokenText,
    };
  }

  public subscribeBackgroundVoice(listener: (state: BackgroundVoiceState) => void): () => void {
    this.bgListeners.push(listener);
    listener(this.getBackgroundVoiceState());
    return () => {
      this.bgListeners = this.bgListeners.filter((l) => l !== listener);
    };
  }

  private notifyBgListeners(isSpeaking: boolean, text: string): void {
    this.bgIsSpeaking = isSpeaking;
    if (text) this.bgLastSpokenText = text;
    this.broadcastBgState();
  }

  private broadcastBgState(): void {
    const state = this.getBackgroundVoiceState();
    this.bgListeners.forEach((l) => l(state));
  }

  public stopSpeaking(): void {
    this.bgIsSpeaking = false;
    this.bgChunkIndex = 0;
    if (this.bgLoopTimer) {
      clearTimeout(this.bgLoopTimer);
      this.bgLoopTimer = null;
    }
    if (this.pendingSpeechTimer) {
      clearTimeout(this.pendingSpeechTimer);
      this.pendingSpeechTimer = null;
    }
    this.stopKeepAlive();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.notifyListeners('', false, 'mandi_girl');
    this.notifyBgListeners(false, '');
  }

  public subscribe(
    listener: (text: string, isPlaying: boolean, persona: VoicePersona) => void
  ): () => void {
    this.onVoiceStateChangeListeners.push(listener);
    return () => {
      this.onVoiceStateChangeListeners = this.onVoiceStateChangeListeners.filter(
        (l) => l !== listener
      );
    };
  }

  private notifyListeners(text: string, isPlaying: boolean, persona: VoicePersona): void {
    this.onVoiceStateChangeListeners.forEach((listener) =>
      listener(text, isPlaying, persona)
    );
  }
}

export const audioVoiceEngine = new AudioVoiceEngine();
