import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, X, ChevronDown, Ruler } from "lucide-react";
import { Logo } from "./Logo";
import { useCartCount } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { AGE_GROUPS, CATEGORIES, products } from "@/data/catalog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./AccountMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const MESSAGES = [
  "Festive Season Is Here — Discover KIDIA's New Collection",
  "Free Shipping on Eligible Orders",
  "Find Their Perfect Fit with Our Size Guide",
];

const NAV = [
  { to: "/", label: "Home" },
  { to: "/collections/new-arrivals", label: "New Arrivals" },
  { to: "/collections/boys", label: "Boys", mega: "boys" },
  { to: "/collections/girls", label: "Girls", mega: "girls" },
  { to: "/shop", label: "Clothing", mega: "all" },
  { to: "/collections/ethnic-festive", label: "Ethnic & Festive", mega: "festive" },
  { to: "/collections/sale", label: "Sale" },
];

const AnnouncementBar = () => {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(() => sessionStorage.getItem("kidia-bar") !== "off");
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % MESSAGES.length), 4500);
    return () => clearInterval(t);
  }, []);
  if (!open) return null;
  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="container-kidia flex h-9 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p key={i} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.3 }} className="truncate px-8 text-center font-semibold">
            {MESSAGES[i]}
          </motion.p>
        </AnimatePresence>
        <button aria-label="Dismiss announcement" onClick={() => { sessionStorage.setItem("kidia-bar", "off"); setOpen(false); }} className="absolute right-3 rounded-full p-1 hover:bg-foreground/10">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const MegaMenu = ({ kind }: { kind: string }) => {
  const base = kind === "boys" ? "/collections/boys" : kind === "girls" ? "/collections/girls" : "/shop";
  const cats = kind === "festive" ? [] : CATEGORIES.filter((c) => !["boys", "girls", "festive"].includes(c.slug));
  return (
    <div className="grid grid-cols-3 gap-8 p-8">
      {kind === "festive" ? (
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {[{ to: "/collections/diwali", t: "Diwali Edit", s: "Little Lights, Big Looks", tone: "bg-butter" }, { to: "/collections/navratri", t: "Navratri Edit", s: "Twirl Into Festivities", tone: "bg-blush" }].map((x) => (
            <Link key={x.to} to={x.to} className={cn("rounded-2xl p-6 transition hover:shadow-soft", x.tone)}>
              <p className="font-serif text-xl text-foreground">{x.t}</p>
              <p className="text-sm text-muted-foreground">{x.s}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="col-span-2">
          <p className="eyebrow mb-3">Shop by category</p>
          <ul className="grid grid-cols-2 gap-2">
            {cats.map((c) => (
              <li key={c.slug}><Link className="text-sm hover:text-primary" to={`${base}?category=${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <p className="eyebrow mb-3">Shop by age</p>
        <ul className="space-y-2">
          {AGE_GROUPS.map((a) => (
            <li key={a.slug}><Link className="text-sm hover:text-primary" to={`${base}?age=${a.slug}`}>{a.label}</Link></li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const SearchBox = ({ onDone }: { onDone: () => void }) => {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const term = q.trim().toLowerCase();
  const hits = term ? products.filter((p) => `${p.name} ${p.category} ${p.occasions.join(" ")} ${p.gender}`.toLowerCase().includes(term)).slice(0, 5) : [];
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (term) { nav(`/shop?q=${encodeURIComponent(q.trim())}`); onDone(); } }} className="container-kidia py-4">
      <label htmlFor="site-search" className="sr-only">Search products</label>
      <div className="flex items-center gap-3 rounded-full border bg-card px-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input id="site-search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search kurtas, dresses, nightwear…" className="h-11 flex-1 bg-transparent outline-none" />
        <button type="button" onClick={onDone} aria-label="Close search"><X className="h-4 w-4" /></button>
      </div>
      {term && (
        <ul className="mt-2 rounded-2xl border bg-card p-2 shadow-soft">
          {hits.length === 0 && <li className="p-3 text-sm text-muted-foreground">No matches for "{q}". Try "kurta" or "dress".</li>}
          {hits.map((p) => (
            <li key={p.id}>
              <Link to={`/product/${p.slug}`} onClick={onDone} className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted">
                <img src={p.images[0]} alt="" className="h-12 w-10 rounded-lg object-cover" />
                <span className="text-sm">{p.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
};

const Badge = ({ n }: { n: number }) =>
  n > 0 ? (
    <motion.span key={n} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
      {n}
    </motion.span>
  ) : null;

export const Header = () => {
  const { user } = useAuth();
  const cart = useCartCount();
  const wish = useWishlist((s) => s.ids.length);
  const [mega, setMega] = useState<string | null>(null);
  const [search, setSearch] = useState(false);
  const [mobile, setMobile] = useState(false);

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur" onMouseLeave={() => setMega(null)}>
        <div className="container-kidia flex h-16 items-center justify-between gap-4 md:h-20">
          <div className="flex items-center gap-2">
            <button className="min-[900px]:hidden rounded-full p-2 hover:bg-muted" aria-label="Open menu" onClick={() => setMobile(true)}><Menu className="h-5 w-5" /></button>
            <Logo />
          </div>
          <nav className="hidden min-[900px]:flex items-center gap-3 xl:gap-6" aria-label="Main">
            {NAV.map((n) => (
              <div key={n.to} onMouseEnter={() => setMega(n.mega ?? null)} className="relative">
                <NavLink to={n.to} end className={({ isActive }) => cn("flex items-center gap-1 py-6 text-[13px] xl:text-sm font-semibold whitespace-nowrap transition-colors hover:text-primary", isActive ? "text-primary" : "text-foreground/80", n.label === "Sale" && "text-accent")}>
                  {n.label}{n.mega && <ChevronDown className="h-3 w-3" />}
                </NavLink>
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <AccountMenu />
            <button aria-label="Search" onClick={() => setSearch((s) => !s)} className="rounded-full p-2 hover:bg-muted"><Search className="h-5 w-5" /></button>
            <Link to="/wishlist" aria-label={`Wishlist, ${wish} items`} className="relative rounded-full p-2 hover:bg-muted"><Heart className="h-5 w-5" /><Badge n={wish} /></Link>
            <Link to="/cart" aria-label={`Bag, ${cart} items`} className="relative rounded-full p-2 hover:bg-muted"><ShoppingBag className="h-5 w-5" /><Badge n={cart} /></Link>
          </div>
        </div>
        <AnimatePresence>
          {mega && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-x-0 top-full hidden border-b bg-background shadow-soft min-[900px]:block">
              <div className="container-kidia" onClick={() => setMega(null)}><MegaMenu kind={mega} /></div>
            </motion.div>
          )}
          {search && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-0 top-full border-b bg-background shadow-soft">
              <SearchBox onDone={() => setSearch(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <Sheet open={mobile} onOpenChange={setMobile}>
        <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto bg-background">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Logo className="mb-8" />
          <div className="mb-6 flex gap-3">
            <Button asChild variant="outline" onClick={() => setMobile(false)}><Link to={user ? "/account" : "/auth"}>{user ? "My profile" : "Sign in"}</Link></Button>
            {!user && <Button asChild onClick={() => setMobile(false)}><Link to="/auth?mode=signup">Sign up</Link></Button>}
          </div>
          <nav className="space-y-1" aria-label="Mobile">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMobile(false)} className="block rounded-xl px-3 py-3 text-lg font-serif hover:bg-muted">{n.label}</Link>
            ))}
            <Link to="/collections/diwali" onClick={() => setMobile(false)} className="block rounded-xl bg-butter px-3 py-3 font-serif">Diwali Edit</Link>
            <Link to="/collections/navratri" onClick={() => setMobile(false)} className="mt-1 block rounded-xl bg-blush px-3 py-3 font-serif">Navratri Edit</Link>
          </nav>
          <p className="eyebrow mt-8 mb-3">Shop by age</p>
          <div className="grid grid-cols-2 gap-2">
            {AGE_GROUPS.map((a) => (
              <Link key={a.slug} to={`/shop?age=${a.slug}`} onClick={() => setMobile(false)} className={cn("rounded-xl p-3 text-center text-sm font-semibold", a.tone)}>{a.label}</Link>
            ))}
          </div>
          <Link to="/size-guide" onClick={() => setMobile(false)} className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary"><Ruler className="h-4 w-4" />Size Guide</Link>
        </SheetContent>
      </Sheet>
    </>
  );
};
