export type OrderStatus = 'Pending' | 'Verified' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  itemId: string;
  name: string;
  urduName: string;
  pricePerKg: number;
  quantityKg: number;
  image: string;
}

export interface BuyingRequest {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  verifiedAt?: string;
  deliveredAt?: string;
  verifiedBy?: string;
}
