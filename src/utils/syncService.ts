import { InventoryItem, StockTransaction, SyncMessage } from '../types/inventory';

// Cross-tab real-time sync service using BroadcastChannel + Storage events
const CHANNEL_NAME = 'mandi_inventory_sync_channel';
const STORAGE_BACKUP_KEY = 'mandi_inventory_sync_payload';

export class SyncService {
  private channel: BroadcastChannel | null = null;
  private clientId: string;
  private messageListeners: ((msg: SyncMessage) => void)[] = [];
  private peerCount: number = 1;
  private lastSyncTime: number = Date.now();

  constructor() {
    this.clientId = 'node_' + Math.random().toString(36).substring(2, 9);

    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
            this.handleIncoming(event.data);
          };
        } catch {
          this.channel = null;
        }
      }

      // Storage event backup for older browsers or if BroadcastChannel is blocked
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_BACKUP_KEY && e.newValue) {
          try {
            const data: SyncMessage = JSON.parse(e.newValue);
            if (data.sourceId !== this.clientId) {
              this.handleIncoming(data);
            }
          } catch {
            // ignore
          }
        }
      });

      // Send initial heartbeat to detect peers
      this.broadcast({
        type: 'HEARTBEAT',
        sourceId: this.clientId,
        timestamp: Date.now(),
        payload: { action: 'join' },
      });
    }
  }

  private handleIncoming(msg: SyncMessage) {
    if (msg.sourceId === this.clientId) return;

    this.lastSyncTime = Date.now();

    if (msg.type === 'HEARTBEAT') {
      this.peerCount = Math.max(2, this.peerCount + 1);
    }

    this.messageListeners.forEach((listener) => listener(msg));
  }

  public broadcast(msg: SyncMessage): void {
    this.lastSyncTime = Date.now();

    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {
        // ignore
      }
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify(msg));
      } catch {
        // ignore
      }
    }
  }

  public broadcastStockChange(
    itemId: string,
    delta: number,
    newStock: number,
    transaction: StockTransaction
  ): void {
    this.broadcast({
      type: 'STOCK_UPDATE',
      sourceId: this.clientId,
      timestamp: Date.now(),
      payload: { itemId, delta, newStock, transaction },
    });
  }

  public broadcastPriceChange(itemId: string, newPrice: number): void {
    this.broadcast({
      type: 'PRICE_CHANGE',
      sourceId: this.clientId,
      timestamp: Date.now(),
      payload: { itemId, newPrice },
    });
  }

  public broadcastRestockAll(items: { id: string; addedKg: number }[]): void {
    this.broadcast({
      type: 'RESTOCK_ALL',
      sourceId: this.clientId,
      timestamp: Date.now(),
      payload: { items },
    });
  }

  public broadcastItemAdded(item: InventoryItem): void {
    this.broadcast({
      type: 'ITEM_ADDED',
      sourceId: this.clientId,
      timestamp: Date.now(),
      payload: { item },
    });
  }

  public broadcastItemUpdated(item: InventoryItem): void {
    this.broadcast({
      type: 'ITEM_UPDATED',
      sourceId: this.clientId,
      timestamp: Date.now(),
      payload: { item },
    });
  }

  public broadcastItemDeleted(itemId: string): void {
    this.broadcast({
      type: 'ITEM_DELETED',
      sourceId: this.clientId,
      timestamp: Date.now(),
      payload: { itemId },
    });
  }

  public onMessage(callback: (msg: SyncMessage) => void): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter((l) => l !== callback);
    };
  }

  public getClientId(): string {
    return this.clientId;
  }

  public getLastSyncTime(): number {
    return this.lastSyncTime;
  }

  public getPeerCount(): number {
    return this.peerCount;
  }
}

export const syncService = new SyncService();
