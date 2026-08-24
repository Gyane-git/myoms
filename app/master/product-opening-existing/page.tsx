"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  XCircle,
  Upload,
  Search,
  Calendar,
  X,
  Save,
  Undo2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LineItem {
  id: number;
  product: string;
  godown: string;
  altQty: string;
  altUom: string;
  qty: string;
  uom: string;
  rate: string;
}

let nextId = 6;

function emptyRow(id: number): LineItem {
  return { id, product: "", godown: "", altQty: "", altUom: "", qty: "", uom: "", rate: "" };
}

const INITIAL_ROWS: LineItem[] = [1, 2, 3, 4, 5].map((id) => emptyRow(id));

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProductOpeningPage() {
  const [voucherNo, setVoucherNo] = useState("");
  const [date, setDate] = useState("16/07/2025");
  const [fyEnd, setFyEnd] = useState("32/03/2082");
  const [rows, setRows] = useState<LineItem[]>(INITIAL_ROWS);
  const [code, setCode] = useState("");

  const amounts = useMemo(
    () =>
      rows.map((r) => {
        const qty = parseFloat(r.qty) || 0;
        const rate = parseFloat(r.rate) || 0;
        return qty * rate;
      }),
    [rows]
  );

  const totals = useMemo(() => {
    const totalAltQty = rows.reduce((sum, r) => sum + (parseFloat(r.altQty) || 0), 0);
    const totalQty = rows.reduce((sum, r) => sum + (parseFloat(r.qty) || 0), 0);
    const totalAmount = amounts.reduce((sum, a) => sum + a, 0);
    return { totalAltQty, totalQty, totalAmount };
  }, [rows, amounts]);

  const updateRow = (id: number, patch: Partial<LineItem>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow(nextId++)]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const handleSave = () => {
    // Wire up to your API, e.g. POST /api/product-opening
    console.log({ voucherNo, date, fyEnd, rows, code, totals });
  };

  const handleCancel = () => {
    setVoucherNo("");
    setRows(INITIAL_ROWS.map((r) => ({ ...r })));
    setCode("");
  };

  return (
    <div className="min-h-screen bg-white text-[13px] text-slate-700">
      {/* top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600" />

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-5 border-b border-slate-200 px-4 py-2.5">
        <ToolbarAction icon={<Plus className="h-4 w-4" />} label="New" onClick={handleCancel} />
        <ToolbarAction icon={<Pencil className="h-4 w-4" />} label="Edit" disabled />
        <ToolbarAction icon={<XCircle className="h-4 w-4" />} label="Delete" />
        <ToolbarAction icon={<Upload className="h-4 w-4" />} label="Import" />

        <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-4">
          <h1 className="text-[14px] font-bold tracking-wide text-teal-700">
            PRODUCT OPENING
          </h1>
          <span className="rounded bg-teal-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            NEW
          </span>
        </div>
      </div>

      {/* voucher / date row */}
      <div className="flex flex-wrap items-end gap-6 px-4 py-4">
        <div className="flex flex-col gap-1">
          <label className="text-slate-600">Voucher No</label>
          <div className="relative">
            <input
              value={voucherNo}
              onChange={(e) => setVoucherNo(e.target.value)}
              className="w-64 rounded border border-slate-300 bg-slate-50 py-1.5 pl-2 pr-8 text-[13px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
            />
            <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-slate-600">Date</label>
          <div className="relative">
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-36 rounded border border-slate-300 py-1.5 pl-2 pr-8 text-[13px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
            />
            <Calendar className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="invisible">Date</label>
          <div className="relative">
            <input
              value={fyEnd}
              onChange={(e) => setFyEnd(e.target.value)}
              className="w-36 rounded border border-slate-300 py-1.5 pl-2 pr-8 text-[13px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
            />
            <Calendar className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* line items grid */}
      <div className="overflow-x-auto px-4">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-slate-200 text-[13px] font-semibold text-slate-700">
              <th className="w-12 py-2">S.NO.</th>
              <th className="py-2">Product</th>
              <th className="w-40 py-2">Godown</th>
              <th className="w-24 py-2">Alt Qty</th>
              <th className="w-20 py-2">UOM</th>
              <th className="w-20 py-2">Qty</th>
              <th className="w-20 py-2">UOM</th>
              <th className="w-24 py-2">Rate</th>
              <th className="w-28 py-2">Amount</th>
              <th className="w-10 py-2">#</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-1.5 align-middle text-slate-500">{idx + 1}</td>

                <td className="py-1.5 pr-2 align-middle">
                  <div className="relative">
                    <input
                      value={row.product}
                      onChange={(e) => updateRow(row.id, { product: e.target.value })}
                      className="w-full rounded border border-slate-300 py-1 pl-2 pr-7 text-[13px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
                    />
                    <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                </td>

                <td className="py-1.5 pr-2 align-middle">
                  <div className="relative">
                    <input
                      value={row.godown}
                      onChange={(e) => updateRow(row.id, { godown: e.target.value })}
                      className="w-full rounded border border-slate-300 py-1 pl-2 pr-7 text-[13px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
                    />
                    <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                </td>

                <td className="py-1.5 pr-2 align-middle">
                  <input
                    value={row.altQty}
                    onChange={(e) => updateRow(row.id, { altQty: e.target.value })}
                    className="w-full rounded border border-slate-300 bg-slate-100 py-1 px-2 text-right text-[13px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
                  />
                </td>

                <td className="py-1.5 pr-2 align-middle">
                  <input
                    value={row.altUom}
                    onChange={(e) => updateRow(row.id, { altUom: e.target.value })}
                    className="w-full rounded border border-slate-300 py-1 px-2 text-[13px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
                  />
                </td>

                <td className="py-1.5 pr-2 align-middle">
                  <input
                    value={row.qty}
                    onChange={(e) => updateRow(row.id, { qty: e.target.value })}
                    className="w-full rounded border border-slate-300 bg-slate-100 py-1 px-2 text-right text-[13px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
                  />
                </td>

                <td className="py-1.5 pr-2 align-middle">
                  <input
                    value={row.uom}
                    onChange={(e) => updateRow(row.id, { uom: e.target.value })}
                    className="w-full rounded border border-slate-300 py-1 px-2 text-[13px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
                  />
                </td>

                <td className="py-1.5 pr-2 align-middle">
                  <input
                    value={row.rate}
                    onChange={(e) => updateRow(row.id, { rate: e.target.value })}
                    className="w-full rounded border border-slate-300 py-1 px-2 text-right text-[13px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
                  />
                </td>

                <td className="py-1.5 pr-2 align-middle">
                  <div className="w-full rounded border border-slate-300 bg-slate-100 py-1 px-2 text-right text-[13px] text-slate-500">
                    {amounts[idx] ? amounts[idx].toFixed(2) : ""}
                  </div>
                </td>

                <td className="py-1.5 align-middle">
                  <button
                    onClick={() => removeRow(row.id)}
                    className="text-slate-400 hover:text-rose-500"
                    title="Remove row"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {/* Code row / add row */}
            <tr className="border-b border-slate-200">
              <td className="py-2 font-semibold text-slate-700">Code</td>
              <td className="py-2 pr-2" colSpan={8}>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full max-w-md rounded border border-slate-300 bg-slate-100 py-1 px-2 text-[13px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
                />
              </td>
              <td className="py-2">
                <button
                  onClick={addRow}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white hover:bg-teal-600"
                  title="Add row"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* totals */}
      <div className="flex flex-wrap items-center gap-8 px-4 py-4">
        <div className="flex flex-col gap-1">
          <label className="text-slate-600">Total AltQty</label>
          <input
            readOnly
            value={totals.totalAltQty.toFixed(2)}
            className="w-40 rounded border border-slate-300 bg-slate-100 py-1.5 px-2 text-[13px] text-slate-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-slate-600">Total Qty</label>
          <input
            readOnly
            value={totals.totalQty.toFixed(2)}
            className="w-40 rounded border border-slate-300 bg-slate-100 py-1.5 px-2 text-[13px] text-slate-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-slate-600">Total Amount</label>
          <input
            readOnly
            value={totals.totalAmount.toFixed(2)}
            className="w-40 rounded border border-slate-300 bg-slate-100 py-1.5 px-2 text-[13px] text-slate-600"
          />
        </div>
      </div>

      {/* footer actions */}
      <div className="flex justify-end gap-6 border-t border-dashed border-slate-200 px-4 py-4">
        <button
          onClick={handleSave}
          className="flex flex-col items-center gap-1 text-teal-600 hover:text-teal-700"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-teal-500">
            <Save className="h-4 w-4" />
          </span>
          <span className="text-[12px] font-medium">Save</span>
        </button>
        <button
          onClick={handleCancel}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-700"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-300">
            <Undo2 className="h-4 w-4" />
          </span>
          <span className="text-[12px] font-medium">Cancel</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function ToolbarAction({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 text-[13px] font-medium ${
        disabled
          ? "cursor-not-allowed text-slate-300"
          : "text-slate-600 hover:text-teal-600"
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
          disabled ? "border-slate-200" : "border-slate-400"
        }`}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}