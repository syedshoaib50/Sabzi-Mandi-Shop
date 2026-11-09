import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Shield,
  Check,
} from 'lucide-react';
import { UserRole } from '../types/auth';
import {
  authService,
  ADMIN_SECRET_CODE,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  validateGmailAddress,
  validatePasswordRules,
  validatePakistaniPhone,
} from '../utils/authService';
import { audioVoiceEngine } from '../utils/audioVoiceEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [adminSecretCode, setAdminSecretCode] = useState<string>('');
  const [showSecretCode, setShowSecretCode] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time password length status (strictly 8 to 20 characters)
  const passLength = password.length;
  const isPassLengthValid = passLength >= MIN_PASSWORD_LENGTH && passLength <= MAX_PASSWORD_LENGTH;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const loginEmail = email.trim() || (role === 'admin' ? 'admin@sabzimandi.pk' : 'customer@sabzimandi.pk');
    const loginPassword = password.trim();

    // 1. Validate Gmail
    const emailCheck = validateGmailAddress(loginEmail);
    if (!emailCheck.valid) {
      setError(emailCheck.error || 'Please enter a valid Gmail address (@gmail.com).');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    // 2. Validate Password Length (8 to 20 chars)
    const passCheck = validatePasswordRules(loginPassword);
    if (!passCheck.valid) {
      setError(passCheck.error || 'Password must be between 8 and 20 characters.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    const res = authService.login(loginEmail, loginPassword, role);
    if (res.success && res.user) {
      audioVoiceEngine.playRestockChime();
      onSuccess(res.user.role);
      onClose();
    } else {
      setError(res.error || 'Login failed. Please check credentials.');
      audioVoiceEngine.playErrorBuzz();
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    // 1. Validate Gmail
    const emailCheck = validateGmailAddress(email.trim());
    if (!emailCheck.valid) {
      setError(emailCheck.error || 'Only valid Gmail addresses (@gmail.com) are accepted.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    // 2. Validate Password Length (8 to 20 chars)
    const passCheck = validatePasswordRules(password.trim());
    if (!passCheck.valid) {
      setError(passCheck.error || 'Password must be between 8 and 20 characters long.');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    // 3. Validate Pakistani Mobile Number (Strict 11 digits starting with 03)
    const phoneCheck = validatePakistaniPhone(phone.trim());
    if (!phoneCheck.valid) {
      setError(phoneCheck.error || 'Please enter a valid 11-digit Pakistani phone number (e.g. 03001234567).');
      audioVoiceEngine.playErrorBuzz();
      return;
    }

    // 4. Validate Admin Secret Passcode (Only for Admin registration)
    if (role === 'admin') {
      if (!adminSecretCode.trim()) {
        setError('Admin Secret Passcode is required to register as Admin.');
        audioVoiceEngine.playErrorBuzz();
        return;
      }
      if (!authService.verifyAdminSecretCode(adminSecretCode.trim())) {
        setError('Invalid Admin Secret Passcode! Registration restricted to authorized administrators.');
        audioVoiceEngine.playErrorBuzz();
        return;
      }
    }

    const res = authService.signup({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      phone: phone.trim(),
      address: address.trim() || (role === 'admin' ? 'Sabzi Mandi Operations Center' : 'Sector G-9, Islamabad'),
      role,
      adminSecretCode: role === 'admin' ? adminSecretCode : undefined,
    });

    if (res.success && res.user) {
      audioVoiceEngine.playRestockChime();
      onSuccess(res.user.role);
      onClose();
    } else {
      setError(res.error || 'Signup failed.');
      audioVoiceEngine.playErrorBuzz();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Header */}
        <div className="px-6 py-5 bg-[#0a4833] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg">Green Vegetable Portal</h3>
              <p className="text-xs text-emerald-200">
                {mode === 'login' ? 'Secure Sign In with Gmail & Password' : 'Create a Secure Mandi Account'}
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-center text-xs font-bold transition cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-emerald-900 border-b-2 border-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-3 text-center text-xs font-bold transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-emerald-900 border-b-2 border-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account (Sign Up)
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Security functions (anti-brute-force lockout, 256-bit encryption, 8-20 char bounds, Gmail verification) run securely in the background */}

          {/* Role Selection Tabs for both Login & Signup */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Access Type:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('customer');
                  if (!email.trim() || email === 'admin@sabzimandi.pk') {
                    setEmail('customer@sabzimandi.pk');
                  }
                  setError(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                  role === 'customer'
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-500 shadow-2xs ring-1 ring-emerald-500/30'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Customer (Buyer)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  if (!email.trim() || email === 'customer@sabzimandi.pk') {
                    setEmail('admin@sabzimandi.pk');
                  }
                  setError(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                  role === 'admin'
                    ? 'bg-amber-100 text-amber-950 border-amber-500 shadow-2xs ring-1 ring-amber-500/30'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin (Mandi Desk)</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gmail Address <span className="text-emerald-700">(@gmail.com)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'admin' ? 'admin@sabzimandi.pk' : 'customer@sabzimandi.pk'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password <span className="text-slate-400 font-normal">(8 to 20 characters)</span>
                  </label>
                  <span
                    className={`text-[10px] font-bold ${
                      passLength === 0
                        ? 'text-slate-400'
                        : isPassLengthValid
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {passLength}/20 chars
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password (8-20 characters)"
                    minLength={MIN_PASSWORD_LENGTH}
                    maxLength={MAX_PASSWORD_LENGTH}
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                      passLength > 0 && !isPassLengthValid
                        ? 'border-amber-400 focus:ring-amber-500 bg-amber-50/20'
                        : passLength > 0 && isPassLengthValid
                        ? 'border-emerald-500 focus:ring-emerald-600'
                        : 'border-slate-300 focus:ring-emerald-600'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  {isPassLengthValid ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" /> Valid password length (8-20 chars)
                    </span>
                  ) : (
                    <span>Password must be between 8 and 20 characters.</span>
                  )}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0d533a] hover:bg-[#093d2b] active:scale-95 text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{role === 'admin' ? 'Authorize & Enter Admin Desk' : 'Sign In to Storefront'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Asad Ullah"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gmail Address <span className="text-emerald-700">(@gmail.com)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. asad@gmail.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Must be a genuine Gmail address ending with @gmail.com
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Create Password <span className="text-slate-400 font-normal">(8-20 characters)</span>
                  </label>
                  <span
                    className={`text-[10px] font-bold ${
                      passLength === 0
                        ? 'text-slate-400'
                        : isPassLengthValid
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {passLength}/20 chars
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8, max 20 characters"
                    minLength={MIN_PASSWORD_LENGTH}
                    maxLength={MAX_PASSWORD_LENGTH}
                    className={`w-full pl-9 pr-10 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                      passLength > 0 && !isPassLengthValid
                        ? 'border-amber-400 focus:ring-amber-500 bg-amber-50/20'
                        : passLength > 0 && isPassLengthValid
                        ? 'border-emerald-500 focus:ring-emerald-600'
                        : 'border-slate-300 focus:ring-emerald-600'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  {isPassLengthValid ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" /> Valid password (8-20 characters)
                    </span>
                  ) : (
                    <span>Password must be between 8 and 20 characters long.</span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (11-digit Pakistani Mobile)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03001234567 (11 digits)"
                    maxLength={14}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Must be a valid 11-digit Pakistani mobile number starting with 03
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {role === 'admin' ? 'Mandi Branch / Hub' : 'Delivery Address'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={role === 'admin' ? 'Main Mandi Hub, Islamabad' : 'Street 4, Sector F-7/2, Islamabad'}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Secret Code Input (Required for Admin Signup) */}
              {role === 'admin' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                      <span>Admin Secret Passcode *</span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-800">
                      Restricted Access
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showSecretCode ? 'text' : 'password'}
                      value={adminSecretCode}
                      onChange={(e) => setAdminSecretCode(e.target.value)}
                      placeholder="Enter authorized admin secret passcode"
                      className="w-full pl-3 pr-10 py-2 rounded-xl bg-white border border-amber-400 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretCode(!showSecretCode)}
                      className="absolute right-2.5 top-2.5 text-amber-700 hover:text-amber-900 cursor-pointer"
                      title={showSecretCode ? 'Hide passcode' : 'Show passcode'}
                    >
                      {showSecretCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-800 font-medium">
                    Authorized secret passcode required to prevent unauthorized administrator access.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-[#0d533a] hover:bg-[#093d2b] active:scale-95 text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{role === 'admin' ? 'Register Verified Admin Account' : 'Create Customer Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
