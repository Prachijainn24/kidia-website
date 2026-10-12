import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    let revision = 0;
    const validate = async () => {
      const current = ++revision;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (active && current === revision) setUser(error ? null : data.user);
      } finally {
        if (active && current === revision) setLoading(false);
      }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { ++revision; setUser(null); setLoading(false); }
      else { setLoading(true); window.setTimeout(() => { if (active) void validate(); }, 0); }
    });
    void validate();
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);