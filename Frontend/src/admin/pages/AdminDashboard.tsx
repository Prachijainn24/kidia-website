import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  IndianRupee,
  Users,
  Eye,
  Plus,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { getDashboardData } from "../services/adminApi";
import KpiCard from "../components/dashboard/KpiCard";
import SalesTrendChart from "../components/dashboard/SalesTrendChart";
import OrdersPieChart from "../components/dashboard/OrdersPieChart";
import CategoryChart from "../components/dashboard/CategoryChart";
import InventoryChart from "../components/dashboard/InventoryChart";
import TopProductsChart from "../components/dashboard/TopProductsChart";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");
  const [data, setData] = useState<any>({
    totalPro: 0,
    totalOrd: 0,
    totalRev: 0,
    totalUse: 0,
    totalCon: 0,
    orders: [],
    products: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDashboardData(null, timeFilter);
      setData(res);
    } catch (err) {
      console.error("Dashboard data load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeFilter]);

  // Chart data calculations
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    (data.products || []).forEach((p: any) => {
      const cat = p.categoryName || "Other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data.products]);

  const ordersPieData = useMemo(() => {
    const counts: Record<string, number> = {
      placed: 0,
      accepted: 0,
      packed: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
    };
    (data.orders || []).forEach((o: any) => {
      const st = (o.orderStatus || "placed").toLowerCase();
      if (counts[st] !== undefined) counts[st]++;
      else if (st === "pending") counts.placed++;
      else if (st === "processing") counts.packed++;
      else if (st === "shipped") counts.shipping++;
      else counts.placed = (counts.placed || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [data.orders]);

  const inventoryData = useMemo(() => {
    let healthy = 0;
    let low = 0;
    let out = 0;
    (data.products || []).forEach((p: any) => {
      const qty = p.quantity ?? 0;
      if (qty <= 0 || p.sold) out++;
      else if (qty <= 5) low++;
      else healthy++;
    });
    return [
      { name: "Healthy Stock", value: healthy },
      { name: "Low Stock (<5)", value: low },
      { name: "Out of Stock", value: out },
    ];
  }, [data.products]);

  const salesTrendData = useMemo(() => {
    const sorted = [...(data.orders || [])].sort(
      (a: any, b: any) =>
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );

    const dateMap: Record<string, { revenue: number; orders: number }> = {};
    sorted.forEach((o: any) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      const key = `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
      if (!dateMap[key]) {
        dateMap[key] = { revenue: 0, orders: 0 };
      }
      dateMap[key].revenue += Number(o.totalAmount || 0);
      dateMap[key].orders += 1;
    });

    return Object.entries(dateMap).map(([date, val]) => ({
      date,
      revenue: val.revenue,
      orders: val.orders,
    }));
  }, [data.orders]);

  const topProductsData = useMemo(() => {
    const productSalesMap: Record<string, { name: string; revenue: number; quantity: number }> = {};

    (data.orders || []).forEach((order: any) => {
      (order.items || []).forEach((item: any) => {
        const title = item.heading || item.title || item.name || "Boutique Item";
        if (!productSalesMap[title]) {
          productSalesMap[title] = { name: title, revenue: 0, quantity: 0 };
        }
        productSalesMap[title].quantity += item.quantity || 1;
        productSalesMap[title].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    const list = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);
    if (list.length === 0) return [];

    const maxQty = Math.max(...list.map((l) => l.quantity), 1);
    return list.slice(0, 5).map((prod) => ({
      ...prod,
      percentage: Math.round((prod.quantity / maxQty) * 100),
    }));
  }, [data.orders]);

  if (loading && !data.products.length) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 text-left">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-foreground tracking-tight">
            Store Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Live orders, catalog metrics, and inventory analytics for KIDIA Boutique.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer shadow-soft"
            title="Refresh metrics"
          >
            <RefreshCw size={15} />
          </button>
          <Link
            to="/admin/create-product"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-soft cursor-pointer"
          >
            <Plus size={15} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Total Store Revenue"
          value={`₹${(data.totalRev || 0).toLocaleString("en-IN")}`}
          icon={IndianRupee}
          badge="Live"
          subtitle={
            data.totalRev > 0
              ? "Live store order revenue"
              : "Fresh launch • ₹0 recorded"
          }
        />
        <KpiCard
          title="Customer Orders"
          value={data.totalOrd || 0}
          icon={ShoppingCart}
          subtitle={
            data.totalOrd > 0
              ? `${data.totalOrd} completed orders`
              : "0 orders • Awaiting checkout"
          }
        />
        <KpiCard
          title="Catalog Designs"
          value={data.totalPro || 0}
          icon={Package}
          subtitle={`${data.totalPro || 0} active designs on store`}
        />
        <KpiCard
          title="Registered Customers"
          value={data.totalUse || 0}
          icon={Users}
          subtitle={
            data.totalUse > 0
              ? `${data.totalUse} boutique accounts`
              : "0 customers • Ready for signups"
          }
        />
      </div>

      {/* Primary Charts (Sales Trend + Orders Fulfillment) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <SalesTrendChart
            data={salesTrendData}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
          />
        </div>
        <div className="lg:col-span-4">
          <OrdersPieChart data={ordersPieData} />
        </div>
      </div>

      {/* Secondary Charts (Category Breakdown + Inventory + Top Products) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CategoryChart data={categoryChartData} />
        <InventoryChart data={inventoryData} />
        <TopProductsChart data={topProductsData} />
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-serif font-black text-foreground tracking-tight">
              Recent Boutique Orders
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Latest customer purchases placed on the storefront.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] font-black tracking-wider bg-muted/30">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {(data.orders || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                    No orders placed yet. Orders will automatically appear here once customers checkout.
                  </td>
                </tr>
              ) : (
                (data.orders || []).slice(0, 5).map((ord: any) => (
                  <tr key={ord._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-foreground">
                      {ord.orderNumber || ord._id}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-foreground">{ord.customerName}</p>
                      <p className="text-[10px] text-muted-foreground">{ord.shippingAddress?.city}</p>
                    </td>
                    <td className="py-3 px-3">
                      {ord.items?.length ? ord.items[0]?.heading : "Boutique Item"}
                      {ord.items?.length > 1 && (
                        <span className="text-[10px] text-muted-foreground/80 ml-1">
                          +{ord.items.length - 1} more
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-foreground">
                      ₹{ord.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          ord.orderStatus === "delivered"
                            ? "bg-primary-soft/50 text-primary"
                            : ord.orderStatus === "processing"
                            ? "bg-butter/60 text-foreground"
                            : ord.orderStatus === "shipped"
                            ? "bg-sky/50 text-foreground"
                            : ord.orderStatus === "cancelled"
                            ? "bg-accent/15 text-accent"
                            : "bg-peach/60 text-foreground"
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to="/admin/orders"
                        className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-muted/60 inline-block"
                        title="View order"
                      >
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
