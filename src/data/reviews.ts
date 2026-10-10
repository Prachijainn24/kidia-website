export type Review = {
  /** The customer's own words, lightly punctuated only. */
  quote: string;
  /** Parent or guardian's first name, as they agreed to be credited. */
  parent: string;
  /** Who wore it — age or size, e.g. "Aarav, 4 yrs". */
  child: string;
  city?: string;
};

/**
 * Real, verified customer reviews only — never invent quotes.
 * Add each one after the customer has actually sent it (email or WhatsApp)
 * and agreed to be quoted. The section hides its review cards while this
 * list is empty, so the page never shows placeholder testimonials.
 */
export const REVIEWS: Review[] = [];
