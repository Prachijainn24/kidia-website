import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
  RotateCcw,
  Loader2,
  Check,
  AlertTriangle,
  ShoppingBag,
  Star,
} from "lucide-react";
import {
  getProduct,
  deleteProduct,
  bulkActionProducts,
  getCategories,
  toggleBestsellerApi,
  AdminProduct,
  AdminCategory,
} from "../services/adminApi";
import ProductStats from "../components/ProductStats";

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Action states
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([getProduct(), getCategories()]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error("Products load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.heading.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
        p._id.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === "all" ||
        p.categoryId === selectedCategory ||
        (p.categoryName && p.categoryName.toLowerCase().includes(selectedCategory.toLowerCase()));

      let matchesStock = true;
      if (stockFilter === "In Stock") matchesStock = (p.quantity || 0) > 3 && !p.sold;
      else if (stockFilter === "Low Stock") matchesStock = (p.quantity || 0) > 0 && (p.quantity || 0) <= 3;
      else if (stockFilter === "Sold") matchesStock = (p.quantity || 0) <= 0 || !!p.sold;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, search, selectedCategory, stockFilter]);

  const handleToggleBestseller = async (id: string, currentVal: boolean) => {
    try {
      await toggleBestsellerApi(id, !currentVal);
      showToast(!currentVal ? "Marked as Bestseller!" : "Removed from Bestsellers");
      loadData();
    } catch {
      showToast("Failed to update bestseller status");
    }
  };

  const handleDelete = async (id: string) => {
    setIsProcessing(true);
    try {
      await deleteProduct(id);
      showToast("Product design deleted successfully");
      setDeleteModalId(null);
      loadData();
    } catch {
      showToast("Failed to delete product");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (!selectedIds.length) return;
    setIsProcessing(true);
    try {
      await bulkActionProducts(action, selectedIds);
      showToast(`Bulk action applied to ${selectedIds.length} designs`);
      setSelectedIds([]);
      loadData();
    } catch {
      showToast("Bulk action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-foreground text-background text-xs font-bold px-4 py-2.5 rounded-xl shadow-soft flex items-center gap-2 animate-slideDown">
          <Check size={14} className="text-butter" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-foreground tracking-tight">
            Boutique Catalog & Designs
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Manage your boutique clothing collections, inventory stock, and piece pricing.
          </p>
        </div>

        <Link
          to="/admin/create-product"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-soft cursor-pointer"
        >
          <Plus size={15} />
          <span>Add New Design</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <ProductStats
        products={products}
        activeFilter={stockFilter}
        onCardClick={(f) => setStockFilter(stockFilter === f ? "" : f)}
      />

      {/* Filters & Search Toolbar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by piece title or ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/30 border border-border text-xs text-foreground focus:bg-card focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 py-2 px-3 rounded-xl bg-muted/30 border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {(search || selectedCategory !== "all" || stockFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setStockFilter("");
              }}
              className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/60 border border-border"
              title="Reset filters"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 px-4 flex items-center justify-between animate-fadeIn">
          <span className="text-xs font-bold text-primary">
            {selectedIds.length} designs selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction("markActive")}
              className="px-3 py-1 bg-card border border-border rounded-lg text-xs font-bold text-foreground hover:bg-muted/60"
            >
              Mark Active
            </button>
            <button
              onClick={() => handleBulkAction("markSold")}
              className="px-3 py-1 bg-card border border-border rounded-lg text-xs font-bold text-marigold hover:bg-muted/60"
            >
              Mark Sold Out
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1 bg-destructive/10 border border-destructive/20 rounded-lg text-xs font-bold text-destructive hover:bg-destructive/20"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] font-black tracking-wider bg-muted/30">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedIds.length === filteredProducts.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                </th>
                <th className="py-3 px-4">Design Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Inventory</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    <span>Loading designs catalog...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                      <p className="font-bold text-foreground">No products matched</p>
                      <p className="text-xs text-muted-foreground">
                        Try modifying your search or adding a new design piece.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isSold = (p.quantity || 0) <= 0 || p.sold;
                  const isLow = !isSold && (p.quantity || 0) <= 3;
                  const isSelected = selectedIds.includes(p._id);

                  return (
                    <tr
                      key={p._id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p._id)}
                          className="rounded text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || "/placeholder.svg"}
                            alt={p.heading}
                            className="w-12 h-12 rounded-xl object-cover border border-border/60 shrink-0 bg-muted/40"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-foreground truncate max-w-xs text-xs">
                                {p.heading}
                              </p>
                              {p.bestseller && (
                                <span className="text-[9px] font-black uppercase text-foreground bg-butter/60 border border-butter px-1.5 py-0.2 rounded shrink-0">
                                  ★ Bestseller
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {p.gender && (
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-muted/60 text-muted-foreground rounded">
                                  {p.gender}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground/80 font-mono">
                                {p._id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                        {p.categoryName || "Boutique"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-foreground text-xs">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground">{p.quantity ?? 0}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">units</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isSold
                              ? "bg-accent/15 text-accent"
                              : isLow
                              ? "bg-marigold/15 text-marigold"
                              : "bg-primary-soft/50 text-primary"
                          }`}
                        >
                          {isSold ? "Sold Out" : isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleBestseller(p._id, !!p.bestseller)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              p.bestseller
                                ? "text-marigold bg-marigold/10 hover:bg-marigold/20 border border-marigold/30"
                                : "text-muted-foreground/40 hover:text-marigold hover:bg-muted/60"
                            }`}
                            title={p.bestseller ? "Active Bestseller (Click to unmark)" : "Click to feature as Bestseller"}
                          >
                            <Star size={14} className={p.bestseller ? "fill-marigold" : ""} />
                          </button>
                          <Link
                            to={`/admin/products/${p._id}`}
                            className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-muted/60"
                            title="View piece"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${p._id}`}
                            className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-muted/60"
                            title="Edit piece"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteModalId(p._id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 cursor-pointer"
                            title="Delete"
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

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-sm w-full p-6 shadow-soft space-y-4 animate-scaleUp border border-border">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-serif font-black text-foreground text-base">Delete this product?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                This design piece will be permanently removed from the catalog.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted/60"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModalId)}
                disabled={isProcessing}
                className="flex-1 py-2 px-3 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold disabled:opacity-50"
              >
                {isProcessing ? "Deleting..." : "Delete Piece"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
