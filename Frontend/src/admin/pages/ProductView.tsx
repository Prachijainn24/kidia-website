import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getProductById, deleteProduct, AdminProduct } from "../services/adminApi";

const ProductView: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (productId) {
      getProductById(productId)
        .then((res) => {
          setProduct(res.data.product || null);
        })
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const handleDelete = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      await deleteProduct(product._id);
      navigate("/admin/products");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
        <span className="text-xs font-bold">Loading product details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="font-serif font-bold text-foreground text-base">Design not found</p>
        <Link to="/admin/products" className="text-xs text-primary hover:underline font-bold">
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length ? product.images : ["/placeholder.svg"];

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all shadow-2xs"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-foreground tracking-tight">
              {product.heading}
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {product._id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/admin/products/edit/${product._id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-soft"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </Link>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all cursor-pointer"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Images Gallery */}
        <div className="md:col-span-5 space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted/20">
            <img
              src={images[activeImgIndex]}
              alt={product.heading}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-card/90 shadow-soft text-foreground hover:bg-card cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setActiveImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-card/90 shadow-soft text-foreground hover:bg-card cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImgIndex === idx ? "border-primary" : "border-transparent opacity-70"
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {product.categoryName || "Boutique"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary-soft/50 text-primary">
                {product.quantity > 0 ? "Active in Stock" : "Sold Out"}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-serif font-black text-foreground">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>
              {product.salePrice && product.salePrice < product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{product.salePrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Gender:</span>
                <span className="font-bold text-foreground capitalize">{product.gender || "Unisex"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Fabric:</span>
                <span className="font-bold text-foreground">{product.fabric || "Pure Cotton"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Total Stock:</span>
                <span className="font-bold text-foreground">{product.quantity} units</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Added:</span>
                <span className="font-bold text-foreground">
                  {new Date(product.createdAt || Date.now()).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>

            {/* Sizing Breakdown */}
            {product.variants && product.variants.length > 0 && (
              <div className="pt-3 border-t border-border/40">
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block mb-2">
                  Inventory by Size:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-muted/30 border border-border text-xs font-bold flex items-center gap-1.5"
                    >
                      <span className="text-foreground">
                        {v.attributes?.find((a) => a.name === "Size")?.value || "Standard"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">({v.quantity} pcs)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-sm w-full p-6 shadow-soft space-y-4 animate-scaleUp border border-border">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-serif font-black text-foreground text-base">Delete this piece?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Are you sure you want to remove &quot;{product.heading}&quot; from the catalog?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted/60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 px-3 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductView;
