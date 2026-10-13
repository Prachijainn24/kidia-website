import { useState } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  ArrowRight,
  RotateCcw,
  PackageCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/data/catalog";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { createOrder } from "@/services/orderService";

export default function Payment() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { clear } = useCart();

  const state = location.state as {
    address: any;
    items: any[];
    totalAmount: number;
  } | null;

  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  if (!loading && !user) {
    return <Navigate to="/auth?redirect=/cart" replace />;
  }

  if (!state || !state.items || state.items.length === 0) {
    return (
      <Layout title="Payment | KIDIA">
        <div className="container-kidia py-24 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-serif text-3xl font-bold">No active checkout found</h1>
          <p className="text-muted-foreground mt-2">Please add items to your bag and proceed from checkout.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/cart">Go to Shopping Bag</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const { address, items, totalAmount } = state;

  const handleSimulateSuccess = async () => {
    setProcessing(true);
    try {
      const res = await createOrder({
        userId: user!.id,
        customerName: address.fullName || profile?.display_name || user!.email!.split("@")[0],
        customerEmail: user!.email!,
        customerPhone: address.phone || profile?.phone || "",
        shippingAddress: address,
        items,
        totalAmount,
        paymentMethod: "Simulated Card / UPI",
        paymentStatus: "paid",
      });

      if (res.success) {
        clear(); // Empty cart
        setCreatedOrder(res.order);
        setPaymentStatus("success");
        toast.success("Order placed successfully! Admin has been notified.");
      } else {
        toast.error(res.error || "Failed to create order.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred during order creation.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulateFailure = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaymentStatus("failed");
      toast.error("Payment failed. Please retry or choose another payment method.");
    }, 600);
  };

  return (
    <Layout title="Payment Checkout | KIDIA">
      <section className="container-kidia py-12 md:py-16 text-left">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Header */}
          <div>
            <p className="eyebrow mb-1">Step 2 of 2 · Secure Payment</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Payment Gateway
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Test the boutique ordering pipeline with our live payment simulator.
            </p>
          </div>

          {/* Success State */}
          {paymentStatus === "success" && createdOrder && (
            <div className="rounded-3xl border-2 border-emerald-600/30 bg-emerald-500/10 p-8 shadow-soft text-center space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-3 py-1 rounded-full">
                  Order Successfully Placed
                </span>
                <h2 className="font-serif text-3xl font-black text-foreground mt-3">
                  Thank You for Your Order!
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Order Number: <strong className="text-foreground">{createdOrder.orderNumber}</strong>
                </p>
              </div>

              <div className="rounded-2xl bg-card p-5 max-w-md mx-auto text-left border shadow-xs text-xs space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-bold text-foreground text-sm">{formatINR(totalAmount)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-semibold text-foreground">Online Payment (Verified)</span>
                </div>
                <div className="pt-1">
                  <span className="text-muted-foreground block mb-1">Delivering To:</span>
                  <p className="font-medium text-foreground leading-relaxed">
                    {address.fullName} · {address.addressLine}, {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => navigate("/orders")}
                  className="rounded-full font-bold px-7 gap-2 shadow-soft"
                >
                  <PackageCheck className="h-4 w-4" />
                  View in My Orders
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full font-bold px-7"
                >
                  <Link to="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Failed State */}
          {paymentStatus === "failed" && (
            <div className="rounded-3xl border-2 border-destructive/30 bg-destructive/10 p-8 shadow-soft text-center space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-destructive text-white flex items-center justify-center mx-auto shadow-md">
                <XCircle className="h-10 w-10" />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-destructive bg-destructive/20 px-3 py-1 rounded-full">
                  Transaction Declined
                </span>
                <h2 className="font-serif text-3xl font-black text-foreground mt-3">
                  Payment Failed
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Your bank or card issuer was unable to authorize the transaction. No amount was deducted from your account.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => setPaymentStatus("idle")}
                  className="rounded-full font-bold px-7 gap-2 shadow-soft bg-primary"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again / Reorder
                </Button>
                <Button
                  onClick={() => navigate("/cart")}
                  variant="outline"
                  className="rounded-full font-bold px-7"
                >
                  Return to Shopping Bag
                </Button>
              </div>
            </div>
          )}

          {/* Normal Checkout State */}
          {paymentStatus === "idle" && (
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                {/* Delivery Address Card */}
                <div className="rounded-2xl border bg-card p-5 shadow-soft">
                  <div className="flex items-center justify-between border-b pb-3 mb-3">
                    <span className="font-serif font-bold text-sm text-foreground flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      Delivery Destination
                    </span>
                    <Link to="/cart" className="text-xs font-bold text-primary hover:underline">
                      Change
                    </Link>
                  </div>
                  <p className="font-bold text-sm text-foreground">{address.fullName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {address.addressLine}, {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">📞 {address.phone}</p>
                </div>

                {/* Items Summary */}
                <div className="rounded-2xl border bg-card p-5 shadow-soft space-y-4">
                  <span className="font-serif font-bold text-sm text-foreground block border-b pb-3">
                    Order Items ({items.length})
                  </span>
                  <div className="divide-y">
                    {items.map((it: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        {it.image && (
                          <img
                            src={it.image}
                            alt={it.heading}
                            className="h-14 w-12 rounded-lg object-cover border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-foreground truncate">
                            {it.heading}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {it.quantity} {it.size ? `· Size: ${it.size}` : ""}{" "}
                            {it.colour ? `· ${it.colour}` : ""}
                          </p>
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-foreground whitespace-nowrap">
                          {formatINR(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Payment Gateway Section */}
                <div className="rounded-3xl border-2 border-primary/20 bg-background/90 p-6 shadow-soft space-y-5">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-serif font-bold text-base text-foreground">
                        Simulated Payment Gateway
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> 256-bit Sandbox
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Select a test outcome below to trigger the entire order lifecycle:
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Option 1: Payment Success */}
                    <button
                      type="button"
                      disabled={processing}
                      onClick={handleSimulateSuccess}
                      className="rounded-2xl border-2 border-emerald-600/40 bg-emerald-600/10 hover:bg-emerald-600/20 p-4 text-left transition-all active:scale-[0.98] group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Payment Success
                        </span>
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Test Success
                        </span>
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed">
                        Authorizes {formatINR(totalAmount)}, marks order as <strong>placed</strong>, notifies admin, and moves to My Orders.
                      </p>
                    </button>

                    {/* Option 2: Payment Failed */}
                    <button
                      type="button"
                      disabled={processing}
                      onClick={handleSimulateFailure}
                      className="rounded-2xl border-2 border-destructive/40 bg-destructive/10 hover:bg-destructive/20 p-4 text-left transition-all active:scale-[0.98] group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-destructive flex items-center gap-1.5">
                          <XCircle className="h-4 w-4 text-destructive" />
                          Payment Failed
                        </span>
                        <span className="text-[10px] font-extrabold uppercase bg-destructive text-white px-2 py-0.5 rounded-full">
                          Test Failure
                        </span>
                      </div>
                      <p className="text-xs text-destructive/90 leading-relaxed">
                        Simulates bank rejection or card decline. Allows customer to retry or return to bag.
                      </p>
                    </button>
                  </div>

                  {processing && (
                    <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-primary animate-pulse">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Communicating with payment gateway simulator...
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Summary */}
              <aside className="rounded-3xl bg-secondary p-6 shadow-soft h-fit space-y-4">
                <span className="font-serif font-bold text-lg text-foreground block">
                  Amount to Pay
                </span>

                <dl className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Items Subtotal</dt>
                    <dd className="font-semibold">{formatINR(totalAmount)}</dd>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <dt>Delivery</dt>
                    <dd className="font-semibold">FREE</dd>
                  </div>
                  <div className="flex justify-between border-t pt-3 font-bold text-foreground text-base">
                    <dt>Total Amount</dt>
                    <dd>{formatINR(totalAmount)}</dd>
                  </div>
                </dl>

                <Button
                  disabled={processing}
                  onClick={handleSimulateSuccess}
                  className="w-full rounded-full font-bold h-11 bg-emerald-700 hover:bg-emerald-800 text-white shadow-soft"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Pay {formatINR(totalAmount)} (Success)
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  className="w-full rounded-full text-xs text-muted-foreground"
                >
                  <Link to="/cart">Cancel & Return to Bag</Link>
                </Button>
              </aside>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
