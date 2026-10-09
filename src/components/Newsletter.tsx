import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.string().trim().email().max(255);

// Development persistence: stored on this device until Lovable Cloud is connected (phase 2).
export const Newsletter = ({ compact = false }: { compact?: boolean }) => {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const id = compact ? "nl-footer" : "nl-home";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(email);
    if (!r.success) return setError("Please enter a valid email address.");
    if (!consent) return setError("Please tick the box to agree to receive emails.");
    const list: string[] = JSON.parse(localStorage.getItem("kidia-newsletter") || "[]");
    if (!list.includes(r.data)) localStorage.setItem("kidia-newsletter", JSON.stringify([...list, r.data]));
    setError(""); setEmail(""); setConsent(false);
    toast.success("You're on the list!", { description: "Little updates are on their way." });
  };

  return (
    <form onSubmit={submit} noValidate className="w-full space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={id} className="sr-only">Email address</label>
        <input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="h-12 flex-1 rounded-full border bg-card px-5 text-foreground outline-none focus:ring-2 focus:ring-ring" />
        <Button type="submit" className="h-12 rounded-full px-8">Subscribe</Button>
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
        I agree to receive emails from KIDIA about new collections and offers. Unsubscribe any time.
      </label>
      {error && <p className="text-xs font-semibold text-destructive" role="alert">{error}</p>}
    </form>
  );
};
