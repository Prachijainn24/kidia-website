import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserRound, LogOut, Heart, ShoppingBag } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferences, setPreferences] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setBusy(true);
    void supabase.from("profiles").select("display_name, phone, preferences").eq("id", user.id).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) setError("Could not load your profile. Please refresh and try again.");
      if (data) { setName(data.display_name); setPhone(data.phone); setPreferences(data.preferences); }
      setBusy(false);
    });
    return () => { active = false; };
  }, [user]);
  if (!loading && !user) return <Navigate to="/auth" replace />;
  const save = async (e: FormEvent) => {
    e.preventDefault(); if (!user) return;
    setBusy(true); setSaved(false); setError("");
    const { data, error } = await supabase.from("profiles").upsert({ id: user.id, display_name: name.trim(), phone: phone.trim(), preferences: preferences.trim() }).select("display_name, phone, preferences").single();
    if (error) setError("Your profile could not be saved. Please try again.");
    else { setName(data.display_name); setPhone(data.phone); setPreferences(data.preferences); setSaved(true); }
    setBusy(false);
  };
  const logout = async () => {
    setBusy(true);
    try {
      await signOut();
      navigate("/");
    } catch {
      setError("Could not sign out. Please try again.");
      setBusy(false);
    }
  };
  return <Layout title="My profile"><section className="container-kidia py-12 md:py-20">
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between gap-4"><div><p className="eyebrow mb-3">Your KIDIA account</p><h1 className="font-serif text-4xl">My profile</h1></div><UserRound className="h-12 w-12 text-primary" strokeWidth={1} /></div>
      {loading ? <p role="status">Loading your account…</p> : <>
        <p className="mb-8 text-sm text-muted-foreground">{user?.email}</p>
        <form onSubmit={save} className="space-y-6">
          <div className="space-y-2"><Label htmlFor="profile-name">Your name</Label><Input id="profile-name" autoComplete="name" maxLength={80} required value={name} onChange={e => { setName(e.target.value); setSaved(false); }} /></div>
          <div className="space-y-2"><Label htmlFor="profile-phone">Phone number (optional)</Label><Input id="profile-phone" type="tel" autoComplete="tel" maxLength={20} value={phone} onChange={e => { setPhone(e.target.value); setSaved(false); }} /></div>
          <div className="space-y-2"><Label htmlFor="profile-preferences">Favourite styles and sizes (optional)</Label><Textarea id="profile-preferences" maxLength={500} placeholder="Favourite colours, everyday outfits, festive styles…" value={preferences} onChange={e => { setPreferences(e.target.value); setSaved(false); }} /></div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {saved && <p role="status" className="text-sm text-primary">Your profile has been saved.</p>}
          <div className="flex flex-wrap gap-3"><Button type="submit" disabled={busy}>Save profile</Button><Button type="button" variant="outline" disabled={busy} onClick={logout}><LogOut className="h-4 w-4" />Sign out</Button></div>
        </form>
        <div className="mt-10 flex flex-wrap gap-6 border-t pt-6"><Button asChild variant="link" className="px-0"><Link to="/wishlist"><Heart className="h-4 w-4" />My wishlist</Link></Button><Button asChild variant="link" className="px-0"><Link to="/cart"><ShoppingBag className="h-4 w-4" />My bag</Link></Button></div>
      </>}
    </div>
  </section></Layout>;
}