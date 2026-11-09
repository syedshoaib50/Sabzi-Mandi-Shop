import React from 'react';
import { CheckCircle2, Truck, ShieldCheck, ArrowDown } from 'lucide-react';
import { VoicePersona } from '../types/inventory';

interface HeroSectionProps {
  onBrowseClick: () => void;
  onOpenProcess?: () => void;
  currentPersona?: VoicePersona;
  onSelectPersona?: (persona: VoicePersona) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBrowseClick,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-[#fbfdfa] via-[#f7fbf6] to-white border-b border-emerald-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Heading, description, browse action */}
          <div className="lg:col-span-7 space-y-6">
            {/* Clean Main Headline (With Live Voice Rates highlight removed per user request) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#13271e] tracking-tight leading-[1.15]">
              Fresh Green Vegetables
            </h1>

            {/* Description Paragraph */}
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal max-w-2xl">
              Every vegetable announced aloud with fresh live rates. Click on any vegetable to hear its price, delivered crisp to your doorstep.
            </p>

            {/* Action Button: Browse All Sabzi (Management Process SOP removed per user request) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onBrowseClick}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold shadow-md shadow-emerald-950/20 transition cursor-pointer text-sm"
              >
                <span>Browse All Sabzi</span>
                <ArrowDown className="w-4 h-4 text-emerald-200" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200/70 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Daily 5 AM Harvest</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Free delivery &gt; Rs. 299</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Fresh Vegetables Produce Showcase (Overlay bottom voice test card removed per user request) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/20 border-4 border-white bg-slate-100">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-emerald-950">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
                  alt="Fresh green vegetables produce market stall"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Corner Badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Fresh Organic Local
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
