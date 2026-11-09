export interface MandiStat {
  label: string;
  value: string;
  description: string;
}

export interface MandiTeamMember {
  id: string;
  name: string;
  role: string;
  roleUrdu?: string;
  phone: string;
  avatar: string;
}

export interface AboutPageData {
  title: string;
  titleUrdu: string;
  tagline: string;
  taglineUrdu: string;
  story: string;
  storyUrdu: string;
  mission: string;
  missionUrdu: string;
  address: string;
  addressUrdu: string;
  phone: string;
  whatsapp: string;
  email: string;
  operatingHours: string;
  operatingHoursUrdu: string;
  stats: MandiStat[];
  team: MandiTeamMember[];
  lastUpdated: string;
  updatedBy: string;
}

const STORAGE_ABOUT_KEY = 'mandi_about_page_content_v2';

export const DEFAULT_ABOUT_DATA: AboutPageData = {
  title: 'Central Sabzi Mandi Punjab',
  titleUrdu: 'مرکزی سبزی منڈی پنجاب',
  tagline: 'Direct Farm-to-Kitchen Freshness With Zero Middleman Markups',
  taglineUrdu: 'کاشتکاروں سے براہِ راست تازہ سبزیاں، بغیر کسی درمیانی دلال کے',
  story:
    'Established with the mission to eliminate unnecessary middlemen, Central Sabzi Mandi connects regional farmers directly with families, restaurants, and local markets. Every morning at 4:30 AM, our field inspectors grade produce fresh from fertile riverbank farms of Punjab, ensuring fair wholesale pricing and the highest grade of vegetables at your doorstep.',
  storyUrdu:
    'مرکزی سبزی منڈی کا بنیادی مقصد کسانوں کی محنت کا پورا معاوضہ دلانا اور عوام تک کھیتوں کی تازہ سبزیاں انتہائی مناسب نرخوں پر پہنچانا ہے۔ روزانہ صبح 4:30 بجے ہمارے انسپکٹرز دریائی زرخیز علاقوں سے تازہ مال کی جانچ کرتے ہیں تاکہ آپ کے کچن تک صرف اور صرف بہترین، تروتازہ اور معیاری سبزیاں پہنچیں۔',
  mission:
    'To modernize traditional mandi trading through real-time transparent digital pricing, verified weight measurement, anti-inflation rates, and hygienic cold-safe delivery.',
  missionUrdu:
    'شفاف اور سرکاری نرخوں کے مطابق ڈیجیٹل سسٹم، درست وزن کی پیمائش، اور صفائی کے اعلیٰ معیار کے ساتھ سبزیوں کی بروقت فراہمی ہمارا نصب العین ہے۔',
  address: 'Central Wholesale Sabzi Mandi Hub, Sector 4, Operations Main Gate, GT Road, Sheikhupura & Badami Bagh, Lahore',
  addressUrdu: 'مرکزی سبزی منڈی ہب، سیکٹر 4، آپریشنز گیٹ، جی ٹی روڈ شیخوپورہ و بادامی باغ ہب، پنجاب',
  phone: '+92 300 7860110',
  whatsapp: '+92 300 7860110',
  email: 'mandi.admin@gmail.com',
  operatingHours: 'Morning Wholesale: 04:30 AM - 09:30 AM | Home Orders & Delivery: 06:00 AM - 10:00 PM',
  operatingHoursUrdu: 'صبح کی ہول سیل بولی: 4:30 بجے تا 9:30 بجے صبح | ہوم ڈیلیوری: 6:00 بجے صبح تا 10:00 بجے رات',
  stats: [
    {
      label: 'Daily Fresh Produce',
      value: '25,000+ KG',
      description: 'Hand-inspected daily before sunrise',
    },
    {
      label: 'Partnered Farmers',
      value: '120+ Farms',
      description: 'From fertile Sheikhupura & Ravi riverbanks',
    },
    {
      label: 'Happy Families Served',
      value: '18,500+',
      description: 'Verified 5-star fresh delivery rating',
    },
    {
      label: 'Price Savings',
      value: '20% - 35%',
      description: 'Cheaper than open hypermarkets & bazaars',
    },
  ],
  team: [],
  lastUpdated: new Date().toISOString(),
  updatedBy: 'Haji Abdul Rehman (Admin)',
};

class AboutService {
  private data: AboutPageData = DEFAULT_ABOUT_DATA;
  private listeners: Array<(data: AboutPageData) => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_ABOUT_KEY);
      if (stored) {
        this.data = { ...DEFAULT_ABOUT_DATA, ...JSON.parse(stored) };
      } else {
        this.data = { ...DEFAULT_ABOUT_DATA, team: [] };
        localStorage.setItem(STORAGE_ABOUT_KEY, JSON.stringify(this.data));
      }
    } catch {
      this.data = { ...DEFAULT_ABOUT_DATA, team: [] };
    }
  }

  public getData(): AboutPageData {
    return { ...this.data };
  }

  public updateData(
    updates: Partial<AboutPageData>,
    editorName: string
  ): { success: boolean; data?: AboutPageData; error?: string } {
    if (!updates.title?.trim()) {
      return { success: false, error: 'Mandi page title is required.' };
    }
    if (!updates.phone?.trim()) {
      return { success: false, error: 'Contact phone number is required.' };
    }

    this.data = {
      ...this.data,
      ...updates,
      lastUpdated: new Date().toISOString(),
      updatedBy: editorName || 'Admin',
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_ABOUT_KEY, JSON.stringify(this.data));
      } catch (err) {
        console.error('Failed to persist about data', err);
      }
    }

    this.notify();
    return { success: true, data: this.getData() };
  }

  public resetToDefault(editorName: string): AboutPageData {
    this.data = {
      ...DEFAULT_ABOUT_DATA,
      lastUpdated: new Date().toISOString(),
      updatedBy: editorName || 'Admin',
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_ABOUT_KEY, JSON.stringify(this.data));
      } catch (err) {
        console.error('Failed to reset about data', err);
      }
    }
    this.notify();
    return this.getData();
  }

  public subscribe(listener: (data: AboutPageData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const fresh = this.getData();
    this.listeners.forEach((l) => l(fresh));
  }
}

export const aboutService = new AboutService();
