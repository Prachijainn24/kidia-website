import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";
import { Product, discountPct, formatINR, inStock } from "@/data/catalog";
import { useWishlist } from "@/hooks/useWishlist";
import { QuickAdd } from "./QuickAdd";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getProductRatingStats, syncReviewsFromSupabase } from "@/services/reviewService";

export const WishButton = ({ p, className }: { p: Product; className?: string }) => {
  const saved = useWishlist((s) => s.ids.includes(p.id));
  const toggle = useWishlist((s) => s.toggle);
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      aria-label={saved ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        const now = toggle(p.id);
        toast(now ? "Saved to wishlist" : "Removed from wishlist");
      }}
      className={cn(
        "rounded-full bg-card/90 p-2 shadow-soft backdrop-blur transition hover:scale-105",
        className
      )}
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

  // Total stock across all size variants
  const totalStock = Object.values(p.stock || {}).reduce(
    (sum, n) => sum + (Number(n) || 0),
    0
  );
  // Rating statistics — strictly genuine customer reviews
  const [stats, setStats] = useState(() => getProductRatingStats(p.id));

  useEffect(() => {
    syncReviewsFromSupabase().then(() => {
      setStats(getProductRatingStats(p.id));
    });

    const onUpdate = () => setStats(getProductRatingStats(p.id));
    window.addEventListener("kidia_reviews_updated", onUpdate);
    return () => window.removeEventListener("kidia_reviews_updated", onUpdate);
  }, [p.id]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className="group flex h-full flex-col text-left"
    >
      <Link to={`/product/${p.slug}`} className="flex flex-1 flex-col">
        <div className={`relative aspect-[4/5] overflow-hidden rounded-[1.5rem] ${tone}`}>
          <img
            src={p.images[0]}
            alt={p.name}
            loading="lazy"
            width={768}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {p.bestseller && (
              <span className="rounded-full bg-amber-400 text-dark-navy px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-xs">
                ★ Bestseller
              </span>
            )}
            {!available && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground shadow-xs">
                Sold out
              </span>
            )}
          </div>

          {/* Real Customer Star Rating Badge — strictly shown only when verified reviews exist */}
          {stats.reviewCount > 0 && (
            <div className="absolute left-3 bottom-3 z-20 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-foreground shadow-soft border border-border/50">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
              <span>{stats.averageRating.toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">({stats.reviewCount})</span>
            </div>
          )}

          <WishButton p={p} className="absolute right-3 top-3" />
        </div>

        <div className="mt-2.5 flex-1 space-y-1 px-1">
          <h3 className="font-sans text-sm font-semibold leading-snug text-foreground line-clamp-2">
            {p.name}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="font-bold text-foreground">{formatINR(p.price)}</span>
            {off > 0 && p.mrp && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  {formatINR(p.mrp)}
                </span>
                <span className="text-xs font-bold text-accent">{off}% off</span>
              </>
            )}
          </div>

          {/* Live stock count display */}
          <div className="pt-0.5">
            {available ? (
              totalStock <= 5 ? (
                <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Only {totalStock} left — order soon!
                </p>
              ) : (
                <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  In Stock ({totalStock} available)
                </p>
              )
            ) : (
              <p className="text-[11px] font-semibold text-rose-600">Currently out of stock</p>
            )}
          </div>

          {/* Sizes available */}
          {(() => {
            const av = Object.entries(p.stock || {})
              .filter(([, n]) => Number(n) > 0)
              .map(([sz]) => sz);
            return (
              av.length > 0 && (
                <p className="text-[11px] font-medium text-muted-foreground">
                  Sizes: {av[0]}
                  {av.length > 1 ? ` – ${av[av.length - 1]}` : ""}
                </p>
              )
            );
          })()}

          {p.colours && p.colours.length > 1 && (
            <div className="flex gap-1 pt-1" aria-label={`${p.colours.length} colours`}>
              {p.colours.map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="h-3 w-3 rounded-full border"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {available ? (
        <Button
          onClick={() => setQuick(true)}
          className="mt-2.5 h-10 w-full rounded-full text-xs font-bold transition bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-primary-foreground" />
          <span>Add To Cart</span>
        </Button>
      ) : (
        <Button disabled variant="secondary" className="mt-2.5 h-10 w-full rounded-full text-xs">
          Sold out
        </Button>
      )}

      <QuickAdd p={p} open={quick} onOpenChange={setQuick} />
    </motion.article>
  );
};
