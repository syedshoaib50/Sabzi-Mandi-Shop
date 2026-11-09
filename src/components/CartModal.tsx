import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, Check, ArrowRight, Truck, Sparkles, User, Phone, MapPin, Send } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { BuyingRequest } from '../types/order';
import { audioVoiceEngine, formatWeight } from '../utils/audioVoiceEngine';
import confetti from 'canvas-confetti';

export interface CartItem {
  item: InventoryItem;
  quantityKg: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onSendBuyingRequest: (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    notes: string;
  }) => BuyingRequest | void;
  defaultCustomer?: {
    name: string;
    phone: string;
    address: string;
  } | null;
  onViewMyOrders?: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onSendBuyingRequest,
  defaultCustomer,
  onViewMyOrders,
}) => {
  const [createdOrder, setCreatedOrder] = useState<BuyingRequest | null>(null);
  const [customerName, setCustomerName] = useState<string>(defaultCustomer?.name || 'Muhammad Ali Khan');
  const [customerPhone, setCustomerPhone] = useState<string>(defaultCustomer?.phone || '0300-8452109');
  const [customerAddress, setCustomerAddress] = useState<string>(
    defaultCustomer?.address || 'House 24-B, Sector G-9, Islamabad'
  );
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [showDetailsForm, setShowDetailsForm] = useState<boolean>(false);

  // Sync if defaultCustomer changes
  React.useEffect(() => {
    if (defaultCustomer) {
      if (defaultCustomer.name) setCustomerName(defaultCustomer.name);
      if (defaultCustomer.phone) setCustomerPhone(defaultCustomer.phone);
      if (defaultCustomer.address) setCustomerAddress(defaultCustomer.address);
    }
  }, [defaultCustomer]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, c) => acc + c.item.pricePerKg * c.quantityKg, 0);
  const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const order = onSendBuyingRequest({
      customerName: customerName.trim() || 'Valued Customer',
      customerPhone: customerPhone.trim() || '0300-0000000',
      customerAddress: customerAddress.trim() || 'Islamabad/Rawalpindi',
      notes: orderNotes.trim(),
    });

    audioVoiceEngine.playRestockChime();
    try {
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.7 } });
    } catch {}

    if (order) {
      setCreatedOrder(order);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a4833] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Fresh Produce Cart & Order Request
              </h3>
              <p className="text-xs text-emerald-200">
                {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCreatedOrder(null);
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdOrder ? (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">
              Buying Request Sent to Admin!
            </h4>
            <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
              Order #{createdOrder.orderNumber} • Status: Pending Verification
            </div>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your request was sent directly to the Mandi Admin. Once verified by the admin desk, fresh harvest will be packed and dispatched.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl text-left text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Customer Name:</span>
                <span className="text-slate-900 font-extrabold">{createdOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Contact Phone:</span>
                <span>{createdOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Address:</span>
                <span className="truncate max-w-[200px]">{createdOrder.customerAddress}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700 pt-1 border-t border-slate-200">
                <span>Total Payable (COD):</span>
                <span className="text-emerald-900 font-black text-sm">Rs. {createdOrder.totalAmount}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {onViewMyOrders && (
                <button
                  onClick={() => {
                    setCreatedOrder(null);
                    onClose();
                    onViewMyOrders();
                  }}
                  className="w-full py-3 rounded-xl bg-[#0d533a] hover:bg-[#093d2b] text-white font-extrabold text-xs transition cursor-pointer"
                >
                  Track in "My Buying Requests"
                </button>
              )}
              <button
                onClick={() => {
                  setCreatedOrder(null);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Close & Continue Browsing
              </button>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-lg font-bold text-slate-700">Your Cart is Empty</h4>
            <p className="text-xs text-slate-500">
              Tap any vegetable in the catalog to hear its voice rate and add fresh produce.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitRequest} className="p-6 space-y-5">
            {/* Free Delivery Bar */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
              <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
              {subtotal >= 299 ? (
                <span className="font-bold">✓ Free Delivery Unlocked (&gt; Rs. 299)</span>
              ) : (
                <span>
                  Add <strong>Rs. {299 - subtotal}</strong> more for Free Delivery!
                </span>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {cart.map(({ item, quantityKg }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 gap-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                        {item.name}
                      </h5>
                      <span className="font-urdu font-bold text-emerald-800 text-xs">
                        {item.urduName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Rs. {item.pricePerKg}/kg • Subtotal: <strong className="text-slate-900">Rs. {Math.round(item.pricePerKg * quantityKg)}</strong>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => {
                          if (quantityKg <= 0.15) {
                            onRemoveItem(item.id);
                          } else if (quantityKg <= 0.3) {
                            onUpdateQuantity(item.id, 0.1);
                          } else if (quantityKg <= 0.6) {
                            onUpdateQuantity(item.id, 0.25);
                          } else if (quantityKg <= 1.1) {
                            onUpdateQuantity(item.id, 0.5);
                          } else {
                            onUpdateQuantity(item.id, Math.round((quantityKg - 0.5) * 10) / 10);
                          }
                        }}
                        className="p-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        title="Reduce weight"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-black text-slate-900 min-w-12 text-center">
                        {formatWeight(quantityKg)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (quantityKg < 0.2) {
                            onUpdateQuantity(item.id, 0.25);
                          } else if (quantityKg < 0.45) {
                            onUpdateQuantity(item.id, 0.5);
                          } else if (quantityKg < 0.95) {
                            onUpdateQuantity(item.id, 1);
                          } else {
                            onUpdateQuantity(item.id, Math.round((quantityKg + 0.5) * 10) / 10);
                          }
                        }}
                        className="p-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        title="Increase weight"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Delivery Details for Buying Request */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  Delivery & Contact Information
                </span>
                <button
                  type="button"
                  onClick={() => setShowDetailsForm(!showDetailsForm)}
                  className="text-[10px] text-emerald-700 underline font-semibold cursor-pointer"
                >
                  {showDetailsForm ? 'Hide' : 'Edit Details'}
                </button>
              </div>

              {showDetailsForm ? (
                <div className="space-y-2 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Phone Number</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Delivery Address</label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Special Instructions</label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Ring bell, bring fresh tender gourd"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-800">{customerName} • {customerPhone}</div>
                  <div className="text-[11px] text-slate-500 truncate">{customerAddress}</div>
                </div>
              )}
            </div>

            {/* Calculations & Order Button */}
            <div className="pt-2 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Produce Subtotal:</span>
                <span>Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Express Morning Delivery:</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `Rs. ${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-emerald-950">Rs. {grandTotal} (Cash on Delivery)</span>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-3.5 rounded-2xl bg-[#0a523a] hover:bg-[#07402d] active:scale-95 text-white font-extrabold text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Send className="w-4 h-4 text-emerald-200" />
                <span>Send Buying Request to Admin</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
