import React, { useState, useEffect } from 'react';
import { X, Radio, RefreshCw, Send, CheckCircle2, Shield, Activity, Laptop } from 'lucide-react';
import { syncService } from '../utils/syncService';
import { SyncMessage, InventoryItem } from '../types/inventory';
import { audioVoiceEngine } from '../utils/audioVoiceEngine';

interface SyncMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onSimulateStockChange: (itemId: string, delta: number, reason: string) => void;
}

export const SyncMonitorModal: React.FC<SyncMonitorModalProps> = ({
  isOpen,
  onClose,
  items,
  onSimulateStockChange,
}) => {
  const [messages, setMessages] = useState<{ id: string; time: string; msg: SyncMessage }[]>([]);
  const [activePeers, setActivePeers] = useState<number>(syncService.getPeerCount());

  useEffect(() => {
    const unsubscribe = syncService.onMessage((msg) => {
      setMessages((prev) => [
        {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString(),
          msg,
        },
        ...prev.slice(0, 19),
      ]);
      setActivePeers(syncService.getPeerCount());
    });

    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const triggerSimulatedHarvest = () => {
    const kaddu = items.find((i) => i.barcode === 'VEG-KAD-101') || items[0];
    if (kaddu) {
      onSimulateStockChange(kaddu.id, 50, 'Simulated Warehouse Harvest Arrival (+50kg Kaddu)');
      audioVoiceEngine.playRestockChime();
    }
  };

  const triggerSimulatedSale = () => {
    const palak = items.find((i) => i.barcode === 'VEG-PAL-103') || items[1];
    if (palak) {
      onSimulateStockChange(palak.id, -2, 'Simulated Background Counter POS Sale (-2kg Palak)');
      audioVoiceEngine.playScannerBeep();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Real-Time Data Synchronization Engine
              </h3>
              <p className="text-xs text-slate-400">
                BroadcastChannel + Storage Cross-Tab Sync Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Metric Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Sync Status</span>
              <div className="mt-1 flex items-center gap-1.5 font-black text-emerald-700 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                ACTIVE
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Local Node ID</span>
              <div className="mt-1 font-mono font-bold text-slate-800 text-xs truncate">
                {syncService.getClientId()}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Connected Tabs</span>
              <div className="mt-1 font-black text-slate-800 text-sm">
                {activePeers} Active Window{activePeers > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Test Simulation Controls */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Multi-Node Simulation Triggers:
              </h4>
            </div>
            <p className="text-xs text-slate-600">
              Test how warehouse workers and counter cashiers update inventory concurrently across tabs in real-time.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={triggerSimulatedHarvest}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Warehouse Harvest (+50kg Kaddu)</span>
              </button>

              <button
                onClick={triggerSimulatedSale}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Counter POS Sale (-2kg Palak)</span>
              </button>
            </div>
          </div>

          {/* Live Message Stream */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Live Synchronized Event Stream:
            </h4>
            <div className="h-44 overflow-y-auto bg-slate-950 rounded-2xl p-3 font-mono text-[11px] space-y-1.5 text-slate-300 border border-slate-800">
              {messages.length === 0 ? (
                <div className="text-slate-500 italic py-8 text-center">
                  Listening for broadcast events across tabs. Trigger an adjustment or scan an item to see live event logs...
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="border-b border-slate-800/80 pb-1 flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0">[{m.time}]</span>
                    <span className="text-amber-400 shrink-0">{m.msg.type}:</span>
                    <span className="text-slate-300 truncate">
                      {JSON.stringify(m.msg.payload)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
