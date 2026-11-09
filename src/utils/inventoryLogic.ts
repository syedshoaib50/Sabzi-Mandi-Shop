import { InventoryItem, LowStockAlert, PurchaseOrder, StockStatus, VoicePersona } from '../types/inventory';

/**
 * Determine stock status based on current stock and threshold
 */
export function getStockStatus(currentStock: number, minThreshold: number): StockStatus {
  if (currentStock <= 0) {
    return 'out_of_stock';
  }
  if (currentStock <= minThreshold * 0.5) {
    return 'critical';
  }
  if (currentStock <= minThreshold) {
    return 'low';
  }
  return 'healthy';
}

/**
 * Filter items that are currently under their threshold and create alerts
 */
export function calculateLowStockAlerts(items: InventoryItem[]): LowStockAlert[] {
  const alerts: LowStockAlert[] = [];

  for (const item of items) {
    const status = getStockStatus(item.currentStock, item.minThreshold);
    if (status !== 'healthy') {
      const deficit = Math.max(0, item.minThreshold - item.currentStock);
      const suggestedReorderKg = Math.max(
        item.minThreshold * 2,
        Math.round(item.maxCapacity * 0.75 - item.currentStock)
      );

      alerts.push({
        itemId: item.id,
        itemName: item.name,
        urduName: item.urduName,
        barcode: item.barcode,
        currentStock: item.currentStock,
        minThreshold: item.minThreshold,
        deficit,
        severity: status === 'out_of_stock' ? 'out_of_stock' : status === 'critical' ? 'critical' : 'low',
        timestamp: new Date().toISOString(),
        suggestedReorderKg: Math.max(5, suggestedReorderKg),
        supplierContact: item.farmOrigin.includes('Multan')
          ? '+92 300 8765432 (Multan Mandi Chacha)'
          : '+92 321 4567890 (Pattoki Farmer Co-op)',
      });
    }
  }

  return alerts.sort((a, b) => {
    const order = { out_of_stock: 0, critical: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

/**
 * Generate an official supplier Purchase Order (PO) from low-stock alerts
 */
export function generatePurchaseOrderFromAlerts(alerts: LowStockAlert[], items: InventoryItem[]): PurchaseOrder {
  const poItems = alerts.map((alert) => {
    const item = items.find((i) => i.id === alert.itemId);
    const estimatedCost = item ? item.costPerKg : 40;
    return {
      itemId: alert.itemId,
      itemName: alert.itemName,
      urduName: alert.urduName,
      quantityKg: alert.suggestedReorderKg,
      estimatedCostPerKg: estimatedCost,
    };
  });

  const totalEstimatedAmount = poItems.reduce(
    (sum, p) => sum + p.quantityKg * p.estimatedCostPerKg,
    0
  );

  return {
    id: 'PO-MANDI-' + Date.now().toString().slice(-6),
    supplierName: 'Punjab Farmers & Mandi Arthi Association',
    supplierPhone: '+92 300 7865432',
    date: new Date().toLocaleDateString('en-GB'),
    status: 'draft',
    items: poItems,
    totalEstimatedAmount,
  };
}

/**
 * Safely adjust stock level with constraints
 */
export function adjustStock(
  currentStock: number,
  delta: number,
  maxCapacity: number = 500
): { newStock: number; actualChange: number } {
  const desired = currentStock + delta;
  const clamped = Math.max(0, Math.min(maxCapacity, desired));
  const rounded = Math.round(clamped * 10) / 10;
  return {
    newStock: rounded,
    actualChange: Math.round((rounded - currentStock) * 10) / 10,
  };
}

/**
 * Search items by barcode, name, common name, or urdu name
 */
export function findItemByBarcodeOrQuery(items: InventoryItem[], query: string): InventoryItem | undefined {
  const clean = query.trim().toLowerCase();
  if (!clean) return undefined;

  const barcodeMatch = items.find(
    (i) => i.barcode.toLowerCase() === clean || i.barcode.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === clean.replace(/[^a-zA-Z0-9]/g, '')
  );
  if (barcodeMatch) return barcodeMatch;

  return items.find(
    (i) =>
      i.name.toLowerCase().includes(clean) ||
      i.commonName.toLowerCase().includes(clean) ||
      i.urduName.includes(clean)
  );
}

/**
 * Calculate store inventory valuation metrics
 */
export function calculateInventoryMetrics(items: InventoryItem[]) {
  let totalStockKg = 0;
  let totalRetailValue = 0;
  let totalCostValue = 0;
  let lowStockCount = 0;
  let criticalStockCount = 0;
  let healthyCount = 0;

  for (const item of items) {
    totalStockKg += item.currentStock;
    totalRetailValue += item.currentStock * item.pricePerKg;
    totalCostValue += item.currentStock * item.costPerKg;

    const status = getStockStatus(item.currentStock, item.minThreshold);
    if (status === 'critical' || status === 'out_of_stock') {
      criticalStockCount++;
      lowStockCount++;
    } else if (status === 'low') {
      lowStockCount++;
    } else {
      healthyCount++;
    }
  }

  const expectedProfit = totalRetailValue - totalCostValue;
  const marginPercent = totalRetailValue > 0 ? (expectedProfit / totalRetailValue) * 100 : 0;
  const healthScore = items.length > 0 ? Math.round((healthyCount / items.length) * 100) : 100;

  return {
    totalItems: items.length,
    totalStockKg: Math.round(totalStockKg * 10) / 10,
    totalRetailValue: Math.round(totalRetailValue),
    totalCostValue: Math.round(totalCostValue),
    expectedProfit: Math.round(expectedProfit),
    marginPercent: Math.round(marginPercent * 10) / 10,
    lowStockCount,
    criticalStockCount,
    healthyCount,
    healthScore,
  };
}

/**
 * Format speech utterance text in pure Saraiki girl voice
 */
export function getSpokenPhraseByPersona(
  item: InventoryItem,
  _persona: VoicePersona = 'mandi_girl'
): string {
  return item.saraikiPhrase || item.girlPhrase || item.urduPhrase;
}
