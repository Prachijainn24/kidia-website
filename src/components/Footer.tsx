import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Mail, Phone } from "lucide-react";
import { CONTACT, instagramUrl, whatsappUrl } from "@/data/contact";
import logoMark from "@/assets/logo-mark.png";
import { Float, Flower, Sparkle, Sunburst } from "./Motifs";

const cols = [
  { title: "Shop", links: [["New Arrivals", "/collections/new-arrivals"], ["Boys", "/collections/boys"], ["Girls", "/collections/girls"], ["Ethnic & Festive", "/collections/ethnic-festive"], ["Sale", "/collections/sale"]] },
  { title: "Help", links: [["Size Guide", "/size-guide"], ["My Wishlist", "/wishlist"], ["My Bag", "/cart"], ["Shop All", "/shop"]] },
];

const policies: [string, string][] = [["Refund & Returns Policy", "/refund-returns"], ["Privacy Policy", "/privacy"], ["Terms & Conditions", "/terms"]];

const bumps = (n: number) => Array.from({ length: n });

export const Footer = () => (
  <footer className="bg-background pb-4 pt-2">
    <div className="container-kidia">
      <div className="relative overflow-hidden rounded-[2.25rem] bg-primary px-5 pb-3 pt-8 md:rounded-[2.75rem] md:px-8 md:pt-10">
        {/* soft glows so the green never reads flat */}
        <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-marigold/15 blur-2xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-28 right-1/3 h-72 w-72 rounded-full bg-coral/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.6fr] lg:gap-10">
          {/* ---- brand side, directly on the green ---- */}
          <div className="flex flex-col">
            <img src={logoMark} alt="" width={1024} height={1024} loading="lazy" className="h-14 w-auto md:h-16" />
            <p className="mt-5 font-display text-2xl font-extrabold leading-tight text-butter md:text-3xl">
              Little Styles.<br />Big Smiles.
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-primary-foreground/80">
              Fashionable, comfortable clothing for kids aged 1–12, designed in India for everyday play and every celebration.
            </p>
            <p className="mt-4 font-hand text-2xl text-blush">Started by two mothers.</p>

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

          {/* ---- cream scalloped panel holding the links ---- */}
          <div className="relative">
            <div className="relative rounded-[1.75rem] bg-background px-6 py-7 md:px-8 md:py-8">
              {/* bumps along the left edge read as a scalloped seam */}
              <div aria-hidden className="pointer-events-none absolute inset-y-7 -left-3 hidden w-6 flex-col justify-between lg:flex">
                {bumps(9).map((_, i) => <span key={i} className="h-6 w-6 rounded-full bg-background" />)}
              </div>
              {/* bumps along the bottom edge */}
              <div aria-hidden className="pointer-events-none absolute inset-x-7 -bottom-3 flex justify-between">
                {bumps(12).map((_, i) => <span key={i} className="h-6 w-6 rounded-full bg-background" />)}
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
                {cols.map((c) => (
                  <div key={c.title}>
                    <h3 className="font-sans text-[13px] font-extrabold uppercase tracking-[0.14em] text-plum">{c.title}</h3>
                    <ul className="mt-4 space-y-2.5">
                      {c.links.map(([l, to]) => <li key={to}><Link to={to} className="text-sm text-muted-foreground transition hover:text-primary">{l}</Link></li>)}
                    </ul>
                  </div>
                ))}
                <div>
                  <h3 className="font-sans text-[13px] font-extrabold uppercase tracking-[0.14em] text-plum">Policies</h3>
                  <ul className="mt-4 space-y-2.5">
                    {policies.map(([l, to]) => (
                      <li key={to}><Link to={to} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition hover:text-primary">{l}</Link></li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-7 border-t border-primary/10 pt-5 font-hand text-2xl text-coral">Little Styles. Big Smiles.</p>
            </div>
          </div>
        </div>

        {/* ---- giant sticker wordmark ---- */}
        <div className="relative mt-6 flex justify-center overflow-hidden px-2">
          <span aria-hidden className="absolute inset-0 kidia-wordmark-outline select-none">KIDIA</span>
          <span className="relative kidia-wordmark text-butter">KIDIA</span>
          <Float className="left-[6%] top-1 h-8 w-8 text-blush/80" delay={0.4}><Flower /></Float>
          <Float className="right-[8%] top-2 h-7 w-7 text-marigold/80" delay={1.2}><Sparkle /></Float>
          <Float className="left-[24%] bottom-1 h-9 w-9 text-sky/70" delay={0.8} spin><Sunburst /></Float>
        </div>

        <div className="mt-3 border-t border-primary-foreground/10 py-3 text-center text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} KIDIA. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
);
