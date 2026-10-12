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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 text-left w-full h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
            Revenue & Sales Trend
          </h3>
          <p className="text-xs text-muted-gray mt-0.5 font-medium">
            Visual billing growth and boutique order volume over time.
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {timeFilterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeFilter(opt.value)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                timeFilter === opt.value
                  ? "bg-[#0F9D8A] text-white shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-muted-gray border border-light-border/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-72 min-h-[280px]">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-2xl mb-1">📈</span>
            <p className="text-xs font-bold text-muted-gray text-center">No sales recorded yet</p>
            <p className="text-[10px] text-muted-gray/80 mt-1 text-center font-medium">
              Sales graph updates dynamically as customer orders are placed.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F9D8A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0F9D8A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={10}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                  fontFamily: "inherit",
                }}
                labelStyle={{ fontWeight: 800, fontSize: "11px", color: "#0F172A", marginBottom: "4px" }}
                formatter={(val: any) => [formatCurrency(val), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0F9D8A"
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
