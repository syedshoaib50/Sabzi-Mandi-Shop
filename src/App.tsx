import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { InventoryItem, VoicePersona } from './types/inventory';
import { INITIAL_INVENTORY } from './data/initialInventory';
import { User, UserRole } from './types/auth';
import { BuyingRequest, OrderStatus } from './types/order';
import { MandiHeader } from './components/MandiHeader';
import { HeroSection } from './components/HeroSection';
import { StorefrontCatalog } from './components/StorefrontCatalog';
import { MandiManagementProcess } from './components/MandiManagementProcess';
import { NutritionModal } from './components/NutritionModal';
import { CartModal, CartItem } from './components/CartModal';
import { SyncMonitorModal } from './components/SyncMonitorModal';
import { AuthModal } from './components/AuthModal';
import { AdminPortal } from './components/AdminPortal';
import { CustomerRequestsModal } from './components/CustomerRequestsModal';
import { ProductModal } from './components/ProductModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AboutModal } from './components/AboutModal';
import { calculateLowStockAlerts, adjustStock } from './utils/inventoryLogic';
import { syncService } from './utils/syncService';
import { audioVoiceEngine } from './utils/audioVoiceEngine';
import { authService } from './utils/authService';
import { orderService } from './utils/orderService';

const STORAGE_INVENTORY_KEY = 'mandi_inventory_items_v9';
const STORAGE_PERSONA_KEY = 'mandi_voice_persona';
const STORAGE_DELETED_PRODUCTS_KEY = 'mandi_permanently_deleted_product_ids_v2';

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedDeleted = localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY);
        const deletedIds: string[] = storedDeleted ? JSON.parse(storedDeleted) : [];
        const saved = localStorage.getItem(STORAGE_INVENTORY_KEY);
        if (saved) {
          const parsed: InventoryItem[] = JSON.parse(saved);
          return parsed.filter((item) => !deletedIds.includes(item.id));
        }
        return INITIAL_INVENTORY.filter((item) => !deletedIds.includes(item.id));
      } catch {
        // fallback
      }
    }
    return INITIAL_INVENTORY;
  });

  const [currentPersona, setCurrentPersona] = useState<VoicePersona>('mandi_girl');

  // Dual Portal: "Two separate sites in one" ('customer' vs 'admin')
  const [activeSite, setActiveSite] = useState<'customer' | 'admin'>('customer');
  const [activeTab, setActiveTab] = useState<'storefront' | 'process'>('storefront');

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Orders state
  const [orders, setOrders] = useState<BuyingRequest[]>(() => orderService.getOrders());
  const [isCustomerRequestsOpen, setIsCustomerRequestsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Cart & UI Modals
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isNutritionOpen, setIsNutritionOpen] = useState<boolean>(false);
  const [selectedNutritionItem, setSelectedNutritionItem] = useState<InventoryItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSyncMonitorOpen, setIsSyncMonitorOpen] = useState<boolean>(false);

  // Admin Product Add & Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Product Deletion Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  // Listen to Auth Service changes
  useEffect(() => {
    const unsub = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Listen to Order Service changes
  useEffect(() => {
    const unsub = orderService.subscribe((updatedOrders) => {
      setOrders(updatedOrders);
    });
    return () => unsub();
  }, []);

  // Background voice welcome when user opens / interacts with the website
  useEffect(() => {
    let hasWelcomed = false;
    const onFirstGesture = () => {
      if (hasWelcomed) return;
      hasWelcomed = true;
      audioVoiceEngine.startFiveMinuteBackgroundRateCycle();
      window.removeEventListener('click', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
    };

    window.addEventListener('click', onFirstGesture, { once: true });
    window.addEventListener('touchstart', onFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
    };
  }, []);

  // Sync persona to audio engine and storage
  const handleSelectPersona = useCallback((persona: VoicePersona) => {
    setCurrentPersona(persona);
    audioVoiceEngine.setPersona(persona);
  }, []);

  // Persist inventory
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(items));
    }
  }, [items]);

  // Handle incoming real-time sync messages across tabs
  useEffect(() => {
    const unsubscribe = syncService.onMessage((msg) => {
      if (msg.type === 'STOCK_UPDATE') {
        const { itemId, newStock } = msg.payload;
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, currentStock: newStock, lastUpdated: new Date().toISOString() }
              : item
          )
        );
      } else if (msg.type === 'PRICE_CHANGE') {
        const { itemId, newPrice } = msg.payload;
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, pricePerKg: newPrice, lastUpdated: new Date().toISOString() }
              : item
          )
        );
      } else if (msg.type === 'RESTOCK_ALL') {
        const { items: restockList } = msg.payload;
        setItems((prev) =>
          prev.map((item) => {
            const found = restockList.find((r: any) => r.id === item.id);
            if (found) {
              return {
                ...item,
                currentStock: Math.min(item.maxCapacity, item.currentStock + found.addedKg),
                lastUpdated: new Date().toISOString(),
              };
            }
            return item;
          })
        );
      } else if (msg.type === 'ITEM_ADDED') {
        const { item } = msg.payload;
        setItems((prev) => {
          if (prev.some((i) => i.id === item.id)) return prev;
          return [item, ...prev];
        });
      } else if (msg.type === 'ITEM_UPDATED') {
        const { item } = msg.payload;
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? item : i))
        );
        setCart((prev) =>
          prev.map((c) => (c.item.id === item.id ? { ...c, item } : c))
        );
      } else if (msg.type === 'ITEM_DELETED') {
        const { itemId } = msg.payload;
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        setCart((prev) => prev.filter((c) => c.item.id !== itemId));
      }
    });

    return () => unsubscribe();
  }, []);

  // Calculate automated low-stock alerts
  const lowStockAlerts = useMemo(() => calculateLowStockAlerts(items), [items]);

  // Adjust stock & broadcast across tabs in real-time
  const handleAdjustStock = useCallback((itemId: string, delta: number, reason: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === itemId);
      if (!target) return prev;

      const { newStock } = adjustStock(target.currentStock, delta, target.maxCapacity);

      syncService.broadcastStockChange(itemId, delta, newStock, {
        id: 'tx_' + Math.random().toString(36).substring(2, 9),
        itemId,
        itemName: target.name,
        barcode: target.barcode,
        type: delta >= 0 ? 'stock_in' : 'stock_out',
        quantity: Math.abs(delta),
        previousStock: target.currentStock,
        newStock,
        reason,
        timestamp: new Date().toISOString(),
        operator: currentUser?.name || 'Mandi Manager',
        syncedAcrossTabs: true,
      });

      return prev.map((item) =>
        item.id === itemId
          ? { ...item, currentStock: newStock, lastUpdated: new Date().toISOString() }
          : item
      );
    });
  }, [currentUser]);

  // Update price & broadcast
  const handleUpdatePrice = useCallback((itemId: string, newPrice: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, pricePerKg: newPrice } : item))
    );
    syncService.broadcastPriceChange(itemId, newPrice);
  }, []);

  // Restock specific item
  const handleRestockItem = useCallback((itemId: string, addedKg: number) => {
    handleAdjustStock(itemId, addedKg, `Automated Restock Delivery (+${addedKg}kg)`);
  }, [handleAdjustStock]);

  // Cart operations
  const handleAddToCart = useCallback((item: InventoryItem, qtyKg: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantityKg: c.quantityKg + qtyKg } : c
        );
      }
      return [...prev, { item, quantityKg: qtyKg }];
    });
  }, []);

  const handleUpdateCartQty = useCallback((itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((c) => c.item.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((c) => (c.item.id === itemId ? { ...c, quantityKg: newQty } : c))
      );
    }
  }, []);

  const handleRemoveCartItem = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  }, []);

  // Admin Product Operations
  const handleOpenAddProduct = useCallback(() => {
    setEditingItem(null);
    setIsProductModalOpen(true);
  }, []);

  const handleOpenEditProduct = useCallback((item: InventoryItem) => {
    setEditingItem(item);
    setIsProductModalOpen(true);
  }, []);

  const handleOpenDeleteProduct = useCallback((item: InventoryItem) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingItem) return;
    const targetId = deletingItem.id;
    if (typeof window !== 'undefined') {
      try {
        const storedDeleted = localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY);
        const deletedIds: string[] = storedDeleted ? JSON.parse(storedDeleted) : [];
        if (!deletedIds.includes(targetId)) {
          deletedIds.push(targetId);
          localStorage.setItem(STORAGE_DELETED_PRODUCTS_KEY, JSON.stringify(deletedIds));
        }
      } catch (err) {
        console.error('Failed to persist deleted product ID', err);
      }
    }
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== targetId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(updated));
      }
      return updated;
    });
    setCart((prev) => prev.filter((c) => c.item.id !== targetId));
    syncService.broadcastItemDeleted(targetId);
    audioVoiceEngine.playScannerBeep();
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  }, [deletingItem]);

  const handleSaveProduct = useCallback((savedProduct: InventoryItem, isNew: boolean) => {
    if (isNew) {
      setItems((prev) => [savedProduct, ...prev]);
      syncService.broadcastItemAdded(savedProduct);
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === savedProduct.id ? savedProduct : i))
      );
      setCart((prev) =>
        prev.map((c) =>
          c.item.id === savedProduct.id ? { ...c, item: savedProduct } : c
        )
      );
      syncService.broadcastItemUpdated(savedProduct);
    }
    audioVoiceEngine.playRestockChime();
  }, []);

  // Customer: Send Buying Request to Admin
  const handleSendBuyingRequest = useCallback(
    (details: { customerName: string; customerPhone: string; customerAddress: string; notes: string }): BuyingRequest | void => {
      if (cart.length === 0) return;

      const subtotal = cart.reduce((acc, c) => acc + c.item.pricePerKg * c.quantityKg, 0);
      const deliveryFee = subtotal >= 299 ? 0 : 50;
      const totalAmount = subtotal + deliveryFee;

      const orderItems = cart.map((c) => ({
        itemId: c.item.id,
        name: c.item.name,
        urduName: c.item.urduName,
        pricePerKg: c.item.pricePerKg,
        quantityKg: c.quantityKg,
        image: c.item.image,
      }));

      const newOrder = orderService.createOrder({
        customerId: currentUser?.id || 'guest_user',
        customerName: details.customerName,
        customerPhone: details.customerPhone,
        customerAddress: details.customerAddress,
        items: orderItems,
        subtotal,
        deliveryFee,
        totalAmount,
        notes: details.notes,
      });

      // Clear cart
      setCart([]);
      return newOrder;
    },
    [cart, currentUser]
  );

  // Admin: Update order status (Verify or Deliver)
  const handleUpdateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      const updated = orderService.updateOrderStatus(
        orderId,
        status,
        currentUser?.name || 'Haji Abdul Rehman (Mandi Admin)'
      );

      // When order is Delivered, deduct inventory
      if (status === 'Delivered' && updated) {
        updated.items.forEach((item) => {
          handleAdjustStock(
            item.itemId,
            -item.quantityKg,
            `Order #${updated.orderNumber} Delivered to ${updated.customerName}`
          );
        });
      }
    },
    [currentUser, handleAdjustStock]
  );

  // Admin: Delete delivered order from records
  const handleDeleteOrder = useCallback((orderId: string) => {
    orderService.deleteOrder(orderId);
    setOrders(orderService.getOrders());
  }, []);

  // Admin: Delete individual product item from order
  const handleDeleteOrderItem = useCallback((orderId: string, itemId: string) => {
    orderService.deleteItemFromOrder(orderId, itemId);
    setOrders(orderService.getOrders());
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, c) => acc + c.item.pricePerKg * c.quantityKg, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, c) => acc + c.quantityKg, 0);
  }, [cart]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Pending').length;
  }, [orders]);

  const customerOrders = useMemo(() => {
    if (!currentUser) return orders;
    return orders.filter(
      (o) => o.customerId === currentUser.id || o.customerName === currentUser.name
    );
  }, [orders, currentUser]);

  const handleOpenNutrition = useCallback((item?: InventoryItem) => {
    setSelectedNutritionItem(item || null);
    setIsNutritionOpen(true);
  }, []);

  const handleAuthSuccess = (role: UserRole) => {
    if (role === 'admin') {
      setActiveSite('admin');
    } else {
      setActiveSite('customer');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setActiveSite('customer');
  };

  return (
    <div className="min-h-screen bg-[#fcfdfa] text-slate-800 font-sans selection:bg-emerald-200">
      {/* Mandi Header with Portal Switcher and Account Badge */}
      <MandiHeader
        items={items}
        cartCount={cartCount}
        cartTotal={cartTotal}
        activeSite={activeSite}
        setActiveSite={setActiveSite}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNutrition={() => handleOpenNutrition()}
        onOpenSyncMonitor={() => setIsSyncMonitorOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenMyRequests={() => setIsCustomerRequestsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        pendingOrdersCount={pendingOrdersCount}
        customerRequestsCount={customerOrders.length}
        currentPersona={currentPersona}
        onSelectPersona={handleSelectPersona}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Content: Switching between Two Separate Sites in One */}
      <main>
        {activeSite === 'customer' ? (
          /* ================= CUSTOMER STOREFRONT SITE ================= */
          activeTab === 'storefront' ? (
            <>
              {/* Hero Section */}
              <HeroSection
                onBrowseClick={() => {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenProcess={() => setActiveTab('process')}
                currentPersona={currentPersona}
                onSelectPersona={handleSelectPersona}
              />

              {/* Catalog Grid: Clicking on ANY product announces name & price in voice */}
              <StorefrontCatalog
                items={items}
                onAddToCart={handleAddToCart}
                onOpenNutrition={handleOpenNutrition}
                currentPersona={currentPersona}
                onSelectPersona={handleSelectPersona}
                isAdmin={currentUser?.role === 'admin'}
                onOpenAddProduct={handleOpenAddProduct}
                onEditProduct={handleOpenEditProduct}
                onDeleteProduct={handleOpenDeleteProduct}
              />
            </>
          ) : (
            /* Mandi Management Process SOP */
            <MandiManagementProcess
              items={items}
              alerts={lowStockAlerts}
              onRestockItem={handleRestockItem}
              onUpdatePrice={handleUpdatePrice}
            />
          )
        ) : (
          /* ================= ADMIN ORDER DESK SITE ================= */
          <AdminPortal
            orders={orders}
            items={items}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateItemPrice={handleUpdatePrice}
            onRestockItem={handleRestockItem}
            onOpenAddProduct={handleOpenAddProduct}
            onEditProduct={handleOpenEditProduct}
            onDeleteProduct={handleOpenDeleteProduct}
            onDeleteOrder={handleDeleteOrder}
            onDeleteOrderItem={handleDeleteOrderItem}
            adminName={currentUser?.name || 'Haji Abdul Rehman (Mandi Admin)'}
            onSwitchToCustomerPortal={() => setActiveSite('customer')}
            onOpenAboutPage={() => setIsAboutOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black">
                GV
              </div>
              <div>
                <h4 className="text-white font-extrabold text-base">
                  Green Vegetable
                </h4>
                <p className="text-xs text-slate-400">
                  Fresh Green Vegetables & Live Rate Storefront
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <button
                onClick={() => {
                  setActiveSite('customer');
                  setActiveTab('storefront');
                }}
                className="hover:text-white transition cursor-pointer text-emerald-400 font-bold"
              >
                Customer Storefront
              </button>
              <button
                type="button"
                onClick={() => setIsAboutOpen(true)}
                className="hover:text-white transition cursor-pointer text-amber-300 font-bold"
              >
                About Us (ہمارے متعلق)
              </button>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Green Vegetable - Fresh Sabzi Mandi. Develop By <span style={{ color: '#ff5733' }}>Syed Shoaib</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        currentUser={currentUser}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <CustomerRequestsModal
        isOpen={isCustomerRequestsOpen}
        onClose={() => setIsCustomerRequestsOpen(false)}
        requests={customerOrders}
        customerName={currentUser?.name || 'Customer'}
      />

      <NutritionModal
        isOpen={isNutritionOpen}
        onClose={() => setIsNutritionOpen(false)}
        selectedItem={selectedNutritionItem}
        allItems={items}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onSendBuyingRequest={handleSendBuyingRequest}
        defaultCustomer={
          currentUser
            ? {
                name: currentUser.name,
                phone: currentUser.phone,
                address: currentUser.address,
              }
            : null
        }
        onViewMyOrders={() => setIsCustomerRequestsOpen(true)}
      />

      <SyncMonitorModal
        isOpen={isSyncMonitorOpen}
        onClose={() => setIsSyncMonitorOpen(false)}
        items={items}
        onSimulateStockChange={handleAdjustStock}
      />

      {/* Admin Product Add & Edit Modal (Only accessible to Admin) */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveProduct}
        initialItem={editingItem}
      />

      {/* Admin Product Deletion Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        item={deletingItem}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingItem(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
