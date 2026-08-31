"use client";

import { useMemo, useState } from "react";
import { Plus, RefreshCw, X as XIcon, Search, Save, Printer, Upload, Download } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LedgerOption {
  code: string;
  desc: string;
  category: string;
  balance: number;
}

interface EntryRow {
  id: number;
  glCode: string; // selected ledger code
  glDesc: string; // selected ledger description (Particular)
  division: string;
  subledger: string;
  agent: string;
  debit: string;
  credit: string;
  narration: string;
}

// ---------------------------------------------------------------------------
// Mock master data — replace with real fetches (see bottom of file)
// ---------------------------------------------------------------------------
const LEDGER_OPTIONS: LedgerOption[] = [
  { code: "CA00001", desc: "Cash In Hand", category: "Cash Book", balance: 45000 },
  { code: "NB00001", desc: "Nabil Bank", category: "Bank Book", balance: 128500 },
  { code: "AN00001", desc: "ANKHU ENTERPRISES", category: "Customer", balance: -12000 },
  { code: "SU00001", desc: "Sujal Suppliers-V", category: "Vendor", balance: 8000 },
  { code: "TR00001", desc: "TRANSPORT EXPENSES", category: "Other", balance: 0 },
  { code: "FR00001", desc: "FRIEGHT", category: "Other", balance: 0 },
];

const CURRENCY_OPTIONS = [
  { code: "NPR", label: "Nepali Rupee", rate: "1.00" },
  { code: "USD", label: "US Dollar", rate: "133.50" },
  { code: "INR", label: "Indian Rupee", rate: "1.60" },
];

const DIVISION_OPTIONS = ["", "Head Office", "Branch A", "Branch B"];
const SUBLEDGER_OPTIONS = ["", "ANKHU ENTERPRISES", "Sujal Suppliers-V", "sssss"];
const AGENT_OPTIONS = ["", "Ravi Agent", "Sam Agent", "Milan Agent"];

function emptyRow(id: number): EntryRow {
  return { id, glCode: "", glDesc: "", division: "", subledger: "", agent: "", debit: "", credit: "", narration: "" };
}

export default function LedgerOpeningPage() {
  const [voucherNo] = useState("8"); // read-only, auto-generated server-side in the legacy app
  const [voucherDate, setVoucherDate] = useState("2025-07-16");
  const [voucherMiti, setVoucherMiti] = useState("32/03/2082");
  const [currencyCode, setCurrencyCode] = useState("NPR");
  const [currencyRate, setCurrencyRate] = useState("1.00");
  const [remarks, setRemarks] = useState("");
  const [rows, setRows] = useState<EntryRow[]>([emptyRow(1), emptyRow(2), emptyRow(3), emptyRow(4), emptyRow(5)]);
  const [importOpen, setImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [nextRowId, setNextRowId] = useState(6);

  const selectedLedgerRow = rows.find((r) => r.glCode);
  const footerLedger = LEDGER_OPTIONS.find((l) => l.code === selectedLedgerRow?.glCode);

  const totals = useMemo(() => {
    const totalDr = rows.reduce((sum, r) => sum + (parseFloat(r.debit) || 0), 0);
    const totalCr = rows.reduce((sum, r) => sum + (parseFloat(r.credit) || 0), 0);
    const rate = parseFloat(currencyRate) || 1;
    return {
      totalDr,
      totalCr,
      totalLocalDr: totalDr * rate,
      totalLocalCr: totalCr * rate,
    };
  }, [rows, currencyRate]);

  function updateRow<K extends keyof EntryRow>(id: number, key: K, value: EntryRow[K]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  function handleParticularChange(id: number, glCode: string) {
    const ledger = LEDGER_OPTIONS.find((l) => l.code === glCode);
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, glCode, glDesc: ledger?.desc ?? "" } : r))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow(nextRowId)]);
    setNextRowId((n) => n + 1);
  }

  function clearRow(id: number) {
    setRows((prev) => prev.map((r) => (r.id === id ? emptyRow(id) : r)));
  }

  function deleteRow(id: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function handleCurrencyChange(code: string) {
    setCurrencyCode(code);
    const c = CURRENCY_OPTIONS.find((c) => c.code === code);
    if (c) setCurrencyRate(c.rate);
  }

  function handleSave() {
    setSaving(true);
    // Swap for: await fetch("/api/finance/ledger-opening", { method: "POST", body: JSON.stringify({...}) });
    setTimeout(() => {
      setSaving(false);
      setSavedMsg("Ledger opening voucher saved.");
    }, 400);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="mx-auto max-w-1xl overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t-4 border-t-sky-400 bg-gray-100 px-4 py-2">
          <h1 className="text-sm font-medium text-gray-700">Ledger Opening</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setRows([emptyRow(1), emptyRow(2), emptyRow(3), emptyRow(4), emptyRow(5)]);
                setNextRowId(6);
                setRemarks("");
                setSavedMsg("");
              }}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              New
            </button>
            <button className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              Edit
            </button>
            <button className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              Delete
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Upload size={13} /> Import
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Voucher header fields */}
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <Field label="Voucher No" width="w-24">
              <input value={voucherNo} readOnly className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-700" />
            </Field>
            <Field label="Date" width="w-36">
              <input
                type="date"
                value={voucherDate}
                onChange={(e) => setVoucherDate(e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </Field>
            <Field label="Miti (BS)" width="w-32">
              <input
                value={voucherMiti}
                onChange={(e) => setVoucherMiti(e.target.value)}
                placeholder="dd/mm/yyyy"
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </Field>
            <Field label="Currency" width="w-40">
              <select
                value={currencyCode}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Rate" width="w-24">
              <input
                value={currencyRate}
                onChange={(e) => setCurrencyRate(e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </Field>
          </div>

          {/* Entry grid */}
          <div className="overflow-auto rounded border border-gray-200">
            <table className="w-full min-w-[1100px] border-collapse text-xs">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-left">
                  <th className="w-10 px-2 py-2 font-semibold text-gray-700">S.No.</th>
                  <th className="w-56 px-2 py-2 font-semibold text-gray-700">Particular</th>
                  <th className="w-32 px-2 py-2 font-semibold text-gray-700">Division</th>
                  <th className="w-40 px-2 py-2 font-semibold text-gray-700">Subledger</th>
                  <th className="w-36 px-2 py-2 font-semibold text-gray-700">Agent</th>
                  <th className="w-24 px-2 py-2 font-semibold text-gray-700">Debit</th>
                  <th className="w-24 px-2 py-2 font-semibold text-gray-700">Credit</th>
                  <th className="px-2 py-2 font-semibold text-gray-700">Narration</th>
                  <th className="w-16 px-2 py-2 font-semibold text-gray-700">#</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 py-1 text-gray-600">{idx + 1}</td>
                    <td className="px-2 py-1">
                      <div className="flex items-center gap-1">
                        <select
                          value={row.glCode}
                          onChange={(e) => handleParticularChange(row.id, e.target.value)}
                          className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                        >
                          <option value="">---Select---</option>
                          {LEDGER_OPTIONS.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.desc}
                            </option>
                          ))}
                        </select>
                        <Search size={12} className="shrink-0 text-gray-400" />
                      </div>
                    </td>
                    <td className="px-2 py-1">
                      <select
                        value={row.division}
                        onChange={(e) => updateRow(row.id, "division", e.target.value)}
                        className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                      >
                        {DIVISION_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d || "---Select---"}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <select
                        value={row.subledger}
                        onChange={(e) => updateRow(row.id, "subledger", e.target.value)}
                        className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                      >
                        {SUBLEDGER_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s || "---Select---"}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <select
                        value={row.agent}
                        onChange={(e) => updateRow(row.id, "agent", e.target.value)}
                        className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                      >
                        {AGENT_OPTIONS.map((a) => (
                          <option key={a} value={a}>
                            {a || "---Select---"}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={row.debit}
                        onChange={(e) => updateRow(row.id, "debit", e.target.value)}
                        className="w-full rounded border border-gray-300 px-1.5 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={row.credit}
                        onChange={(e) => updateRow(row.id, "credit", e.target.value)}
                        className="w-full rounded border border-gray-300 px-1.5 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={row.narration}
                        onChange={(e) => updateRow(row.id, "narration", e.target.value)}
                        className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex items-center gap-1">
                        <button onClick={() => clearRow(row.id)} title="Clear row" className="text-gray-400 hover:text-sky-600">
                          <RefreshCw size={13} />
                        </button>
                        <button onClick={() => deleteRow(row.id)} title="Delete row" className="text-gray-400 hover:text-red-600">
                          <XIcon size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td colSpan={2} className="px-2 py-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <span>Code</span>
                      <input value={footerLedger?.code ?? ""} readOnly className="w-24 rounded border border-gray-200 bg-white px-1.5 py-1 text-xs" />
                      <span>Balance</span>
                      <input value={footerLedger ? footerLedger.balance.toFixed(2) : ""} readOnly className="w-28 rounded border border-gray-200 bg-white px-1.5 py-1 text-xs" />
                    </div>
                  </td>
                  <td colSpan={6}></td>
                  <td className="px-2 py-2">
                    <button onClick={addRow} title="Add row" className="text-sky-600 hover:text-sky-800">
                      <Plus size={16} />
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <Field label="Total Dr" width="w-36">
              <input value={totals.totalDr.toFixed(2)} disabled className="w-full rounded border border-gray-200 bg-gray-100 px-2 py-1.5 text-right text-sm text-gray-600" />
            </Field>
            <Field label="Total Local Dr" width="w-36">
              <input value={totals.totalLocalDr.toFixed(2)} disabled className="w-full rounded border border-gray-200 bg-gray-100 px-2 py-1.5 text-right text-sm text-gray-600" />
            </Field>
            <Field label="Total Cr" width="w-36">
              <input value={totals.totalCr.toFixed(2)} disabled className="w-full rounded border border-gray-200 bg-gray-100 px-2 py-1.5 text-right text-sm text-gray-600" />
            </Field>
            <Field label="Total Local Cr" width="w-36">
              <input value={totals.totalLocalCr.toFixed(2)} disabled className="w-full rounded border border-gray-200 bg-gray-100 px-2 py-1.5 text-right text-sm text-gray-600" />
            </Field>
            {Math.abs(totals.totalDr - totals.totalCr) > 0.001 && (totals.totalDr > 0 || totals.totalCr > 0) && (
              <span className="text-xs font-medium text-red-600">Debit and Credit totals do not match.</span>
            )}
          </div>

          {/* Remarks */}
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-gray-600">Remarks</label>
            <input
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 rounded bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Saving..." : "Save"}
            </button>
            <button className="flex items-center gap-1 rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
              <Printer size={14} /> Save & Print
            </button>
            <button className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            {savedMsg && <span className="text-sm text-green-600">{savedMsg}</span>}
          </div>
        </div>

        {/* Footer bar */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-center text-xs text-gray-500">
          © 2010 - 2026 - Global Tech Solutions Pvt. Ltd.
        </div>
      </div>

      {/* Import modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Import Ledger Opening</h2>
              <button onClick={() => setImportOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={16} />
              </button>
            </div>
            <p className="mb-3 text-xs text-gray-500">
              Non-existing ledgers, agents, divisions, or subledgers will be created once you click Import.
            </p>
            <label className="flex cursor-pointer items-center justify-between rounded border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50">
              <span>{importFileName || "Choose Excel File..."}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => setImportFileName(e.target.files?.[0]?.name ?? "")}
              />
            </label>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button className="flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                <Download size={13} /> Download Template
              </button>
              <button
                onClick={() => setImportOpen(false)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setImportOpen(false)}
                className="rounded bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small labeled field wrapper for the voucher header row
// ---------------------------------------------------------------------------
function Field({ label, width, children }: { label: string; width: string; children: React.ReactNode }) {
  return (
    <div className={width}>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Optional: swap the mocks for real API calls, e.g.
//
// async function fetchLedgerOptions(searchText: string): Promise<LedgerOption[]> {
//   const res = await fetch(`/api/master/ledger-search?q=${searchText}`);
//   return res.json();
// }
//
// and fetch CURRENCY_OPTIONS / DIVISION_OPTIONS / SUBLEDGER_OPTIONS / AGENT_OPTIONS
// from their respective master-data endpoints. handleSave() should POST the
// voucher header + rows to /api/finance/ledger-opening.
// ---------------------------------------------------------------------------