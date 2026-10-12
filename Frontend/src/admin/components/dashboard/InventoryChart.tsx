import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const INVENTORY_COLORS: Record<string, string> = {
  "Healthy Stock": "#10B981",
  "Low Stock (<5)": "#F59E0B",
  "Out of Stock": "#EF4444",
};

interface InventoryChartProps {
  data: { name: string; value: number }[];
}

const InventoryChart: React.FC<InventoryChartProps> = ({ data }) => {
  const activeData = data.filter((item) => item.value > 0);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 text-left w-full h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
          Inventory Stock Health
        </h3>
        <p className="text-xs text-muted-gray mt-0.5 font-medium">
          Health snapshot of listed boutique products stock.
        </p>
      </div>

      <div className="w-full h-72 min-h-[280px] flex items-center justify-center mt-4">
        {activeData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-2xl mb-1">📦</span>
            <p className="text-xs font-bold text-muted-gray text-center">No inventory tracked</p>
            <p className="text-[10px] text-muted-gray/80 mt-1 text-center font-medium">
              Stock levels update automatically as items are listed.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeData}
                cx="50%"
                cy="45%"
                innerRadius={58}
                outerRadius={83}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {activeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={INVENTORY_COLORS[entry.name] || "#94A3B8"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default InventoryChart;
