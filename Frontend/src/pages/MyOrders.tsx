import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/data/catalog";
import { useAuth } from "@/hooks/useAuth";
import { getCustomerOrders, CustomerOrder, OrderStatus } from "@/services/orderService";

export const StatusBadge = ({ status }: { status: OrderStatus }) => {
  switch (status) {
    case "placed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20">
          <Clock className="h-3 w-3 text-amber-600" />
          Order Placed
        </span>
      );
    case "accepted":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-800 border border-blue-500/20">
          <Check className="h-3 w-3 text-blue-600" />
          Accepted
        </span>
      );
    case "packed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-800 border border-purple-500/20">
          <Package className="h-3 w-3 text-purple-600" />
          Packed
        </span>
      );
    case "shipping":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
          <Truck className="h-3 w-3 text-primary" />
          Out for Delivery
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600/15 text-emerald-800 border border-emerald-600/30">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          Delivered
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
          <XCircle className="h-3 w-3 text-destructive" />
          Cancelled
        </span>
      );
    case "delivery_failed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-900 border border-red-500/30">
          <AlertTriangle className="h-3 w-3 text-red-700" />
          Failed
        </span>
      );
    default:
      return <span className="text-[11px] font-bold capitalize">{status}</span>;
  }
};

export default function MyOrders() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const list = await getCustomerOrders(user.id, user.email);
      setOrders(list);
    } catch (err) {
      console.warn("Failed to load customer orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!loading && !user) {
    return <Navigate to="/auth?redirect=/orders" replace />;
  }

  return (
    <Layout title="My Orders | KIDIA">
      <section className="container-kidia py-10 md:py-14 text-left">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
            <div>
              <p className="eyebrow mb-1">Customer Dashboard</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                My Orders
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Tap any order to view tracking details, courier info, and share feedback.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-semibold">
                <Link to="/account">My Profile</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-primary font-bold text-xs">
                <Link to="/shop">Shop More</Link>
              </Button>
            </div>
          </div>

          {/* Orders Listing */}
          {loadingOrders ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-xs text-muted-foreground">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Package className="h-8 w-8" />
              </div>
              <h2 className="font-serif text-2xl font-bold">No orders placed yet</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Explore our festive collections and everyday boutique essentials for your little ones.
              </p>
              <Button asChild className="rounded-full px-8 font-bold">
                <Link to="/shop">Explore Collections</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => {
                const firstItem = ord.items[0];
                const formattedDate = ord.createdAt && !isNaN(new Date(ord.createdAt).getTime())
                  ? new Date(ord.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Recently";

                const formattedDeliveredDate = ord.deliveredAt && !isNaN(new Date(ord.deliveredAt).getTime())
                  ? new Date(ord.deliveredAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : null;

                return (
                  <Link
                    key={ord._id}
                    to={`/orders/${ord._id}`}
                    className="group block rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs hover:shadow-soft hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      {/* Left: Product Thumbnail */}
                      <div className="relative shrink-0">
                        {firstItem?.image ? (
                          <img
                            src={firstItem.image}
                            alt={firstItem.heading}
                            className="h-20 w-16 sm:h-24 sm:w-20 rounded-xl object-cover border bg-muted"
                          />
                        ) : (
                          <div className="h-20 w-16 sm:h-24 sm:w-20 rounded-xl bg-muted flex items-center justify-center border text-muted-foreground">
                            <ShoppingBag className="h-7 w-7" />
                          </div>
                        )}
                        {ord.items.length > 1 && (
                          <span className="absolute -bottom-1.5 -right-1.5 bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                            +{ord.items.length - 1}
                          </span>
                        )}
                      </div>

                      {/* Center: Order & Item Info */}
                      <div className="min-w-0 flex-1 space-y-1">
                        {/* Status Indicator Pill */}
                        <div className="flex items-center gap-2">
                          <StatusBadge status={ord.orderStatus} />
                          {ord.orderStatus === "delivered" && (
                            <span className="text-[11px] font-semibold text-emerald-700 hidden sm:inline">
                              Delivered {formattedDeliveredDate ? `on ${formattedDeliveredDate}` : ""}
                            </span>
                          )}
                          {ord.orderStatus === "shipping" && ord.courierName && (
                            <span className="text-[11px] font-semibold text-primary hidden sm:inline">
                              Via {ord.courierName}
                            </span>
                          )}
                        </div>

                        {/* Product Title */}
                        <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {firstItem?.heading || `Order #${ord.orderNumber}`}
                          {ord.items.length > 1 && (
                            <span className="text-xs font-normal text-muted-foreground ml-1.5">
                              (+{ord.items.length - 1} more item{ord.items.length > 2 ? "s" : ""})
                            </span>
                          )}
                        </h3>

                        {/* Item Details */}
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {firstItem?.size ? `Size: ${firstItem.size}` : ""}
                          {firstItem?.colour ? ` · ${firstItem.colour}` : ""}
                          {firstItem ? ` · Qty: ${firstItem.quantity}` : ""}
                        </p>

                        {/* Order Meta */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground pt-0.5">
                          <span className="font-medium text-foreground">Order #{ord.orderNumber}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formattedDate}
                          </span>
                          {ord.trackingId && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-[10px]">AWB: {ord.trackingId}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Price & View Details Action */}
                      <div className="shrink-0 flex items-center gap-3 sm:gap-4 pl-2">
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-bold text-foreground block">
                            {formatINR(ord.totalAmount)}
                          </span>
                          <span className="text-[11px] font-semibold text-primary group-hover:underline">
                            View Details
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
