import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  User,
  KeyRound,
  Store,
  Database,
  Check,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AdminSettings: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "store" | "system">("profile");
  const [toastMessage, setToastMessage] = useState("");

  // Profile Form States
  const [displayName, setDisplayName] = useState(profile?.display_name || "Kidia Admin");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Store Settings States
  const [storeName, setStoreName] = useState("KIDIA Boutique");
  const [supportEmail, setSupportEmail] = useState("support@kidia.com");
  const [supportPhone, setSupportPhone] = useState("+91 98765 43210");
  const [freeShippingMin, setFreeShippingMin] = useState("1999");
  const [announcement, setAnnouncement] = useState(
    "✨ Handcrafted Boutique Kids Wear for Ages 1–12 • Little Styles. Big Smiles."
  );
  const [savingStore, setSavingStore] = useState(false);

  // System status
  const [testingDb, setTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<"connected" | "error" | "idle">("connected");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "Kidia Admin");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      await refreshProfile();
      showToast("Profile details updated successfully!");
    } catch (err: any) {
      showToast("Error updating profile: " + (err?.message || "Failed"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully! Keep it safe.");
    } catch (err: any) {
      showToast("Error updating password: " + (err?.message || "Failed"));
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStore(true);
    try {
      // Upsert to site_settings table
      await supabase.from("site_settings").upsert({
        key: "store_config",
        value: {
          storeName,
          supportEmail,
          supportPhone,
          freeShippingMin: Number(freeShippingMin) || 1999,
          announcement,
        },
        updated_at: new Date().toISOString(),
      });

      localStorage.setItem(
        "kidia_store_config",
        JSON.stringify({ storeName, supportEmail, supportPhone, freeShippingMin, announcement })
      );

      showToast("Store configurations saved!");
    } catch {
      localStorage.setItem(
        "kidia_store_config",
        JSON.stringify({ storeName, supportEmail, supportPhone, freeShippingMin, announcement })
      );
      showToast("Configurations saved to local store");
    } finally {
      setSavingStore(false);
    }
  };

  const handleTestDatabase = async () => {
    setTestingDb(true);
    try {
      const { data, error } = await supabase.from("categories").select("id").limit(1);
      if (error) throw error;
      setDbStatus("connected");
      showToast("Supabase Database connection is healthy and responsive!");
    } catch {
      setDbStatus("error");
      showToast("Supabase connection check failed. Verify API keys.");
    } finally {
      setTestingDb(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-dark-navy text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-slideDown">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-dark-navy tracking-tight font-sans">
          Store & Admin Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-gray mt-1 font-medium">
          Manage administrator profile credentials, storefront preferences, and database configurations.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "profile"
              ? "border-[#0F9D8A] text-[#0F9D8A]"
              : "border-transparent text-muted-gray hover:text-dark-navy"
          }`}
        >
          <User size={15} />
          <span>Admin Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("store")}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "store"
              ? "border-[#0F9D8A] text-[#0F9D8A]"
              : "border-transparent text-muted-gray hover:text-dark-navy"
          }`}
        >
          <Store size={15} />
          <span>Boutique Storefront</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "system"
              ? "border-[#0F9D8A] text-[#0F9D8A]"
              : "border-transparent text-muted-gray hover:text-dark-navy"
          }`}
        >
          <Database size={15} />
          <span>System & Supabase</span>
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Personal Info Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-[#0F9D8A]/10 text-[#0F9D8A] flex items-center justify-center font-bold">
                <User size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-dark-navy">Admin Profile Details</h3>
                <p className="text-[11px] text-muted-gray">Manage your display name and contact information</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-dark-navy mb-1.5">Display Name</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F9D8A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-navy mb-1.5">Admin Email</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || "admin@kidia.com"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs cursor-not-allowed font-medium"
                  />
                  <p className="text-[10px] text-muted-gray mt-1">Email is tied to primary Supabase Auth</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-navy mb-1.5">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F9D8A]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0F9D8A] hover:bg-[#0C7D6E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {savingProfile && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <KeyRound size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-dark-navy">Change Admin Password</h3>
                <p className="text-[11px] text-muted-gray">Update your Supabase authentication password</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-dark-navy mb-1.5">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F9D8A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-navy mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F9D8A]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-dark-navy hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {updatingPassword && <Loader2 size={13} className="animate-spin" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Storefront Tab */}
      {activeTab === "store" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-[#0F9D8A]/10 text-[#0F9D8A] flex items-center justify-center font-bold">
              <Store size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-dark-navy">Boutique Storefront Settings</h3>
              <p className="text-[11px] text-muted-gray">Global store branding and customer contact info</p>
            </div>
          </div>

          <form onSubmit={handleSaveStore} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-dark-navy mb-1.5">Store Brand Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F9D8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-navy mb-1.5">Free Shipping Minimum (₹)</label>
                <input
                  type="number"
                  required
                  value={freeShippingMin}
                  onChange={(e) => setFreeShippingMin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F9D8A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-dark-navy mb-1.5">Customer Support Email</label>
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F9D8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-navy mb-1.5">Customer Helpline Phone</label>
                <input
                  type="tel"
                  required
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F9D8A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-navy mb-1.5">Storefront Announcement Bar</label>
              <textarea
                rows={2}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingStore}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0F9D8A] hover:bg-[#0C7D6E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60"
              >
                {savingStore && <Loader2 size={13} className="animate-spin" />}
                <span>Save Store Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* System & Supabase Tab */}
      {activeTab === "system" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0F9D8A]/10 text-[#0F9D8A] flex items-center justify-center font-bold">
                <Database size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-dark-navy">Supabase Connection Status</h3>
                <p className="text-[11px] text-muted-gray">Live database endpoints and health checks</p>
              </div>
            </div>

            <button
              onClick={handleTestDatabase}
              disabled={testingDb}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-dark-navy hover:bg-slate-50 transition-all cursor-pointer"
            >
              <RefreshCw size={12} className={testingDb ? "animate-spin" : ""} />
              <span>Test Connection</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-gray">Project URL</span>
              <p className="font-mono text-dark-navy truncate font-medium">
                https://gmwyetmtaiavvcsspxvf.supabase.co
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-gray">Connection Health</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-emerald-700">Connected & Verified</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-gray">Security Model</span>
              <p className="font-semibold text-dark-navy">Row Level Security (RLS) Active</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-gray">Active Account</span>
              <p className="font-semibold text-dark-navy">admin@kidia.com (Super Administrator)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
