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

interface CategoryChartProps {
  data: { name: string; value: number }[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 text-left w-full h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
          Boutique Categories Breakdown
        </h3>
        <p className="text-xs text-muted-gray mt-0.5 font-medium">
          Total items catalog distribution in kidswear inventory.
        </p>
      </div>

      <div className="w-full h-72 min-h-[280px] mt-4">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-2xl mb-1">🏷️</span>
            <p className="text-xs font-bold text-muted-gray text-center">No categories mapped</p>
            <p className="text-[10px] text-muted-gray/80 mt-1 text-center font-medium">
              Categorization registers once boutique products are listed.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
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
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(15, 23, 42, 0.03)" }}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                  fontFamily: "inherit",
                }}
                labelStyle={{ fontWeight: 800, fontSize: "11px", color: "#0F172A", marginBottom: "4px" }}
                itemStyle={{ fontSize: "11px", fontWeight: 700 }}
              />
              <Bar dataKey="value" name="Pieces Listed" radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? "#0F9D8A" : "#14B8A6"}
                  />
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
