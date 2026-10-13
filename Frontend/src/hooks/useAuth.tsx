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
  setBypassSession: (user: User, profile?: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  setBypassSession: () => {},
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
        try {
          localStorage.setItem("kidia_bypass_profile", JSON.stringify(data));
        } catch {}
        return;
      }

      // If not found by ID, try looking up by email
      if (email) {
        const cleanEmail = email.trim().toLowerCase();
        const { data: emailData } = await supabase
          .from("profiles")
          .select("*")
          .ilike("email", cleanEmail)
          .maybeSingle();

        if (emailData) {
          setProfile(emailData as UserProfile);
          try {
            localStorage.setItem("kidia_bypass_profile", JSON.stringify(emailData));
          } catch {}
          return;
        }
      }

      // If user is admin by email, fallback profile
      if (email?.toLowerCase() === "admin@kidia.com") {
        const adminProf: UserProfile = {
          id: userId,
          email: "admin@kidia.com",
          display_name: "Kidia Admin",
          role: "admin",
          status: "active",
        };
        setProfile(adminProf);
        try {
          localStorage.setItem("kidia_bypass_profile", JSON.stringify(adminProf));
        } catch {}
      } else {
        const cached = localStorage.getItem("kidia_bypass_profile");
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
            return;
          } catch {}
        }
        if (email) {
          setProfile({
            id: userId,
            email,
            display_name: email.split("@")[0],
            role: "customer",
            status: "active",
          });
        } else {
          setProfile(null);
        }
      }
    } catch {
      const cached = localStorage.getItem("kidia_bypass_profile");
      if (cached) {
        try {
          setProfile(JSON.parse(cached));
          return;
        } catch {}
      }
      if (email?.toLowerCase() === "admin@kidia.com") {
        setProfile({
          id: userId,
          email: "admin@kidia.com",
          display_name: "Kidia Admin",
          role: "admin",
          status: "active",
        });
      } else if (email) {
        setProfile({
          id: userId,
          email,
          display_name: email.split("@")[0],
          role: "customer",
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

  const setBypassSession = (bypassUser: User, customProfile?: UserProfile | null) => {
    try {
      localStorage.setItem("kidia_bypass_session", JSON.stringify(bypassUser));
      if (customProfile) {
        localStorage.setItem("kidia_bypass_profile", JSON.stringify(customProfile));
      }
    } catch {}
    setUser(bypassUser);
    if (customProfile) {
      setProfile(customProfile);
    } else {
      void fetchProfile(bypassUser.id, bypassUser.email);
    }
    setLoading(false);
  };

  const signOut = async () => {
    try {
      localStorage.removeItem("kidia_bypass_session");
      localStorage.removeItem("kidia_bypass_profile");
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    let revision = 0;

    const safetyTimer = setTimeout(() => {
      if (active) setLoading(false);
    }, 1200);

    const validate = async (isInitial = false) => {
      const current = ++revision;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (active && current === revision) {
          const currentUser = error ? null : data.user;
          if (currentUser) {
            setUser(currentUser);
            await fetchProfile(currentUser.id, currentUser.email);
          } else {
            // Check if there is an active local bypass session
            const savedBypass = localStorage.getItem("kidia_bypass_session");
            const savedBypassProfile = localStorage.getItem("kidia_bypass_profile");
            if (savedBypass) {
              try {
                const parsed = JSON.parse(savedBypass);
                setUser(parsed);
                if (savedBypassProfile) {
                  try {
                    setProfile(JSON.parse(savedBypassProfile));
                  } catch {}
                }
                await fetchProfile(parsed.id, parsed.email);
              } catch {
                setUser(null);
                setProfile(null);
              }
            } else {
              setUser(null);
              setProfile(null);
            }
          }
        }
      } catch (err) {
        console.error("Auth validation error", err);
      } finally {
        if (active && (isInitial || current === revision)) {
          setLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // Only clear state if no local bypass session exists
        if (!localStorage.getItem("kidia_bypass_session")) {
          ++revision;
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
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
      clearTimeout(safetyTimer);
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
        setBypassSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);