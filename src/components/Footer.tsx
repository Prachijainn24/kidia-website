import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Mail, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { Newsletter } from "./Newsletter";

const cols = [
  { title: "Shop", links: [["New Arrivals", "/collections/new-arrivals"], ["Boys", "/collections/boys"], ["Girls", "/collections/girls"], ["Ethnic & Festive", "/collections/ethnic-festive"], ["Sale", "/collections/sale"]] },
  { title: "Help", links: [["Size Guide", "/size-guide"], ["My Wishlist", "/wishlist"], ["My Bag", "/cart"], ["Shop All", "/shop"]] },
];

export const Footer = () => (
  <footer className="mt-24 bg-secondary">
    <div className="container-kidia grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-4">
        <Logo />
        <p className="font-serif text-lg italic text-primary">Little Styles. Big Smiles.</p>
        <p className="max-w-sm text-sm text-muted-foreground">Fashionable, comfortable clothing for kids aged 1–12, designed in India for everyday play and every celebration.</p>
        <Newsletter compact />
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
        <h3 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider">Customer care</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2"><Mail className="h-4 w-4" />hello@kidia.in*</li>
          <li className="flex items-center gap-2"><Phone className="h-4 w-4" />+91 00000 00000*</li>
          <li>Mon–Sat, 10am–7pm IST</li>
          <li className="text-xs">*Placeholder details — to be replaced.</li>
        </ul>
        <div className="mt-4 flex gap-2">
          {[Instagram, Facebook, Youtube].map((I, i) => (
            <a key={i} href="#" aria-label="Social link (to be added)" onClick={(e) => e.preventDefault()} className="rounded-full bg-background p-2 hover:text-primary"><I className="h-4 w-4" /></a>
          ))}
        </div>
      </div>
    </div>
    <div className="border-t">
      <div className="container-kidia py-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} KIDIA. All rights reserved.</div>
    </div>
  </footer>
);
