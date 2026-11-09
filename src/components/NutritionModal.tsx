import React from 'react';
import { X, Heart, Shield, Activity, Sparkles } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: InventoryItem | null;
  allItems: InventoryItem[];
}

export const NutritionModal: React.FC<NutritionModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  allItems,
}) => {
  if (!isOpen) return null;

  const displayList = selectedItem ? [selectedItem] : allItems;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-[#14422e] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Nutrition & Ayurvedic Mandi Health Guide
              </h3>
              <p className="text-xs text-emerald-200">
                Nutritional values, calories, and traditional wellness properties
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
          {displayList.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    {item.name}
                  </h4>
                  <span className="font-urdu font-bold text-emerald-800 text-sm">
                    {item.urduName}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                  {item.nutrition}
                </p>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
                  <span>Shelf life: <strong>{item.shelfLifeDays} days</strong></span>
                  <span>•</span>
                  <span>Origin: {item.farmOrigin}</span>
                </div>
              </div>

              <div className="sm:text-right shrink-0 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-xs text-slate-500">Calories</div>
                <div className="text-lg font-black text-emerald-900">
                  {item.caloriesPer100g} <span className="text-[10px] text-slate-500 font-normal">kcal/100g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
