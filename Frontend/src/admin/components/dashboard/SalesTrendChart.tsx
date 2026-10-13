import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesTrendChartProps {
  data: { date: string; revenue: number; orders: number }[];
  timeFilter: string;
  setTimeFilter: (val: string) => void;
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  data,
  timeFilter,
  setTimeFilter,
}) => {
  const formatCurrency = (val: number) => {
    return `₹${Number(val).toLocaleString("en-IN")}`;
  };

  const timeFilterOptions = [
    { label: "Today", value: "today" },
    { label: "7 Days", value: "7days" },
    { label: "30 Days", value: "30days" },
    { label: "All Time", value: "all" },
  ];

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-soft hover:shadow-lift transition-all duration-300 text-left w-full h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-serif font-black text-foreground tracking-tight">
            Revenue & Sales Trend
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Visual billing growth and boutique order volume over time.
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {timeFilterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                timeFilter === opt.value
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground border border-border/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-72 min-h-[280px]">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-border rounded-2xl p-6 bg-muted/20">
            <span className="text-2xl mb-1">📈</span>
            <p className="text-xs font-bold text-muted-foreground text-center">No sales recorded yet</p>
            <p className="text-[10px] text-muted-foreground/80 mt-1 text-center font-medium">
              Sales graph updates dynamically as customer orders are placed.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#304A3C" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#304A3C" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DEC8" />
              <XAxis
                dataKey="date"
                stroke="#6D5D55"
                fontSize={10}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis
                stroke="#6D5D55"
                fontSize={10}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8DEC8",
                  borderRadius: "16px",
                  boxShadow: "0 8px 30px -12px rgba(48, 74, 60, 0.18)",
                  fontFamily: "inherit",
                }}
                labelStyle={{ fontWeight: 800, fontSize: "11px", color: "#2C1E18", marginBottom: "4px" }}
                formatter={(val: any) => [formatCurrency(val), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#304A3C"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#salesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SalesTrendChart;
