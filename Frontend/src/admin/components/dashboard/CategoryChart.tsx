import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PALETTE = ["#304A3C", "#D64C33", "#EE9B00", "#6D4C61", "#52796F", "#E0A96D", "#B38867"];

interface CategoryChartProps {
  data: { name: string; value: number }[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-soft hover:shadow-lift transition-all duration-300 text-left w-full h-full flex flex-col justify-between">
      <div>
        <h3 className="text-base font-serif font-black text-foreground tracking-tight">
          Boutique Categories Breakdown
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
          Total items catalog distribution in kidswear inventory.
        </p>
      </div>

      <div className="w-full h-72 min-h-[280px] mt-4">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-border rounded-2xl p-6 bg-muted/20">
            <span className="text-2xl mb-1">🏷️</span>
            <p className="text-xs font-bold text-muted-foreground text-center">No categories mapped</p>
            <p className="text-[10px] text-muted-foreground/80 mt-1 text-center font-medium">
              Categorization registers once boutique products are listed.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DEC8" />
              <XAxis
                dataKey="name"
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
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(48, 74, 60, 0.05)" }}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8DEC8",
                  borderRadius: "16px",
                  boxShadow: "0 8px 30px -12px rgba(48, 74, 60, 0.18)",
                  fontFamily: "inherit",
                }}
                formatter={(val: any) => [`${val} designs`, "Catalog Count"]}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default CategoryChart;
