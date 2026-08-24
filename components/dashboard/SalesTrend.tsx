type Point = { label: string; sales: number; purchase: number };

const DATA: Point[] = [
  { label: "Shrwn", sales: 42, purchase: 30 },
  { label: "Bhdr", sales: 55, purchase: 38 },
  { label: "Aswn", sales: 48, purchase: 41 },
  { label: "Kart", sales: 61, purchase: 44 },
  { label: "Mrgs", sales: 58, purchase: 50 },
  { label: "Push", sales: 70, purchase: 46 },
];

const MAX = Math.max(...DATA.flatMap((d) => [d.sales, d.purchase]));

export default function SalesTrend() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-700">
          Sales vs Purchase (last 6 months)
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Sales
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-300" /> Purchase
          </span>
        </div>
      </div>

      <div className="flex items-end gap-4 h-40">
        {DATA.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full flex items-end justify-center gap-1 h-32">
              <div
                className="w-2.5 rounded-t bg-blue-500"
                style={{ height: `${(d.sales / MAX) * 100}%` }}
                title={`Sales: ${d.sales}`}
              />
              <div
                className="w-2.5 rounded-t bg-slate-300"
                style={{ height: `${(d.purchase / MAX) * 100}%` }}
                title={`Purchase: ${d.purchase}`}
              />
            </div>
            <span className="text-[11px] text-slate-400">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}