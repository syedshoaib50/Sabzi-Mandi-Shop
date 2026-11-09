import { BuyingRequest, OrderStatus } from '../types/order';
import { syncService } from './syncService';

const STORAGE_ORDERS_KEY = 'mandi_buying_requests_v1';

export const INITIAL_ORDERS: BuyingRequest[] = [
  {
    id: 'req_001',
    orderNumber: 'MANDI-1082',
    customerId: 'user_cust_1',
    customerName: 'Muhammad Ali Khan',
    customerPhone: '0300-8452109',
    customerAddress: 'House 24-B, Street 5, Sector G-9, Islamabad',
    items: [
      {
        itemId: 'veg-01',
        name: 'Kaddu (Bottle Gourd)',
        urduName: 'کدو',
        pricePerKg: 100,
        quantityKg: 2,
        image: 'https://images.unsplash.com/photo-1506917728037-b6af01a7d403?auto=format&fit=crop&w=600&q=80',
      },
      {
        itemId: 'veg-03',
        name: 'Palak (Fresh Green Spinach)',
        urduName: 'پالک',
        pricePerKg: 50,
        quantityKg: 2,
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      },
      {
        itemId: 'veg-05',
        name: 'Tamatar (Red Farm Tomatoes)',
        urduName: 'ٹماٹر',
        pricePerKg: 70,
        quantityKg: 3,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      },
    ],
    subtotal: 510,
    deliveryFee: 0,
    totalAmount: 510,
    notes: 'Please select tender Kaddu for lunch cooking. Ring bell at gate.',
    status: 'Pending',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(), // 35 mins ago
  },
  {
    id: 'req_002',
    orderNumber: 'MANDI-1081',
    customerId: 'user_cust_2',
    customerName: 'Fatima Zahra',
    customerPhone: '0333-5129844',
    customerAddress: 'Apartment 304, Royal Heights, F-11/1, Islamabad',
    items: [
      {
        itemId: 'veg-04',
        name: 'Sarson Da Saag (Mustard Greens)',
        urduName: 'سرسوں کا ساگ',
        pricePerKg: 60,
        quantityKg: 3,
        image: '/images/saag.jpg',
      },
      {
        itemId: 'veg-07',
        name: 'Methi (Desi Fenugreek Leaves)',
        urduName: 'میتھی',
        pricePerKg: 60,
        quantityKg: 1,
        image: '/images/methi.jpg',
      },
    ],
    subtotal: 240,
    deliveryFee: 50,
    totalAmount: 290,
    notes: 'Clean fresh leaves only please.',
    status: 'Verified',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    verifiedAt: new Date(Date.now() - 75 * 60000).toISOString(),
    verifiedBy: 'Haji Abdul Rehman (Mandi Admin)',
  },
  {
    id: 'req_003',
    orderNumber: 'MANDI-1079',
    customerId: 'user_cust_3',
    customerName: 'Tariq Mehmood',
    customerPhone: '0321-9988776',
    customerAddress: 'House 88, Street 12, DHA Phase 5, Lahore',
    items: [
      {
        itemId: 'veg-09',
        name: 'Aalo (Red Skin Hill Potatoes)',
        urduName: 'آلو',
        pricePerKg: 150,
        quantityKg: 5,
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      },
      {
        itemId: 'veg-08',
        name: 'Shimla Mirch (Green Bell Pepper)',
        urduName: 'شملہ مرچ',
        pricePerKg: 120,
        quantityKg: 2,
        image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
      },
    ],
    subtotal: 990,
    deliveryFee: 0,
    totalAmount: 990,
    notes: 'Delivered at morning shift.',
    status: 'Delivered',
    createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
    verifiedAt: new Date(Date.now() - 210 * 60000).toISOString(),
    deliveredAt: new Date(Date.now() - 120 * 60000).toISOString(),
    verifiedBy: 'Haji Abdul Rehman (Mandi Admin)',
  },
];

class OrderService {
  private orders: BuyingRequest[] = [];
  private listeners: ((orders: BuyingRequest[]) => void)[] = [];

  constructor() {
    this.init();
    this.setupSyncListener();
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (stored) {
        this.orders = JSON.parse(stored);
      } else {
        this.orders = [...INITIAL_ORDERS];
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(this.orders));
      }
    } catch {
      this.orders = [...INITIAL_ORDERS];
    }
  }

  private setupSyncListener() {
    syncService.onMessage((msg) => {
      if (msg.type === 'ORDER_CREATED' || msg.type === 'ORDER_UPDATED') {
        const stored = localStorage.getItem(STORAGE_ORDERS_KEY);
        if (stored) {
          try {
            this.orders = JSON.parse(stored);
            this.notify();
          } catch {}
        }
      }
    });
  }

  public getOrders(): BuyingRequest[] {
    return [...this.orders];
  }

  public getOrdersByCustomer(customerId: string): BuyingRequest[] {
    return this.orders.filter((o) => o.customerId === customerId);
  }

  public createOrder(data: Omit<BuyingRequest, 'id' | 'orderNumber' | 'createdAt' | 'status'>): BuyingRequest {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: BuyingRequest = {
      ...data,
      id: 'req_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      orderNumber: `MANDI-${randomNum}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    this.persist();
    syncService.broadcast({
      type: 'ORDER_CREATED',
      sourceId: syncService.getClientId(),
      timestamp: Date.now(),
      payload: newOrder,
    });
    this.notify();
    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminName: string = 'Mandi Admin'
  ): BuyingRequest | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = newStatus;
    if (newStatus === 'Verified') {
      order.verifiedAt = new Date().toISOString();
      order.verifiedBy = adminName;
    } else if (newStatus === 'Delivered') {
      order.deliveredAt = new Date().toISOString();
      if (!order.verifiedAt) {
        order.verifiedAt = new Date().toISOString();
        order.verifiedBy = adminName;
      }
    }

    this.persist();
    syncService.broadcast({
      type: 'ORDER_UPDATED',
      sourceId: syncService.getClientId(),
      timestamp: Date.now(),
      payload: order,
    });
    this.notify();
    return order;
  }

  public deleteOrder(orderId: string): boolean {
    const prevCount = this.orders.length;
    this.orders = this.orders.filter((o) => o.id !== orderId);
    if (this.orders.length !== prevCount) {
      this.persist();
      syncService.broadcast({
        type: 'ORDER_UPDATED',
        sourceId: syncService.getClientId(),
        timestamp: Date.now(),
        payload: { deletedOrderId: orderId },
      });
      this.notify();
      return true;
    }
    return false;
  }

  public deleteItemFromOrder(orderId: string, itemId: string): BuyingRequest | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.items = order.items.filter((item) => item.itemId !== itemId);
    const newSubtotal = order.items.reduce((acc, i) => acc + i.pricePerKg * i.quantityKg, 0);
    order.subtotal = newSubtotal;
    order.totalAmount = newSubtotal + order.deliveryFee;

    this.persist();
    syncService.broadcast({
      type: 'ORDER_UPDATED',
      sourceId: syncService.getClientId(),
      timestamp: Date.now(),
      payload: order,
    });
    this.notify();
    return order;
  }

  public updateCustomerDetailsInOrders(
    customerId: string,
    details: { name?: string; phone?: string; address?: string }
  ): void {
    let changed = false;
    this.orders.forEach((o) => {
      if (
        o.customerId === customerId ||
        (details.phone && o.customerPhone === details.phone)
      ) {
        if (details.name) o.customerName = details.name;
        if (details.phone) o.customerPhone = details.phone;
        if (details.address) o.customerAddress = details.address;
        changed = true;
      }
    });

    if (changed) {
      this.persist();
      this.notify();
    }
  }

  public subscribe(listener: (orders: BuyingRequest[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l([...this.orders]));
  }

  private persist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(this.orders));
    }
  }
}

export const orderService = new OrderService();
