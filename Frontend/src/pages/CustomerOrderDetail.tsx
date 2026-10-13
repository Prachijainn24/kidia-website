import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Star,
  MapPin,
  Calendar,
  CreditCard,
  MessageCircle,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/data/catalog";
import { useAuth } from "@/hooks/useAuth";
import {
  getCustomerOrderById,
  updateOrderStatus,
  CustomerOrder,
  OrderStatus,
} from "@/services/orderService";
import {
  checkReviewEligibility,
  submitProductReview,
} from "@/services/reviewService";

export const StatusBadge = ({ status }: { status: OrderStatus }) => {
  switch (status) {
    case "placed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20">
          <Clock className="h-3.5 w-3.5 text-amber-600" />
          Order Placed
        </span>
      );
    case "accepted":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-800 border border-blue-500/20">
          <Check className="h-3.5 w-3.5 text-blue-600" />
          Order Accepted
        </span>
      );
    case "packed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-800 border border-purple-500/20">
          <Package className="h-3.5 w-3.5 text-purple-600" />
          Packed in Boutique
        </span>
      );
    case "shipping":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
          <Truck className="h-3.5 w-3.5 text-primary" />
          Out for Delivery / Shipped
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/15 text-emerald-800 border border-emerald-600/30">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Delivered
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
          <XCircle className="h-3.5 w-3.5 text-destructive" />
          Order Cancelled
        </span>
      );
    case "delivery_failed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-900 border border-red-500/30">
          <AlertTriangle className="h-3.5 w-3.5 text-red-700" />
          Delivery Failed
        </span>
      );
    default:
      return <span className="text-xs font-bold capitalize">{status}</span>;
  }
};

export const PipelineSteps = ({ status }: { status: OrderStatus }) => {
  if (status === "cancelled" || status === "delivery_failed") return null;

  const steps = [
    { key: "placed", label: "Placed" },
    { key: "accepted", label: "Accepted" },
    { key: "packed", label: "Packed" },
    { key: "shipping", label: "Shipping" },
    { key: "delivered", label: "Delivered" },
  ];

  const orderIndexMap: Record<string, number> = {
    placed: 0,
    accepted: 1,
    packed: 2,
    shipping: 3,
    delivered: 4,
  };

  const currentIndex = orderIndexMap[status] ?? 0;

  return (
    <div className="py-4">
      <div className="relative flex items-center justify-between">
        {/* Track Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border/60 -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 -z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((st, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={st.key} className="flex flex-col items-center z-10 bg-card px-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 shadow-xs"
                    : isDone
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground border"
                }`}
              >
                {isDone ? <Check size={13} strokeWidth={3} /> : idx + 1}
              </div>
              <span
                className={`text-[11px] font-semibold mt-1.5 ${
                  isDone ? "text-foreground font-bold" : "text-muted-foreground"
                }`}
              >
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function CustomerOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Order cancellation state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const handleConfirmCancel = async () => {
    if (!order) return;
    setCancellingOrder(true);
    try {
      await updateOrderStatus(order._id, "cancelled");
      toast.success("Order cancelled successfully. Item inventory has been restored.");
      setCancelModalOpen(false);
      await fetchOrder();
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel order.");
    } finally {
      setCancellingOrder(false);
    }
  };

  const fetchOrder = async () => {
    if (!orderId) return;
    setLoadingOrder(true);
    try {
      const found = await getCustomerOrderById(orderId, user?.id, user?.email);
      setOrder(found);
    } catch (e) {
      console.warn("Failed to load order details", e);
    } finally {
      setLoadingOrder(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId, user]);

  const openReviewModal = (item: any) => {
    setReviewItem(item);
    setReviewRating(5);
    setReviewComment("");
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !reviewItem || !user) return;

    if (!reviewComment.trim()) {
      toast.error("Please enter a review comment.");
      return;
    }

    if (reviewComment.trim().length > 200) {
      toast.error("Review comment cannot exceed 200 characters.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await submitProductReview({
        orderId: order._id,
        productId: reviewItem.productId,
        productName: reviewItem.heading,
        customerName: profile?.display_name || user.email?.split("@")[0] || "Verified Buyer",
        customerEmail: user.email!,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      if (res.success) {
        toast.success("Thank you! Your product review has been submitted.");
        setReviewModalOpen(false);
        setReviewItem(null);
        fetchOrder();
      } else {
        toast.error(res.error || "Failed to submit review.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || loadingOrder) {
    return (
      <Layout title="Order Details | KIDIA">
        <div className="container-kidia py-24 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">Loading order details...</p>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout title="Order Not Found | KIDIA">
        <div className="container-kidia py-24 text-center space-y-4 max-w-md mx-auto">
          <Package className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="font-serif text-2xl font-bold">Order Not Found</h1>
          <p className="text-sm text-muted-foreground">
            We couldn't locate this order in your account. It may have been archived or belongs to another email address.
          </p>
          <Button asChild className="rounded-full">
            <Link to="/orders">Back to My Orders</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const formattedDate = order.createdAt && !isNaN(new Date(order.createdAt).getTime())
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return (
    <Layout title={`Order #${order.orderNumber} | KIDIA`}>
      <section className="container-kidia py-10 md:py-14 text-left">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between border-b pb-4">
            <button
              onClick={() => navigate("/orders")}
              className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to My Orders</span>
            </button>

            <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-bold gap-1.5">
              <a
                href="https://wa.me/919876543210?text=Hello%20Kidia,%20I%20need%20help%20with%20my%20order"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                Need Help?
              </a>
            </Button>
          </div>

          {/* Order Header Summary */}
          <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                    Order #{order.orderNumber}
                  </h1>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Placed on {formattedDate}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Total Amount</span>
                <span className="text-xl font-bold text-foreground">
                  {formatINR(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Stepper Pipeline */}
            <PipelineSteps status={order.orderStatus} />

            {/* Courier Tracking box */}
            {(order.orderStatus === "shipping" || order.orderStatus === "delivered") && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block text-sm">
                      Courier: {order.courierName || "Kidia Express Logistics"}
                    </span>
                    <span className="text-muted-foreground font-mono mt-0.5 block">
                      Tracking AWB: {order.trackingId || `KID${order.orderNumber.replace(/\D/g, "")}IN`}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full shrink-0">
                  {order.orderStatus === "delivered" ? "Delivered to Customer ✓" : "In Transit"}
                </span>
              </div>
            )}

            {/* Customer Cancellation Option */}
            {(order.orderStatus === "placed" || order.orderStatus === "accepted") && (
              <div className="pt-2 flex items-center justify-between border-t text-xs">
                <span className="text-muted-foreground">Need to make a change before boutique packing?</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelModalOpen(true)}
                  className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10 font-bold text-xs h-8 gap-1.5 cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel Order
                </Button>
              </div>
            )}
          </div>

          {/* Ordered Items Card */}
          <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
            <h2 className="font-serif text-lg font-bold text-foreground border-b pb-3">
              Items in this Order ({order.items.length})
            </h2>

            <div className="divide-y">
              {order.items.map((it, idx) => {
                const eligibility = checkReviewEligibility(order, it.productId);

                return (
                  <div
                    key={idx}
                    className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={it.heading}
                          className="h-20 w-16 rounded-2xl object-cover border shrink-0 bg-muted"
                        />
                      ) : (
                        <div className="h-20 w-16 rounded-2xl bg-muted flex items-center justify-center border shrink-0">
                          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          to={`/product/${it.productId}`}
                          className="font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {it.heading}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Qty: {it.quantity} {it.size ? `· Size: ${it.size}` : ""}{" "}
                          {it.colour ? `· ${it.colour}` : ""}
                        </p>
                        <p className="text-xs font-semibold text-foreground mt-1">
                          {formatINR(it.price * it.quantity)}
                        </p>
                      </div>
                    </div>

                    {/* Write Review Action */}
                    {order.orderStatus === "delivered" && (
                      <div className="shrink-0 sm:text-right">
                        {eligibility.eligible ? (
                          <Button
                            size="sm"
                            onClick={() => openReviewModal(it)}
                            className="rounded-full text-xs font-bold gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 shadow-xs cursor-pointer"
                          >
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            Rate & Review Product
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-medium italic block bg-muted/40 px-3 py-1.5 rounded-xl border border-border/50">
                            {eligibility.reason}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address & Payment Breakdown */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Delivery Address */}
            <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-3">
              <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2 border-b pb-2">
                <MapPin className="h-4 w-4 text-primary" />
                Delivery Address
              </h3>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {typeof order.shippingAddress === "object" ? (
                  <>
                    <p className="font-bold text-foreground text-sm">
                      {order.shippingAddress.fullName || order.customerName}
                    </p>
                    <p className="mt-1">
                      {order.shippingAddress.addressLine || order.shippingAddress.address}
                    </p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                      {order.shippingAddress.pincode}
                    </p>
                    {order.customerPhone && (
                      <p className="mt-2 font-medium text-foreground">
                        Phone: {order.customerPhone}
                      </p>
                    )}
                  </>
                ) : (
                  <p>{String(order.shippingAddress)}</p>
                )}
              </div>
            </div>

            {/* Price Details */}
            <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-3">
              <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2 border-b pb-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Price Details
              </h3>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>List Price ({order.items.length} items)</span>
                  <span className="font-medium text-foreground">
                    {formatINR(order.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Mode</span>
                  <span className="font-medium text-foreground capitalize">
                    {order.paymentMethod || "Online"} (Paid ✓)
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-sm text-foreground">
                  <span>Total Amount</span>
                  <span>{formatINR(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      {reviewModalOpen && reviewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-5 animate-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground">Rate & Review</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verified Buyer Feedback for: <strong>{reviewItem.heading}</strong>
                </p>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Overall Rating <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-marigold transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-foreground ml-2">
                    {reviewRating} out of 5 stars
                  </span>
                </div>
              </div>

              {/* Review Comment Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    Your Review <span className="text-destructive">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      reviewComment.length > 200 ? "text-destructive font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {reviewComment.length} / 200
                  </span>
                </div>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about the fabric, sizing, comfort, and how it fit your child..."
                  rows={4}
                  maxLength={200}
                  className="rounded-2xl resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewModalOpen(false)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingReview || !reviewComment.trim()}
                  className="rounded-full bg-primary font-bold min-w-28 cursor-pointer"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancelModalOpen && order && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Cancel Order #{order.orderNumber}?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to cancel this order?
                </p>
              </div>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed bg-muted/40 p-3 rounded-2xl border">
              Upon cancellation, all reserved boutique garment inventory will be immediately restored to stock.
            </p>

            <div className="flex gap-2.5 pt-2 border-t">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={cancellingOrder}
                onClick={handleConfirmCancel}
                className="rounded-full font-bold text-xs gap-1.5 cursor-pointer flex-1"
              >
                {cancellingOrder ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Order"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={cancellingOrder}
                onClick={() => setCancelModalOpen(false)}
                className="rounded-full font-bold text-xs cursor-pointer"
              >
                Keep Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
