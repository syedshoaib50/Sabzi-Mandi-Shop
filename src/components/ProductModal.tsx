import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, Image, Sparkles, Tag, DollarSign, Package, AlertTriangle, Check, Layers } from 'lucide-react';
import { InventoryItem, VegCategory } from '../types/inventory';
import { audioVoiceEngine } from '../utils/audioVoiceEngine';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: InventoryItem, isNew: boolean) => void;
  initialItem?: InventoryItem | null;
}

// Popular vegetable presets with high-quality photos for fast admin entry
const VEGETABLE_PRESETS = [
  {
    name: 'Gajar (Red Sweet Carrots)',
    commonName: 'Gajar',
    urduName: 'گاجر',
    category: 'root' as VegCategory,
    price: 90,
    cost: 65,
    origin: 'Faisalabad Agro Fields',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=600&q=80',
    nutrition: 'High beta-carotene, Vitamin A for eye health and skin vibrancy',
  },
  {
    name: 'Shimla Mirch (Green Capsicum)',
    commonName: 'Shimla Mirch',
    urduName: 'شملہ مرچ',
    category: 'fruit-veg' as VegCategory,
    price: 180,
    cost: 130,
    origin: 'Swat Valley Terraces',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Rich in Vitamin C, boosts immunity and cellular health',
  },
  {
    name: 'Kheera (Crisp Farm Cucumbers)',
    commonName: 'Kheera',
    urduName: 'کھیرا',
    category: 'fruit-veg' as VegCategory,
    price: 80,
    cost: 55,
    origin: 'Gujranwala Green Valley',
    image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Hydrating, contains silica and potassium for skin refreshment',
  },
  {
    name: 'Phool Gobhi (Cauliflower)',
    commonName: 'Phool Gobhi',
    urduName: 'پھول گوبھی',
    category: 'root' as VegCategory,
    price: 120,
    cost: 85,
    origin: 'Kasur Farm Belt',
    image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Packed with fiber, B-vitamins and antioxidant glucosinolates',
  },
  {
    name: 'Band Gobhi (Crisp Green Cabbage)',
    commonName: 'Band Gobhi',
    urduName: 'بند گوبھی',
    category: 'leafy' as VegCategory,
    price: 70,
    cost: 50,
    origin: 'Sheikhupura Farmland',
    image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Dietary fiber and vitamin K, supports heart and gut health',
  },
  {
    name: 'Baingan (Purple Eggplant / Brinjal)',
    commonName: 'Baingan',
    urduName: 'بینگن',
    category: 'fruit-veg' as VegCategory,
    price: 90,
    cost: 60,
    origin: 'Multan Agro Fields',
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Contains nasunin anthocyanins and polyphenols for cardiovascular health',
  },
  {
    name: 'Adrak (Fresh Desi Ginger)',
    commonName: 'Adrak',
    urduName: 'ادرک',
    category: 'seasoning' as VegCategory,
    price: 450,
    cost: 360,
    origin: 'Northern Agro Import',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Gingerol active compound aids digestion and reduces systemic inflammation',
  },
  {
    name: 'Lehsan (Desi Garlic Bulbs)',
    commonName: 'Lehsan',
    urduName: 'لہسن',
    category: 'seasoning' as VegCategory,
    price: 380,
    cost: 300,
    origin: 'Khyber Desi Farms',
    image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Allicin compound supports arterial elasticity and immune defenses',
  },
  {
    name: 'Harri Mirch (Spicy Green Chillies)',
    commonName: 'Harri Mirch',
    urduName: 'ہری مرچ',
    category: 'seasoning' as VegCategory,
    price: 160,
    cost: 110,
    origin: 'Sindh Spice Farms',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
    nutrition: 'High capsaicin content stimulates metabolism and circulation',
  },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const isEditing = !!initialItem;

  const [name, setName] = useState<string>('');
  const [commonName, setCommonName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [category, setCategory] = useState<VegCategory>('fruit-veg');
  const [pricePerKg, setPricePerKg] = useState<number>(100);
  const [costPerKg, setCostPerKg] = useState<number>(75);
  const [currentStock, setCurrentStock] = useState<number>(40);
  const [minThreshold, setMinThreshold] = useState<number>(15);
  const [maxCapacity, setMaxCapacity] = useState<number>(100);
  const [image, setImage] = useState<string>('');
  const [farmOrigin, setFarmOrigin] = useState<string>('Pattoki Organic Fields');
  const [qualityGrade, setQualityGrade] = useState<'A+' | 'A' | 'B'>('A+');
  const [moisturePercent, setMoisturePercent] = useState<number>(90);
  const [nutrition, setNutrition] = useState<string>('Fresh dietary fiber and essential minerals');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setCommonName(initialItem.commonName);
      setUrduName(initialItem.urduName);
      setCategory(initialItem.category);
      setPricePerKg(initialItem.pricePerKg);
      setCostPerKg(initialItem.costPerKg || Math.round(initialItem.pricePerKg * 0.75));
      setCurrentStock(initialItem.currentStock);
      setMinThreshold(initialItem.minThreshold);
      setMaxCapacity(initialItem.maxCapacity);
      setImage(initialItem.image);
      setFarmOrigin(initialItem.farmOrigin);
      setQualityGrade(initialItem.qualityGrade || 'A+');
      setMoisturePercent(initialItem.moisturePercent || 90);
      setNutrition(initialItem.nutrition);
    } else {
      // Default new product template
      setName('');
      setCommonName('');
      setUrduName('');
      setCategory('fruit-veg');
      setPricePerKg(100);
      setCostPerKg(75);
      setCurrentStock(50);
      setMinThreshold(15);
      setMaxCapacity(120);
      setImage('https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=600&q=80');
      setFarmOrigin('Pattoki Organic Fields');
      setQualityGrade('A+');
      setMoisturePercent(92);
      setNutrition('Fresh farm harvested vegetable, rich in dietary fiber and nutrients');
    }
    setError(null);
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof VEGETABLE_PRESETS[0]) => {
    setName(preset.name);
    setCommonName(preset.commonName);
    setUrduName(preset.urduName);
    setCategory(preset.category);
    setPricePerKg(preset.price);
    setCostPerKg(preset.cost);
    setImage(preset.image);
    setFarmOrigin(preset.origin);
    setNutrition(preset.nutrition);
    audioVoiceEngine.playScannerBeep();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter vegetable product name.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }
    if (!urduName.trim()) {
      setError('Please enter Urdu name (e.g. گاجر).');
      audioVoiceEngine.playErrorBuzz();
      return;
    }
    if (pricePerKg <= 0) {
      setError('Price per kg must be greater than Rs. 0.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }
    if (currentStock < 0) {
      setError('Stock cannot be negative.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    const cName = commonName.trim() || name.split('(')[0].trim();
    const barcodeCode = initialItem?.barcode || `VEG-${cName.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const savedProduct: InventoryItem = {
      id: initialItem?.id || `veg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      commonName: cName,
      urduName: urduName.trim(),
      saraikiPhrase: initialItem?.saraikiPhrase || `${cName} ${pricePerKg} rupay kilo hay bhai, taaza khet da maal`,
      urduPhrase: initialItem?.urduPhrase || `${cName} ${pricePerKg} rupay kilo, taza sabzi mandi rate`,
      girlPhrase: initialItem?.girlPhrase || `Taza ${cName} sirf ${pricePerKg} rupay kilo dastyab hai, bohat khalis aur naram!`,
      hawkerManCall: initialItem?.hawkerManCall || `Aao le lo taza ${cName}! ${pricePerKg} rupay kilo! Ek dam taaza sabzi!`,
      category,
      pricePerKg: Number(pricePerKg),
      costPerKg: Number(costPerKg) || Math.round(Number(pricePerKg) * 0.75),
      currentStock: Number(currentStock),
      minThreshold: Number(minThreshold),
      maxCapacity: Number(maxCapacity),
      barcode: barcodeCode,
      harvestDate: initialItem?.harvestDate || 'Today 5:00 AM',
      farmOrigin: farmOrigin.trim() || 'Desi Farm Fields',
      nutrition: nutrition.trim() || 'Fresh source of dietary fiber and natural vitamins',
      caloriesPer100g: initialItem?.caloriesPer100g || 25,
      shelfLifeDays: initialItem?.shelfLifeDays || 5,
      unit: 'kg',
      image: image.trim() || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      qualityGrade,
      moisturePercent: Number(moisturePercent),
      lastUpdated: new Date().toISOString(),
    };

    onSave(savedProduct, !isEditing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a4833] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider mb-0.5">
                Admin Privilege
              </div>
              <h3 className="font-black text-lg">
                {isEditing ? `Edit Vegetable: ${initialItem?.name}` : 'Add New Vegetable Product'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 animate-in fade-in">
              {error}
            </div>
          )}

          {/* Quick 1-Click Presets for Adding New Vegetable */}
          {!isEditing && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Quick 1-Click Vegetable Presets:</span>
                </span>
                <span className="text-[10px] text-emerald-800 font-bold">
                  Autofills name, Urdu & photo
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VEGETABLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300/80 transition cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <span>{preset.commonName}</span>
                    <span className="font-urdu text-[11px] text-emerald-700 font-bold">
                      ({preset.urduName})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: English Name & Urdu Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!commonName) setCommonName(e.target.value.split('(')[0].trim());
                  }}
                  placeholder="e.g. Gajar (Red Sweet Carrots)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Urdu Name (اردو نام) *
                </label>
                <input
                  type="text"
                  value={urduName}
                  onChange={(e) => setUrduName(e.target.value)}
                  placeholder="e.g. گاجر یا بینگن"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold font-urdu text-right focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>
            </div>

            {/* Row 2: Common Short Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Common Name (Used in Voice) *
                </label>
                <input
                  type="text"
                  value={commonName}
                  onChange={(e) => setCommonName(e.target.value)}
                  placeholder="e.g. Gajar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VegCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="fruit-veg">Fruit Veg (ٹماٹر، بھنڈی، کھیرا)</option>
                  <option value="root">Roots & Bulbs (آلو، پیاز، گاجر)</option>
                  <option value="leafy">Leafy Greens (پالک، ساگ، میتھی)</option>
                  <option value="gourd">Gourds (کدو، لوکی، کریلا)</option>
                  <option value="seasoning">Seasoning (ادرک، لہسن، مرچ)</option>
                </select>
              </div>
            </div>

            {/* Row 3: Rates & Stock */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sale Rate (Rs/kg) *
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    min="1"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cost (Rs/kg)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    min="1"
                    value={costPerKg}
                    onChange={(e) => setCostPerKg(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Stock (kg) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Low Stock Min (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Row 4: Image URL & Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Vegetable Photo Image URL *
              </label>
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <Image className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
                <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Farm Origin & Quality Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Farm Origin
                </label>
                <input
                  type="text"
                  value={farmOrigin}
                  onChange={(e) => setFarmOrigin(e.target.value)}
                  placeholder="e.g. Faisalabad Riverbed Agro Fields"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quality Grade
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="A+">Grade A+ (Premium Export)</option>
                  <option value="A">Grade A (Fresh Daily)</option>
                  <option value="B">Grade B (Standard)</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="product-form"
            className="px-6 py-2.5 rounded-xl bg-[#0d533a] hover:bg-[#093d2b] active:scale-95 text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{isEditing ? 'Save Product Changes' : 'Add Product to Mandi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
