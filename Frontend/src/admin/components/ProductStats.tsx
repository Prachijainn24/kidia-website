import React from "react";
import { Package, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface ProductStatsProps {
  products?: any[];
  activeFilter?: string;
  onCardClick?: (filter: string) => void;
}

const ProductStats: React.FC<ProductStatsProps> = ({
  products = [],
  activeFilter = "",
  onCardClick,
}) => {
  const getProductTotalStock = (product: any) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);
    }
    return product.quantity ?? 0;
  };

  const getProductStatus = (item: any) => {
    const qty = getProductTotalStock(item);
    if (qty <= 0 || item.sold) return "Sold";
    if (qty <= 3) return "Low Stock";
    return "In Stock";
  };

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => getProductStatus(p) === "In Stock").length;
  const lowStockProducts = products.filter((p) => getProductStatus(p) === "Low Stock").length;
  const outOfStockProducts = products.filter((p) => getProductStatus(p) === "Sold").length;

  const statCards = [
    {
      id: "",
      title: "Total Designs",
      value: totalProducts,
      icon: <Package size={16} />,
      colorClass: "bg-blue-50 text-blue-700 border-blue-200/60",
    },
    {
      id: "In Stock",
      title: "Active In-Stock",
      value: activeProducts,
      icon: <CheckCircle size={16} />,
      colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    },
    {
      id: "Low Stock",
      title: "Low Inventory (≤3)",
      value: lowStockProducts,
      icon: <AlertTriangle size={16} />,
      colorClass: "bg-amber-50 text-amber-700 border-amber-200/60",
    },
    {
      id: "Sold",
      title: "Sold Out",
      value: outOfStockProducts,
      icon: <XCircle size={16} />,
      colorClass: "bg-rose-50 text-rose-700 border-rose-200/60",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {statCards.map((card) => {
        const isSelected = activeFilter === card.id;
        return (
          <div
            key={card.title}
            onClick={() => onCardClick && onCardClick(card.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between bg-white text-left ${
              isSelected
                ? "border-[#0F9D8A] shadow-md ring-2 ring-[#0F9D8A]/20"
                : "border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <div>
              <p className="text-[11px] font-bold text-muted-gray uppercase tracking-wider">
                {card.title}
              </p>
              <p className="text-xl sm:text-2xl font-black text-dark-navy mt-1">
                {card.value}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl border ${card.colorClass}`}>
              {card.icon}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductStats;
