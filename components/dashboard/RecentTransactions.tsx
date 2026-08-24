type Txn = {
  id: string;
  type: "Sales" | "Purchase" | "Payment" | "Receipt";
  ref: string;
  party: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Overdue" | "Draft";
};

const TXNS: Txn[] = [
  { id: "1", type: "Sales", ref: "SI-2082-0142", party: "Himalayan Traders", date: "2082-04-18", amount: "Rs 1,24,500", status: "Paid" },
  { id: "2", type: "Purchase", ref: "PB-2082-0098", party: "Everest Distributors", date: "2082-04-17", amount: "Rs 3,42,000", status: "Pending" },
  { id: "3", type: "Receipt", ref: "RC-2082-0211", party: "Sagarmatha Enterprises", date: "2082-04-17", amount: "Rs 85,000", status: "Paid" },
  { id: "4", type: "Sales", ref: "SI-2082-0141", party: "Annapurna Retail", date: "2082-04-16", amount: "Rs 62,750", status: "Overdue" },
  { id: "5", type: "Payment", ref: "PY-2082-0075", party: "Global Tech Suppliers", date: "2082-04-15", amount: "Rs 1,10,000", status: "Draft" },
];

const STATUS_STYLE: Record<Txn["status"], string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Overdue: "bg-rose-50 text-rose-700",
  Draft: "bg-slate-100 text-slate-600",
};

export default function RecentTransactions() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-medium text-slate-700">
          Recent Transactions
        </h3>
        <a href="/finance/ledger" className="text-xs text-blue-600 hover:underline">
          View all
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="px-4 py-2 font-medium">Ref No.</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Party</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium text-right">Amount</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {TXNS.map((t) => (
              <tr
                key={t.id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
              >
                <td className="px-4 py-2.5 text-slate-700 font-medium">
                  {t.ref}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{t.type}</td>
                <td className="px-4 py-2.5 text-slate-600">{t.party}</td>
                <td className="px-4 py-2.5 text-slate-500">{t.date}</td>
                <td className="px-4 py-2.5 text-slate-700 text-right">
                  {t.amount}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[t.status]}`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}