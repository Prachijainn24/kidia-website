import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Loader2,
  Trash2,
  Upload,
  IndianRupee,
} from "lucide-react";
import {
  getProductById,
  updateProduct,
  getCategories,
  AdminCategory,
} from "../services/adminApi";

const ProductEdit: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  // Form states
  const [heading, setHeading] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [gender, setGender] = useState<"boys" | "girls" | "unisex">("unisex");
  const [fabric, setFabric] = useState("");
  const [description, setDescription] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    if (productId) {
      Promise.all([getProductById(productId), getCategories()])
        .then(([prodRes, catRes]) => {
          const p = prodRes.data.product;
          if (p) {
            setHeading(p.heading || "");
            setPrice(p.price?.toString() || "");
            setSalePrice(p.salePrice?.toString() || p.price?.toString() || "");
            setCategoryName(p.categoryName || "");
            setQuantity(p.quantity?.toString() || "0");
            setGender(p.gender || "unisex");
            setFabric(p.fabric || "");
            setDescription(p.description || "");
            setBestseller(Boolean(p.bestseller));
            setImages(p.images || []);
          }
          setCategories(catRes.data.categories || []);
        })
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const handleAddImage = () => {
    if (!newUrl.trim()) return;
    setImages([...images, newUrl.trim()]);
    setNewUrl("");
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSalePriceInvalid = Boolean(salePrice && price && Number(salePrice) < Number(price));

    if (isSalePriceInvalid) {
      showToast(`Sale price (₹${salePrice}) must be greater than or equal to Price (₹${price})`);
      return;
    }

    setSaving(true);
    try {
      await updateProduct(productId, {
        heading: heading.trim(),
        price: Number(price),
        salePrice: Number(salePrice || price),
        categoryName,
        quantity: Number(quantity),
        gender,
        fabric: fabric.trim(),
        description: description.trim(),
        bestseller,
        images,
      });
      showToast("Design updated successfully!");
      setTimeout(() => navigate(`/admin/products/${productId}`), 800);
    } catch {
      showToast("Failed to update design");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-muted-gray">
        <Loader2 className="w-6 h-6 animate-spin text-[#0F9D8A] mb-2" />
        <span className="text-xs font-bold">Loading piece for editing...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-dark-navy text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-slideDown">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/products/${productId}`}
            className="p-2 rounded-xl border border-slate-200 bg-white text-muted-gray hover:text-dark-navy hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-dark-navy tracking-tight font-sans">
              Edit Boutique Design
            </h1>
            <p className="text-xs text-muted-gray font-mono mt-0.5">ID: {productId}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-dark-navy mb-1.5">Piece Name *</label>
            <input
              type="text"
              required
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-dark-navy focus:outline-none focus:border-[#0F9D8A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark-navy mb-1.5">Category</label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-dark-navy bg-white cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-navy mb-1.5">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {(["boys", "girls", "unisex"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 text-xs font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                      gender === g
                        ? "bg-[#0F9D8A] text-white border-[#0F9D8A]"
                        : "bg-slate-50 text-muted-gray border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark-navy mb-1.5">Price (₹) *</label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-dark-navy"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-dark-navy">Sale Price / MRP (₹)</label>
                <span className="text-[10px] text-muted-gray">Must be ≥ Price</span>
              </div>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min={price ? Number(price) : 0}
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-xs font-bold text-dark-navy ${
                    salePrice && price && Number(salePrice) < Number(price)
                      ? "border-rose-400 bg-rose-50/40 focus:border-rose-500"
                      : "border-slate-200"
                  }`}
                />
              </div>
              {salePrice && price && Number(salePrice) < Number(price) && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">
                  ⚠️ Sale Price must be ≥ Price (₹{price})
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-navy mb-1.5">Stock Quantity</label>
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-dark-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-navy mb-1.5">Fabric</label>
            <input
              type="text"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-dark-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-navy mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-dark-navy"
            />
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-muted-gray uppercase tracking-wider">
            Photos ({images.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                <img src={img} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Paste new image URL..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-dark-navy rounded-xl text-xs font-bold"
            >
              Add URL
            </button>
          </div>
        </div>

        {/* Bestseller Toggle Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-dark-navy tracking-tight">Feature as Bestseller</h3>
            <p className="text-[11px] text-muted-gray mt-0.5">Showcase this design with the gold Bestseller badge and promote in Bestseller collections.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={bestseller}
              onChange={(e) => setBestseller(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F9D8A]"></div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to={`/admin/products/${productId}`}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-muted-gray hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F9D8A] hover:bg-[#0C7D6E] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;
