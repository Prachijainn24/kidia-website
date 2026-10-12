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
  Calendar,
  IndianRupee,
  Eye,
  X,
  Truck,
  RotateCcw,
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
        <div className="fixed top-20 right-6 z-50 bg-dark-navy text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-slideDown">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-dark-navy tracking-tight font-sans">
          Boutique Customer Orders
        </h1>
        <p className="text-xs sm:text-sm text-muted-gray mt-1 font-medium">
          Track customer purchases, packing progress, shipping status, and order totals.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-muted-gray uppercase tracking-wider">
            Total Orders
          </p>
          <p className="text-2xl font-black text-dark-navy mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Pending Confirmation
          </p>
          <p className="text-2xl font-black text-dark-navy mt-1">{stats.pending}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            In Processing
          </p>
          <p className="text-2xl font-black text-dark-navy mt-1">{stats.processing}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Fulfilled Revenue
          </p>
          <p className="text-2xl font-black text-dark-navy mt-1">
            ₹{stats.revenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, order ID, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-dark-navy focus:bg-white focus:outline-none focus:border-[#0F9D8A]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? "bg-[#0F9D8A] text-white shadow-xs"
                  : "bg-slate-50 text-muted-gray hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-muted-gray uppercase text-[10px] font-black tracking-wider bg-slate-50/70">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Ordered</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Total (₹)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-gray">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0F9D8A] mb-2" />
                    <span>Loading customer orders...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-gray">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-dark-navy">No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-dark-navy">
                      <span className="font-mono text-xs">{ord.orderNumber || ord._id}</span>
                      <span className="block text-[10px] text-muted-gray">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-dark-navy">{ord.customerName}</p>
                      <p className="text-[10px] text-muted-gray">{ord.shippingAddress?.city}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.items && ord.items.length > 0 ? (
                        <div>
                          <p className="font-bold text-dark-navy truncate max-w-xs">
                            {ord.items[0]?.heading}
                          </p>
                          <p className="text-[10px] text-muted-gray">
                            Qty: {ord.items[0]?.quantity} • Size: {ord.items[0]?.size || "Std"}
                            {ord.items.length > 1 && ` (+${ord.items.length - 1} more)`}
                          </p>
                        </div>
                      ) : (
                        "Boutique piece"
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-dark-navy capitalize">{ord.paymentMethod}</p>
                      <span
                        className={`text-[9px] font-extrabold uppercase ${
                          ord.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-dark-navy text-xs">
                      ₹{ord.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.orderStatus}
                        disabled={actionLoadingId === ord._id}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                          ord.orderStatus === "delivered"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : ord.orderStatus === "processing"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : ord.orderStatus === "shipped"
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : ord.orderStatus === "cancelled"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
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
                        className="p-1.5 text-slate-400 hover:text-[#0F9D8A] rounded-lg hover:bg-slate-100 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-dark-navy text-base">
                  Order {selectedOrder.orderNumber || selectedOrder._id}
                </h3>
                <p className="text-[11px] text-muted-gray">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-dark-navy rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer Details */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
              <p className="font-bold text-dark-navy">{selectedOrder.customerName}</p>
              <p className="text-muted-gray flex items-center gap-1.5">
                <Mail size={12} /> {selectedOrder.customerEmail}
              </p>
              <p className="text-muted-gray flex items-center gap-1.5">
                <Phone size={12} /> {selectedOrder.customerPhone}
              </p>
              <p className="text-muted-gray flex items-center gap-1.5">
                <MapPin size={12} />
                {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city},{" "}
                {selectedOrder.shippingAddress?.pincode}
              </p>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-muted-gray uppercase tracking-wider">
                Ordered Designs
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div>
                      <p className="font-bold text-dark-navy">{item.heading}</p>
                      <p className="text-[10px] text-muted-gray">
                        Size: {item.size || "1-2Y"} • Color: {item.colour || "Standard"} • Qty:{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <span className="font-black text-dark-navy">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-gray">Total Paid / COD</span>
              <span className="text-lg font-black text-dark-navy">
                ₹{selectedOrder.totalAmount?.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Status Selector */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-dark-navy">Update Order Status:</span>
              <select
                value={selectedOrder.orderStatus}
                onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-dark-navy bg-slate-50 cursor-pointer"
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
