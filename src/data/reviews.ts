export type Review = {
  /** The customer's own words, lightly punctuated only. */
  quote: string;
  /** Parent or guardian's first name, as they agreed to be credited. */
  parent: string;
  /** Who wore it — age or size, e.g. "Aarav, 4 yrs". */
  child: string;
  city?: string;
  /** Which style the review is about — the product id, e.g. "p1". */
  productId?: string;
  /** 1–5, exactly as the customer rated it. */
  rating?: number;
  /** ISO date the review reached us, e.g. "2026-06-11". */
  date?: string;
};

/**
 * Real, verified customer reviews only — never invent quotes.
 * Add each one after the customer has actually sent it (email or WhatsApp)
 * and agreed to be quoted. The sections hide their review cards while this
 * list is empty, so no page ever shows placeholder testimonials.
 */
export const REVIEWS: Review[] = [];

/** Reviews written for one style. */
export const reviewsFor = (productId: string) => REVIEWS.filter((r) => r.productId === productId);

/** Mean of the ratings present; 0 when nothing has been rated yet. */
export const averageRating = (list: Review[]) => {
  const rated = list.filter((r) => typeof r.rating === "number");
  if (!rated.length) return 0;
  return rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length;
};

/** "2026-06-11" → "11 Jun 2026"; blank when no date was given. */
export const reviewDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
