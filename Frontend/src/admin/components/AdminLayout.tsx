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

  // If still loading or verifying authorization, show clean loader instead of premature rejection
  if (loading && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Verifying Admin Authorization...
        </p>
      </div>
    );
  }

  // Only if auth has finished loading and user is genuinely not an admin
  if (!loading && (!user || !isAdmin)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-soft text-center">
          <div className="w-14 h-14 rounded-2xl bg-butter/60 text-primary flex items-center justify-center mx-auto mb-4 border border-butter">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-serif font-black text-foreground tracking-tight mb-2">
            Admin Authentication Required
          </h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            {user ? (
              <>
                You are currently signed in as <strong>{user.email}</strong> (customer account). Store modifications require boutique admin privileges.
              </>
            ) : (
              <>
                Please sign in with your administrator ID and password on the sign-in page to access the admin portal.
              </>
            )}
          </p>
          <div className="space-y-3">
            <Link
              to="/auth"
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-soft flex items-center justify-center gap-2"
            >
              <span>Sign In with Admin ID & Password</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/"
              className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-all block"
            >
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || "Kidia Admin";
  const displayEmail = user?.email || "admin@kidia.com";

  return (
    <div className="flex w-full min-h-screen bg-background text-foreground font-sans antialiased text-left selection:bg-butter selection:text-foreground">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 relative">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border/80 h-16 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
          {/* Mobile hamburger & brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Sidebar"
              className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/60 lg:hidden cursor-pointer"
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
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted/60 hover:text-primary hover:border-primary/40 transition-all shadow-2xs"
            >
              <span>View Live Store</span>
              <ExternalLink size={12} />
            </Link>

            {/* Notification bell */}
            <NotificationBell />

            {/* Admin identity chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-border/80">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-extrabold text-xs flex items-center justify-center shadow-xs">
                {(displayName || "A").charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-foreground block leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] font-semibold text-primary leading-tight flex items-center gap-0.5">
                  <ShieldCheck size={10} /> {displayEmail}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out of Admin Portal"
                className="p-1.5 ml-1 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
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
