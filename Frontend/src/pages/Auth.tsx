import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Flower2, Loader2, Phone, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [params, setParams] = useSearchParams();
  const signup = params.get("mode") === "signup";
  const forgot = params.get("mode") === "forgot";
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [privacyAgree, setPrivacyAgree] = useState(false);

  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user && !loading) {
      if (user.email?.toLowerCase() === "admin@kidia.com" || isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/account", { replace: true });
      }
    }
  }, [user, loading, isAdmin, navigate]);

  const switchMode = (mode: string) => {
    setParams(mode ? { mode } : {});
    setError("");
    setMessage("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage("If an account uses this email, you'll receive a password reset link shortly.");
      } else if (signup) {
        // Validation checks
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match. Please re-enter.");
        }
        if (!privacyAgree) {
          throw new Error("Please agree to the Privacy Policy to create your account.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              display_name: name.trim(),
              phone: phone.trim() || undefined,
              privacy_accepted: true,
            },
          },
        });

        if (error) throw error;
        if (data.session) {
          navigate("/account");
        } else {
          setMessage("Account created! Check your email to confirm your account, then sign in to KIDIA.");
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.user?.email?.toLowerCase() === "admin@kidia.com") {
          navigate("/admin");
        } else {
          navigate("/account");
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/account`,
        },
      });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in could not start. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout title={forgot ? "Reset password" : signup ? "Customer Sign up" : "Sign in"}>
      <section className="boutique-stripes px-4 py-12 md:py-20">
        <div className="mx-auto max-w-md rounded-2xl border bg-background p-6 shadow-soft sm:p-9 text-left">
          <Flower2 aria-hidden="true" className="mb-5 h-9 w-9 text-accent" strokeWidth={1} />
          <p className="eyebrow mb-2">Your little KIDIA corner</p>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {forgot
              ? "Forgot your password?"
              : signup
              ? "Join the KIDIA family."
              : "Lovely to see you again."}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {forgot
              ? "We'll send a link to help you start fresh."
              : signup
              ? "Create your customer account for lovely wardrobe moments."
              : "Sign in to access your orders, wishlist, or store management."}
          </p>

          {!forgot && (
            <div className="mt-6 grid grid-cols-2 border-b">
              <Button
                type="button"
                variant="ghost"
                onClick={() => switchMode("")}
                className={
                  !signup
                    ? "border-b-2 border-primary font-bold rounded-none text-primary"
                    : "rounded-none text-muted-foreground font-semibold"
                }
              >
                Sign in
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => switchMode("signup")}
                className={
                  signup
                    ? "border-b-2 border-primary font-bold rounded-none text-primary"
                    : "rounded-none text-muted-foreground font-semibold"
                }
              >
                Sign up
              </Button>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {signup && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="auth-name" className="text-xs font-semibold">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="auth-name"
                    placeholder="e.g. John Doe"
                    autoComplete="name"
                    required
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="auth-phone" className="text-xs font-semibold flex items-center justify-between">
                    <span>Mobile Number</span>
                    <span className="text-[11px] text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="auth-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9"
                    />
                    <Phone className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="text-xs font-semibold">
                Email address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="auth-email"
                type="email"
                placeholder={signup ? "parent@example.com" : "admin@kidia.com or customer@example.com"}
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!forgot && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-password" className="text-xs font-semibold">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="auth-password"
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete={signup ? "new-password" : "current-password"}
                    required
                    minLength={signup ? 8 : 1}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={show ? "Hide password" : "Show password"}
                    onClick={() => setShow(!show)}
                    className="absolute right-0 top-0 text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {signup && (
                  <p className="text-[11px] text-muted-foreground">Use at least 8 characters.</p>
                )}
              </div>
            )}

            {signup && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-confirm-password" className="text-xs font-semibold">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="auth-confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-12"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-0 top-0 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {signup && (
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    id="auth-privacy"
                    required
                    checked={privacyAgree}
                    onChange={(e) => setPrivacyAgree(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    I agree to KIDIA's{" "}
                    <Link
                      to="/privacy"
                      target="_blank"
                      className="text-primary underline font-medium hover:text-primary/80"
                    >
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/terms"
                      target="_blank"
                      className="text-primary underline font-medium hover:text-primary/80"
                    >
                      Terms of Service
                    </Link>
                    .
                  </span>
                </label>
              </div>
            )}

            {signup && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-muted-foreground flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Customer Account:</strong> Sign up is reserved for boutique customers. Admin accounts are managed separately.
                </span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                {message}
              </div>
            )}

            <Button disabled={busy} className="w-full mt-2" type="submit">
              {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {forgot ? "Send reset link" : signup ? "Create Customer Account" : "Sign in"}
            </Button>
          </form>

          {!forgot && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                disabled={busy}
                variant="outline"
                className="w-full"
                onClick={google}
              >
                Continue with Google
              </Button>

              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="link"
                  className="px-0 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => switchMode("forgot")}
                >
                  Forgot password?
                </Button>
                <Link
                  to="/admin"
                  className="text-xs font-medium text-[#0F9D8A] hover:underline"
                >
                  Admin Portal →
                </Link>
              </div>
            </>
          )}

          {forgot && (
            <Button
              variant="link"
              className="mt-4 px-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => switchMode("")}
            >
              ← Back to sign in
            </Button>
          )}

          <Link
            to="/shop"
            className="mt-6 block text-center text-xs text-muted-foreground hover:text-foreground underline"
          >
            Continue browsing collections
          </Link>
        </div>
      </section>
    </Layout>
  );
}