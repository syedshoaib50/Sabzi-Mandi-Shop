import React, { useState } from 'react';
import { Volume2, ShoppingBag, Sparkles, Check, Info, Plus, Edit3, Trash2, ShieldCheck, Scale, Award, Droplets, AlertCircle } from 'lucide-react';
import { InventoryItem, VegCategory, VoicePersona } from '../types/inventory';
import { audioVoiceEngine, getUrduPriceWords, formatWeight, WEIGHT_OPTIONS } from '../utils/audioVoiceEngine';

interface StorefrontCatalogProps {
  items: InventoryItem[];
  onAddToCart: (item: InventoryItem, qtyKg: number) => void;
  onOpenNutrition: (item?: InventoryItem) => void;
  currentPersona?: VoicePersona;
  onSelectPersona?: (persona: VoicePersona) => void;
  isAdmin?: boolean;
  onOpenAddProduct?: () => void;
  onEditProduct?: (item: InventoryItem) => void;
  onDeleteProduct?: (item: InventoryItem) => void;
}

export const StorefrontCatalog: React.FC<StorefrontCatalogProps> = ({
  items,
  onAddToCart,
  onOpenNutrition,
  isAdmin = false,
  onOpenAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<VegCategory>('all');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [selectedWeights, setSelectedWeights] = useState<Record<string, number>>({});
  const [customWeights, setCustomWeights] = useState<Record<string, string>>({});
  const [customMode, setCustomMode] = useState<Record<string, boolean>>({});

  const filtered = items.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const getItemWeight = (itemId: string): number => {
    return selectedWeights[itemId] ?? 1;
  };

  const handleSelectWeight = (itemId: string, weightKg: number, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    if (weightKg === 0) {
      setCustomMode((prev) => ({ ...prev, [itemId]: true }));
      const currentCustom = parseFloat(customWeights[itemId]) || 2.5;
      setSelectedWeights((prev) => ({ ...prev, [itemId]: currentCustom }));
    } else {
      setCustomMode((prev) => ({ ...prev, [itemId]: false }));
      setSelectedWeights((prev) => ({ ...prev, [itemId]: weightKg }));
    }
  };

  const handleCustomWeightChange = (itemId: string, valueStr: string, e?: React.ChangeEvent) => {
    if (e) e.stopPropagation();
    setCustomWeights((prev) => ({ ...prev, [itemId]: valueStr }));
    const val = parseFloat(valueStr);
    if (!isNaN(val) && val > 0) {
      setSelectedWeights((prev) => ({ ...prev, [itemId]: val }));
    }
  };

  const handleSpeak = (item: InventoryItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setActiveSpeakingId(item.id);
    audioVoiceEngine.speakItem(item, 'mandi_girl', () => {
      setActiveSpeakingId(null);
    });

    // Auto-clear highlight after 4 seconds as fallback
    setTimeout(() => {
      setActiveSpeakingId((prev) => (prev === item.id ? null : prev));
    }, 4000);
  };

  const handleAdd = (item: InventoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const weight = getItemWeight(item.id);
    onAddToCart(item, weight);
    audioVoiceEngine.playScannerBeep();
    const weightStr = formatWeight(weight);
    const cost = Math.round(item.pricePerKg * weight);
    setAddedItemNotice(`Added ${weightStr} ${item.commonName} (Rs. ${cost}) to cart`);
    setTimeout(() => setAddedItemNotice(null), 2500);
  };

  const handleOpenInfo = (item: InventoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenNutrition(item);
  };

  return (
    <section id="catalog-section" className="py-12 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Heading & Voice Persona Switcher */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                Tap Any Vegetable for Hear Voice
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Daily Fresh Vegetable Harvest
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-xl">
                Crisp produce photographed fresh from our morning harvest. <strong className="text-emerald-900">Click on any vegetable</strong> to hear: &ldquo;Aao bhai taza... mandi se laaye hain taza taza!&rdquo;
              </p>
            </div>

            {/* Added Notice Toast */}
            {addedItemNotice && (
              <div className="bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <Check className="w-4 h-4 text-emerald-300" />
                <span>{addedItemNotice}</span>
              </div>
            )}
          </div>

        </div>

        {/* Category Pills & Admin Add Product Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
            {[
              { id: 'all', label: 'All Vegetables (سب سبزیاں)' },
              { id: 'gourd', label: 'Gourds (کدو اور لوکی)' },
              { id: 'leafy', label: 'Leafy Greens (پالک اور ساگ)' },
              { id: 'root', label: 'Roots & Bulbs (آلو اور پیاز)' },
              { id: 'fruit-veg', label: 'Fruit Veg (ٹماٹر اور بھنڈی)' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as VegCategory)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#0f4d36] text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Add Product Button - ONLY SHOWN FOR ADMIN */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAddProduct}
              className="px-4 py-2.5 rounded-xl bg-[#0d533a] hover:bg-[#093d2b] active:scale-95 text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>+ Add Product</span>
            </button>
          )}
        </div>

        {/* Product Grid: Clicking on ANY product triggers voice with name and price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => {
            const isLow = item.currentStock <= item.minThreshold;
            const isSpeaking = activeSpeakingId === item.id;
            const urduPriceWord = getUrduPriceWords(item.pricePerKg);
            const activeCallout = `آؤ بھائی تازہ ${item.urduName} ${urduPriceWord} روپے کلو، منڈی سے لائے ہیں تازہ تازہ!`;
            const currentWeight = getItemWeight(item.id);
            const isCustom = !!customMode[item.id];
            const calculatedCost = Math.round(item.pricePerKg * currentWeight);

            return (
              <div
                key={item.id}
                onClick={() => handleSpeak(item)}
                title={`Click anywhere on ${item.name} to hear girl voice rate!`}
                className={`group bg-white rounded-3xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-950/10 ${
                  isSpeaking
                    ? 'border-emerald-500 ring-4 ring-emerald-500/30 scale-[1.02]'
                    : 'border-slate-200/90 hover:border-emerald-500/60'
                }`}
              >
                <div>
                  {/* Vegetable Picture Frame */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
                      }}
                    />

                    {/* Active Voice Playing Banner */}
                    {isSpeaking && (
                      <div className="absolute inset-x-0 top-0 bg-[#0a4833]/90 text-white p-2 text-center text-xs font-black backdrop-blur-xs flex items-center justify-center gap-2 animate-pulse z-10">
                        <Volume2 className="w-4 h-4 text-amber-300 animate-bounce" />
                        <span>Aao bhai taza {item.commonName} {urduPriceWord} rupay kilo, mandi se laaye hain taza taza!</span>
                      </div>
                    )}

                    {/* Quality Grade Badge & Moisture */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-emerald-900 backdrop-blur-md shadow-xs border border-white/40 flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-600" />
                        Grade {item.qualityGrade}
                      </span>
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md flex items-center gap-1">
                        <Droplets className="w-2.5 h-2.5 text-cyan-300" />
                        {item.moisturePercent}%
                      </span>
                    </div>

                    {/* Stock Freshness Badge */}
                    <div className="absolute top-3 right-3">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm">
                          <AlertCircle className="w-3 h-3" />
                          {item.currentStock} kg left
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-950 bg-emerald-300/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs">
                          {item.currentStock} kg fresh
                        </span>
                      )}
                    </div>

                    {/* Mandi Ka Taza Maal Ribbon */}
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white bg-emerald-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-400/40 shadow-md">
                      <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">Mandi Ka Taza Maal</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    {/* Header Title with Photo Thumbnail and Urdu */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-emerald-200 shadow-2xs shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-900 transition-colors leading-tight truncate">
                            {item.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {item.category.toUpperCase()} • Daily Harvest
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-urdu font-black text-2xl text-emerald-800 block -mt-1">
                          {item.urduName}
                        </span>
                      </div>
                    </div>

                    {/* Rate Box & Voice Trigger */}
                    <div
                      className={`p-3 rounded-2xl border transition-colors flex items-center justify-between gap-2 ${
                        isSpeaking
                          ? 'bg-amber-100 border-amber-300 shadow-inner'
                          : 'bg-gradient-to-br from-[#fbfdfa] to-emerald-50/70 border-emerald-100'
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          Mandi Rate
                        </div>
                        <div className="text-2xl font-black text-slate-900">
                          Rs. {item.pricePerKg}{' '}
                          <span className="text-xs font-semibold text-slate-500">/kg</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleSpeak(item, e)}
                        title="Listen to authentic Mandi rate call"
                        className="px-3.5 py-2.5 rounded-xl bg-[#fae890] hover:bg-[#f6df74] active:scale-95 text-[#243d14] font-black text-xs flex items-center gap-1.5 border border-[#e5d475] shadow-xs transition cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4 text-[#35521a]" />
                        <span>{isSpeaking ? 'Speaking...' : 'Hear Rate'}</span>
                      </button>
                    </div>

                    {/* Weight Options in a list for users */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-[#0d533a] flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Weight (وزن منتخب کریں):</span>
                        </span>
                        <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 text-xs shadow-2xs">
                          {formatWeight(currentWeight)} = <strong className="text-emerald-800">Rs. {calculatedCost}</strong>
                        </span>
                      </div>

                      {/* Weight Options Selection List */}
                      <select
                        value={isCustom ? 'custom' : `${currentWeight}`}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            handleSelectWeight(item.id, 0, e);
                          } else {
                            handleSelectWeight(item.id, parseFloat(val), e);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-800 bg-white border border-emerald-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                      >
                        <option value="0.1">100g (100 گرام) — Rs. {Math.round(item.pricePerKg * 0.1)}</option>
                        <option value="0.25">250g (پاؤ) — Rs. {Math.round(item.pricePerKg * 0.25)}</option>
                        <option value="0.5">500g (آدھا کلو) — Rs. {Math.round(item.pricePerKg * 0.5)}</option>
                        <option value="1">1kg (1 کلو) — Rs. {item.pricePerKg}</option>
                        <option value="1.5">1.5kg (ڈیڑھ کلو) — Rs. {Math.round(item.pricePerKg * 1.5)}</option>
                        <option value="2">2kg (2 کلو) — Rs. {item.pricePerKg * 2}</option>
                        <option value="5">5kg (5 کلو فیملی پیک) — Rs. {item.pricePerKg * 5}</option>
                        <option value="custom">More Weight (مزید وزن منتخب کریں)...</option>
                      </select>

                      {/* Quick Weight Chips for fast single-tap selection */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {WEIGHT_OPTIONS.map((opt) => {
                          const isSelected = opt.id === 'custom' ? isCustom : !isCustom && currentWeight === opt.weightKg;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={(e) => handleSelectWeight(item.id, opt.weightKg, e)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0d533a] text-white shadow-xs font-black ring-1 ring-emerald-600'
                                  : 'bg-white hover:bg-emerald-100 text-slate-700 border border-emerald-200/80'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Weight Input if More Weight is chosen */}
                      {isCustom && (
                        <div className="flex items-center gap-2 pt-1 animate-in fade-in slide-in-from-top-1">
                          <span className="text-[11px] font-bold text-slate-600 shrink-0">Enter Weight:</span>
                          <div className="flex items-center gap-1 flex-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              max="100"
                              value={customWeights[item.id] ?? `${currentWeight}`}
                              onChange={(e) => handleCustomWeightChange(item.id, e.target.value, e)}
                              placeholder="e.g. 3"
                              className="w-full px-2.5 py-1 text-xs font-bold text-slate-800 bg-white border border-emerald-400 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                            />
                            <span className="text-xs font-black text-slate-700 shrink-0">kg</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
                  <button
                    type="button"
                    onClick={(e) => handleOpenInfo(item, e)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer py-2 shrink-0"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nutrition</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleAdd(item, e)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#0d533a] hover:bg-[#093d2b] active:scale-95 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-200" />
                    <span className="truncate">Add {formatWeight(currentWeight)} • Rs. {calculatedCost}</span>
                  </button>
                </div>

                {/* Admin Exclusive: Edit and Delete Product Buttons (Hidden for Users) */}
                {isAdmin && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mx-5 mb-4 p-2 rounded-xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-between gap-2"
                  >
                    <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Admin</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProduct?.(item);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Edit3 className="w-3 h-3 text-slate-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProduct?.(item);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Delete product"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
