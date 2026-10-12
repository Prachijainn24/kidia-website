import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  delivered: "#10B981",
  processing: "#3B82F6",
  shipped: "#06B6D4",
  pending: "#F59E0B",
  cancelled: "#EF4444",
};

const DEFAULT_COLOR = "#94A3B8";

interface OrdersPieChartProps {
  data: { name: string; value: number }[];
}

const OrdersPieChart: React.FC<OrdersPieChartProps> = ({ data }) => {
  const activeData = data.filter((item) => item.value > 0);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 text-left w-full h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
          Orders Fulfillment Overview
        </h3>
        <p className="text-xs text-muted-gray mt-0.5 font-medium">
          Status distribution of placed boutique orders.
        </p>
      </div>

      <div className="w-full h-72 min-h-[280px] flex items-center justify-center mt-4">
        {activeData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-2xl mb-1">📦</span>
            <p className="text-xs font-bold text-muted-gray text-center">No orders placed yet</p>
            <p className="text-[10px] text-muted-gray/80 mt-1 text-center font-medium">
              Fulfillment tracking starts with customer checkout.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {activeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name.toLowerCase()] || DEFAULT_COLOR}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100">
        {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
          <div key={status} className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-gray">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[status.toLowerCase()] || DEFAULT_COLOR }}
            />
            <span>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPieChart;
