import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Camera,
  Save,
  CheckCircle2,
  X,
  AlertCircle,
  Key,
  Upload,
  Trash2,
} from 'lucide-react';
import { User, UserRole } from '../types/auth';
import { authService, validatePasswordRules } from '../utils/authService';
import { readFileAsDataURL } from '../utils/imageHelper';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}



export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const dataUrl = await readFileAsDataURL(file, 400, 400);
      setAvatarUrl(dataUrl);
      setStatusMessage({
        type: 'success',
        text: 'ڈیوائس سے تصویر منتخب ہو گئی ہے! تبدیلیاں رکھنے کیلئے نیچے "Save Changes" پر کلک کریں۔ (Device photo loaded. Click Save Changes to save).',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to read image from device.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      setPassword(currentUser.password || '');
      setStatusMessage(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setStatusMessage({
        type: 'error',
        text: 'صارف کے پاس ڈیٹا تبدیل کرنے کا اختیار نہیں ہے۔ صرف ایڈمن کو تبدیلی کی اجازت ہے۔ (Access Denied: Only Admin can update profile data).',
      });
      return;
    }

    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }
    if (!phone.trim()) {
      setStatusMessage({ type: 'error', text: 'Phone number cannot be empty.' });
      return;
    }

    if (password) {
      const passValidation = validatePasswordRules(password);
      if (!passValidation.valid) {
        setStatusMessage({ type: 'error', text: passValidation.error || 'Password invalid.' });
        return;
      }
    }

    setIsSaving(true);
    setStatusMessage(null);

    const result = authService.updateUser(currentUser.id, {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      avatarUrl: avatarUrl.trim(),
      password: password ? password.trim() : undefined,
    });

    setIsSaving(false);

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: 'پروفائل کی معلومات اور تصویر کامیابی سے محفوظ ہو گئی ہے۔ (Profile successfully updated!)',
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'Failed to update profile.',
      });
    }
  };

  const currentDisplayAvatar = avatarUrl || currentUser.avatarUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0b3826] via-[#09422b] to-[#042417] text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-wide text-white">
                  User Profile
                </h3>
                <span className="font-urdu text-sm font-bold text-emerald-300">
                  (صارف کا پروفائل)
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-emerald-400 text-emerald-950'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Toast */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border border-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-semibold">{statusMessage.text}</span>
            </div>
          )}

          {/* Profile Picture & Badges Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="relative group shrink-0">
              {currentDisplayAvatar ? (
                <img
                  src={currentDisplayAvatar}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-emerald-500">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload photo from device (ڈیوائس سے تصویر منتخب کریں)"
                  className="absolute -bottom-1 -right-1 bg-amber-400 hover:bg-amber-300 text-slate-950 p-1.5 rounded-full shadow-md border-2 border-white cursor-pointer active:scale-95 transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-center sm:text-left min-w-0 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h4 className="text-base font-extrabold text-slate-900 truncate">
                  {currentUser.name}
                </h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                {currentUser.email}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  <Calendar className="w-3 h-3 text-emerald-700" />
                  <span>Joined: {new Date(currentUser.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* Device Photo Upload (Replaces URL and Presets per User Request) */}
            {isAdmin ? (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-amber-950">
                      Profile Picture from Device (ڈیوائس سے تصویر لگائیں):
                    </label>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      Select any photo from your mobile phone or computer to change profile picture.
                    </p>
                  </div>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-emerald-200" />
                    <span>
                      {isUploading
                        ? 'Loading Photo...'
                        : avatarUrl
                        ? 'Change Photo from Device (دوسری تصویر لگائیں)'
                        : 'Choose Photo from Device (ڈیوائس سے تصویر منتخب کریں)'}
                    </span>
                  </button>

                  {avatarUrl && (
                    <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Device photo ready to save</span>
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name (پورا نام):
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border ${
                    !isAdmin
                      ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-emerald-600'
                  }`}
                />
              </div>
            </div>

            {/* Email (Always protected Gmail address) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gmail Address (جی میل):
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  disabled={true}
                  value={email}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border bg-slate-100 text-slate-600 border-slate-200 font-mono cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Gmail account identifier is locked for security & authentication integrity.
              </span>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number (فون نمبر):
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  disabled={!isAdmin}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border ${
                    !isAdmin
                      ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-emerald-600'
                  }`}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivery Address (پتہ):
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  disabled={!isAdmin}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border ${
                    !isAdmin
                      ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-emerald-600'
                  }`}
                />
              </div>
            </div>

            {/* Password (Visible & Editable only by Admin) */}
            {isAdmin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Change Password (پاس ورڈ - 8 تا 20 حروف):
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (8-20 characters)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Close (بند کریں)
              </button>

              {isAdmin && (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-700/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes (تبدیلیاں محفوظ کریں)'}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
