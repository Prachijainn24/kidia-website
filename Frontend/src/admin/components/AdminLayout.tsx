import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { Menu, ExternalLink, ShieldCheck, LogOut, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import NotificationBell from "./NotificationBell";
import logoBlossom from "@/assets/logo-blossom.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickLoggingIn, setQuickLoggingIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading, signOut, refreshProfile } = useAuth();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleQuickAdminLogin = async () => {
    setQuickLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@kidia.com",
        password: "Admin123",
      });
      if (error) throw error;
      if (data.session) {
        await refreshProfile();
      }
    } catch (err: any) {
      alert("Admin sign-in failed: " + (err?.message || "Check Supabase connection"));
    } finally {
      setQuickLoggingIn(false);
    }
  };

  // If still loading initial auth state and no user is loaded yet
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 text-[#0F9D8A] animate-spin mb-3" />
        <p className="text-xs font-bold text-muted-gray uppercase tracking-wider">
          Verifying Admin Authorization...
        </p>
      </div>
    );
  }

  // If NOT logged in or logged in as a non-admin customer account
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-soft text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <Lock size={22} />
          </div>
          <h2 className="text-xl font-black text-dark-navy tracking-tight mb-2">
            Admin Authentication Required
          </h2>
          <p className="text-xs text-muted-gray mb-6 leading-relaxed">
            {user ? (
              <>
                You are currently signed in as <strong>{user.email}</strong> (customer account). Store modifications require admin credentials.
              </>
            ) : (
              <>
                You need to be signed in as <strong>admin@kidia.com</strong> to manage products, categories, orders, and view live database metrics.
              </>
            )}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleQuickAdminLogin}
              disabled={quickLoggingIn}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0F9D8A] hover:bg-[#0c8272] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {quickLoggingIn ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Sparkles size={15} />
              )}
              <span>Sign In as Kidia Admin (One Click)</span>
            </button>
            <Link
              to="/auth"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-dark-navy text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <span>Go to Sign In Page</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/"
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-dark-navy transition-all block"
            >
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || "Kidia Admin";
  const displayEmail = user?.email || "admin@kidia.com";

  return (
    <div className="flex w-full min-h-screen bg-slate-50/60 text-dark-navy font-sans antialiased text-left">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 relative">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
          {/* Mobile hamburger & brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Sidebar"
              className="p-2 text-muted-gray hover:text-dark-navy rounded-xl hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <img src={logoBlossom} alt="KIDIA" className="h-7 w-auto object-contain" />
              <span className="font-display font-extrabold text-base text-primary">KIDIA</span>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* View store link */}
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <span>View Live Store</span>
              <ExternalLink size={12} />
            </Link>

            {/* Notification bell */}
            <NotificationBell />

            {/* Admin identity chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0F9D8A]/10 text-[#0F9D8A] font-extrabold text-xs flex items-center justify-center border border-[#0F9D8A]/20">
                A
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-dark-navy block leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 leading-tight flex items-center gap-0.5">
                  <ShieldCheck size={10} /> {displayEmail}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out of Admin Portal"
                className="p-1.5 ml-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
