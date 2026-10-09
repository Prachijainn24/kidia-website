import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Flower2, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export default function Auth() {
  const [params, setParams] = useSearchParams();
  const signup = params.get("mode") === "signup";
  const forgot = params.get("mode") === "forgot";
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => { if (user && !loading) navigate("/account", { replace: true }); }, [user, loading, navigate]);
  const switchMode = (mode: string) => { setParams(mode ? { mode } : {}); setError(""); setMessage(""); };
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMessage("If an account uses this email, you’ll receive a password reset link shortly.");
      } else if (signup) {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin, data: { display_name: name.trim() } } });
        if (error) throw error;
        if (data.session) navigate("/account");
        else setMessage("Check your email to confirm your account, then sign in to KIDIA.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate("/account");
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  };
  const google = async () => {
    setBusy(true); setError("");
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) { setError(result.error.message); return; }
      if (!result.redirected) navigate("/account");
    } catch { setError("Google sign-in could not start. Please try again."); }
    finally { setBusy(false); }
  };
  return <Layout title={forgot ? "Reset password" : signup ? "Sign up" : "Sign in"}>
    <section className="boutique-stripes px-4 py-12 md:py-20">
      <div className="mx-auto max-w-md rounded-lg border bg-background p-6 shadow-soft sm:p-9">
        <Flower2 aria-hidden="true" className="mb-5 h-9 w-9 text-accent" strokeWidth={1} />
        <p className="eyebrow mb-3">Your little KIDIA corner</p>
        <h1 className="font-serif text-3xl">{forgot ? "Forgot your password?" : signup ? "Join the KIDIA family." : "Lovely to see you again."}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{forgot ? "We’ll send a link to help you start fresh." : signup ? "Create your account for all their little wardrobe moments." : "Sign in to your account."}</p>
        {!forgot && <div className="mt-6 grid grid-cols-2 border-b"><Button variant="ghost" onClick={() => switchMode("")} className={!signup ? "border-b-2 border-primary rounded-none" : "rounded-none"}>Sign in</Button><Button variant="ghost" onClick={() => switchMode("signup")} className={signup ? "border-b-2 border-primary rounded-none" : "rounded-none"}>Sign up</Button></div>}
        <form onSubmit={submit} className="mt-6 space-y-5">
          {signup && <div className="space-y-2"><Label htmlFor="auth-name">Your name</Label><Input id="auth-name" autoComplete="name" required maxLength={80} value={name} onChange={e => setName(e.target.value)} /></div>}
          <div className="space-y-2"><Label htmlFor="auth-email">Email address</Label><Input id="auth-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
          {!forgot && <div className="space-y-2"><Label htmlFor="auth-password">Password</Label><div className="relative"><Input id="auth-password" type={show ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} required minLength={signup ? 8 : 1} value={password} onChange={e => setPassword(e.target.value)} className="pr-12" /><Button type="button" size="icon" variant="ghost" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} className="absolute right-0 top-0">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div>{signup && <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>}</div>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {message && <p role="status" className="text-sm text-primary">{message}</p>}
          <Button disabled={busy} className="w-full" type="submit">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{forgot ? "Send reset link" : signup ? "Create account" : "Sign in"}</Button>
        </form>
        {!forgot && <><Button disabled={busy} variant="outline" className="mt-4 w-full" onClick={google}>Continue with Google</Button><Button variant="link" className="mt-3 px-0" onClick={() => switchMode("forgot")}>Forgot password?</Button></>}
        {forgot && <Button variant="link" className="mt-4 px-0" onClick={() => switchMode("")}>Back to sign in</Button>}
        <Link to="/shop" className="mt-6 block text-center text-xs text-muted-foreground underline">Continue browsing</Link>
      </div>
    </section>
  </Layout>;
}