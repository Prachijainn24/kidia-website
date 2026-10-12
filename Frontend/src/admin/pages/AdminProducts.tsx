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
  X,
  AlertTriangle,
  ChevronDown,
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
      setDeleteModalId(null);
      showToast("Design removed from catalog");
      loadData();
    } catch (err) {
      showToast("Failed to delete design");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (!selectedIds.length) return;
    setIsProcessing(true);
    try {
      await bulkActionProducts({ action, ids: selectedIds });
      setSelectedIds([]);
      showToast(`Bulk ${action} completed successfully`);
      loadData();
    } catch {
      showToast("Bulk operation failed");
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
        <div className="fixed top-20 right-6 z-50 bg-dark-navy text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-slideDown">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-dark-navy tracking-tight font-sans">
            Boutique Catalog & Designs
          </h1>
          <p className="text-xs sm:text-sm text-muted-gray mt-1 font-medium">
            Manage your boutique clothing collections, inventory stock, and piece pricing.
          </p>
        </div>

        <Link
          to="/admin/create-product"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F9D8A] hover:bg-[#0C7D6E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by piece title or ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-dark-navy focus:bg-white focus:outline-none focus:border-[#0F9D8A] transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-muted-gray focus:outline-none focus:border-[#0F9D8A] cursor-pointer"
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
              className="p-2 text-muted-gray hover:text-dark-navy rounded-xl hover:bg-slate-100 border border-slate-200"
              title="Reset filters"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#0F9D8A]/10 border border-[#0F9D8A]/20 rounded-2xl p-3 px-4 flex items-center justify-between animate-fadeIn">
          <span className="text-xs font-bold text-[#0F9D8A]">
            {selectedIds.length} designs selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction("markActive")}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-dark-navy hover:bg-slate-50"
            >
              Mark Active
            </button>
            <button
              onClick={() => handleBulkAction("markSold")}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-amber-700 hover:bg-slate-50"
            >
              Mark Sold Out
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-100"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-muted-gray uppercase text-[10px] font-black tracking-wider bg-slate-50/70">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedIds.length === filteredProducts.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-[#0F9D8A] focus:ring-[#0F9D8A]"
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
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-gray">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0F9D8A] mb-2" />
                    <span>Loading designs catalog...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-gray">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-dark-navy">No products matched</p>
                      <p className="text-xs text-muted-gray">
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
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-teal-50/30" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p._id)}
                          className="rounded text-[#0F9D8A] focus:ring-[#0F9D8A]"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || "/placeholder.svg"}
                            alt={p.heading}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-dark-navy truncate max-w-xs text-xs">
                                {p.heading}
                              </p>
                              {p.bestseller && (
                                <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded shrink-0">
                                  ★ Bestseller
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {p.gender && (
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                  {p.gender}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                {p._id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-gray font-semibold">
                        {p.categoryName || "Boutique"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-dark-navy text-xs">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-dark-navy">{p.quantity ?? 0}</span>
                        <span className="text-[10px] text-muted-gray ml-1">units</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isSold
                              ? "bg-rose-50 text-rose-700"
                              : isLow
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
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
                                ? "text-amber-500 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                                : "text-slate-300 hover:text-amber-500 hover:bg-slate-100"
                            }`}
                            title={p.bestseller ? "Active Bestseller (Click to unmark)" : "Click to feature as Bestseller"}
                          >
                            <Star size={14} className={p.bestseller ? "fill-amber-400" : ""} />
                          </button>
                          <Link
                            to={`/admin/products/${p._id}`}
                            className="p-1.5 text-slate-400 hover:text-[#0F9D8A] rounded-lg hover:bg-slate-100"
                            title="View piece"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${p._id}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                            title="Edit piece"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteModalId(p._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-black text-dark-navy text-base">Delete this product?</h3>
              <p className="text-xs text-muted-gray mt-1">
                This design piece will be permanently removed from the catalog.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-muted-gray hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModalId)}
                disabled={isProcessing}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
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
