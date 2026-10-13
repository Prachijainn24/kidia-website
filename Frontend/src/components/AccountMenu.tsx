import { Link, useNavigate } from "react-router-dom";
import { UserRound, LogIn, LogOut, UserPlus, LayoutDashboard, ShoppingBag, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function AccountMenu() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await signOut();
      toast.success("You’re signed out.");
      navigate("/");
    } catch {
      toast.error("Could not sign out. Please try again.");
    }
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "My Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account"
          className="relative rounded-full p-2 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95"
        >
          <UserRound className="h-5 w-5" />
          {user && (
            <span className="absolute bottom-1 right-1 block h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border border-border/80 bg-card shadow-soft text-left z-50">
        <DropdownMenuLabel className="px-2.5 py-2 font-sans">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {(displayName || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                <p className="text-[11px] font-medium text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-foreground">Welcome to KIDIA</p>
              <p className="text-[11px] font-medium text-muted-foreground">Little Styles. Big Smiles.</p>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/60 my-1" />

        {/* Link to Admin Portal - Only shown if user is authenticated admin */}
        {isAdmin && (
          <>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-primary/10 focus:bg-primary/10 focus:text-primary text-primary font-bold transition-colors">
              <Link to="/admin" className="text-primary font-bold flex items-center py-2 px-2.5 w-full">
                <LayoutDashboard className="mr-2 h-4 w-4 text-primary shrink-0" />
                <span className="text-primary">Admin Portal</span>
                <span className="ml-auto text-[9px] font-extrabold uppercase bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <ShieldCheck size={9} /> Admin
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/60 my-1" />
          </>
        )}

        {user ? (
          <>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-primary/10 focus:bg-primary/10 focus:text-primary text-foreground hover:text-primary transition-colors group">
              <Link to="/account" className="flex items-center text-foreground group-hover:text-primary group-focus:text-primary font-semibold py-2 px-2.5 w-full">
                <UserRound className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary group-focus:text-primary transition-colors shrink-0" />
                <span>My Profile & Orders</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-primary/10 focus:bg-primary/10 focus:text-primary text-foreground hover:text-primary transition-colors group">
              <Link to="/cart" className="flex items-center text-foreground group-hover:text-primary group-focus:text-primary font-semibold py-2 px-2.5 w-full">
                <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary group-focus:text-primary transition-colors shrink-0" />
                <span>Shopping Bag</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/60 my-1" />
            <DropdownMenuItem
              onSelect={() => void logout()}
              className="rounded-xl cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 font-semibold py-2 px-2.5 transition-colors w-full"
            >
              <LogOut className="mr-2 h-4 w-4 shrink-0" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 focus:text-primary-foreground font-bold mb-1 transition-colors">
              <Link to="/auth" className="flex items-center py-2 px-2.5 w-full text-primary-foreground">
                <LogIn className="mr-2 h-4 w-4 shrink-0" />
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-primary/10 focus:bg-primary/10 focus:text-primary font-semibold text-foreground hover:text-primary transition-colors group">
              <Link to="/auth?mode=signup" className="flex items-center py-2 px-2.5 w-full text-foreground group-hover:text-primary group-focus:text-primary">
                <UserPlus className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary group-focus:text-primary transition-colors shrink-0" />
                <span>Create Account</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}