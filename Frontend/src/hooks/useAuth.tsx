import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  display_name?: string;
  role: "admin" | "customer";
  status: "active" | "suspended";
  privacy_accepted?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as UserProfile);
        return;
      }

      // If user is admin by email, fallback profile
      if (email?.toLowerCase() === "admin@kidia.com") {
        setProfile({
          id: userId,
          email: "admin@kidia.com",
          display_name: "Kidia Admin",
          role: "admin",
          status: "active",
        });
      } else {
        setProfile(null);
      }
    } catch {
      if (email?.toLowerCase() === "admin@kidia.com") {
        setProfile({
          id: userId,
          email: "admin@kidia.com",
          display_name: "Kidia Admin",
          role: "admin",
          status: "active",
        });
      } else {
        setProfile(null);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    let active = true;
    let revision = 0;

    const validate = async (isInitial = false) => {
      const current = ++revision;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (active && current === revision) {
          const currentUser = error ? null : data.user;
          setUser(currentUser);
          if (currentUser) {
            await fetchProfile(currentUser.id, currentUser.email);
          } else {
            setProfile(null);
          }
        }
      } finally {
        if (active && current === revision && isInitial) {
          setLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        ++revision;
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else {
        // Do NOT reset loading to true on tab change / token refresh
        window.setTimeout(() => {
          if (active) void validate(false);
        }, 0);
      }
    });

    void validate(true);

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin =
    user?.email?.toLowerCase() === "admin@kidia.com" ||
    profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);