import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const INVENTORY_COLORS: Record<string, string> = {
  "Healthy Stock": "#304A3C", // Kidia Forest Green
  "Low Stock (<5)": "#EE9B00", // Kidia Marigold
  "Out of Stock": "#D64C33", // Kidia Terracotta
};

interface InventoryChartProps {
  data: { name: string; value: number }[];
}

const InventoryChart: React.FC<InventoryChartProps> = ({ data }) => {
  const activeData = data.filter((item) => item.value > 0);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-soft hover:shadow-lift transition-all duration-300 text-left w-full h-full flex flex-col justify-between">
      <div>
        <h3 className="text-base font-serif font-black text-foreground tracking-tight">
          Inventory Stock Health
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
          Health snapshot of listed boutique products stock.
        </p>
      </div>

      <div className="w-full h-72 min-h-[280px] flex items-center justify-center mt-4">
        {activeData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-border rounded-2xl p-6 bg-muted/20">
            <span className="text-2xl mb-1">📦</span>
            <p className="text-xs font-bold text-muted-foreground text-center">No inventory tracked</p>
            <p className="text-[10px] text-muted-foreground/80 mt-1 text-center font-medium">
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
                    fill={INVENTORY_COLORS[entry.name] || "#8F7E75"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8DEC8",
                  borderRadius: "16px",
                  boxShadow: "0 8px 30px -12px rgba(48, 74, 60, 0.18)",
                  fontFamily: "inherit",
                }}
                formatter={(val: any, name: any) => [`${val} items`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40 mt-2">
        {Object.entries(INVENTORY_COLORS).map(([key, col]) => (
          <div key={key} className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col }} />
            <span className="truncate">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryChart;
