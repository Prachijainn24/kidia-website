import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [recovery, setRecovery] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => { if (event === "PASSWORD_RECOVERY") setRecovery(true); });
    return () => subscription.unsubscribe();
  }, []);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError("");
    if (password !== confirm) { setError("The passwords don’t match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message); else setDone(true);
    setBusy(false);
  };
  return <Layout title="Set new password"><section className="container-kidia py-16"><div className="mx-auto max-w-md"><h1 className="mb-6 font-serif text-3xl">A fresh start.</h1>
    {done ? <><p role="status">Your password has been updated.</p><Button asChild className="mt-6"><Link to="/account">Go to my profile</Link></Button></> : !recovery ? <><p>This reset link is missing or has expired. Please request a new one.</p><Button asChild className="mt-6"><Link to="/auth?mode=forgot">Request reset link</Link></Button></> : <form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} /></div>{error && <p role="alert" className="text-destructive">{error}</p>}<Button type="submit" disabled={busy}>Update password</Button></form>}
  </div></section></Layout>;
}