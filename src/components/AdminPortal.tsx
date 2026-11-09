import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Phone,
  MapPin,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  DollarSign,
  ChevronRight,
  UserCheck,
  UserPlus,
  Plus,
  Edit3,
  Trash2,
  Users,
  User,
  Mail,
  Shield,
  Key,
  Calendar,
  X,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Upload,
  Camera,
  List,
  LayoutGrid,
  Info,
} from 'lucide-react';
import { BuyingRequest, OrderStatus } from '../types/order';
import { InventoryItem } from '../types/inventory';
import { audioVoiceEngine } from '../utils/audioVoiceEngine';
import { authService, ADMIN_SECRET_CODE } from '../utils/authService';
import { orderService } from '../utils/orderService';
import { User as AuthUser } from '../types/auth';
import { readFileAsDataURL } from '../utils/imageHelper';
import confetti from 'canvas-confetti';

interface AdminPortalProps {
  orders: BuyingRequest[];
  items: InventoryItem[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateItemPrice: (itemId: string, newPrice: number) => void;
  onRestockItem: (itemId: string, addedKg: number) => void;
  onOpenAddProduct: () => void;
  onEditProduct: (item: InventoryItem) => void;
  onDeleteProduct: (item: InventoryItem) => void;
  onDeleteOrder: (orderId: string) => void;
  onDeleteOrderItem?: (orderId: string, itemId: string) => void;
  adminName: string;
  onSwitchToCustomerPortal: () => void;
  onOpenAboutPage?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  orders,
  items,
  onUpdateOrderStatus,
  onUpdateItemPrice,
  onRestockItem,
  onOpenAddProduct,
  onEditProduct,
  onDeleteProduct,
  onDeleteOrder,
  onDeleteOrderItem,
  adminName,
  onSwitchToCustomerPortal,
  onOpenAboutPage,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [adminTab, setAdminTab] = useState<'orders' | 'inventory' | 'users'>('orders');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // In-app Confirmation Modal states (Replaces window.confirm which is blocked in iframes!)
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; orderNumber: string } | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<{ id: string; orderNumber: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ orderId: string; itemId: string; itemName: string } | null>(null);

  // User & Admin Directory State
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [userSearchInput, setUserSearchInput] = useState<string>('');
  const [userViewMode, setUserViewMode] = useState<'list' | 'grid'>('list');
  const [registeredUsers, setRegisteredUsers] = useState<AuthUser[]>(() => authService.getUsers());
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>([]);

  // Add New User Modal State (Direct Admin creation)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserPhone, setNewUserPhone] = useState<string>('');
  const [newUserAddress, setNewUserAddress] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<'customer' | 'admin'>('customer');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [newUserAvatar, setNewUserAvatar] = useState<string>('');
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const addFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // User Edit Modal State
  const [userToEdit, setUserToEdit] = useState<AuthUser | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>('');
  const [editNewPassword, setEditNewPassword] = useState<string>('');
  const [editConfirmPassword, setEditConfirmPassword] = useState<string>('');
  const [showEditPassword, setShowEditPassword] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const editFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // User Delete Confirmation State
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);

  // Change Admin Secret Code Modal State
  const [isSecretCodeModalOpen, setIsSecretCodeModalOpen] = useState<boolean>(false);
  const [currentSecretInput, setCurrentSecretInput] = useState<string>('');
  const [newSecretInput, setNewSecretInput] = useState<string>('');
  const [confirmSecretInput, setConfirmSecretInput] = useState<string>('');
  const [showSecretCode, setShowSecretCode] = useState<boolean>(false);
  const [secretCodeError, setSecretCodeError] = useState<string | null>(null);

  // Subscribe to auth changes so users list stays live
  useEffect(() => {
    const unsub = authService.subscribe(() => {
      setRegisteredUsers(authService.getUsers());
    });
    return () => unsub();
  }, []);

  const customerList = useMemo(() => {
    const list: AuthUser[] = [
      ...registeredUsers.filter((u) => u.role === 'customer' && !deletedUserIds.includes(u.id)),
    ];
    
    // Also include any customers from orders that might have registered via order checkout
    orders.forEach((o) => {
      const orderCustId = o.customerId || 'cust_' + o.customerPhone.replace(/[^0-9]/g, '');
      if (
        o.customerName &&
        !deletedUserIds.includes(orderCustId) &&
        !list.some(
          (c) =>
            c.id === orderCustId ||
            c.name.toLowerCase() === o.customerName.toLowerCase() ||
            c.phone === o.customerPhone
        )
      ) {
        list.push({
          id: orderCustId,
          name: o.customerName,
          email: `${o.customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@customer.mandi`,
          phone: o.customerPhone,
          address: o.customerAddress,
          role: 'customer',
          createdAt: o.createdAt,
        });
      }
    });

    // If no search query, show all users safely
    const query = (userSearchQuery || userSearchInput).trim().toLowerCase();
    if (!query) return list;

    // Filter strictly by the searched name, phone, email, or address
    return list.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(query);
      const phoneMatch = c.phone.toLowerCase().includes(query);
      const emailMatch = c.email.toLowerCase().includes(query);
      const addressMatch = (c.address || '').toLowerCase().includes(query);
      return nameMatch || phoneMatch || emailMatch || addressMatch;
    });
  }, [registeredUsers, orders, userSearchQuery, userSearchInput, deletedUserIds]);

  const adminList = useMemo(() => {
    const list = registeredUsers.filter((u) => u.role === 'admin' && !deletedUserIds.includes(u.id));
    const query = (userSearchQuery || userSearchInput).trim().toLowerCase();
    if (!query) return list;

    return list.filter((adm) => {
      const nameMatch = adm.name.toLowerCase().includes(query);
      const phoneMatch = adm.phone.toLowerCase().includes(query);
      const emailMatch = adm.email.toLowerCase().includes(query);
      const addressMatch = (adm.address || '').toLowerCase().includes(query);
      return nameMatch || phoneMatch || emailMatch || addressMatch;
    });
  }, [registeredUsers, deletedUserIds, userSearchQuery, userSearchInput]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerAddress.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const verified = orders.filter((o) => o.status === 'Verified').length;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;
    const totalRevenue = orders
      .filter((o) => o.status === 'Delivered' || o.status === 'Verified')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { total, pending, verified, delivered, totalRevenue };
  }, [orders]);

  const handleVerify = (orderId: string, orderNumber: string) => {
    onUpdateOrderStatus(orderId, 'Verified');
    audioVoiceEngine.playRestockChime();
    setActionNotice(`Order #${orderNumber} successfully VERIFIED! Customer notified.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleDeliver = (orderId: string, orderNumber: string) => {
    onUpdateOrderStatus(orderId, 'Delivered');
    audioVoiceEngine.playRestockChime();
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch {}
    setActionNotice(`Order #${orderNumber} marked as DELIVERED! Stock balances adjusted.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Safe in-app cancellation (no blocked window.confirm)
  const handleCancel = (orderId: string, orderNumber: string) => {
    setOrderToCancel({ id: orderId, orderNumber });
  };

  const confirmCancel = () => {
    if (!orderToCancel) return;
    onUpdateOrderStatus(orderToCancel.id, 'Cancelled');
    audioVoiceEngine.playErrorBuzz();
    setActionNotice(`Order #${orderToCancel.orderNumber} has been cancelled.`);
    setOrderToCancel(null);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Safe in-app delivered order deletion (no blocked window.confirm)
  const handleDeleteDeliveredOrder = (orderId: string, orderNumber: string) => {
    setOrderToDelete({ id: orderId, orderNumber });
  };

  const confirmDeleteOrder = () => {
    if (!orderToDelete) return;
    onDeleteOrder(orderToDelete.id);
    audioVoiceEngine.playScannerBeep();
    setActionNotice(`Delivered Order #${orderToDelete.orderNumber} successfully deleted from records.`);
    setOrderToDelete(null);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Safe in-app delivered item deletion (no blocked window.confirm)
  const handleDeleteDeliveredItem = (orderId: string, itemId: string, itemName: string) => {
    setItemToDelete({ orderId, itemId, itemName });
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    if (onDeleteOrderItem) {
      onDeleteOrderItem(itemToDelete.orderId, itemToDelete.itemId);
    }
    audioVoiceEngine.playScannerBeep();
    setActionNotice(`Delivered product "${itemToDelete.itemName}" removed from order.`);
    setItemToDelete(null);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Add New User by Administrator
  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      setAddUserError('Please enter user full name.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }
    if (!newUserEmail.trim()) {
      setAddUserError('Please enter a valid Gmail address (@gmail.com).');
      audioVoiceEngine.playErrorBuzz();
      return;
    }
    if (!newUserPhone.trim()) {
      setAddUserError('Please enter contact phone number.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    const res = authService.addUserByAdmin({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim(),
      address: newUserAddress.trim(),
      role: newUserRole,
      password: newUserPassword.trim() || undefined,
      avatarUrl: newUserAvatar.trim() || undefined,
    });

    if (!res.success) {
      setAddUserError(res.error || 'Failed to create user account.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    setRegisteredUsers(authService.getUsers());
    audioVoiceEngine.playRestockChime();
    confetti({ particleCount: 30, spread: 60 });
    setActionNotice(
      `New ${newUserRole === 'admin' ? 'Administrator' : 'Customer'} "${newUserName.trim()}" successfully created!`
    );
    setIsAddUserModalOpen(false);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // User Management Handlers (Edit & Delete for Customer & Admin)
  const handleStartEditUser = (user: AuthUser) => {
    setUserToEdit(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditAddress(user.address);
    setEditAvatarUrl(user.avatarUrl || '');
    setEditNewPassword('');
    setEditConfirmPassword('');
    setShowEditPassword(false);
    setEditError(null);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    if (!editName.trim()) {
      setEditError('Please enter full name.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }
    if (!editPhone.trim()) {
      setEditError('Please enter phone number.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      setEditError('Please enter a valid email address.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    // Validate Password Change if entered (strictly 8 to 20 characters)
    if (editNewPassword.trim()) {
      if (editNewPassword.trim().length < 8) {
        setEditError('New password must not be less than 8 characters!');
        audioVoiceEngine.playErrorBuzz();
        return;
      }
      if (editNewPassword.trim().length > 20) {
        setEditError('New password must not be more than 20 characters!');
        audioVoiceEngine.playErrorBuzz();
        return;
      }
      if (editNewPassword.trim() !== editConfirmPassword.trim()) {
        setEditError('New password and confirm password do not match.');
        audioVoiceEngine.playErrorBuzz();
        return;
      }
    }

    const res = authService.updateUser(
      userToEdit.id,
      {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        avatarUrl: editAvatarUrl.trim() || undefined,
        password: editNewPassword.trim() || undefined,
      },
      userToEdit.role
    );

    if (!res.success) {
      setEditError(res.error || 'Failed to update account.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    if (userToEdit.role === 'customer') {
      orderService.updateCustomerDetailsInOrders(userToEdit.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      });
    }

    setRegisteredUsers(authService.getUsers());
    audioVoiceEngine.playRestockChime();
    const passNotice = editNewPassword.trim() ? ' and password' : '';
    setActionNotice(
      `${userToEdit.role === 'admin' ? 'Administrator' : 'Customer'} "${editName.trim()}" details${passNotice} successfully updated.`
    );
    setUserToEdit(null);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleStartDeleteUser = (user: AuthUser) => {
    setUserToDelete(user);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;

    if (userToDelete.role === 'admin') {
      const remainingAdmins = authService
        .getUsers()
        .filter((u) => u.role === 'admin' && !deletedUserIds.includes(u.id));
      if (remainingAdmins.length <= 1) {
        audioVoiceEngine.playErrorBuzz();
        setActionNotice('Cannot delete the last remaining Administrator. At least one admin must remain.');
        setUserToDelete(null);
        setTimeout(() => setActionNotice(null), 4000);
        return;
      }
    }

    authService.deleteUser(userToDelete.id);
    setDeletedUserIds((prev) => [...prev, userToDelete.id]);
    setRegisteredUsers(authService.getUsers());
    audioVoiceEngine.playScannerBeep();
    setActionNotice(
      `${userToDelete.role === 'admin' ? 'Administrator' : 'Customer'} "${userToDelete.name}" successfully deleted.`
    );
    setUserToDelete(null);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleOpenSecretCodeModal = () => {
    setCurrentSecretInput('');
    setNewSecretInput('');
    setConfirmSecretInput('');
    setShowSecretCode(false);
    setSecretCodeError(null);
    setIsSecretCodeModalOpen(true);
  };

  const handleSaveAdminSecretCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSecretInput.trim()) {
      setSecretCodeError('Please enter current admin secret code.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    if (!authService.verifyAdminSecretCode(currentSecretInput.trim())) {
      setSecretCodeError('Current admin secret code is incorrect!');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    if (!newSecretInput.trim()) {
      setSecretCodeError('Please enter new admin secret code.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    if (newSecretInput.trim().length < 4) {
      setSecretCodeError('New secret code must be at least 4 characters long.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    if (newSecretInput.trim().length > 30) {
      setSecretCodeError('New secret code must not exceed 30 characters.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    if (newSecretInput.trim() !== confirmSecretInput.trim()) {
      setSecretCodeError('New secret code and confirmation do not match.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    const res = authService.updateAdminSecretCode(newSecretInput.trim());
    if (!res.success) {
      setSecretCodeError(res.error || 'Failed to update admin secret code.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    audioVoiceEngine.playRestockChime();
    confetti({ particleCount: 40, spread: 60 });
    setActionNotice('Admin Signup Secret Code successfully updated!');
    setIsSecretCodeModalOpen(false);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      {/* Admin Top Banner */}
      <div className="bg-[#0f2d1e] text-white border-b border-emerald-900/60 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
               Online Vegetables Shop
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Online Mandi Green Vegetable</span>
                <span className="text-xs bg-emerald-700/80 text-emerald-100 font-bold px-2 py-0.5 rounded-md">
                  ADMIN SITE
                </span>
              </h1>
              <p className="text-emerald-200/90 text-xs sm:text-sm mt-1">
                Logged in as <strong className="text-white">{adminName}</strong>. Review customer buying requests, verify orders, and dispatch deliveries.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {onOpenAboutPage && (
                <button
                  type="button"
                  onClick={onOpenAboutPage}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5 border border-amber-300"
                  title="View and Edit About Mandi Page"
                >
                  <Info className="w-4 h-4 text-slate-950" />
                  <span>About Page (ہمارے متعلق)</span>
                </button>
              )}
              <button
                onClick={onSwitchToCustomerPortal}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-200" />
                <span>Switch to Customer Storefront</span>
              </button>
            </div>
          </div>

          {/* Action Notice Toast */}
          {actionNotice && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500 text-emerald-950 font-black text-xs shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Check className="w-4 h-4 text-emerald-950" />
              <span>{actionNotice}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* KPI Dashboard Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Total Requests</span>
              <Package className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {stats.total}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">All customer orders</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between text-amber-900 text-xs font-black">
              <span>Pending Action</span>
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-2">
              {stats.pending}
            </div>
            <div className="text-[11px] text-amber-800 font-bold mt-0.5">Needs Admin Verification</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-900 text-xs font-black">
              <span>Verified Orders</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-2">
              {stats.verified}
            </div>
            <div className="text-[11px] text-emerald-800 font-bold mt-0.5">Packing & Transit</div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 shadow-2xs">
            <div className="flex items-center justify-between text-teal-900 text-xs font-black">
              <span>Delivered</span>
              <Truck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-950 mt-2">
              {stats.delivered}
            </div>
            <div className="text-[11px] text-teal-800 font-bold mt-0.5">Completed Today</div>
          </div>

          <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-[#0d533a] to-[#083b29] text-white shadow-2xs">
            <div className="flex items-center justify-between text-emerald-200 text-xs font-bold">
              <span>Mandi Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              Rs. {stats.totalRevenue}
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">Verified & Delivered</div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setAdminTab('orders')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 sm:gap-2 transition cursor-pointer whitespace-nowrap shrink-0 ${
              adminTab === 'orders'
                ? 'bg-[#0f4d36] text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Customer Buying Requests</span>
            {stats.pending > 0 && (
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {stats.pending} NEW
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('inventory')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 sm:gap-2 transition cursor-pointer whitespace-nowrap shrink-0 ${
              adminTab === 'inventory'
                ? 'bg-[#0f4d36] text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>Mandi Rates & Stock Operations</span>
          </button>

          <button
            onClick={() => setAdminTab('users')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 sm:gap-2 transition cursor-pointer whitespace-nowrap shrink-0 ${
              adminTab === 'users'
                ? 'bg-[#0f4d36] text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Customers & Admin Details</span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {customerList.length}
            </span>
          </button>
        </div>

        {adminTab === 'orders' ? (
          /* Orders Section */
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {(['All', 'Pending', 'Verified', 'Delivered'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      statusFilter === status
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {status === 'All' ? 'All Requests' : status}
                    {status === 'Pending' && stats.pending > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px]">
                        {stats.pending}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search order #, customer, phone..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">No Orders Found</h4>
                <p className="text-xs text-slate-500">
                  {searchQuery ? 'Try matching another customer name or phone.' : 'No customer buying requests in this filter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isPending = order.status === 'Pending';
                  const isVerified = order.status === 'Verified';
                  const isDelivered = order.status === 'Delivered';

                  return (
                    <div
                      key={order.id}
                      className={`p-6 rounded-3xl bg-white border transition-all duration-200 shadow-xs ${
                        isPending
                          ? 'border-amber-300/90 ring-2 ring-amber-400/20'
                          : isVerified
                          ? 'border-emerald-300/90'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-base text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                            #{order.orderNumber}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-slate-900 text-base">
                                {order.customerName}
                              </h3>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                {order.customerPhone}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{order.customerAddress}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge & Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                              Action Required: Pending Verification
                            </span>
                          )}
                          {isVerified && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              Verified • In Transit
                            </span>
                          )}
                          {isDelivered && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-teal-100 text-teal-950 border border-teal-300">
                              <Truck className="w-4 h-4 text-teal-700" />
                              Delivered ✓
                            </span>
                          )}
                          {order.status === 'Cancelled' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-100 text-rose-900 border border-rose-300">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items Grid */}
                      <div className="py-4">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Ordered Fresh Vegetables ({order.items.length} items):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80';
                                }}
                              />
                              <div className="min-w-0 flex-1 text-xs">
                                <div className="font-extrabold text-slate-900 truncate">
                                  {item.name}
                                </div>
                                <div className="font-urdu text-emerald-800 text-[11px]">
                                  {item.urduName}
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                  <div className="text-[11px] text-slate-500">
                                    {item.quantityKg} kg @ Rs. {item.pricePerKg} ={' '}
                                    <strong className="text-slate-900">
                                      Rs. {item.quantityKg * item.pricePerKg}
                                    </strong>
                                  </div>
                                  {isDelivered && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDeliveredItem(order.id, item.itemId, item.name)}
                                      className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-100 transition cursor-pointer ml-1"
                                      title={`Delete ${item.name} from delivered order`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes if any */}
                      {order.notes && (
                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 mb-4">
                          <strong>Customer Instructions:</strong> {order.notes}
                        </div>
                      )}

                      {/* Bottom Summary & Admin Workflow Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        <div className="space-y-0.5">
                          <div className="text-xs text-slate-500">
                            Requested at:{' '}
                            <span className="font-semibold text-slate-700">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-lg font-black text-slate-900">
                            Total Payable: <span className="text-emerald-900">Rs. {order.totalAmount}</span>
                            <span className="text-xs font-normal text-slate-500 ml-1.5">(Cash on Delivery)</span>
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleVerify(order.id, order.orderNumber)}
                                className="px-5 py-2.5 rounded-xl bg-[#0d533a] hover:bg-[#093d2b] active:scale-95 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                <span>Verify Buying Request</span>
                              </button>
                              <button
                                onClick={() => handleCancel(order.id, order.orderNumber)}
                                className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {isVerified && (
                            <button
                              onClick={() => handleDeliver(order.id, order.orderNumber)}
                              className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Truck className="w-4 h-4 text-teal-200" />
                              <span>Mark as Delivered to Customer</span>
                            </button>
                          )}

                          {isDelivered && (
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 flex items-center gap-1.5">
                                <Check className="w-4 h-4 text-teal-700" />
                                <span>Order Completed & Delivered</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteDeliveredOrder(order.id, order.orderNumber)}
                                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                title="Delete delivered order from records"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete Delivered</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : adminTab === 'inventory' ? (
          /* Inventory and Rates Management Desk */
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Admin Catalog Controls
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Mandi Daily Rates, Products & Stock Operations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add new fresh vegetables, edit prices & stock, or delete discontinued products. Only visible to verified Admin.
                </p>
              </div>

              {/* Add Product Button (Only Shown for Admin) */}
              <button
                type="button"
                onClick={onOpenAddProduct}
                className="px-4 py-2.5 rounded-xl bg-[#0d533a] hover:bg-[#093d2b] active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2 self-start sm:self-auto shrink-0"
              >
                <Plus className="w-4 h-4 text-emerald-300" />
                <span>+ Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const isLow = item.currentStock <= item.minThreshold;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-slate-900 text-sm truncate">
                            {item.name}
                          </h4>
                          <span className="font-urdu font-black text-emerald-800 text-base">
                            {item.urduName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Stock:{' '}
                          <span className={isLow ? 'text-amber-700 font-black' : 'font-bold text-slate-800'}>
                            {item.currentStock} kg
                          </span>{' '}
                          / {item.maxCapacity} kg
                        </div>
                      </div>
                    </div>

                    {/* Rate & Restock Controls */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">Daily Mandi Rate:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">Rs.</span>
                          <input
                            type="number"
                            defaultValue={item.pricePerKg}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val > 0) {
                                onUpdateItemPrice(item.id, val);
                              }
                            }}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-900 text-center"
                          />
                          <span className="text-slate-400">/kg</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onRestockItem(item.id, 25)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs transition cursor-pointer text-center"
                        >
                          +25 kg Restock
                        </button>
                        <button
                          type="button"
                          onClick={() => onRestockItem(item.id, 50)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer text-center"
                        >
                          +50 kg Crate
                        </button>
                      </div>

                      {/* Admin Exclusive: Edit and Delete Product Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => onEditProduct(item)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit Product</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(item)}
                          className="py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                          title="Delete this product from mandi"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ================= CUSTOMERS & ADMIN DETAILS SECTION ================= */
          /* Strictly restricted to Admin; regular customers cannot view this */
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider mb-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-700" />
                    Admin Confidential • Restricted Directory
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span>Customers & Admin Directory</span>
                    <span className="font-urdu text-base font-bold text-emerald-800">
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
                    Exclusive administrator directory showing all customer accounts, order histories, delivery addresses, and authorized administrator credentials.</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setNewUserName('');
                      setNewUserEmail('');
                      setNewUserPhone('');
                      setNewUserAddress('');
                      setNewUserRole('customer');
                      setNewUserPassword('');
                      setNewUserAvatar('');
                      setAddUserError(null);
                      setIsAddUserModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-200" />
                    <span>+ Add New User</span>
                  </button>
                </div>
              </div>

              {/* Statistics Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    Total Registered Customers
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {customerList.length}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    Total Customer Buying Requests
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {orders.length}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase">
                    Total Customer Revenue
                  </div>
                  <div className="text-2xl font-black text-emerald-950 mt-1">
                    Rs. {stats.totalRevenue}
                  </div>
                </div>
              </div>
            </div>

            {/* Administrator Profile Details Card */}
            <div className="bg-gradient-to-br from-[#0c3825] via-[#093522] to-[#06291a] text-white rounded-3xl p-6 shadow-xl border border-emerald-700/60 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                    👨‍💼
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                        Primary Mandi Administrator
                      </span>
                      <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-md">
                        ACTIVE SESSION
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-white mt-0.5">
                      {adminName}
                    </h4>
                    <p className="text-xs text-emerald-200">
                      Central Sabzi Mandi Hub • Office #4, Operations Headquarters
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenSecretCodeModal}
                  className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2 border border-amber-300 shrink-0"
                  title="Change Admin Signup Secret Code"
                >
                  <KeyRound className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>Change Admin Secret Code (ایڈمن خفیہ کوڈ تبدیل کریں)</span>
                </button>
              </div>

              {/* Admin Accounts List & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {adminList.map((adm) => (
                  <div
                    key={adm.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-white text-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-300" />
                        <span>{adm.name}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                        {adm.role}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-emerald-100">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                        <span className="font-mono">{adm.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                        <span>{adm.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                        <span>{adm.address}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 text-[11px] text-emerald-300 flex items-center justify-between">
                      <span>Permissions: Order Approval, Rate Edits, Catalog Control, Deletion</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>

                    {/* Admin Action Buttons: Edit & Delete */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEditUser(adm)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/70 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-emerald-400/30 active:scale-95"
                        title={`Edit ${adm.name} details`}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Edit Admin</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartDeleteUser(adm)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/40 hover:bg-rose-600 text-rose-100 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-rose-400/30 active:scale-95"
                        title={`Delete ${adm.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-200" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customers Directory Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-700" />
                    <span>Registered Customers List ({customerList.length})</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View full customer contact details: picture, name, phone, email, address, and orders list.
                  </p>
                </div>

                {/* Customer Search Bar & View Mode Toggle */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                  {/* View Toggle: List vs Cards */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setUserViewMode('list')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        userViewMode === 'list'
                          ? 'bg-white text-emerald-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Show users in detailed list format"
                    >
                      <List className="w-3.5 h-3.5 text-emerald-700" />
                      <span>List View (لسٹ)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserViewMode('grid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        userViewMode === 'grid'
                          ? 'bg-white text-emerald-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Show users in card tiles"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
                      <span>Cards (کارڈز)</span>
                    </button>
                  </div>

                  <div className="relative flex-1 md:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={userSearchInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUserSearchInput(val);
                        if (!val) setUserSearchQuery('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setUserSearchQuery(userSearchInput.trim());
                        }
                      }}
                      placeholder="Search name, phone, email, address..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                    />
                    {userSearchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserSearchInput('');
                          setUserSearchQuery('');
                        }}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setUserSearchQuery(userSearchInput.trim())}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search (تلاش کریں)</span>
                  </button>
                </div>
              </div>

              {/* Customers Display: List or Grid */}
              {customerList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-xs font-bold text-slate-600">
                    No customers match your search query &ldquo;{userSearchQuery}&rdquo;.
                  </div>
                  {userSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserSearchInput('');
                        setUserSearchQuery('');
                      }}
                      className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Show all customers
                    </button>
                  )}
                </div>
              ) : userViewMode === 'list' ? (
                /* ============= LIST VIEW (جدول / لسٹ فارمیٹ) ============= */
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-50/90 text-slate-700 text-[11px] font-black uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">User & Picture (تصویر و نام)</th>
                        <th className="py-3 px-4">Phone (فون نمبر)</th>
                        <th className="py-3 px-4">Email (جی میل)</th>
                        <th className="py-3 px-4">Address (پتہ)</th>
                        <th className="py-3 px-4 text-center">Orders & Spent</th>
                        <th className="py-3 px-4 text-right">Actions (اختیارات)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {customerList.map((customer) => {
                        const custOrders = orders.filter(
                          (o) =>
                            o.customerId === customer.id ||
                            o.customerName.toLowerCase() === customer.name.toLowerCase()
                        );
                        const totalSpent = custOrders
                          .filter((o) => o.status === 'Delivered' || o.status === 'Verified')
                          .reduce((sum, o) => sum + o.totalAmount, 0);

                        return (
                          <tr
                            key={customer.id}
                            className="hover:bg-emerald-50/40 transition-colors"
                          >
                            {/* Photo & Name */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {customer.avatarUrl ? (
                                  <img
                                    src={customer.avatarUrl}
                                    alt={customer.name}
                                    className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow-2xs shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                                    {customer.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-extrabold text-slate-900 text-sm truncate">
                                    {customer.name}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                                      Customer
                                    </span>
                                    {customer.authProvider === 'google' && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                        Google
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Phone */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <a
                                href={`tel:${customer.phone}`}
                                className="font-bold text-slate-800 hover:text-emerald-700 hover:underline flex items-center gap-1.5"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{customer.phone}</span>
                              </a>
                            </td>

                            {/* Email */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[180px]">{customer.email}</span>
                              </div>
                            </td>

                            {/* Address */}
                            <td className="py-3 px-4">
                              <div className="flex items-start gap-1.5 text-slate-700 max-w-xs">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-2 text-[11px]">{customer.address || 'Not specified'}</span>
                              </div>
                            </td>

                            {/* Orders & Spent */}
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <div className="font-black text-slate-900">
                                {custOrders.length} {custOrders.length === 1 ? 'Order' : 'Orders'}
                              </div>
                              <div className="text-[10px] font-bold text-emerald-800">
                                Rs. {totalSpent} spent
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditUser(customer)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 active:scale-95"
                                  title={`Edit ${customer.name}`}
                                >
                                  <Edit3 className="w-3 h-3 text-slate-500" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartDeleteUser(customer)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 active:scale-95"
                                  title={`Delete ${customer.name}`}
                                >
                                  <Trash2 className="w-3 h-3 text-rose-600" />
                                  <span>Delete</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery(customer.phone);
                                    setAdminTab('orders');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                                  title={`View orders of ${customer.name}`}
                                >
                                  <span>Orders</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* ============= CARDS VIEW ============= */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customerList.map((customer) => {
                    const custOrders = orders.filter(
                      (o) =>
                        o.customerId === customer.id ||
                        o.customerName.toLowerCase() === customer.name.toLowerCase()
                    );
                    const totalSpent = custOrders
                      .filter((o) => o.status === 'Delivered' || o.status === 'Verified')
                      .reduce((sum, o) => sum + o.totalAmount, 0);

                    return (
                      <div
                        key={customer.id}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {customer.avatarUrl ? (
                                <img
                                  src={customer.avatarUrl}
                                  alt={customer.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-xs shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                                  {customer.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h5 className="font-black text-slate-900 text-sm truncate">
                                  {customer.name}
                                </h5>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                                    Customer
                                  </span>
                                  {customer.authProvider === 'google' && (
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                      G Google
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xs font-black text-slate-900">
                                {custOrders.length} {custOrders.length === 1 ? 'Order' : 'Orders'}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Rs. {totalSpent} spent
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <a
                                href={`tel:${customer.phone}`}
                                className="font-semibold text-slate-800 hover:text-emerald-700 hover:underline"
                              >
                                {customer.phone}
                              </a>
                            </div>

                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate text-slate-500 font-mono text-[11px]">
                                {customer.email}
                              </span>
                            </div>

                            <div className="flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2 text-slate-700">
                                {customer.address}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Edit, Delete, and View Orders */}
                        <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-1.5">
                          <span className="text-[10px] text-slate-400">
                            Joined {new Date(customer.createdAt).toLocaleDateString()}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditUser(customer)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 active:scale-95"
                              title={`Edit ${customer.name} details`}
                            >
                              <Edit3 className="w-3 h-3 text-slate-500" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStartDeleteUser(customer)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 active:scale-95"
                              title={`Delete ${customer.name}`}
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                              <span>Delete</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery(customer.phone);
                                setAdminTab('orders');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                              title={`View orders for ${customer.name}`}
                            >
                              <span>Orders</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= IN-APP CONFIRMATION MODALS (Replaces blocked window.confirm) ================= */}
      {/* 1. Delete Delivered Order Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Delete Delivered Order #{orderToDelete.orderNumber}?
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to permanently delete this delivered order record from the system? This action cannot be undone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteOrder}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Delete Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cancel Order Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Cancel Buying Request #{orderToCancel.orderNumber}?
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to cancel this customer buying request? The customer will be informed that their order has been cancelled.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToCancel(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={confirmCancel}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Yes, Cancel Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Delivered Item Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Delete Delivered Product?
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to remove <strong className="text-slate-900">{itemToDelete.itemName}</strong> from this delivered order record?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteItem}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Delete Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit User Modal (Customer or Administrator) */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div
              className={`px-6 py-4 flex items-center justify-between text-white ${
                userToEdit.role === 'admin' ? 'bg-[#0f2d1e]' : 'bg-[#0a4833]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base">
                    Edit {userToEdit.role === 'admin' ? 'Administrator' : 'Customer'} Details
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Update profile credentials and contact info
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserToEdit(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {userToEdit.role === 'admin'
                    ? 'Operations Center / Office Address'
                    : 'Delivery Address'}
                </label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Profile Photo: Upload from Device */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Profile Picture (ڈیوائس سے تصویر منتخب کریں)</span>
                  </label>
                  {editAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setEditAvatarUrl('')}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {editAvatarUrl ? (
                    <img
                      src={editAvatarUrl}
                      alt="Preview"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-dashed border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const dataUrl = await readFileAsDataURL(file, 400, 400);
                            setEditAvatarUrl(dataUrl);
                          } catch {
                            setEditError('Could not read image file.');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editAvatarUrl ? 'Change Photo from Device' : 'Choose Photo from Device'}</span>
                    </button>
                    <p className="text-[10px] text-slate-500 text-center">
                      Upload directly from mobile gallery or computer
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Change Feature (For both Edit Admin and Edit User) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-700" />
                    <span>Change Account Password (اختیاری)</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    8-20 Characters
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-tight">
                  Leave empty to keep existing password, or enter new password below to update credentials.
                </p>

                <div className="space-y-2 pt-1">
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editNewPassword}
                      onChange={(e) => setEditNewPassword(e.target.value)}
                      placeholder="New password (8 to 20 characters)"
                      minLength={8}
                      maxLength={20}
                      className="w-full pl-9 pr-9 py-2 rounded-xl bg-white border border-amber-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showEditPassword ? 'Hide password' : 'Show password'}
                    >
                      {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {editNewPassword.trim().length > 0 && (
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editConfirmPassword}
                        onChange={(e) => setEditConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        minLength={8}
                        maxLength={20}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl bg-white border text-xs text-slate-900 focus:outline-none focus:ring-2 ${
                          editConfirmPassword && editNewPassword !== editConfirmPassword
                            ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                            : 'border-amber-300 focus:ring-amber-600'
                        }`}
                      />
                    </div>
                  )}

                  {editNewPassword.trim().length > 0 && (
                    <div className="text-[10px] flex items-center justify-between">
                      <span
                        className={
                          editNewPassword.trim().length >= 8 && editNewPassword.trim().length <= 20
                            ? 'text-emerald-700 font-bold'
                            : 'text-amber-700 font-bold'
                        }
                      >
                        Length: {editNewPassword.trim().length}/20 chars{' '}
                        {editNewPassword.trim().length >= 8 && editNewPassword.trim().length <= 20
                          ? '✓ Valid'
                          : '(Requires 8-20)'}
                      </span>
                      {editConfirmPassword && (
                        <span
                          className={
                            editNewPassword === editConfirmPassword
                              ? 'text-emerald-700 font-bold'
                              : 'text-rose-600 font-bold'
                          }
                        >
                          {editNewPassword === editConfirmPassword ? '✓ Passwords Match' : '✗ Mismatched'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToEdit(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-[#0d533a] hover:bg-[#093d2b] active:scale-95 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete User Confirmation Modal (Customer or Administrator) */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Delete {userToDelete.role === 'admin' ? 'Administrator' : 'Customer'}?
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-slate-900">{userToDelete.name}</strong> ({userToDelete.email}) from the Mandi records?
                </p>
                {userToDelete.role === 'admin' && adminList.length <= 1 && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                    ⚠️ Cannot delete the only remaining Administrator account. At least one administrator must remain active.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  disabled={userToDelete.role === 'admin' && adminList.length <= 1}
                  className={`py-2.5 px-4 rounded-xl font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    userToDelete.role === 'admin' && adminList.length <= 1
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Add New User Modal (Direct Administrator Creation) */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#0d533a] to-[#083a29] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Add New User Account</h3>
                  <span className="font-urdu text-xs text-emerald-300">
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {addUserError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-bold">{addUserError}</span>
                </div>
              )}

              {/* Role selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Type :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewUserRole('customer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      newUserRole === 'customer'
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Customer </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUserRole('admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      newUserRole === 'admin'
                        ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Administrator </span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (پورا نام): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Aslam Pervez"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Gmail Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gmail Address (جی میل): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (فون نمبر): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Address (پتہ):
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <textarea
                    rows={2}
                    value={newUserAddress}
                    onChange={(e) => setNewUserAddress(e.target.value)}
                    placeholder="Street address, City, Area"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password (پاس ورڈ - 8 تا 20 حروف):
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Leave blank for default (MandiPassword2026)"
                    minLength={8}
                    maxLength={20}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>

              {/* Profile Photo: Upload from Device */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Profile Picture </span>
                  </label>
                  {newUserAvatar && (
                    <button
                      type="button"
                      onClick={() => setNewUserAvatar('')}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {newUserAvatar ? (
                    <img
                      src={newUserAvatar}
                      alt="Preview"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-dashed border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={addFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const dataUrl = await readFileAsDataURL(file, 400, 400);
                            setNewUserAvatar(dataUrl);
                          } catch {
                            setAddUserError('Could not read image file.');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{newUserAvatar ? 'Change Photo from Device' : 'Choose Photo from Device'}</span>
                    </button>
                    <p className="text-[10px] text-slate-500 text-center">
                      Upload directly from mobile gallery or computer
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel 
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account </span>
                </button>
              </div>
            </form>
          </div>
        </div>
     )}
      {/* Change Admin Signup Secret Code Modal */}
      {isSecretCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400 text-slate-950">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    Change Admin Secret Code
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSecretCodeModalOpen(false)}
                className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminSecretCode} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-extrabold">Confidential Security Notice</p>
                  <p className="text-[11px] text-amber-800">
                    This secret code is required whenever a new administrator signs up. Keep it confidential.
                  </p>
                </div>
              </div>

              {secretCodeError && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{secretCodeError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Current Admin Secret Code</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showSecretCode ? 'text' : 'password'}
                    value={currentSecretInput}
                    onChange={(e) => setCurrentSecretInput(e.target.value)}
                    placeholder="Enter current secret code"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono tracking-wider"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretCode(!showSecretCode)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showSecretCode ? 'Hide password' : 'Show password'}
                  >
                    {showSecretCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>New Admin Secret Code </span>
                  <span className="text-[10px] text-slate-500 font-normal">Min 4 chars</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showSecretCode ? 'text' : 'password'}
                    value={newSecretInput}
                    onChange={(e) => setNewSecretInput(e.target.value)}
                    placeholder="Enter new admin secret code"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono tracking-wider"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  Confirm New Secret Code 
                </label>
                <div className="relative">
                  <CheckCircle2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showSecretCode ? 'text' : 'password'}
                    value={confirmSecretInput}
                    onChange={(e) => setConfirmSecretInput(e.target.value)}
                    placeholder="Confirm new admin secret code"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono tracking-wider"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSecretCodeModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Code </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
