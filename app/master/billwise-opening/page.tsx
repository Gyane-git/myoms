"use client";

import { useMemo, useState } from "react";
import { Plus, RefreshCw, X as XIcon, Search, Save, Upload, Download } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PartyOption {
  code: string;
  desc: string;
  panNo: string;
  currBal: number;
  crLimit: number;
}

interface EntryRow {
  id: number;
  vNo: string;
  date: string;
  miti: string;
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
const PARTY_OPTIONS: PartyOption[] = [
  { code: "AN00001", desc: "ANKHU ENTERPRISES", panNo: "123444444", currBal: -8000, crLimit: 0 },
  { code: "00001", desc: "Sujal Suppliers-V", panNo: "", currBal: 800, crLimit: 0 },
  { code: "NI00012", desc: "NITESH ADHIKARI", panNo: "123456789", currBal: 102260, crLimit: 0 },
  { code: "1683", desc: "helembhu", panNo: "601286125", currBal: 66780, crLimit: 0 },
  { code: "AROt001", desc: "ARUN JI", panNo: "999999999", currBal: 2989023, crLimit: 0 },
];

const DIVISION_OPTIONS = ["", "Head Office", "Branch A", "Branch B"];
const SUBLEDGER_OPTIONS = ["", "ANKHU ENTERPRISES", "Sujal Suppliers-V", "sssss"];
const AGENT_OPTIONS = ["", "Ravi Agent", "Sam Agent", "Milan Agent"];

function emptyRow(id: number): EntryRow {
  return {
    id,
    vNo: "",
    date: "2025-07-16",
    miti: "32/03/2082",
    division: "",
    subledger: "",
    agent: "",
    debit: "",
    credit: "",
    narration: "",
  };
}

export default function BillwiseOpeningPage() {
  const [partyCode, setPartyCode] = useState("");
  const [rows, setRows] = useState<EntryRow[]>([
    emptyRow(1),
    emptyRow(2),
    emptyRow(3),
    emptyRow(4),
    emptyRow(5),
  ]);
  const [importOpen, setImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [nextRowId, setNextRowId] = useState(6);

  const selectedParty = PARTY_OPTIONS.find((p) => p.code === partyCode);

  const totals = useMemo(() => {
    const totalDr = rows.reduce((sum, r) => sum + (parseFloat(r.debit) || 0), 0);
    const totalCr = rows.reduce((sum, r) => sum + (parseFloat(r.credit) || 0), 0);
    return {
      totalDr,
      totalCr,
      totalLocalDr: totalDr,
      totalLocalCr: totalCr,
    };
  }, [rows]);

  function updateRow<K extends keyof EntryRow>(id: number, key: K, value: EntryRow[K]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow(nextRowId)]);
    setNextRowId((n) => n + 1);
  }

  function deleteRow(id: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function handleSave() {
    setSaving(true);
    // Swap for: await fetch("/api/finance/billwise-opening", { method: "POST", body: JSON.stringify({...}) });
    setTimeout(() => {
      setSaving(false);
      setSavedMsg("Billwise opening voucher saved.");
    }, 400);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="mx-auto max-w-1xl overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t-4 border-t-sky-400 bg-gray-100 px-4 py-2">
          <h1 className="text-sm font-medium text-gray-700">Billwise Opening</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setPartyCode("");
                setRows([emptyRow(1), emptyRow(2), emptyRow(3), emptyRow(4), emptyRow(5)]);
                setNextRowId(6);
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
          {/* Party header fields */}
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <Field label="Party Name" width="w-64">
              <div className="flex items-center gap-1">
                <select
                  value={partyCode}
                  onChange={(e) => setPartyCode(e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
                >
                  <option value="">---Select---</option>
                  {PARTY_OPTIONS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.desc}
                    </option>
                  ))}
                </select>
                <Search size={14} className="shrink-0 text-gray-400" />
              </div>
            </Field>
            <Field label="Pan No" width="w-32">
              <input value={selectedParty?.panNo ?? ""} disabled className="w-full rounded border border-gray-200 bg-gray-100 px-2 py-1.5 text-sm text-gray-600" />
            </Field>
            <Field label="Curr Bal" width="w-32">
              <input
                value={selectedParty ? selectedParty.currBal.toFixed(2) : ""}
                disabled
                className="w-full rounded border border-gray-200 bg-gray-100 px-2 py-1.5 text-right text-sm text-gray-600"
              />
            </Field>
            <Field label="Cr Limit" width="w-32">
              <input
                value={selectedParty ? selectedParty.crLimit.toFixed(2) : ""}
                disabled
                className="w-full rounded border border-gray-200 bg-gray-100 px-2 py-1.5 text-right text-sm text-gray-600"
              />
            </Field>
          </div>

          {/* Entry grid */}
          <div className="overflow-auto rounded border border-gray-200">
            <table className="w-full min-w-[1100px] border-collapse text-xs">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-left">
                  <th className="w-10 px-2 py-2 font-semibold text-gray-700">S.No.</th>
                  <th className="w-24 px-2 py-2 font-semibold text-gray-700">VNo</th>
                  <th className="w-28 px-2 py-2 font-semibold text-gray-700">Date</th>
                  <th className="w-28 px-2 py-2 font-semibold text-gray-700">Miti</th>
                  <th className="w-32 px-2 py-2 font-semibold text-gray-700">Division</th>
                  <th className="w-40 px-2 py-2 font-semibold text-gray-700">Subledger</th>
                  <th className="w-36 px-2 py-2 font-semibold text-gray-700">Agent</th>
                  <th className="w-24 px-2 py-2 font-semibold text-gray-700">Debit</th>
                  <th className="w-24 px-2 py-2 font-semibold text-gray-700">Credit</th>
                  <th className="px-2 py-2 font-semibold text-gray-700">Narration</th>
                  <th className="w-10 px-2 py-2 font-semibold text-gray-700">#</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 py-1 text-gray-600">{idx + 1}</td>
                    <td className="px-2 py-1">
                      <input
                        value={row.vNo}
                        onChange={(e) => updateRow(row.id, "vNo", e.target.value)}
                        className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => updateRow(row.id, "date", e.target.value)}
                        className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={row.miti}
                        onChange={(e) => updateRow(row.id, "miti", e.target.value)}
                        placeholder="dd/mm/yyyy"
                        className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                      />
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
                      <button onClick={() => deleteRow(row.id)} title="Delete row" className="text-gray-400 hover:text-red-600">
                        <XIcon size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td colSpan={10}></td>
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

          {/* Actions */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 rounded bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Saving..." : "Save"}
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
              <h2 className="text-sm font-semibold text-gray-800">Import Billwise Opening</h2>
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
// Small labeled field wrapper for the header row
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
// async function fetchPartyOptions(searchText: string): Promise<PartyOption[]> {
//   const res = await fetch(`/api/master/ledger-search?q=${searchText}`);
//   return res.json();
// }
//
// and fetch DIVISION_OPTIONS / SUBLEDGER_OPTIONS / AGENT_OPTIONS from their
// respective master-data endpoints. handleSave() should POST the party code +
// rows to /api/finance/billwise-opening.
// ---------------------------------------------------------------------------