import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  allUsers,
  getAllOrders,
  toggleUserSuspensionApi,
  deleteUserApi,
  AdminUser,
  AdminOrder,
} from "../services/adminApi";
import { getSavedAddresses } from "@/services/addressService";
import { formatINR } from "@/data/catalog";
import { OrderStatusPill } from "./UserManagement";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Loader2,
  Trash2,
  UserMinus,
  UserCheck,
  Check,
  Clock,
  Package,
} from "lucide-react";

const CustomerDetailView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<AdminUser | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const loadCustomerData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [usersRes, ordersRes] = await Promise.all([
        allUsers(),
        getAllOrders(),
      ]);

      const foundUser = (usersRes.data.users || []).find(
        (u) => u._id === userId || u.email.toLowerCase() === userId.toLowerCase()
      );

      setCustomer(foundUser || null);
      setOrders(ordersRes.data.orders || []);
    } catch (err) {
      console.warn("Failed to load customer profile:", err);
      showToast("Could not load customer data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [userId]);

  const handleToggleStatus = async () => {
    if (!customer) return;
    try {
      await toggleUserSuspensionApi(customer._id);
      setCustomer({
        ...customer,
        status: customer.status === "active" ? "suspended" : "active",
      });
      showToast("Customer status updated successfully.");
    } catch {
      showToast("Failed to update status");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customer) return;
    if (!window.confirm(`Are you sure you want to delete customer ${customer.name}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteUserApi(customer._id);
      showToast("Customer record deleted.");
      setTimeout(() => navigate("/admin/users"), 1000);
    } catch {
      showToast("Failed to delete customer");
    }
  };

  const customerOrders = useMemo(() => {
    if (!customer) return [];
    return orders.filter(
      (o) =>
        (o.userId && o.userId === customer._id) ||
        (o.customerEmail && o.customerEmail.toLowerCase() === customer.email.toLowerCase())
    );
  }, [customer, orders]);

  const totalSpent = useMemo(() => {
    return customerOrders
      .filter((o) => o.orderStatus !== "cancelled" && o.orderStatus !== "delivery_failed")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [customerOrders]);

  const aov = useMemo(() => {
    return customerOrders.length > 0 ? Math.round(totalSpent / customerOrders.length) : 0;
  }, [customerOrders, totalSpent]);

  const deliveredCount = useMemo(() => {
    return customerOrders.filter((o) => o.orderStatus === "delivered").length;
  }, [customerOrders]);

  const activeOrdersCount = useMemo(() => {
    return customerOrders.filter(
      (o) =>
        o.orderStatus !== "delivered" &&
        o.orderStatus !== "cancelled" &&
        o.orderStatus !== "delivery_failed"
    ).length;
  }, [customerOrders]);

  const savedAddresses = useMemo(() => {
    if (!customer) return [];
    const local = getSavedAddresses(customer._id);
    const fromOrders = customerOrders
      .map((o) => o.shippingAddress)
      .filter((a) => a && (a.addressLine || a.address || a.city));

    const list: any[] = [...local];
    for (const ordAddr of fromOrders) {
      const line = ordAddr.addressLine || ordAddr.address || "";
      if (line && !list.some((ex) => (ex.addressLine || ex.address) === line)) {
        list.push({
          id: `ord_${Math.random().toString(36).substring(2, 7)}`,
          fullName: ordAddr.fullName || customer.name,
          phone: ordAddr.phone || customer.phone || "",
          addressLine: line,
          city: ordAddr.city || "",
          state: ordAddr.state || "",
          pincode: ordAddr.pincode || "",
          isDefault: list.length === 0,
        });
      }
    }
    return list;
  }, [customer, customerOrders]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Loading customer details...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <Users className="w-12 h-12 text-muted-foreground/40 mx-auto" />
        <h2 className="text-xl font-serif font-black text-foreground">Customer Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The customer profile with ID <code>{userId}</code> could not be located.
        </p>
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
        >
          <ArrowLeft size={14} /> Back to Customers List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-foreground text-background text-xs font-bold px-4 py-2.5 rounded-xl shadow-soft flex items-center gap-2 animate-slideDown">
          <Check size={14} className="text-butter" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between border-b pb-4">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Customers</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              customer.status === "active"
                ? "border-amber-500/30 text-amber-800 bg-amber-500/10 hover:bg-amber-500/20"
                : "border-primary/30 text-primary bg-primary/10 hover:bg-primary/20"
            }`}
          >
            {customer.status === "active" ? (
              <>
                <UserMinus size={13} /> Suspend Account
              </>
            ) : (
              <>
                <UserCheck size={13} /> Activate Account
              </>
            )}
          </button>
          <button
            onClick={handleDeleteCustomer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/15 transition-colors cursor-pointer"
          >
            <Trash2 size={13} /> Delete Record
          </button>
        </div>
      </div>

      {/* Customer Profile Banner */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-black text-2xl flex items-center justify-center shrink-0 shadow-soft">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-foreground">
                {customer.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  customer.status === "active"
                    ? "bg-primary-soft/50 text-primary border border-primary/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {customer.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-secondary text-muted-foreground border">
                {customer.role}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
              <span>Customer ID: <code className="font-mono">{customer._id}</code></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Joined {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently"}
              </span>
            </p>
          </div>
        </div>

        {/* Contact Links */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <a
            href={`mailto:${customer.email}`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-xs font-semibold text-foreground border transition-colors"
          >
            <Mail size={13} className="text-primary" />
            <span>{customer.email}</span>
          </a>
          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-xs font-semibold text-foreground border transition-colors"
            >
              <Phone size={13} className="text-primary" />
              <span>{customer.phone}</span>
            </a>
          )}
        </div>
      </div>

      {/* 4 Financial & Order Metrics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-primary/20 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lifetime Spent</span>
            <CreditCard size={15} className="text-primary" />
          </div>
          <div className="text-2xl font-serif font-black text-foreground">
            {formatINR(totalSpent)}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Total value of all orders</span>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag size={15} className="text-primary" />
          </div>
          <div className="text-2xl font-serif font-black text-foreground">
            {customerOrders.length}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {activeOrdersCount} in progress · {deliveredCount} delivered
          </span>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Order</span>
            <TrendingUp size={15} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-black text-foreground">
            {formatINR(aov)}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">AOV across transactions</span>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-black text-foreground">
            {deliveredCount} / {customerOrders.length}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Completed deliveries</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left Column: Orders History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-black text-foreground flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary" />
              <span>Order History ({customerOrders.length})</span>
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All Store Orders</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          {customerOrders.length === 0 ? (
            <div className="border border-dashed border-border rounded-3xl p-10 text-center bg-card">
              <Package size={36} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-bold text-foreground text-sm">No Orders Placed Yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                This customer hasn't purchased any boutique items yet. Future orders will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="bg-card border border-border/80 rounded-3xl p-5 shadow-soft space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-foreground">
                          #{ord.orderNumber || ord._id.slice(0, 8)}
                        </span>
                        <OrderStatusPill status={ord.orderStatus} />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Placed on {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-foreground block">
                        {formatINR(ord.totalAmount)}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {ord.paymentMethod} • {ord.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2.5">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <img
                          src={it.image || "/placeholder.svg"}
                          alt={it.heading}
                          className="w-12 h-12 rounded-xl object-cover border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground truncate">{it.heading}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Size: <span className="font-medium text-foreground">{it.size || "Standard"}</span>
                            {it.colour && ` · Colour: ${it.colour}`} · Quantity: {it.quantity}
                          </p>
                        </div>
                        <span className="font-bold text-foreground shrink-0">
                          {formatINR(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer with address & link */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t text-[11px] text-muted-foreground">
                    <span className="truncate">
                      📍 Ship to: {ord.shippingAddress?.addressLine || ord.shippingAddress?.address || ord.shippingAddress?.city || "Address on file"}
                    </span>
                    <Link
                      to="/admin/orders"
                      className="font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>Manage Order Status</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Customer Details & Saved Addresses */}
        <div className="space-y-6">
          {/* Customer Saved Delivery Addresses */}
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-soft space-y-4">
            <h3 className="font-serif font-black text-base text-foreground flex items-center gap-2 border-b pb-3">
              <MapPin size={16} className="text-primary" />
              <span>Saved Delivery Addresses ({savedAddresses.length})</span>
            </h3>

            {savedAddresses.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No delivery addresses recorded for this user.
              </p>
            ) : (
              <div className="space-y-3">
                {savedAddresses.map((addr: any, idx: number) => (
                  <div
                    key={addr.id || idx}
                    className="p-3.5 rounded-2xl border border-border/70 bg-muted/20 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        {addr.fullName || customer.name}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[9px] font-extrabold uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-foreground/80 leading-relaxed">
                      {addr.addressLine || addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    {addr.phone && (
                      <p className="text-muted-foreground text-[11px]">
                        📞 {addr.phone}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Meta Box */}
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-soft space-y-3 text-xs">
            <h3 className="font-serif font-black text-base text-foreground border-b pb-2">
              Account Overview
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex justify-between">
                <span>Account Role:</span>
                <span className="font-bold text-foreground capitalize">{customer.role}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span className="font-bold text-foreground capitalize">{customer.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Member Since:</span>
                <span className="font-bold text-foreground">
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Verified Buyer:</span>
                <span className="font-bold text-emerald-700">{customerOrders.length > 0 ? "Yes ✓" : "No"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailView;
