import { useState } from "react";
import { Instagram, MessageCircle, Star } from "lucide-react";
import { Product } from "@/data/catalog";
import { REVIEWS, Review, averageRating, reviewDate, reviewsFor } from "@/data/reviews";
import { CONTACT, instagramUrl, whatsappUrl } from "@/data/contact";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SHOWN = 3;

const Stars = ({ value, className }: { value: number; className?: string }) => (
  <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={cn("h-3.5 w-3.5", i <= Math.round(value) ? "fill-marigold text-marigold" : "text-primary/25")} strokeWidth={1.6} />
    ))}
  </span>
);

const ReviewRow = ({ r }: { r: Review }) => {
  const [more, setMore] = useState(false);
  const long = r.quote.length > 190;
  const date = reviewDate(r.date);
  return (
    <li className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-butter font-display text-base font-bold text-primary">
            {r.parent.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <span>
            <span className="block text-sm font-bold text-primary">{r.parent}</span>
            <span className="block text-xs text-muted-foreground">
              {date ? `Reviewed on ${date}` : "Verified buyer"}
              {r.child ? ` · for ${r.child}` : ""}
              {r.city ? ` · ${r.city}` : ""}
            </span>
          </span>
        </div>
        {typeof r.rating === "number" && <Stars value={r.rating} className="mt-1 shrink-0" />}
      </div>
      <p className={cn("mt-3 text-sm leading-relaxed text-foreground/80", !more && long && "line-clamp-3")}>“{r.quote}”</p>
      {long && (
        <button onClick={() => setMore((v) => !v)} className="mt-1 text-xs font-extrabold uppercase tracking-wide text-coral">
          {more ? "Show less" : "Show more"}
        </button>
      )}
    </li>
  );
};

export const ProductReviews = ({ p }: { p: Product }) => {
  const list = reviewsFor(p.id);
  const avg = averageRating(list);
  const [all, setAll] = useState(false);
  const shown = all ? list : list.slice(0, SHOWN);

  return (
    <section className="mt-14 rounded-[1.75rem] border border-primary/10 bg-card p-6 shadow-soft md:p-9" aria-labelledby="reviews-title">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 id="reviews-title" className="font-serif text-2xl text-primary md:text-3xl">Customer reviews</h2>
          <p className="mt-1 text-sm text-muted-foreground">Read feedback from verified buyers of this product.</p>
        </div>
        {list.length > 0 && (
          <div className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-background px-5 py-3">
            <span className="font-display text-3xl font-extrabold text-primary">{avg.toFixed(1)}</span>
            <span>
              <Stars value={avg} />
              <span className="mt-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Based on {list.length} {list.length === 1 ? "review" : "reviews"}
              </span>
            </span>
          </div>
        )}
      </div>

      {list.length > 0 ? (
        <>
          <ul className="mt-6 divide-y divide-primary/10">
            {shown.map((r, i) => <ReviewRow key={`${r.parent}-${i}`} r={r} />)}
          </ul>
          {!all && list.length > SHOWN && (
            <div className="mt-7 text-center">
              <Button variant="outline" className="rounded-full px-8 border-primary text-primary" onClick={() => setAll(true)}>
                See all reviews ({list.length})
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-primary/20 bg-background/70 px-6 py-8 text-center">
          <p className="font-hand text-3xl text-plum">No reviews yet — and we'd rather show you real ones.</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            If your little one has worn this style, we'd love to hear how it went — a line or two, in your own words.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappUrl(`Hi KIDIA! I'd love to share a review of the ${p.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-coral"
            >
              <MessageCircle className="h-4 w-4" />Share a review on WhatsApp
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-background"
            >
              <Instagram className="h-4 w-4" />Tag us @{CONTACT.instagramHandle}
            </a>
          </div>
        </div>
      )}
    </section>
  );
};
