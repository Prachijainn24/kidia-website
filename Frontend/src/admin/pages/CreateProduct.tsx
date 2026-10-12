import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Check,
  Loader2,
  Tag,
  IndianRupee,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { postProduct, getCategories, AdminCategory } from "../services/adminApi";
import { ALL_SIZES } from "@/data/catalog";

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Form Fields
  const [heading, setHeading] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [gender, setGender] = useState<"boys" | "girls" | "unisex">("unisex");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [fabric, setFabric] = useState("");
  const [care, setCare] = useState("Dry clean or gentle hand wash in cold water");
  const [description, setDescription] = useState("");

  // Sizes & Quantities
  const [sizes, setSizes] = useState<Record<string, number>>({
    "1-2Y": 5,
    "2-3Y": 6,
    "3-4Y": 6,
    "4-5Y": 4,
  });

  // Colours
  const [colours, setColours] = useState<{ name: string; hex: string }[]>([
    { name: "Rose Pink", hex: "#E8A598" },
    { name: "Ivory Cream", hex: "#FAF3DD" },
  ]);

  // Images
  const [images, setImages] = useState<string[]>([
    "/placeholder.svg",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    getCategories().then((res) => {
      const cats = res.data.categories || [];
      setCategories(cats);
      if (cats.length > 0) setCategoryName(cats[0].name);
    });
  }, []);

  const handleAddSize = (sz: string) => {
    if (sizes[sz] !== undefined) return;
    setSizes({ ...sizes, [sz]: 5 });
  };

  const handleRemoveSize = (sz: string) => {
    const updated = { ...sizes };
    delete updated[sz];
    setSizes(updated);
  };

  const handleSizeQtyChange = (sz: string, qty: number) => {
    setSizes({ ...sizes, [sz]: Math.max(0, qty) });
  };

  const handleAddColour = () => {
    setColours([...colours, { name: "Blush Coral", hex: "#F4A261" }]);
  };

  const handleRemoveColour = (idx: number) => {
    setColours(colours.filter((_, i) => i !== idx));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages([...images, event.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heading.trim()) {
      showToast("Please enter a design title");
      return;
    }
    if (!price || Number(price) <= 0) {
      showToast("Please enter a valid price");
      return;
    }

    if (mrp && Number(mrp) < Number(price)) {
      showToast(`Sale Price / MRP (₹${mrp}) must be greater than or equal to Selling Price (₹${price})`);
      return;
    }

    setLoading(true);
    try {
      const totalQuantity = Object.values(sizes).reduce((a, b) => a + b, 0);
      const catObj = categories.find((c) => c.name === categoryName);

      await postProduct({
        heading: heading.trim(),
        description: description.trim(),
        price: Number(price),
        salePrice: Number(price),
        mrp: mrp ? Number(mrp) : undefined,
        quantity: totalQuantity || 10,
        categoryId: catObj?._id || "cat-1",
        categoryName,
        gender,
        fabric: fabric.trim() || "100% Pure Organic Cotton",
        care: [care.trim()],
        stock: sizes,
        colours,
        images: images.length ? images : ["/placeholder.svg"],
      });

      showToast("Design successfully added to catalog!");
      setTimeout(() => navigate("/admin/products"), 1000);
    } catch {
      showToast("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
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
            to="/admin/products"
            className="p-2 rounded-xl border border-slate-200 bg-white text-muted-gray hover:text-dark-navy hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-dark-navy tracking-tight font-sans">
              Create New Boutique Design
            </h1>
            <p className="text-xs text-muted-gray mt-0.5">
              Add a new kidswear piece to the live customer storefront.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-muted-gray uppercase tracking-wider">
            1. Core Design Information
          </h3>

          <div>
            <label className="block text-xs font-bold text-dark-navy mb-1.5">
              Piece Name / Title *
            </label>
            <input
              type="text"
              required
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Gulab Chanderi Silk Kurta Set"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-dark-navy focus:outline-none focus:border-[#0F9D8A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark-navy mb-1.5">
                Collection Category *
              </label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-dark-navy focus:outline-none focus:border-[#0F9D8A] bg-white cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-navy mb-1.5">
                Target Gender *
              </label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark-navy mb-1.5">
                Selling Price (₹) *
              </label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2490"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-dark-navy focus:outline-none focus:border-[#0F9D8A]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-dark-navy">
                  Sale Price / MRP (₹)
                </label>
                <span className="text-[10px] text-muted-gray">Must be ≥ Price</span>
              </div>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min={price ? Number(price) : 1}
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  placeholder="3290"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-xs font-bold text-dark-navy focus:outline-none ${
                    mrp && price && Number(mrp) < Number(price)
                      ? "border-rose-400 bg-rose-50/40 focus:border-rose-500"
                      : "border-slate-200 focus:border-[#0F9D8A]"
                  }`}
                />
              </div>
              {mrp && price && Number(mrp) < Number(price) && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">
                  ⚠️ Sale Price / MRP must be ≥ Selling Price (₹{price})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fabric, Care & Description */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-muted-gray uppercase tracking-wider">
            2. Fabric & Craftsmanship
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark-navy mb-1.5">
                Fabric Material
              </label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. 100% Chanderi Silk with Mulmul lining"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-dark-navy focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-navy mb-1.5">
                Garment Care Instructions
              </label>
              <input
                type="text"
                value={care}
                onChange={(e) => setCare(e.target.value)}
                placeholder="e.g. Dry clean only, gentle steam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-dark-navy focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-navy mb-1.5">
              Boutique Description & Story
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the silhouette, button accents, weave, and styling inspiration..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-dark-navy focus:outline-none focus:border-[#0F9D8A]"
            />
          </div>
        </div>

        {/* Sizes & Stock */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-muted-gray uppercase tracking-wider">
              3. Age Sizing & Inventory Allocation
            </h3>
            <span className="text-xs font-bold text-[#0F9D8A]">
              Total Units: {Object.values(sizes).reduce((a, b) => a + b, 0)}
            </span>
          </div>

          {/* Quick add size chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-gray mr-1">Available Sizes:</span>
            {ALL_SIZES.map((sz) => {
              const hasSize = sizes[sz] !== undefined;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => (hasSize ? handleRemoveSize(sz) : handleAddSize(sz))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    hasSize
                      ? "bg-[#0F9D8A] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sz} {hasSize ? "✓" : "+"}
                </button>
              );
            })}
          </div>

          {/* Sizing quantity table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {Object.entries(sizes).map(([sz, qty]) => (
              <div key={sz} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-black text-dark-navy">{sz}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={qty}
                    onChange={(e) => handleSizeQtyChange(sz, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                  />
                  <span className="text-[10px] text-muted-gray">pcs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-muted-gray uppercase tracking-wider">
            4. Product Photos & Editorial Images
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-50">
                <img src={img} alt="Product" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            <label className="border-2 border-dashed border-slate-200 hover:border-[#0F9D8A] rounded-xl aspect-square flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-teal-50/20">
              <Upload size={20} className="text-[#0F9D8A] mb-1" />
              <span className="text-[10px] font-bold text-dark-navy">Upload Photo</span>
              <span className="text-[9px] text-muted-gray">PNG, JPG</span>
              <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
            </label>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Or paste an image URL here..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-dark-navy focus:outline-none focus:border-[#0F9D8A]"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-dark-navy rounded-xl text-xs font-bold cursor-pointer"
            >
              Add URL
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-muted-gray hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F9D8A] hover:bg-[#0C7D6E] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <span>Publish to Store</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
