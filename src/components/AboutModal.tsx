import React, { useState, useEffect } from 'react';
import {
  Info,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  Edit3,
  Check,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  Store,
  CheckCircle2,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Camera,
  Upload,
} from 'lucide-react';
import { aboutService, AboutPageData, MandiTeamMember } from '../utils/aboutService';
import { User } from '../types/auth';
import { audioVoiceEngine } from '../utils/audioVoiceEngine';
import { readFileAsDataURL } from '../utils/imageHelper';
import confetti from 'canvas-confetti';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [data, setData] = useState<AboutPageData>(() => aboutService.getData());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<AboutPageData>(() => aboutService.getData());
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Leadership Team Member modal state
  const [memberModalOpen, setMemberModalOpen] = useState<boolean>(false);
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
  const [memberForm, setMemberForm] = useState<MandiTeamMember>({
    id: '',
    name: '',
    role: '',
    roleUrdu: '',
    phone: '',
    avatar: '👨‍💼',
  });
  const [memberImageError, setMemberImageError] = useState<string | null>(null);
  const memberFileRef = React.useRef<HTMLInputElement | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const unsub = aboutService.subscribe((updated) => {
      setData(updated);
      if (!isEditing) {
        setEditForm(updated);
      }
    });
    return () => unsub();
  }, [isEditing]);

  if (!isOpen) return null;

  const handleStartEdit = () => {
    if (!isAdmin) return;
    setEditForm({ ...data });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm({ ...data });
    setIsEditing(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const res = aboutService.updateData(
      editForm,
      currentUser?.name || 'Administrator'
    );

    if (res.success && res.data) {
      setData(res.data);
      setIsEditing(false);
      audioVoiceEngine.playRestockChime();
      confetti({ particleCount: 40, spread: 60 });
      setSaveNotice('About Page content successfully updated and saved permanently!');
      setTimeout(() => setSaveNotice(null), 3500);
    }
  };

  const handleResetDefaults = () => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to restore default About page information?')) {
      const reset = aboutService.resetToDefault(currentUser?.name || 'Admin');
      setData(reset);
      setEditForm(reset);
      setIsEditing(false);
      audioVoiceEngine.playScannerBeep();
      setSaveNotice('About Page reset to verified official defaults.');
      setTimeout(() => setSaveNotice(null), 3000);
    }
  };

  // Team Member CRUD handlers
  const handleOpenAddMember = () => {
    setMemberForm({
      id: 'team_' + Math.random().toString(36).substring(2, 9),
      name: '',
      role: '',
      roleUrdu: '',
      phone: '',
      avatar: '👨‍💼',
    });
    setEditingMemberIndex(null);
    setMemberImageError(null);
    setMemberModalOpen(true);
  };

  const handleStartEditMember = (member: MandiTeamMember, idx: number) => {
    setMemberForm({ ...member });
    setEditingMemberIndex(idx);
    setMemberImageError(null);
    setMemberModalOpen(true);
  };

  const handleRemoveMember = (idx: number) => {
    setEditForm((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== idx),
    }));
    audioVoiceEngine.playScannerBeep();
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim()) return;

    setEditForm((prev) => {
      const updated = [...prev.team];
      if (editingMemberIndex !== null && editingMemberIndex >= 0) {
        updated[editingMemberIndex] = { ...memberForm };
      } else {
        updated.push({
          ...memberForm,
          id: memberForm.id || 'team_' + Date.now(),
        });
      }
      return { ...prev, team: updated };
    });

    audioVoiceEngine.playRestockChime();
    setMemberModalOpen(false);
  };

  const handleMemberImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setMemberImageError(null);
      const dataUrl = await readFileAsDataURL(file, 300, 300);
      setMemberForm((prev) => ({ ...prev, avatar: dataUrl }));
    } catch {
      setMemberImageError('Could not process image file. Please choose PNG/JPG.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-300/30">
                  Official Portal Information
                </span>
                {isAdmin ? (
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-md">
                    Admin Edit Mode Available
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800/80 text-emerald-200 font-medium px-2 py-0.5 rounded-md">
                    Verified Public Directory
                  </span>
                )}
              </div>
              <h3 className="font-black text-lg sm:text-xl text-white mt-0.5">
                About Our Mandi • ہمارے متعلق
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && !isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                title="Edit About Page Information"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit Info (تبدیل کریں)</span>
                <span className="sm:hidden">Edit</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Notice */}
        {saveNotice && (
          <div className="px-5 py-2.5 bg-emerald-100 border-b border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{saveNotice}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isEditing && isAdmin ? (
            /* ================= ADMIN EDIT FORM ================= */
            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Administrator Content Management</span>
                </div>
                <p className="text-amber-800 text-[11px]">
                  Any changes you save will be immediately updated across both Customer and Admin portals and permanently stored in the Mandi system.
                </p>
              </div>

              {/* Title & Tagline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">
                    Mandi Name / Title (English)
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">
                    Mandi Name / Title (اردو نام)
                  </label>
                  <input
                    type="text"
                    value={editForm.titleUrdu}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, titleUrdu: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-right font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">
                    Tagline / Slogan (English)
                  </label>
                  <input
                    type="text"
                    value={editForm.tagline}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, tagline: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">
                    Tagline / Slogan (اردو سلوگن)
                  </label>
                  <input
                    type="text"
                    value={editForm.taglineUrdu}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, taglineUrdu: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-right font-medium"
                  />
                </div>
              </div>

              {/* Story */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">
                    Our Story & Background (English)
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.story}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, story: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">
                    منڈی کی تاریخ اور تفصیل (اردو)
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.storyUrdu}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, storyUrdu: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-right font-medium leading-relaxed"
                  />
                </div>
              </div>

              {/* Mission */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">
                    Mission & Quality Standard (English)
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.mission}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, mission: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">
                    ہمارا مشن و معیار (اردو)
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.missionUrdu}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, missionUrdu: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-right font-medium leading-relaxed"
                  />
                </div>
              </div>

              {/* Contact & Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Official Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">WhatsApp Helpline</label>
                  <input
                    type="text"
                    value={editForm.whatsapp}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Official Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Operating Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Operating Timings (English)</label>
                  <input
                    type="text"
                    value={editForm.operatingHours}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, operatingHours: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">اوقات کار (اردو)</label>
                  <input
                    type="text"
                    value={editForm.operatingHoursUrdu}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, operatingHoursUrdu: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-right font-medium"
                  />
                </div>
              </div>

              {/* Physical Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Mandi Physical Address (English)</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">منڈی کا مکمل پتہ (اردو)</label>
                  <input
                    type="text"
                    value={editForm.addressUrdu}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, addressUrdu: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-right font-medium"
                  />
                </div>
              </div>

              {/* Leadership & Committee Members Management */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/70 pb-3">
                  <div>
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span>Mandi Operations Leadership (منتظمین منڈی کی تفصیلات)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Add, update or remove key leadership members displayed on the About page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddMember}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member (نیا رکن شامل کریں)</span>
                  </button>
                </div>

                {editForm.team.length === 0 ? (
                  <div className="p-4 text-center bg-white rounded-xl border border-dashed border-emerald-300 text-xs text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700">No leadership members added yet.</p>
                    <p className="text-[11px] text-slate-400">Click &ldquo;Add Member&rdquo; above to add committee members, operations incharge, or directors.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {editForm.team.map((member, idx) => (
                      <div
                        key={member.id || idx}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {member.avatar?.startsWith('data:') || member.avatar?.startsWith('http') ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-10 h-10 rounded-xl object-cover border border-emerald-300 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg shrink-0">
                              {member.avatar || '👨‍💼'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-900 truncate">
                              {member.name}
                            </div>
                            <div className="text-[10px] text-emerald-800 font-bold truncate">
                              {member.role}
                            </div>
                            {member.phone && (
                              <div className="text-[10px] text-slate-500 font-mono truncate">
                                {member.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditMember(member, idx)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                            title="Edit member"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Changes (محفوظ کریں)</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ================= BEAUTIFUL VIEW MODE ================= */
            <>
              {/* Hero Banner inside About Modal */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c3825] via-[#093522] to-[#041a10] text-white p-6 sm:p-8 shadow-lg border border-emerald-700/50">
                <div className="relative z-10 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-300/30">
                      🌾 Mandi Ka Taza Maal
                    </span>
                    <span className="text-[11px] bg-emerald-600/80 text-emerald-100 font-bold px-3 py-1 rounded-full">
                      Farm Sourced Daily • 100% Halal & Hygienic
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {data.title}
                    </h2>
                    <h3 className="text-lg sm:text-xl font-bold text-amber-300 font-serif mt-1">
                      {data.titleUrdu}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                    {data.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-200/90 font-medium text-right max-w-2xl leading-relaxed">
                    {data.taglineUrdu}
                  </p>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {data.stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1 shadow-2xs hover:border-emerald-300 transition"
                  >
                    <div className="text-xl sm:text-2xl font-black text-emerald-950">
                      {stat.value}
                    </div>
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      {stat.label}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {stat.description}
                    </div>
                  </div>
                ))}
              </div>

              {/* Story and Mission */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Our Story Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-black text-slate-900 text-sm">
                      Our Background & Heritage • ہماری کہانی
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {data.story}
                  </p>
                  <p className="text-xs text-emerald-950 font-medium text-right leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    {data.storyUrdu}
                  </p>
                </div>

                {/* Our Mission Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-black text-slate-900 text-sm">
                      Our Mission & Sourcing Rules • ہمارا مشن
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {data.mission}
                  </p>
                  <p className="text-xs text-emerald-950 font-medium text-right leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    {data.missionUrdu}
                  </p>
                </div>
              </div>

              {/* Operating Hours & Central Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Operating Hours (اوقاتِ کار)</span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-medium">{data.operatingHours}</p>
                    <p className="text-emerald-900 font-bold text-right">
                      {data.operatingHoursUrdu}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>Headquarters & Hub (منڈی کا پتہ)</span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-medium">{data.address}</p>
                    <p className="text-emerald-900 font-bold text-right">
                      {data.addressUrdu}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Leadership Team - Only shown if admin has added members! */}
              {data.team && data.team.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span>Mandi Operations Leadership • منتظمین منڈی</span>
                    </h4>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Official Committee Members
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {data.team.map((member, idx) => (
                      <div
                        key={member.id || idx}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3"
                      >
                        {member.avatar?.startsWith('data:') || member.avatar?.startsWith('http') ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-11 h-11 rounded-xl object-cover border border-emerald-300 shadow-2xs shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
                            {member.avatar || '👨‍💼'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black text-slate-900 truncate">
                            {member.name}
                          </div>
                          <div className="text-[10px] text-emerald-800 font-bold truncate">
                            {member.role}
                          </div>
                          {member.phone && (
                            <div className="text-[10px] text-slate-500 truncate font-mono">
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Bar & WhatsApp Action */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-bold">{data.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-mono text-xs">{data.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Helpline</span>
                  </a>
                  <a
                    href={`tel:${data.phone}`}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Direct</span>
                  </a>
                </div>
              </div>

              {/* Footer info in Modal */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[10px] text-slate-400 border-t border-slate-100">
                <div>
                  Last verified by <span className="font-bold text-slate-600">{data.updatedBy}</span> on{' '}
                  {new Date(data.lastUpdated).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {isAdmin
                      ? 'You are logged in as Administrator: Full editing access enabled.'
                      : 'Public Verified View: Editing restricted to Mandi Administrator.'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Bottom Close */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            Close (بند کریں)
          </button>
        </div>
      </div>

      {/* Member Add/Edit Dialog Modal */}
      {memberModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-300" />
                <h3 className="font-black text-sm text-white">
                  {editingMemberIndex !== null ? 'Edit Leadership Member' : 'Add Leadership Member'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMemberModalOpen(false)}
                className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-5 space-y-4">
              {memberImageError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {memberImageError}
                </div>
              )}

              {/* Picture / Avatar selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Photo / Avatar (تصویر منتخب کریں)</span>
                  {memberForm.avatar && (
                    <button
                      type="button"
                      onClick={() => setMemberForm((p) => ({ ...p, avatar: '👨‍💼' }))}
                      className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Reset to Default
                    </button>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  {memberForm.avatar?.startsWith('data:') || memberForm.avatar?.startsWith('http') ? (
                    <img
                      src={memberForm.avatar}
                      alt="Preview"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                      {memberForm.avatar || '👨‍💼'}
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={memberFileRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleMemberImageFile}
                    />
                    <button
                      type="button"
                      onClick={() => memberFileRef.current?.click()}
                      className="w-full py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo from Device</span>
                    </button>

                    {/* Quick Emojis */}
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="text-[10px] text-slate-400 font-bold mr-1">Presets:</span>
                      {['👨‍💼', '👩‍🌾', '🚚', '🧑‍🌾', '📦', '🛡️'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setMemberForm((p) => ({ ...p, avatar: emoji }))}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition cursor-pointer border ${
                            memberForm.avatar === emoji
                              ? 'bg-amber-300 border-amber-400 scale-105'
                              : 'bg-slate-100 hover:bg-slate-200 border-slate-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name (رکن کا نام)</label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Haji Abdul Rehman"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              {/* Role / Designation */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Designation / Role (عہدہ)</label>
                <input
                  type="text"
                  value={memberForm.role}
                  onChange={(e) => setMemberForm((p) => ({ ...p, role: e.target.value }))}
                  placeholder="e.g. Chief Mandi Administrator / Operations Incharge"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Contact Phone (فون نمبر)</label>
                <input
                  type="tel"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. 0300-7860110"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setMemberModalOpen(false)}
                  className="py-2 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingMemberIndex !== null ? 'Update Member' : 'Add Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
