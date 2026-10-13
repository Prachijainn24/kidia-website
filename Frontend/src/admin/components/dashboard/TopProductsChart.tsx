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
    <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-soft hover:shadow-lift transition-all duration-300 text-left w-full h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-serif font-black text-foreground tracking-tight">
            Top Performing Kidswear
          </h3>
          <span className="text-[10px] font-extrabold uppercase bg-butter/60 text-foreground border border-butter px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Award size={11} className="text-accent" /> Leaderboard
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-medium mb-4">
          Best selling designs ranked by orders volume and customer share.
        </p>
      </div>

      <div className="space-y-2.5 flex-1">
        {data.length === 0 ? (
          <div className="w-full h-44 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl p-6 bg-muted/20">
            <span className="text-2xl mb-1">🏆</span>
            <p className="text-xs font-bold text-muted-foreground text-center">No sales recorded yet</p>
            <p className="text-[10px] text-muted-foreground/80 mt-1 text-center font-medium">
              Rankings update as customer purchases are made.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {data.slice(0, 5).map((prod, index) => (
              <div
                key={index}
                className="p-3 bg-muted/30 border border-border/60 rounded-xl flex flex-col gap-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                        index === 0
                          ? "bg-butter text-foreground border border-butter/80"
                          : index === 1
                          ? "bg-primary-soft text-primary font-bold"
                          : index === 2
                          ? "bg-peach text-foreground font-bold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-foreground truncate">
                      {prod.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-foreground block">
                      ₹{prod.revenue.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground flex items-center justify-end gap-1">
                      <ShoppingCart size={10} /> {prod.quantity} sold
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-border/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, prod.percentage || 15))}%` }}
                  ></div>
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
