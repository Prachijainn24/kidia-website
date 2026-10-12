import React from "react";
import { Award, ShoppingCart } from "lucide-react";

interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
  percentage?: number;
}

interface TopProductsChartProps {
  data: TopProduct[];
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 text-left w-full h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
            Top Performing Kidswear
          </h3>
          <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Award size={11} /> Leaderboard
          </span>
        </div>
        <p className="text-xs text-muted-gray font-medium mb-4">
          Best selling designs ranked by orders volume and customer share.
        </p>
      </div>

      <div className="space-y-2.5 flex-1">
        {data.length === 0 ? (
          <div className="w-full h-44 flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-2xl mb-1">🏆</span>
            <p className="text-xs font-bold text-muted-gray text-center">No sales recorded yet</p>
            <p className="text-[10px] text-muted-gray/80 mt-1 text-center font-medium">
              Rankings update as customer purchases are made.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {data.slice(0, 5).map((prod, index) => (
              <div
                key={index}
                className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl flex flex-col gap-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                        index === 0
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : index === 1
                          ? "bg-slate-200 text-slate-800"
                          : index === 2
                          ? "bg-orange-100 text-orange-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="truncate text-xs font-bold text-dark-navy" title={prod.name}>
                      {prod.name}
                    </span>
                  </div>

                  <span className="font-extrabold text-xs text-dark-navy shrink-0">
                    ₹{prod.revenue.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        index === 0
                          ? "bg-amber-500"
                          : index === 1
                          ? "bg-slate-500"
                          : index === 2
                          ? "bg-orange-500"
                          : "bg-[#0F9D8A]"
                      }`}
                      style={{ width: `${Math.min(prod.percentage || (5 - index) * 20, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-white border border-slate-200 text-muted-gray px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                    <ShoppingCart size={10} /> {prod.quantity} sold
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProductsChart;
