import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getStockStatus,
  calculateLowStockAlerts,
  adjustStock,
  findItemByBarcodeOrQuery,
  calculateInventoryMetrics,
  getSpokenPhraseByPersona,
  generatePurchaseOrderFromAlerts,
} from './inventoryLogic';
import { InventoryItem } from '../types/inventory';

const mockItems: InventoryItem[] = [
  {
    id: 'item-1',
    name: 'Kaddu (Bottle Gourd)',
    commonName: 'Kaddu',
    urduName: 'کدو',
    saraikiPhrase: 'Kaddu sau rupay kilo hay bhai',
    urduPhrase: 'Kaddu aik sau rupay kilo',
    girlPhrase: 'Taza kaddu sau rupay kilo!',
    hawkerManCall: 'Awaaz suno bhai! Kaddu sau rupay kilo!',
    category: 'gourd',
    pricePerKg: 100,
    costPerKg: 70,
    currentStock: 25,
    minThreshold: 15,
    maxCapacity: 100,
    barcode: 'VEG-KAD-101',
    harvestDate: 'Today 5:00 AM',
    farmOrigin: 'Multan Riverbed Farm',
    nutrition: 'Rich in dietary fiber and water',
    caloriesPer100g: 14,
    shelfLifeDays: 5,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1570527140771-020881225262?auto=format&fit=crop&w=600&q=80',
    qualityGrade: 'A+',
    moisturePercent: 92,
    lastUpdated: '2026-11-02T05:00:00Z',
  },
  {
    id: 'item-2',
    name: 'Palak (Fresh Spinach)',
    commonName: 'Palak',
    urduName: 'پالک',
    saraikiPhrase: 'Palak panjah rupay kilo',
    urduPhrase: 'Palak pachaas rupay kilo',
    girlPhrase: 'Taza desi palak pachaas rupay kilo!',
    hawkerManCall: 'O palak aa gayi bhai! Pachaas rupay kilo!',
    category: 'leafy',
    pricePerKg: 50,
    costPerKg: 30,
    currentStock: 5, // Below minThreshold of 12 (Critical <= 6)
    minThreshold: 12,
    maxCapacity: 60,
    barcode: 'VEG-PAL-103',
    harvestDate: 'Today 5:00 AM',
    farmOrigin: 'Kasur Canal Greenbelt',
    nutrition: 'High iron, vitamin A and C',
    caloriesPer100g: 23,
    shelfLifeDays: 2,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    qualityGrade: 'A',
    moisturePercent: 88,
    lastUpdated: '2026-11-02T05:00:00Z',
  },
];

test('getStockStatus classifies correctly', () => {
  assert.equal(getStockStatus(25, 15), 'healthy');
  assert.equal(getStockStatus(10, 15), 'low');
  assert.equal(getStockStatus(5, 12), 'critical');
  assert.equal(getStockStatus(0, 20), 'out_of_stock');
});

test('calculateLowStockAlerts flags low items', () => {
  const alerts = calculateLowStockAlerts(mockItems);
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].barcode, 'VEG-PAL-103');
  assert.equal(alerts[0].severity, 'critical');
});

test('generatePurchaseOrderFromAlerts generates complete PO structure', () => {
  const alerts = calculateLowStockAlerts(mockItems);
  const po = generatePurchaseOrderFromAlerts(alerts, mockItems);
  assert.ok(po.id.startsWith('PO-MANDI-'));
  assert.equal(po.items.length, 1);
  assert.equal(po.items[0].itemName, 'Palak (Fresh Spinach)');
  assert.ok(po.totalEstimatedAmount > 0);
});

test('getSpokenPhraseByPersona returns pure Saraiki girl voice script', () => {
  const item = mockItems[0];
  assert.equal(getSpokenPhraseByPersona(item, 'mandi_girl'), 'Kaddu sau rupay kilo hay bhai');
  assert.equal(getSpokenPhraseByPersona(item), 'Kaddu sau rupay kilo hay bhai');
});

