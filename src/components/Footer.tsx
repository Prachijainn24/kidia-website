import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Mail, Phone } from "lucide-react";
import { CONTACT, instagramUrl, whatsappUrl } from "@/data/contact";
import { AGE_GROUPS } from "@/data/catalog";
import logoLight from "@/assets/logo-blossom-light.png";
import { Float, Flower, Sparkle, Sunburst } from "./Motifs";

const cols = [
  { title: "Shop", links: [["New Arrivals", "/collections/new-arrivals"], ["Boys", "/collections/boys"], ["Girls", "/collections/girls"], ["Ethnic & Festive", "/collections/ethnic-festive"], ["Sale", "/collections/sale"]] },
  { title: "Help", links: [["Size Guide", "/size-guide"], ["My Wishlist", "/wishlist"], ["My Bag", "/cart"], ["Shop All", "/shop"]] },
];

const policies: [string, string][] = [["Refund & Returns Policy", "/refund-returns"], ["Privacy Policy", "/privacy"], ["Terms & Conditions", "/terms"]];

const bumps = (n: number) => Array.from({ length: n });

/** Cream "postage stamp" panel: same-colour bumps on all four edges read as one deliberate scalloped seam */
const StampPanel = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex self-start p-3">
    <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 flex justify-between">
      {bumps(11).map((_, i) => <span key={`t${i}`} className="h-6 w-6 rounded-full bg-background" />)}
    </div>
    <div aria-hidden className="pointer-events-none absolute inset-x-8 bottom-0 flex justify-between">
      {bumps(11).map((_, i) => <span key={`b${i}`} className="h-6 w-6 rounded-full bg-background" />)}
    </div>
    <div aria-hidden className="pointer-events-none absolute inset-y-8 left-0 flex w-6 flex-col justify-between">
      {bumps(8).map((_, i) => <span key={`l${i}`} className="h-6 w-6 rounded-full bg-background" />)}
    </div>
    <div aria-hidden className="pointer-events-none absolute inset-y-8 right-0 flex w-6 flex-col justify-between">
      {bumps(8).map((_, i) => <span key={`r${i}`} className="h-6 w-6 rounded-full bg-background" />)}
    </div>
    <div className="relative flex-1 rounded-[1.5rem] bg-background px-9 py-9 md:px-11 md:py-10">
      <span aria-hidden className="pointer-events-none absolute inset-5 rounded-[1.15rem] border border-dashed border-primary/15" />
      <div aria-hidden className="mb-5 flex items-center gap-3">
        <Flower className="h-3.5 w-3.5 text-coral" />
        <span className="h-px flex-1 bg-primary/10" />
        <Sparkle className="h-3.5 w-3.5 text-marigold" />
        <span className="h-px flex-1 bg-primary/10" />
        <Sunburst className="h-3.5 w-3.5 text-sky" />
      </div>
      {children}
    </div>
  </div>
);

export const Footer = () => (
  <footer className="overflow-hidden rounded-t-[50%_48px] bg-primary md:rounded-t-[50%_80px]">
    <div className="relative px-5 pb-4 pt-16 md:px-8 md:pt-24">
      <div className="container-kidia">
        <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-marigold/15 blur-2xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-28 right-1/3 h-72 w-72 rounded-full bg-coral/10 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[0.9fr_1.6fr] lg:gap-12">
          {/* ---------- brand side, on the green ---------- */}
          <div className="flex flex-col">
            <img src={logoLight} alt="KIDIA" width={1038} height={295} loading="lazy" className="h-16 w-auto md:h-20" />
            <p className="mt-5 font-display text-2xl font-extrabold leading-tight text-butter md:text-3xl">
              Little Styles.<br />Big Smiles.
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-primary-foreground/80">
              Fashionable, comfortable clothing for kids aged 1–12, designed in India for everyday play and every celebration.
            </p>

            <div className="mt-6 flex gap-2.5">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="KIDIA on Instagram" className="grid h-10 w-10 place-items-center rounded-full bg-coral text-primary-foreground transition hover:brightness-110">
                <Instagram className="h-[18px] w-[18px]" />
              </a>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="Message KIDIA on WhatsApp" className="grid h-10 w-10 place-items-center rounded-full bg-coral text-primary-foreground transition hover:brightness-110">
                <MessageCircle className="h-[18px] w-[18px]" />
              </a>
              <a href={`mailto:${CONTACT.email}`} aria-label="Email KIDIA" className="grid h-10 w-10 place-items-center rounded-full bg-coral text-primary-foreground transition hover:brightness-110">
                <Mail className="h-[18px] w-[18px]" />
              </a>
            </div>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-3 text-sm font-bold text-butter hover:underline">@{CONTACT.instagramHandle}</a>

            <ul className="mt-6 space-y-2 text-sm text-primary-foreground/80">
              <li><a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-butter"><Mail className="h-4 w-4" />{CONTACT.email}</a></li>
              <li><a href={`tel:+${CONTACT.whatsappNumber}`} className="flex items-center gap-2 hover:text-butter"><Phone className="h-4 w-4" />{CONTACT.phoneDisplay}</a></li>
              <li><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-butter"><MessageCircle className="h-4 w-4" />Chat on WhatsApp</a></li>
              <li className="pt-1 text-primary-foreground/60">{CONTACT.hours}</li>
            </ul>
          </div>

          {/* ---------- cream stamp panel with the links ---------- */}
          <StampPanel>
            <div className="relative grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-4">
              {cols.map((c) => (
                <div key={c.title}>
                  <h3 className="font-sans text-[11px] font-extrabold uppercase tracking-[0.16em] text-plum">{c.title}</h3>
                  <span aria-hidden className="mt-1.5 block h-[2px] w-6 rounded-full bg-coral/40" />
                  <ul className="mt-3.5 space-y-2">
                    {c.links.map(([l, to]) => <li key={to}><Link to={to} className="inline-block text-[13px] text-muted-foreground transition hover:translate-x-0.5 hover:text-primary">{l}</Link></li>)}
                  </ul>
                </div>
              ))}
              <div>
                <h3 className="font-sans text-[11px] font-extrabold uppercase tracking-[0.16em] text-plum">Policies</h3>
                <span aria-hidden className="mt-1.5 block h-[2px] w-6 rounded-full bg-coral/40" />
                <ul className="mt-3.5 space-y-2">
                  {policies.map(([l, to]) => (
                    <li key={to}><Link to={to} target="_blank" rel="noopener noreferrer" className="inline-block text-[13px] text-muted-foreground transition hover:translate-x-0.5 hover:text-primary">{l}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-sans text-[11px] font-extrabold uppercase tracking-[0.16em] text-plum">Shop by age</h3>
                <span aria-hidden className="mt-1.5 block h-[2px] w-6 rounded-full bg-coral/40" />
                <ul className="mt-3.5 space-y-2">
                  {AGE_GROUPS.map((a) => <li key={a.slug}><Link to={`/shop?age=${a.slug}`} className="inline-block text-[13px] text-muted-foreground transition hover:translate-x-0.5 hover:text-primary">{a.label}</Link></li>)}
                </ul>
              </div>
            </div>
            <p className="mt-6 border-t border-primary/10 pt-4 font-hand text-xl text-coral">Made by two mothers, for little humans.</p>
          </StampPanel>
        </div>

        {/* ---------- giant sticker wordmark ---------- */}
        <div className="relative mt-4 px-1">
          <svg viewBox="0 0 700 160" className="mx-auto block h-auto w-full max-w-5xl" role="img" aria-label="KIDIA">
            <text
              x="350" y="135" textAnchor="middle"
              className="font-serif"
              style={{ fontSize: 150, fontWeight: 600, letterSpacing: "0.02em", fontVariationSettings: '"opsz" 144', paintOrder: "stroke", stroke: "hsl(var(--background))", strokeWidth: 22, strokeLinejoin: "round", fill: "hsl(var(--butter))" }}
            >KIDIA</text>
          </svg>
          <Float className="hidden left-[4%] top-0 h-8 w-8 text-blush/80 sm:block" delay={0.4}><Flower /></Float>
          <Float className="hidden right-[6%] top-1 h-7 w-7 text-marigold/90 sm:block" delay={1.2}><Sparkle /></Float>
          <Float className="hidden left-[20%] bottom-0 h-9 w-9 text-sky/70 sm:block" delay={0.8} spin><Sunburst /></Float>
        </div>

        <div className="mt-2 border-t border-primary-foreground/10 py-3 text-center text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} KIDIA. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
);
