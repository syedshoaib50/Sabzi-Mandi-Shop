import React, { useState } from 'react';
import {
  GitCommit,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  AlertTriangle,
  Send,
  Droplets,
  ShieldCheck,
  Truck,
  Scale,
  Percent,
  Trash2,
  Printer
} from 'lucide-react';
import { InventoryItem, LowStockAlert, PurchaseOrder } from '../types/inventory';
import { generatePurchaseOrderFromAlerts } from '../utils/inventoryLogic';
import { audioVoiceEngine } from '../utils/audioVoiceEngine';
import confetti from 'canvas-confetti';

interface MandiManagementProcessProps {
  items: InventoryItem[];
  alerts: LowStockAlert[];
  onRestockItem: (itemId: string, addedKg: number) => void;
  onUpdatePrice: (itemId: string, newPrice: number) => void;
}

export const MandiManagementProcess: React.FC<MandiManagementProcessProps> = ({
  items,
  alerts,
  onRestockItem,
  onUpdatePrice,
}) => {
  const [activeStage, setActiveStage] = useState<number>(2);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder>(() =>
    generatePurchaseOrderFromAlerts(alerts, items)
  );
  const [poDispatched, setPoDispatched] = useState<boolean>(false);
  const [discountNotice, setDiscountNotice] = useState<string | null>(null);

  const stages = [
    {
      step: 1,
      time: '05:00 AM',
      title: 'Dawn Harvest & Origin Weighing',
      desc: 'Crops cut at peak moisture under morning dew in Kasur, Multan, and Okara.',
      badge: 'COMPLETED',
      icon: Clock,
    },
    {
      step: 2,
      time: '06:30 AM',
      title: 'Mandi Quality Grading & Intake',
      desc: 'Visual inspection, moisture sensor check (80-95%), and sorting into Grade A+ / A.',
      badge: 'ACTIVE NOW',
      icon: Scale,
    },
    {
      step: 3,
      time: '08:00 AM',
      title: 'Voice Rate Fixing & Multi-Tab Sync',
      desc: 'Auctioneer fixes daily market rates, broadcasting aloud via voice announcer.',
      badge: 'SYNCHRONIZED',
      icon: Sparkles,
    },
    {
      step: 4,
      time: '09:00 AM',
      title: 'Barcode Tagging & Shelf Slotting',
      desc: 'Crates tagged with Code-128 barcodes for automated POS and threshold monitoring.',
      badge: 'AUTOMATED',
      icon: ShieldCheck,
    },
    {
      step: 5,
      time: 'All Day',
      title: 'POS Weigh-out & Cold-Chain Dispatch',
      desc: 'Real-time stock deduction with instant low-stock alerts on threshold breach.',
      badge: 'LIVE MONITOR',
      icon: Truck,
    },
  ];

  const handleDispatchPO = () => {
    setPurchaseOrder((prev) => ({ ...prev, status: 'dispatched' }));
    setPoDispatched(true);
    audioVoiceEngine.playRestockChime();
    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch {}
  };

  const handleApplyClearanceDiscount = (item: InventoryItem) => {
    const discountedPrice = Math.round(item.pricePerKg * 0.7);
    onUpdatePrice(item.id, discountedPrice);
    audioVoiceEngine.playScannerBeep();
    setDiscountNotice(`Applied 30% anti-waste discount to ${item.commonName}! New rate: Rs. ${discountedPrice}/kg`);
    setTimeout(() => setDiscountNotice(null), 3000);
  };

  return (
    <section className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <GitCommit className="w-3.5 h-3.5 text-emerald-700" />
            Standard Operating Procedure (SOP)
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Mandi Inventory Operations & Supply Chain Process
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            From 5 AM farm harvests to automated re-ordering and zero-waste shelf life management.
          </p>
        </div>

        {/* 5-Stage Supply Chain Interactive Flow */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-lg">
              5-Stage Daily Produce Supply Chain
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Pipeline Health: 100% Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {stages.map((stage) => {
              const Icon = stage.icon;
              const isSelected = activeStage === stage.step;

              return (
                <button
                  key={stage.step}
                  onClick={() => setActiveStage(stage.step)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-900 text-white border-emerald-950 shadow-md ring-2 ring-emerald-600'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                        isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-white text-slate-700 border border-slate-200'
                      }`}>
                        {stage.time}
                      </span>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`} />
                    </div>

                    <h4 className="font-black text-sm leading-snug">
                      {stage.title}
                    </h4>
                    <p className={`text-xs mt-1.5 leading-relaxed ${
                      isSelected ? 'text-emerald-100' : 'text-slate-600'
                    }`}>
                      {stage.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-white/10">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      isSelected ? 'text-emerald-300' : 'text-emerald-700'
                    }`}>
                      {stage.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality Grading & Produce Inspection Matrix */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Fresh Produce Quality Grading & Moisture Inspection
              </h3>
              <p className="text-xs text-slate-500">
                Incoming lots inspected for crisp turgidity, natural hydration, and zero chemical polishing.
              </p>
            </div>
            {discountNotice && (
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300 animate-pulse">
                {discountNotice}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-300 shadow-2xs shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">
                      {item.name}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-urdu font-bold text-emerald-800 text-xs">
                        {item.urduName}
                      </span>
                      <span>•</span>
                      <span>{item.farmOrigin}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                        Grade {item.qualityGrade}
                      </span>
                      <span className="text-[10px] text-slate-600 flex items-center gap-0.5 font-medium">
                        <Droplets className="w-3 h-3 text-emerald-600" />
                        {item.moisturePercent}% Moisture
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyClearanceDiscount(item)}
                  title="Apply 30% anti-waste discount for quick sale"
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold transition cursor-pointer shrink-0"
                >
                  Quick Sale
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Automated Purchase Order (PO) Management */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Automated Mandi Supplier Purchase Order (PO)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically calculated from active low-stock deficits ({alerts.length} item{alerts.length !== 1 ? 's' : ''} flagged).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PO</span>
              </button>

              <button
                onClick={handleDispatchPO}
                disabled={poDispatched}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                  poDispatched
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-default'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{poDispatched ? '✓ PO Dispatched to Supplier' : 'Dispatch PO to Mandi Farmers'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="font-bold text-slate-900">PO Number:</span> {purchaseOrder.id}
              </div>
              <div>
                <span className="font-bold text-slate-900">Supplier:</span> {purchaseOrder.supplierName} ({purchaseOrder.supplierPhone})
              </div>
              <div>
                <span className="font-bold text-slate-900">Date:</span> {purchaseOrder.date}
              </div>
            </div>

            <div className="space-y-2">
              {purchaseOrder.items.map((pi, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-slate-400">#{idx + 1}</span>
                    <span className="font-bold text-slate-900">{pi.itemName}</span>
                    <span className="font-urdu text-emerald-800">({pi.urduName})</span>
                  </div>
                  <div>
                    Reorder: <strong>{pi.quantityKg} kg</strong> @ Rs. {pi.estimatedCostPerKg}/kg ={' '}
                    <strong className="text-emerald-900">Rs. {pi.quantityKg * pi.estimatedCostPerKg}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200">
              <span>Total Estimated Reorder Investment:</span>
              <span className="text-emerald-950 font-black">Rs. {purchaseOrder.totalEstimatedAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
