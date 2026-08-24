import {
  FilePlus2,
  ReceiptText,
  PackagePlus,
  Truck,
  BookOpenCheck,
  Users2,
} from "lucide-react";

const ACTIONS = [
  { label: "New Sales Invoice", href: "/sales/invoice/new", icon: ReceiptText },
  { label: "New Purchase Bill", href: "/purchase/bill/new", icon: FilePlus2 },
  { label: "New Item", href: "/master/item/new", icon: PackagePlus },
  { label: "New Party", href: "/master/party/new", icon: Users2 },
  { label: "Stock Transfer", href: "/inventory/transfer/new", icon: Truck },
  { label: "Journal Entry", href: "/finance/journal/new", icon: BookOpenCheck },
];

export default function QuickActions() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-medium text-slate-700 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ACTIONS.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            className="flex flex-col items-start gap-2 rounded-md border border-slate-200 p-3 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
          >
            <Icon size={17} className="text-blue-600" />
            <span className="text-xs text-slate-600 leading-tight">
              {label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}