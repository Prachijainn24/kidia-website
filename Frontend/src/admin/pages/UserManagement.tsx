import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  allUsers,
  deleteUserApi,
  toggleUserSuspensionApi,
  addCustomerApi,
  getAllOrders,
  AdminUser,
  AdminOrder,
} from "../services/adminApi";
import { formatINR } from "@/data/catalog";
import {
  Users,
  Search,
  Trash2,
  UserMinus,
  UserCheck,
  Loader2,
  Check,
  Mail,
  Phone,
  Calendar,
  UserPlus,
  X,
  Eye,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  AlertTriangle,
} from "lucide-react";

export const OrderStatusPill: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case "placed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20">
          <Clock size={10} className="text-amber-600" /> Placed
        </span>
      );
    case "accepted":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-800 border border-blue-500/20">
          <Check size={10} className="text-blue-600" /> Accepted
        </span>
      );
    case "packed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-800 border border-purple-500/20">
          <Package size={10} className="text-purple-600" /> Packed
        </span>
      );
    case "shipping":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
          <Truck size={10} /> In Transit
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/15 text-emerald-800 border border-emerald-600/30">
          <CheckCircle2 size={10} className="text-emerald-600" /> Delivered
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
          <XCircle size={10} /> Cancelled
        </span>
      );
    case "delivery_failed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-900 border border-red-500/30">
          <AlertTriangle size={10} /> Failed
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground capitalize">
          {status}
        </span>
      );
  }
};

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Add customer modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("Customer@123");
  const [formStatus, setFormStatus] = useState("active");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, ordersRes] = await Promise.all([
        allUsers(),
        getAllOrders(),
      ]);
      setUsers(usersRes.data.users || []);
      setOrders(ordersRes.data.orders || []);
    } catch (err) {
      console.warn("Failed to load users and orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCustomerOrders = (customer: AdminUser): AdminOrder[] => {
    return orders.filter(
      (o) =>
        (o.userId && o.userId === customer._id) ||
        (o.customerEmail && o.customerEmail.toLowerCase() === customer.email.toLowerCase())
    );
  };

  const getCustomerTotalSpent = (customer: AdminUser): number => {
    const custOrders = getCustomerOrders(customer);
    return custOrders
      .filter((o) => o.orderStatus !== "cancelled" && o.orderStatus !== "delivery_failed")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast("Name and email are required");
      return;
    }

    setSubmitting(true);
    try {
      await addCustomerApi({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        password: formPassword.trim() || "Customer@123",
        status: formStatus,
      });

      showToast("Customer account created successfully!");
      setIsAddModalOpen(false);
      setFormName("");
      setFormEmail("");
      setFormPhone("");
      setFormPassword("Customer@123");
      setFormStatus("active");
      await loadData();
    } catch (err: any) {
      showToast("Error: " + (err?.message || "Failed to create customer"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleUserSuspensionApi(id);
      showToast("User account status updated");
      loadData();
    } catch {
      showToast("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer record?")) return;
    try {
      await deleteUserApi(id);
      showToast("User record removed");
      loadData();
    } catch {
      showToast("Failed to delete user");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone && u.phone.includes(search))
    );
  }, [users, search]);

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-foreground text-background text-xs font-bold px-4 py-2.5 rounded-xl shadow-soft flex items-center gap-2 animate-slideDown">
          <Check size={14} className="text-butter" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-foreground tracking-tight">
            Customers & Profiles
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Manage registered customer accounts, inspect lifetime spend, order history, and saved addresses.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-soft cursor-pointer shrink-0"
        >
          <UserPlus size={15} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-soft flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-muted/20 border border-border text-xs text-foreground focus:bg-card focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground">
          {filteredUsers.length} total customers
        </span>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] font-black tracking-wider bg-muted/30">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    <span>Loading customer profiles & orders...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="font-bold text-foreground">No customers registered yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Customers will appear here when they register or place orders on the storefront.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const custOrders = getCustomerOrders(u);
                  const custSpent = getCustomerTotalSpent(u);

                  return (
                    <tr
                      key={u._id}
                      onClick={() => navigate(`/admin/users/${u._id}`)}
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20 text-xs group-hover:scale-105 transition-transform">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              to={`/admin/users/${u._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-foreground text-xs group-hover:text-primary transition-colors hover:underline block truncate"
                              title="View Customer Profile"
                            >
                              {u.name}
                            </Link>
                            <p className="text-[10px] text-muted-foreground font-mono">{u._id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <Mail size={12} className="text-muted-foreground" />
                            <span>{u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                              <Phone size={11} className="text-muted-foreground" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-foreground border border-border">
                          <ShoppingBag size={10} className="text-primary" />
                          {custOrders.length} {custOrders.length === 1 ? "order" : "orders"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground text-xs">
                          {formatINR(custSpent)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-muted-foreground" />
                          <span>
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Recent"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.status === "active"
                              ? "bg-primary-soft/50 text-primary"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/users/${u._id}`);
                            }}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 cursor-pointer inline-flex items-center justify-center transition-colors"
                            title="View Customer Profile & Orders"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(u._id);
                            }}
                            className={`p-1.5 rounded-lg hover:bg-muted/60 cursor-pointer ${
                              u.status === "active"
                                ? "text-muted-foreground hover:text-marigold"
                                : "text-marigold hover:text-primary"
                            }`}
                            title={u.status === "active" ? "Suspend user" : "Activate user"}
                          >
                            {u.status === "active" ? <UserMinus size={14} /> : <UserCheck size={14} />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(u._id);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-soft relative text-left">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h3 className="text-base font-serif font-black text-foreground">Add Customer</h3>
                  <p className="text-[11px] text-muted-foreground">Create customer profile in Supabase</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ananya Roy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-card transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-card transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-card transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Temporary Password</label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-card transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Initial Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted/60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-soft cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
