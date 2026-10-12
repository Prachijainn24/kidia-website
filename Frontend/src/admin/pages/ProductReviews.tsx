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
  Trash2,
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
        <div className="fixed top-20 right-6 z-50 bg-dark-navy text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-slideDown">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-dark-navy tracking-tight font-sans">
          Customer Reviews & Testimonials
        </h1>
        <p className="text-xs sm:text-sm text-muted-gray mt-1 font-medium">
          Moderate customer ratings, verified buyer feedback, and child wear testimonials.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-muted-gray uppercase tracking-wider">
            Total Reviews
          </p>
          <p className="text-2xl font-black text-dark-navy mt-1">{reviews.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Average Rating
          </p>
          <p className="text-2xl font-black text-dark-navy mt-1 flex items-center gap-1.5">
            <Star
              size={20}
              className={reviews.length ? "fill-amber-400 text-amber-400" : "text-slate-300"}
            />
            <span className="text-lg sm:text-2xl">
              {reviews.length ? `${avgRating} / 5` : "0.0 / 5"}
            </span>
          </p>
          {reviews.length === 0 && (
            <p className="text-[10px] text-muted-gray mt-1">No reviews received yet</p>
          )}
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Live on Store
          </p>
          <p className="text-2xl font-black text-dark-navy mt-1">
            {reviews.filter((r) => r.isApproved).length}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by parent or design..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["all", "5", "4", "3"].map((star) => (
            <button
              key={star}
              onClick={() => setRatingFilter(star)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ratingFilter === star
                  ? "bg-[#0F9D8A] text-white shadow-xs"
                  : "bg-slate-50 text-muted-gray border border-slate-200 hover:bg-slate-100"
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
          <div className="py-16 text-center text-muted-gray bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0F9D8A] mb-2" />
            <span className="text-xs font-bold">Loading verified reviews...</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center text-muted-gray bg-white rounded-2xl border border-slate-200">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-dark-navy text-xs">No reviews matching criteria</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-dark-navy text-xs">{rev.parentName}</span>
                    <span className="text-[11px] text-muted-gray font-medium">
                      ({rev.childInfo})
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-[#0F9D8A] mt-0.5">
                    Design: {rev.productName || "Boutique Piece"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < rev.rating ? "fill-amber-400" : "text-slate-200"}
                      />
                    ))}
                  </div>

                  {/* Toggle Live */}
                  <button
                    onClick={() => handleToggle(rev._id)}
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1 ${
                      rev.isApproved
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
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

              <p className="text-xs text-slate-700 italic bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
                &ldquo;{rev.comment}&rdquo;
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-medium">
                <span>Verified Buyer Review</span>
                <span>{new Date(rev.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
