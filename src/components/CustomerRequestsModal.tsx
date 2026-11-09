import React from 'react';
import { X, Clock, CheckCircle2, Truck, Package, Phone, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { BuyingRequest } from '../types/order';

interface CustomerRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: BuyingRequest[];
  customerName: string;
}

export const CustomerRequestsModal: React.FC<CustomerRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  customerName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a4833] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                My Buying Requests & Order History
              </h3>
              <p className="text-xs text-emerald-200">
                Customer: <span className="font-semibold">{customerName}</span> • {requests.length} total request{requests.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Requests List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {requests.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">No Buying Requests Sent Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Add vegetables to your cart and click "Send Buying Request" to place fresh mandi orders.
              </p>
            </div>
          ) : (
            requests.map((req) => {
              const isPending = req.status === 'Pending';
              const isVerified = req.status === 'Verified';
              const isDelivered = req.status === 'Delivered';

              return (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-colors space-y-4"
                >
                  {/* Top Bar: Order ID & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        #{req.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                          Pending Admin Verification
                        </span>
                      )}
                      {isVerified && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Verified by Admin (Preparing)
                        </span>
                      )}
                      {isDelivered && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-teal-100 text-teal-950 border border-teal-300">
                          <Truck className="w-3.5 h-3.5 text-teal-700" />
                          Order Delivered ✓
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Step Bar */}
                  <div className="py-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                      <span className={isPending ? 'text-amber-700 font-extrabold' : 'text-slate-400'}>
                        1. Request Sent
                      </span>
                      <span className={isVerified ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}>
                        2. Admin Verified
                      </span>
                      <span className={isDelivered ? 'text-teal-700 font-extrabold' : 'text-slate-400'}>
                        3. Harvest Delivered
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isDelivered
                            ? 'w-full bg-teal-600'
                            : isVerified
                            ? 'w-2/3 bg-emerald-600'
                            : 'w-1/3 bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Ordered Vegetables:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {req.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200/70 text-xs"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-9 h-9 rounded-md object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-slate-800 truncate">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {item.quantityKg} kg × Rs. {item.pricePerKg} ={' '}
                              <strong className="text-slate-900">Rs. {item.quantityKg * item.pricePerKg}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Destination */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-1">
                    <div className="space-y-1 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.customerAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.customerPhone}</span>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="text-[11px] text-slate-500">
                        Produce: Rs. {req.subtotal} {req.deliveryFee > 0 ? `+ Rs. ${req.deliveryFee} Deliv` : '• Free Delivery'}
                      </div>
                      <div className="text-base font-black text-emerald-950">
                        Total: Rs. {req.totalAmount} (COD)
                      </div>
                    </div>
                  </div>

                  {req.notes && (
                    <div className="text-xs text-slate-600 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                      <strong>Note:</strong> {req.notes}
                    </div>
                  )}

                  {req.verifiedBy && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md font-medium">
                      ✓ Verified by: {req.verifiedBy} at{' '}
                      {req.verifiedAt ? new Date(req.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
          >
            Close Order History
          </button>
        </div>
      </div>
    </div>
  );
};
