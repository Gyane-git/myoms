import { AlertTriangle } from "lucide-react";

type StockItem = {
  name: string;
  code: string;
  currentQty: number;
  reorderLevel: number;
  unit: string;
};

const ITEMS: StockItem[] = [
  { name: "Cement OPC 43 Grade", code: "ITM-0231", currentQty: 12, reorderLevel: 50, unit: "Bag" },
  { name: "MS Rod 12mm", code: "ITM-0187", currentQty: 8, reorderLevel: 25, unit: "Qtl" },
  { name: "PVC Pipe 4 inch", code: "ITM-0309", currentQty: 20, reorderLevel: 40, unit: "Pcs" },
];

export default function LowStockAlert() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-amber-500" />
        <h3 className="text-sm font-medium text-slate-700">
          Low Stock Alerts
        </h3>
      </div>
      <div className="flex flex-col divide-y divide-slate-50">
        {ITEMS.map((item) => (
          <div key={item.code} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm text-slate-700">{item.name}</p>
              <p className="text-xs text-slate-400">{item.code}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-rose-600">
                {item.currentQty} {item.unit}
              </p>
              <p className="text-xs text-slate-400">
                reorder at {item.reorderLevel}
              </p>
            </div>
          </div>
        ))}
      </div>
      <a
        href="/inventory/stock-ledger"
        className="mt-3 inline-block text-xs text-blue-600 hover:underline"
      >
        View full stock report
      </a>
    </div>
  );
}