import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Loader2,
  Trash2,
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
      <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
        <span className="text-xs font-bold">Loading piece for editing...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-foreground text-background text-xs font-bold px-4 py-2.5 rounded-xl shadow-soft flex items-center gap-2 animate-slideDown">
          <Check size={14} className="text-butter" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/products/${productId}`}
            className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all shadow-2xs"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-foreground tracking-tight">
              Edit Boutique Design
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {productId}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Piece Name *</label>
            <input
              type="text"
              required
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-card transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Category</label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {(["boys", "girls", "unisex"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 text-xs font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                      gender === g
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/60"
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
              <label className="block text-xs font-bold text-foreground mb-1.5">Price (₹) *</label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-border bg-muted/20 text-xs font-bold text-foreground focus:outline-none focus:border-primary focus:bg-card transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-foreground">Sale Price / MRP (₹)</label>
                <span className="text-[10px] text-muted-foreground">Must be ≥ Price</span>
              </div>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  min={price ? Number(price) : 0}
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-xs font-bold text-foreground focus:outline-none transition-all ${
                    salePrice && price && Number(salePrice) < Number(price)
                      ? "border-destructive/60 bg-destructive/10 focus:border-destructive text-destructive"
                      : "border-border bg-muted/20 focus:border-primary focus:bg-card"
                  }`}
                />
              </div>
              {salePrice && price && Number(salePrice) < Number(price) && (
                <p className="text-[11px] font-bold text-destructive mt-1">
                  ⚠️ Sale Price must be ≥ Price (₹{price})
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Stock Quantity</label>
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 text-xs font-bold text-foreground focus:outline-none focus:border-primary focus:bg-card transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Fabric</label>
            <input
              type="text"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-card transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-card transition-all"
            />
          </div>
        </div>

        {/* Photos */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
            Photos ({images.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted/20">
                <img src={img} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
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
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-card transition-all"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold"
            >
              Add URL
            </button>
          </div>
        </div>

        {/* Bestseller Toggle Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-foreground tracking-tight">Feature as Bestseller</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Showcase this design with the gold Bestseller badge and promote in Bestseller collections.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={bestseller}
              onChange={(e) => setBestseller(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to={`/admin/products/${productId}`}
            className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted/60"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-soft disabled:opacity-50 cursor-pointer"
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
