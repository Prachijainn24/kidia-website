import { Link, useNavigate } from "react-router-dom";
import { UserRound, LogIn, LogOut, UserPlus, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Could not sign out. Please try again.");
    } else {
      toast.success("You’re signed out.");
      navigate("/");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={loading}
          aria-label="Account"
          className="h-9 w-9 rounded-full"
        >
          <UserRound className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 text-left">
        <DropdownMenuLabel>{user ? "My KIDIA" : "Welcome to KIDIA"}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Link to Admin Portal */}
        <DropdownMenuItem asChild>
          <Link to="/admin" className="text-[#0F9D8A] font-bold">
            <LayoutDashboard className="mr-2 h-4 w-4 text-[#0F9D8A]" />
            Admin Portal
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {user ? (
          <>
            <DropdownMenuItem asChild>
              <Link to="/account">
                <UserRound className="mr-2 h-4 w-4" />
                My profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/auth?mode=signup">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign up
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}