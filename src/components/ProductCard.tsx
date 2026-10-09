import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Product, discountPct, formatINR, inStock } from "@/data/catalog";
import { useWishlist } from "@/hooks/useWishlist";
import { QuickAdd } from "./QuickAdd";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const WishButton = ({ p, className }: { p: Product; className?: string }) => {
  const saved = useWishlist((s) => s.ids.includes(p.id));
  const toggle = useWishlist((s) => s.toggle);
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      aria-label={saved ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
      aria-pressed={saved}
      onClick={(e) => { e.preventDefault(); const now = toggle(p.id); toast(now ? "Saved to wishlist" : "Removed from wishlist"); }}
      className={cn("rounded-full bg-card/90 p-2 shadow-soft backdrop-blur transition hover:scale-105", className)}
    >
      <Heart className={cn("h-4 w-4", saved ? "fill-accent text-accent" : "text-foreground")} />
    </motion.button>
  );
};

const TONES = ["bg-blush", "bg-sky/60", "bg-butter/70", "bg-primary-soft"];

export const ProductCard = ({ p }: { p: Product }) => {
  const tone = TONES[parseInt(p.id.replace(/\D/g, "") || "0", 10) % TONES.length];
  const [quick, setQuick] = useState(false);
  const off = discountPct(p);
  const available = inStock(p);
  return (
    <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} className="group">
      <Link to={`/product/${p.slug}`} className="block">
        <div className={`relative aspect-[3/4] overflow-hidden rounded-[1.5rem] ${tone}`}>
          <img src={p.images[0]} alt={p.name} loading="lazy" width={768} height={1024} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          {p.images[1] && <img src={p.images[1]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" />}
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {p.isNew && <span className="rounded-full -rotate-3 bg-coral px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-background">✦ New</span>}
            {p.bestseller && <span className="rounded-full bg-butter px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-foreground">Bestseller</span>}
            {!available && <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground">Sold out</span>}
          </div>
          <WishButton p={p} className="absolute right-3 top-3" />
        </div>
        <div className="mt-3 space-y-1 px-1">
          <h3 className="font-sans text-sm font-semibold leading-snug text-foreground line-clamp-2">{p.name}</h3>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-foreground">{formatINR(p.price)}</span>
            {off > 0 && p.mrp && <><span className="text-xs text-muted-foreground line-through">{formatINR(p.mrp)}</span><span className="text-xs font-bold text-accent">{off}% off</span></>}
          </div>
          {(() => { const av = Object.entries(p.stock).filter(([, n]) => n > 0).map(([sz]) => sz); return av.length > 0 && <p className="text-[11px] font-semibold text-muted-foreground">Sizes: {av[0]}{av.length > 1 ? ` – ${av[av.length - 1]}` : ""}</p>; })()}
          {p.colours.length > 1 && (
            <div className="flex gap-1 pt-1" aria-label={`${p.colours.length} colours`}>
              {p.colours.map((c) => <span key={c.name} title={c.name} className="h-3 w-3 rounded-full border" style={{ backgroundColor: c.hex }} />)}
            </div>
          )}
        </div>
      </Link>
      {available ? (
        <Button onClick={() => setQuick(true)} className="mt-3 h-11 w-full rounded-full text-sm font-bold transition hover:bg-accent">
          <ShoppingBag className="h-4 w-4" />Add to Cart
        </Button>
      ) : (
        <Button disabled variant="secondary" className="mt-3 h-11 w-full rounded-md">Sold out</Button>
      )}
      <QuickAdd p={p} open={quick} onOpenChange={setQuick} />
    </motion.article>
  );
};
