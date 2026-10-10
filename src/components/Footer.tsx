import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Mail, Phone } from "lucide-react";
import { CONTACT, instagramUrl, whatsappUrl } from "@/data/contact";
import { Logo } from "./Logo";

const cols = [
  { title: "Shop", links: [["New Arrivals", "/collections/new-arrivals"], ["Boys", "/collections/boys"], ["Girls", "/collections/girls"], ["Ethnic & Festive", "/collections/ethnic-festive"], ["Sale", "/collections/sale"]] },
  { title: "Help", links: [["Size Guide", "/size-guide"], ["My Wishlist", "/wishlist"], ["My Bag", "/cart"], ["Shop All", "/shop"]] },
];

const policies = [["Refund & Returns Policy", "/refund-returns"], ["Privacy Policy", "/privacy"], ["Terms & Conditions", "/terms"]];

export const Footer = () => (
  <footer className="bg-secondary">
    <div className="container-kidia grid gap-8 py-10 md:grid-cols-2 md:py-12 lg:grid-cols-6">
      <div className="lg:col-span-2 space-y-4">
        <Logo />
        <p className="font-serif text-lg italic text-primary">Little Styles. Big Smiles.</p>
        <p className="max-w-sm text-sm text-muted-foreground">Fashionable, comfortable clothing for kids aged 1–12, designed in India for everyday play and every celebration.</p>
      </div>
      {cols.map((c) => (
        <div key={c.title}>
          <h3 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider">{c.title}</h3>
          <ul className="space-y-2">
            {c.links.map(([l, to]) => <li key={to}><Link to={to} className="text-sm text-muted-foreground hover:text-primary">{l}</Link></li>)}
          </ul>
        </div>
      ))}
      <div>
        <h3 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider">Policies</h3>
        <ul className="space-y-2">
          {policies.map(([l, to]) => (
            <li key={to}><Link to={to} target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-primary">{l}</Link></li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider">Customer care</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li><a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-primary"><Mail className="h-4 w-4" />{CONTACT.email}</a></li>
          <li><a href={`tel:+${CONTACT.whatsappNumber}`} className="flex items-center gap-2 hover:text-primary"><Phone className="h-4 w-4" />{CONTACT.phoneDisplay}</a></li>
          <li><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary"><MessageCircle className="h-4 w-4" />Chat on WhatsApp</a></li>
          <li><a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary"><Instagram className="h-4 w-4" />@{CONTACT.instagramHandle}</a></li>
          <li>{CONTACT.hours}</li>
        </ul>
        <div className="mt-4 flex gap-2">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="KIDIA on Instagram" className="rounded-full bg-background p-2 hover:text-primary"><Instagram className="h-4 w-4" /></a>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="Message KIDIA on WhatsApp" className="rounded-full bg-background p-2 hover:text-primary"><MessageCircle className="h-4 w-4" /></a>
          <a href={`mailto:${CONTACT.email}`} aria-label="Email KIDIA" className="rounded-full bg-background p-2 hover:text-primary"><Mail className="h-4 w-4" /></a>
        </div>
      </div>
    </div>
    <div className="border-t">
      <div className="container-kidia py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} KIDIA. All rights reserved.</div>
    </div>
  </footer>
);
