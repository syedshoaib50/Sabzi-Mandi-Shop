export type VegCategory = 'all' | 'leafy' | 'gourd' | 'root' | 'fruit-veg' | 'seasoning';

export type StockStatus = 'healthy' | 'low' | 'critical' | 'out_of_stock';

export type VoicePersona = 'mandi_girl';

export interface InventoryItem {
  id: string;
  name: string;
  commonName: string;
  urduName: string;
  saraikiPhrase: string;
  urduPhrase: string;
  girlPhrase: string;
  hawkerManCall: string;
  category: VegCategory;
  pricePerKg: number;
  costPerKg: number;
  currentStock: number;
  minThreshold: number;
  maxCapacity: number;
  barcode: string;
  harvestDate: string;
  farmOrigin: string;
  nutrition: string;
  caloriesPer100g: number;
  shelfLifeDays: number;
  unit: string;
  image: string;
  qualityGrade: 'A+' | 'A' | 'B';
  moisturePercent: number;
  lastUpdated: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  barcode: string;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'wastage';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  timestamp: string;
  operator: string;
  syncedAcrossTabs: boolean;
}

export interface LowStockAlert {
  itemId: string;
  itemName: string;
  urduName: string;
  barcode: string;
  currentStock: number;
  minThreshold: number;
  deficit: number;
  severity: 'low' | 'critical' | 'out_of_stock';
  timestamp: string;
  suggestedReorderKg: number;
  supplierContact: string;
}

export interface SyncMessage {
  type: 'STOCK_UPDATE' | 'ITEM_ADDED' | 'ITEM_UPDATED' | 'ITEM_DELETED' | 'PRICE_CHANGE' | 'HEARTBEAT' | 'RESTOCK_ALL' | 'ORDER_CREATED' | 'ORDER_UPDATED';
  sourceId: string;
  timestamp: number;
  payload: any;
}

export interface PurchaseOrder {
  id: string;
  supplierName: string;
  supplierPhone: string;
  date: string;
  status: 'draft' | 'dispatched' | 'received';
  items: {
    itemId: string;
    itemName: string;
    urduName: string;
    quantityKg: number;
    estimatedCostPerKg: number;
  }[];
  totalEstimatedAmount: number;
}

export interface SpoilageLog {
  id: string;
  itemId: string;
  itemName: string;
  quantityKg: number;
  reason: 'wilted' | 'bruised' | 'overripe' | 'trimming';
  date: string;
  recordedBy: string;
}
