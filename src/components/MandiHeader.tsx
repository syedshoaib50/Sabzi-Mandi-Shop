import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShieldCheck, LogIn, LogOut, Package, Volume2, VolumeX, Info } from 'lucide-react';
import { InventoryItem, VoicePersona } from '../types/inventory';
import { User as AuthUser } from '../types/auth';
import { audioVoiceEngine } from '../utils/audioVoiceEngine';

interface MandiHeaderProps {
  items: InventoryItem[];
  cartCount: number;
  cartTotal: number;
  activeSite: 'customer' | 'admin';
  setActiveSite: (site: 'customer' | 'admin') => void;
  activeTab: 'storefront' | 'process';
  setActiveTab: (tab: 'storefront' | 'process') => void;
  onOpenCart: () => void;
  onOpenNutrition: () => void;
  onOpenSyncMonitor: () => void;
  onOpenAuth: () => void;
  onOpenMyRequests: () => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenProfile?: () => void;
  pendingOrdersCount: number;
  customerRequestsCount: number;
  currentPersona?: VoicePersona;
  onSelectPersona?: (persona: VoicePersona) => void;
  onOpenAbout?: () => void;
}

export const MandiHeader: React.FC<MandiHeaderProps> = ({
  cartCount,
  cartTotal,
  activeSite,
  setActiveSite,
  activeTab,
  setActiveTab,
  onOpenCart,
  onOpenNutrition,
  onOpenSyncMonitor,
  onOpenAuth,
  onOpenMyRequests,
  currentUser,
  onLogout,
  onOpenProfile,
  pendingOrdersCount,
  customerRequestsCount,
  onOpenAbout,
}) => {
  const [isVoicePlaying, setIsVoicePlaying] = useState<boolean>(false);

  useEffect(() => {
    const unsubVoice = audioVoiceEngine.subscribe((_text, isPlaying) => {
      setIsVoicePlaying(isPlaying);
    });
    const unsubBg = audioVoiceEngine.subscribeBackgroundVoice((state) => {
      setIsVoicePlaying(state.isSpeaking);
    });
    return () => {
      unsubVoice();
      unsubBg();
    };
  }, []);

  const handleToggleVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }
    if (isVoicePlaying) {
      audioVoiceEngine.stopSpeaking();
    } else {
      audioVoiceEngine.playElevenLabsMandiOverview();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-emerald-100">
      {/* Top Bar: Clean greeting and Admin access only when authenticated */}
      <div className="bg-[#0b3826] text-white text-xs px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Commercial Male Voice Button + Tagline / Admin Portal */}
          <div className="flex items-center gap-2">
            {/* Voice Button on Left Side of Up Green Line */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 ${
                isVoicePlaying
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-amber-400/30 animate-pulse'
                  : 'bg-emerald-800/90 hover:bg-emerald-700 text-amber-300 border border-emerald-500/50 hover:text-white'
              }`}
              title={
                isVoicePlaying
                  ? 'Click to Stop Voice'
                  : 'Click to Listen to Live Mandi Rates Voice'
              }
            >
              {isVoicePlaying ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-950" />
                  <span className="tracking-wide">⏹️ Stop Voice</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                  <span className="tracking-wide">🔊 Voice Rates</span>
                </>
              )}
            </button>

            {currentUser?.role === 'admin' ? (
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-amber-400/40">
                <button
                  onClick={() => setActiveSite('customer')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    activeSite === 'customer'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Storefront</span>
                </button>
                <button
                  onClick={() => setActiveSite('admin')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    activeSite === 'admin'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Desk</span>
                  {pendingOrdersCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <span className="text-emerald-200 font-medium hidden sm:inline">
                🌱 Fresh Green Vegetables Mandi • Pure Farm Harvest
              </span>
            )}
          </div>

          {/* User Account / Role & Quick Auth Switch */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenProfile}
                  title="View Profile & Info (پروفائل دیکھیں)"
                  className="flex items-center gap-1.5 text-xs hover:bg-emerald-900/60 active:scale-95 px-2 py-1 rounded-xl transition cursor-pointer border border-transparent hover:border-emerald-600/40 text-left"
                >
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-full object-cover border border-emerald-400 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-[11px] shrink-0">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="font-bold text-white hidden sm:inline max-w-[120px] truncate underline decoration-dotted decoration-emerald-400">
                    {currentUser.name}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-emerald-400 text-emerald-950'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </button>

                <button
                  onClick={onOpenAuth}
                  title="Switch User or Role"
                  className="text-emerald-200 hover:text-white text-[11px] font-semibold underline cursor-pointer"
                >
                  Switch
                </button>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="text-slate-300 hover:text-rose-300 p-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => {
            setActiveSite('customer');
            setActiveTab('storefront');
          }}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#0d533a] flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
            <svg
              className="w-5 h-5 sm:w-7 sm:h-7 text-[#74d99f]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9A9 9 0 0 0 12 2z" />
              <path d="M12 6v12" />
              <path d="M8 10c2 0 4-2 4-2s2 2 4 2" />
              <path d="M8 14c2 0 4-2 4-2s2 2 4 2" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-black text-[#0f2d1e] tracking-tight">
                Green Vegetable
              </span>
            </div>
            <div className="text-[9px] sm:text-xs font-bold text-[#156e4c] tracking-widest uppercase">
              Online Sabzi Mandi Store
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#1e3f30]">
          <button
            onClick={() => {
              setActiveSite('customer');
              setActiveTab('storefront');
            }}
            className="px-4 py-2 rounded-xl transition cursor-pointer bg-emerald-50 text-emerald-900 font-bold"
          >
            Fresh Produce
          </button>
          {onOpenAbout && (
            <button
              type="button"
              onClick={onOpenAbout}
              className="px-3.5 py-2 rounded-xl transition cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-950 font-black border border-amber-200 text-xs flex items-center gap-1.5"
              title="About Central Sabzi Mandi (ہمارے متعلق معلومات)"
            >
              <Info className="w-3.5 h-3.5 text-amber-700" />
              <span>About Us (ہمارے متعلق)</span>
            </button>
          )}
        </nav>

        {/* Right Actions: My Requests, Sync Live & Cart */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* About Us Button (Visible on mobile/tablet too) */}
          {onOpenAbout && (
            <button
              type="button"
              onClick={onOpenAbout}
              title="About Central Sabzi Mandi (ہمارے متعلق)"
              className="flex md:hidden items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-xs font-black transition cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-amber-700" />
              <span>About</span>
            </button>
          )}

          {/* Customer "My Requests" Button */}
          {activeSite === 'customer' && (
            <button
              onClick={onOpenMyRequests}
              title="Track your sent buying requests"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
              <span className="hidden sm:inline">My Requests</span>
              {customerRequestsCount > 0 && (
                <span className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {customerRequestsCount}
                </span>
              )}
            </button>
          )}

          {/* Real-time Sync Indicator */}
          <button
            onClick={onOpenSyncMonitor}
            title="Real-Time Data Synchronization Status"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-700"></span>
            </span>
            <span className="text-[11px] font-bold">Sync Live</span>
          </button>

          {/* Cart / POS Button */}
          {activeSite === 'customer' && (
            <button
              onClick={onOpenCart}
              title="Open Customer Cart & Send Request"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#0a523a] hover:bg-[#07402d] active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-950/20 transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-200" />
              <span>Cart</span>
              <span className="text-emerald-100 font-bold hidden xs:inline">Rs. {cartTotal}</span>
              {cartCount > 0 && (
                <span className="bg-emerald-300 text-emerald-950 text-xs px-1.5 py-0.5 rounded-full font-black">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
