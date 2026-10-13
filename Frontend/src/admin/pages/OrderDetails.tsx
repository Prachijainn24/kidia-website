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
} from "lucide-react";

const OrderDetails: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setActionLoadingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`);
      loadOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus as any });
      }
    } catch {
      showToast("Failed to update status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
        o._id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        o.orderStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.orderStatus === "pending").length;
    const processing = orders.filter((o) => o.orderStatus === "processing").length;
    const delivered = orders.filter((o) => o.orderStatus === "delivered").length;
    const revenue = orders
      .filter((o) => o.orderStatus === "delivered" || o.paymentStatus === "paid")
      .reduce((s, o) => s + (o.totalAmount || 0), 0);
    return { total, pending, processing, delivered, revenue };
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
          Track customer purchases, packing progress, shipping status, and order totals.
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
          <p className="text-[11px] font-bold text-marigold uppercase tracking-wider">
            Pending Confirmation
          </p>
          <p className="text-2xl font-display font-black text-foreground mt-1">{stats.pending}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
            In Processing
          </p>
          <p className="text-2xl font-display font-black text-foreground mt-1">{stats.processing}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Fulfilled Revenue
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
            placeholder="Search customer, order ID, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/20 border border-border text-xs text-foreground focus:bg-card focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/60 border border-border"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] font-black tracking-wider bg-muted/30">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Ordered</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Total (₹)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    <span>Loading customer orders...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="font-bold text-foreground">No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <span className="font-mono text-xs">{ord.orderNumber || ord._id}</span>
                      <span className="block text-[10px] text-muted-foreground">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground">{ord.customerName}</p>
                      <p className="text-[10px] text-muted-foreground">{ord.shippingAddress?.city}</p>
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
                        "Boutique piece"
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground capitalize">{ord.paymentMethod}</p>
                      <span
                        className={`text-[9px] font-extrabold uppercase ${
                          ord.paymentStatus === "paid" ? "text-primary font-bold" : "text-marigold"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-foreground text-xs">
                      ₹{ord.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.orderStatus}
                        disabled={actionLoadingId === ord._id}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                          ord.orderStatus === "delivered"
                            ? "bg-primary-soft/50 text-primary border-primary/20"
                            : ord.orderStatus === "processing"
                            ? "bg-butter/60 text-foreground border-butter"
                            : ord.orderStatus === "shipped"
                            ? "bg-sky/50 text-foreground border-sky"
                            : ord.orderStatus === "cancelled"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-peach/60 text-foreground border-peach"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-muted/60 cursor-pointer"
                        title="View Order Details"
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-lg w-full p-6 shadow-soft space-y-4 animate-scaleUp text-left max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-serif font-black text-foreground text-base">
                  Order {selectedOrder.orderNumber || selectedOrder._id}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
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
                <Phone size={12} /> {selectedOrder.customerPhone}
              </p>
              <p className="text-muted-foreground flex items-center gap-1.5">
                <MapPin size={12} />
                {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city},{" "}
                {selectedOrder.shippingAddress?.pincode}
              </p>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                Ordered Designs
              </h4>
              <div className="divide-y divide-border/40 border border-border/60 rounded-xl overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-card">
                    <div>
                      <p className="font-bold text-foreground">{item.heading}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Size: {item.size || "1-2Y"} • Color: {item.colour || "Standard"} • Qty:{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <span className="font-black text-foreground">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Total Paid / COD</span>
              <span className="text-lg font-serif font-black text-foreground">
                ₹{selectedOrder.totalAmount?.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Status Selector */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-foreground">Update Order Status:</span>
              <select
                value={selectedOrder.orderStatus}
                onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-border text-xs font-bold text-foreground bg-card cursor-pointer focus:outline-none focus:border-primary"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
