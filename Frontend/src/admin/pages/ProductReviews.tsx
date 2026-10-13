import React, { useEffect, useState, useMemo } from "react";
import {
  getVendorReviewsApi,
  toggleReviewApprovalApi,
  AdminReview,
} from "../services/adminApi";
import {
  Star,
  Search,
  Check,
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";

const ProductReviews: React.FC = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await getVendorReviewsApi();
      setReviews(res.data.reviews || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await toggleReviewApprovalApi(id);
      showToast("Review approval status updated");
      loadReviews();
    } catch {
      showToast("Failed to update status");
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        r.parentName.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase()) ||
        (r.productName && r.productName.toLowerCase().includes(search.toLowerCase())) ||
        r.childInfo.toLowerCase().includes(search.toLowerCase());

      const matchesRating =
        ratingFilter === "all" || r.rating.toString() === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }, [reviews, search, ratingFilter]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return "0.0";
    const sum = reviews.reduce((a, b) => a + (b.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-foreground text-background text-xs font-bold px-4 py-2.5 rounded-xl shadow-soft flex items-center gap-2 animate-slideDown">
          <Check size={14} className="text-butter" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-foreground tracking-tight">
          Customer Reviews & Testimonials
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
          Moderate customer ratings, verified buyer feedback, and child wear testimonials.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Reviews
          </p>
          <p className="text-2xl font-display font-black text-foreground mt-1">{reviews.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <p className="text-[11px] font-bold text-marigold uppercase tracking-wider">
            Average Rating
          </p>
          <p className="text-2xl font-display font-black text-foreground mt-1 flex items-center gap-1.5">
            <Star
              size={20}
              className={reviews.length ? "fill-marigold text-marigold" : "text-muted"}
            />
            <span className="text-lg sm:text-2xl">
              {reviews.length ? `${avgRating} / 5` : "0.0 / 5"}
            </span>
          </p>
          {reviews.length === 0 && (
            <p className="text-[10px] text-muted-foreground mt-1">No reviews received yet</p>
          )}
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Live on Store
          </p>
          <p className="text-2xl font-display font-black text-foreground mt-1">
            {reviews.filter((r) => r.isApproved).length}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by parent or design..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-muted/20 border border-border text-xs text-foreground focus:bg-card focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["all", "5", "4", "3"].map((star) => (
            <button
              key={star}
              onClick={() => setRatingFilter(star)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ratingFilter === star
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/30 text-muted-foreground border border-border hover:bg-muted/60"
              }`}
            >
              {star === "all" ? "All Stars" : `${star} ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground bg-card rounded-2xl border border-border">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
            <span className="text-xs font-bold">Loading verified reviews...</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground bg-card rounded-2xl border border-border">
            <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-bold text-foreground text-xs">No reviews matching criteria</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-card border border-border/80 rounded-2xl p-5 shadow-soft space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-foreground text-xs">{rev.parentName}</span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      ({rev.childInfo})
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-primary mt-0.5">
                    Design: {rev.productName || "Boutique Piece"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-marigold">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < rev.rating ? "fill-marigold text-marigold" : "text-muted"}
                      />
                    ))}
                  </div>

                  {/* Toggle Live */}
                  <button
                    onClick={() => handleToggle(rev._id)}
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1 ${
                      rev.isApproved
                        ? "bg-primary-soft/50 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {rev.isApproved ? (
                      <>
                        <CheckCircle size={11} /> Approved
                      </>
                    ) : (
                      <>
                        <XCircle size={11} /> Hidden
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed font-sans bg-muted/20 p-3 rounded-xl border border-border/40">
                "{rev.comment}"
              </p>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                <span>{new Date(rev.createdAt).toLocaleDateString("en-IN")}</span>
                <span className="font-semibold text-primary">Verified Boutique Buyer ✓</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
