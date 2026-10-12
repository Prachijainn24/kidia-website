import { SIZE_CHART } from "@/data/catalog";

export const SizeChart = () => (
  <div className="overflow-x-auto rounded-2xl border">
    <table className="w-full min-w-[480px] text-sm">
      <caption className="sr-only">KIDIA size chart in centimetres</caption>
      <thead className="bg-secondary text-left">
        <tr>{["Size (age)", "Height", "Chest", "Waist", "Garment length"].map((h) => <th key={h} scope="col" className="px-4 py-3 font-bold">{h}</th>)}</tr>
      </thead>
      <tbody>
        {SIZE_CHART.map((r) => (
          <tr key={r.size} className="border-t">
            <th scope="row" className="px-4 py-3 font-semibold">{r.size}</th>
            <td className="px-4 py-3">{r.height} cm</td><td className="px-4 py-3">{r.chest} cm</td><td className="px-4 py-3">{r.waist} cm</td><td className="px-4 py-3">{r.length} cm</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
