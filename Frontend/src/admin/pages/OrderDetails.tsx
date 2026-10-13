import React, { useEffect, useState, useMemo } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  AdminOrder,
} from "../services/adminApi";
import {
  ShoppingBag,
  Search,
  Check,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Eye,
  X,
  Truck,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

const OrderDetails: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Shipping Modal State
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingOrder, setShippingOrder] = useState<AdminOrder | null>(null);
  const [courierName, setCourierName] = useState("Blue Dart");
  const [trackingId, setTrackingId] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders();
      setOrders(res.data.orders || []);
    } catch {
      showToast("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    newStatus: string,
    courier?: string,
    tracking?: string
  ) => {
    // If transitioning to shipping, open courier modal first
    if (newStatus === "shipping" && (!courier || !tracking)) {
      const target = orders.find((o) => o._id === orderId);
      if (target) {
        setShippingOrder(target);
        setCourierName(target.courierName || "Blue Dart");
        setTrackingId(target.trackingId || `KID${Date.now().toString().slice(-8)}IN`);
        setShippingModalOpen(true);
        return;
      }
    }

    setActionLoadingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus, courier, tracking);
      showToast(`Order status updated to ${newStatus.toUpperCase()}`);
      await loadOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                orderStatus: newStatus as any,
                ...(courier ? { courierName: courier } : {}),
                ...(tracking ? { trackingId: tracking } : {}),
              }
            : null
        );
      }
    } catch {
      showToast("Failed to update status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingOrder) return;

    if (!courierName.trim() || !trackingId.trim()) {
      showToast("Courier name and tracking ID are required");
      return;
    }

    await handleStatusChange(
      shippingOrder._id,
      "shipping",
      courierName.trim(),
      trackingId.trim()
    );
    setShippingModalOpen(false);
    setShippingOrder(null);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
        (o.courierName && o.courierName.toLowerCase().includes(search.toLowerCase())) ||
        (o.trackingId && o.trackingId.toLowerCase().includes(search.toLowerCase())) ||
        o._id?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        o.orderStatus?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const placed = orders.filter((o) => o.orderStatus === "placed").length;
    const accepted = orders.filter((o) => o.orderStatus === "accepted").length;
    const packed = orders.filter((o) => o.orderStatus === "packed").length;
    const shipping = orders.filter((o) => o.orderStatus === "shipping").length;
    const delivered = orders.filter((o) => o.orderStatus === "delivered").length;
    const active = placed + accepted + packed + shipping;
    const revenue = orders
      .filter((o) => o.orderStatus === "delivered" || o.paymentStatus === "paid")
      .reduce((s, o) => s + (o.totalAmount || 0), 0);
    return { total, placed, accepted, packed, shipping, delivered, active, revenue };
  }, [orders]);

  return (
    <div className="space-y-6 text-left">
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
          Boutique Customer Orders
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
          Manage fulfillment status: Placed → Accepted → Packed → Shipping (Courier & AWB) → Delivered.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Orders
          </p>
          <p className="text-2xl font-display font-black text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Active Fulfillment
          </p>
          <p className="text-2xl font-display font-black text-amber-700 mt-1">{stats.active}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Delivered
          </p>
          <p className="text-2xl font-display font-black text-emerald-700 mt-1">{stats.delivered}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Total Revenue
          </p>
          <p className="text-2xl font-display font-black text-foreground mt-1">
            ₹{stats.revenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, customer, courier, AWB..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-background rounded-xl border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            "All",
            "Placed",
            "Accepted",
            "Packed",
            "Shipping",
            "Delivered",
            "Cancelled",
            "Delivery_Failed",
          ].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                statusFilter.toLowerCase() === st.toLowerCase()
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/20 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Order Details</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Courier / Tracking</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Loader2 size={24} className="animate-spin mx-auto text-primary mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <ShoppingBag size={32} className="mx-auto text-muted-foreground/40 mb-2" />
                    No customer orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <span className="font-mono text-xs">{ord.orderNumber || ord._id}</span>
                      <span className="block text-[10px] text-muted-foreground">
                        {ord.createdAt && !isNaN(new Date(ord.createdAt).getTime())
                          ? new Date(ord.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Recently"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground">{ord.customerName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {typeof ord.shippingAddress === "object"
                          ? ord.shippingAddress?.city
                          : "Customer address"}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.items && ord.items.length > 0 ? (
                        <div>
                          <p className="font-bold text-foreground truncate max-w-xs">
                            {ord.items[0]?.heading}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Qty: {ord.items[0]?.quantity} • Size: {ord.items[0]?.size || "Std"}
                            {ord.items.length > 1 && ` (+${ord.items.length - 1} more)`}
                          </p>
                        </div>
                      ) : (
                        "Boutique item"
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground capitalize">{ord.paymentMethod || "Online"}</p>
                      <span
                        className={`text-[9px] font-extrabold uppercase ${
                          ord.paymentStatus === "paid" ? "text-emerald-700 font-bold" : "text-amber-600"
                        }`}
                      >
                        {ord.paymentStatus || "paid"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.courierName ? (
                        <div>
                          <p className="font-bold text-foreground text-[11px] flex items-center gap-1">
                            <Truck size={12} className="text-primary" />
                            {ord.courierName}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            {ord.trackingId}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Not assigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-black text-foreground text-xs whitespace-nowrap">
                      ₹{ord.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.orderStatus}
                        disabled={actionLoadingId === ord._id}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                          ord.orderStatus === "delivered"
                            ? "bg-emerald-500/15 text-emerald-800 border-emerald-500/30"
                            : ord.orderStatus === "shipping"
                            ? "bg-primary/10 text-primary border-primary/30"
                            : ord.orderStatus === "packed"
                            ? "bg-purple-500/10 text-purple-800 border-purple-500/20"
                            : ord.orderStatus === "accepted"
                            ? "bg-blue-500/10 text-blue-800 border-blue-500/20"
                            : ord.orderStatus === "cancelled" || ord.orderStatus === "delivery_failed"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-amber-500/15 text-amber-900 border-amber-500/30"
                        }`}
                      >
                        <option value="placed">Placed</option>
                        <option value="accepted">Accepted</option>
                        <option value="packed">Packed</option>
                        <option value="shipping">Shipping</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="delivery_failed">Delivery Failed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-muted/60 cursor-pointer"
                        title="View Full Order Details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipping Details Modal (Input Courier Name & Tracking ID) */}
      {shippingModalOpen && shippingOrder && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-soft space-y-4 animate-scaleUp text-left border border-border">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <h3 className="font-serif font-black text-foreground text-base">
                  Dispatch & Shipping Details
                </h3>
              </div>
              <button
                onClick={() => setShippingModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Provide courier partner and tracking AWB for order{" "}
              <strong>#{shippingOrder.orderNumber || shippingOrder._id}</strong>. Customer will see this in their My Orders dashboard.
            </p>

            <form onSubmit={handleConfirmShipping} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Courier Partner Name *</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Blue Dart">Blue Dart Express</option>
                  <option value="Delhivery">Delhivery Logistics</option>
                  <option value="DTDC">DTDC Courier</option>
                  <option value="FedEx">FedEx Express</option>
                  <option value="India Post">India Post Speed Post</option>
                  <option value="Shadowfax">Shadowfax</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Tracking ID / AWB Number *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. BD123456789IN"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border bg-background font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShippingModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
                >
                  Confirm & Mark Shipping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-lg w-full p-6 shadow-soft space-y-4 animate-scaleUp text-left max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-serif font-black text-foreground text-base">
                  Order #{selectedOrder.orderNumber || selectedOrder._id}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Placed on{" "}
                  {selectedOrder.createdAt && !isNaN(new Date(selectedOrder.createdAt).getTime())
                    ? new Date(selectedOrder.createdAt).toLocaleString("en-IN")
                    : "Recently"}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer Details */}
            <div className="p-3 bg-muted/20 rounded-xl space-y-1.5 text-xs border border-border/60">
              <p className="font-bold text-foreground">{selectedOrder.customerName}</p>
              <p className="text-muted-foreground flex items-center gap-1.5">
                <Mail size={12} /> {selectedOrder.customerEmail}
              </p>
              <p className="text-muted-foreground flex items-center gap-1.5">
                <Phone size={12} /> {selectedOrder.customerPhone || "Not provided"}
              </p>
              <p className="text-muted-foreground flex items-center gap-1.5">
                <MapPin size={12} />
                {typeof selectedOrder.shippingAddress === "object"
                  ? `${selectedOrder.shippingAddress.addressLine || selectedOrder.shippingAddress.address || ""}, ${selectedOrder.shippingAddress.city || ""}, ${selectedOrder.shippingAddress.state || ""} - ${selectedOrder.shippingAddress.pincode || ""}`
                  : String(selectedOrder.shippingAddress)}
              </p>
            </div>

            {/* Courier Details if any */}
            {selectedOrder.courierName && (
              <div className="p-3 bg-primary/5 rounded-xl text-xs border border-primary/20 space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1">
                  <Truck size={13} className="text-primary" /> Courier: {selectedOrder.courierName}
                </p>
                <p className="text-muted-foreground font-mono">AWB: {selectedOrder.trackingId}</p>
              </div>
            )}

            {/* Items */}
            <div className="space-y-2">
              <p className="font-bold text-foreground text-xs uppercase tracking-wider">
                Order Items ({selectedOrder.items?.length || 0})
              </p>
              <div className="divide-y border rounded-xl overflow-hidden">
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-foreground">{it.heading}</p>
                      <p className="text-muted-foreground text-[11px]">
                        Qty: {it.quantity} {it.size ? `• Size: ${it.size}` : ""}{" "}
                        {it.colour ? `• ${it.colour}` : ""}
                      </p>
                    </div>
                    <span className="font-black text-foreground">
                      ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t font-black text-sm">
              <span>Total Amount:</span>
              <span className="text-base text-primary">
                ₹{selectedOrder.totalAmount?.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Quick Status Changers */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-muted-foreground block mb-1.5 uppercase">
                Fast Status Action:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["placed", "accepted", "packed", "shipping", "delivered", "cancelled"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedOrder._id, st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-colors ${
                      selectedOrder.orderStatus === st
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
