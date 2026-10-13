import { supabase } from "@/integrations/supabase/client";

export interface ProductReviewItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1 to 5 stars
  comment: string; // Under 200 characters
  createdAt: string;
  isApproved?: boolean;
}

const REVIEWS_STORAGE_KEY = "kidia_customer_product_reviews";

export const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getStoredProductReviews = (): ProductReviewItem[] => {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to load reviews:", err);
  }
  return [];
};

export const setStoredProductReviews = (reviews: ProductReviewItem[]) => {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("kidia_reviews_updated"));
    }
  } catch (err) {
    console.warn("Failed to save reviews:", err);
  }
};

/**
 * Fetch approved reviews from Supabase and merge into local storage.
 */
export const syncReviewsFromSupabase = async (): Promise<ProductReviewItem[]> => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      const stored = getStoredProductReviews();
      const map = new Map<string, ProductReviewItem>();

      // First add Supabase data (authoritative)
      for (const row of data) {
        map.set(row.id, {
          id: row.id,
          orderId: row.id,
          productId: row.product_id,
          productName: "",
          customerName: row.parent_name || "Verified Buyer",
          customerEmail: "",
          rating: Number(row.rating) || 5,
          comment: row.quote || "",
          createdAt: row.created_at,
          isApproved: row.is_approved !== false,
        });
      }

      // Add any local reviews that might not yet be in Supabase
      for (const s of stored) {
        // avoid duplicate if same comment and product
        const alreadyExists = Array.from(map.values()).some(
          (m) => m.productId === s.productId && m.comment === s.comment
        );
        if (!map.has(s.id) && !alreadyExists) {
          map.set(s.id, s);
        }
      }

      const merged = Array.from(map.values());
      setStoredProductReviews(merged);
      return merged;
    }
  } catch (e) {
    console.warn("Supabase review fetch error:", e);
  }
  return getStoredProductReviews();
};

// Trigger sync on module import in browser
if (typeof window !== "undefined") {
  syncReviewsFromSupabase().catch(() => {});
}

/**
 * Check if customer is eligible to review an item:
 * 1. Order status must be 'delivered'
 * 2. Delivery date must be within 7 days
 * 3. Has not already reviewed this item in this order
 */
export const checkReviewEligibility = (
  order: { orderStatus: string; deliveredAt?: string; _id: string; createdAt: string },
  productId: string
): { eligible: boolean; reason?: string } => {
  if (order.orderStatus !== "delivered") {
    return { eligible: false, reason: "Review is available only once the product is delivered." };
  }

  // Delivery timestamp check: use deliveredAt or fallback to order creation time
  const deliveryTime = order.deliveredAt ? new Date(order.deliveredAt).getTime() : new Date(order.createdAt).getTime();
  const diffDays = (Date.now() - deliveryTime) / (1000 * 60 * 60 * 24);

  if (diffDays > 7) {
    return { eligible: false, reason: "Review window has expired (available within 7 days after delivery)." };
  }

  // Check if already reviewed
  const existingReviews = getStoredProductReviews();
  const alreadyReviewed = existingReviews.some(
    (r) => r.orderId === order._id && r.productId === productId
  );

  if (alreadyReviewed) {
    return { eligible: false, reason: "You have already reviewed this product for this order." };
  }

  return { eligible: true };
};

export const submitProductReview = async (reviewData: {
  orderId: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
}): Promise<{ success: boolean; review?: ProductReviewItem; error?: string }> => {
  const comment = reviewData.comment.trim();
  if (!comment) {
    return { success: false, error: "Please enter your review text." };
  }

  if (comment.length > 200) {
    return { success: false, error: "Review cannot exceed 200 characters." };
  }

  const rating = Math.min(5, Math.max(1, Math.round(reviewData.rating || 5)));
  const reviewUuid = generateUUID();

  const newReview: ProductReviewItem = {
    id: reviewUuid,
    orderId: reviewData.orderId,
    productId: reviewData.productId,
    productName: reviewData.productName,
    customerName: reviewData.customerName || "Verified Buyer",
    customerEmail: reviewData.customerEmail,
    rating,
    comment,
    createdAt: new Date().toISOString(),
    isApproved: true,
  };

  const existing = getStoredProductReviews();
  const updated = [newReview, ...existing];
  setStoredProductReviews(updated);

  // Sync to Supabase reviews table
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    if (userId) {
      const { error } = await supabase.from("reviews").insert([{
        id: newReview.id,
        user_id: userId,
        product_id: reviewData.productId,
        parent_name: reviewData.customerName || "Verified Buyer",
        child_info: "Verified Purchase",
        rating,
        quote: comment,
        is_approved: true,
      }]);
      if (error) {
        console.warn("Direct supabase review insert note:", error);
      }
    }
  } catch (e) {
    console.warn("Supabase reviews sync warning (saved locally):", e);
  }

  return { success: true, review: newReview };
};

export const getReviewsForProduct = (productId: string): ProductReviewItem[] => {
  const allReviews = getStoredProductReviews();
  return allReviews.filter((r) => r.productId === productId);
};

export const getProductRatingStats = (
  productId: string
): { averageRating: number; reviewCount: number } => {
  const reviews = getReviewsForProduct(productId);
  if (reviews.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  const avg = Number((sum / reviews.length).toFixed(1));
  return { averageRating: avg, reviewCount: reviews.length };
};
