"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface GroupOption {
  value: string;
  label: string;
}

interface LedgerRow {
  id: number;
  name: string;
}

// Mirrors the <select id="SelectGroup"> options from the legacy page.
// Replace with a fetch from /api/master/account-group when wiring the real API.
const GROUP_OPTIONS: GroupOption[] = [
  { value: "A00001", label: "A" },
  { value: "ab00001", label: "abc" },
  { value: "1", label: "Administrative Expenses  mmmm" },
  { value: "2", label: "Capital & Reserves" },
  { value: "6", label: "CASH N BANK" },
  { value: "5", label: "Cost of Goods Sold" },
  { value: "4", label: "Current Assets" },
  { value: "3", label: "Current Liabilities" },
  { value: "8", label: "Expenditure" },
  { value: "7", label: "Export Expenses" },
  { value: "fd00001", label: "fdsafadsf" },
  { value: "9", label: "Finance Cost" },
  { value: "10", label: "Fixed Assets" },
  { value: "11", label: "GENERAL" },
  { value: "gf00001", label: "gfghfgfgfg" },
  { value: "12", label: "Income" },
  { value: "jn00001", label: "jna" },
  { value: "14", label: "LOAN" },
  { value: "13", label: "Long Term Borrowings" },
  { value: "15", label: "Non-Current Assets" },
  { value: "17", label: "Other Expenses" },
  { value: "16", label: "Other Liabilities" },
  { value: "18", label: "OTHER LOAN" },
  { value: "19", label: "Prepaid Expenses" },
  { value: "20", label: "PROVISION" },
  { value: "ra00001", label: "random" },
  { value: "ra00002", label: "ravi" },
  { value: "ra00003", label: "ravizzz" },
  { value: "21", label: "Resurve & Surplus" },
  { value: "sa00001", label: "sam" },
  { value: "sh00001", label: "shahaaa" },
  { value: "ss00001ss", label: "ssss" },
  { value: "ss00001", label: "ssssss" },
  { value: "23", label: "SUNDRY CREDITORS" },
  { value: "26", label: "SUNDRY DEBTOR SEMI RED ALERT" },
  { value: "22", label: "SUNDRY DEBTORS" },
  { value: "25", label: "SUNDRY DEBTORS - RED ALERT" },
  { value: "24", label: "SUNDRY DEBTORS CASH" },
  { value: "27", label: "SUNDRY DEBTORS SOHANLAL JI" },
  { value: "28", label: "Tax & Charges" },
  { value: "To00001", label: "Today expenditure" },
  { value: "xx00001", label: "xxxxxxxxx" },
];

// ---------------------------------------------------------------------------
// Mock per-group ledger lookup (replace with fetchLedgersByGroup() below)
// ---------------------------------------------------------------------------
const MOCK_LEDGERS_BY_GROUP: Record<string, LedgerRow[]> = {
  "6": [
    { id: 1, name: "Cash In Hand" },
    { id: 2, name: "Nabil Bank" },
    { id: 3, name: "NIC Asia Bank" },
    { id: 4, name: "Petty Cash" },
  ],
  "22": [
    { id: 5, name: "ANKHU ENTERPRISES" },
    { id: 6, name: "Sujal Suppliers-V" },
    { id: 7, name: "sssss" },
  ],
  "8": [
    { id: 8, name: "TRANSPORT EXPENSES" },
    { id: 9, name: "FRIEGHT" },
    { id: 10, name: "LOAD/UNLOAD" },
  ],
};

function fetchLedgersByGroup(groupValue: string): LedgerRow[] {
  // Swap this for: const res = await fetch(`/api/master/ledger?group=${groupValue}`);
  return MOCK_LEDGERS_BY_GROUP[groupValue] ?? [];
}

export default function LedgerUnitAllocationPage() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const ledgers = useMemo(
    () => (selectedGroup ? fetchLedgersByGroup(selectedGroup) : []),
    [selectedGroup]
  );

  function handleGroupChange(value: string) {
    setSelectedGroup(value);
    setChecked(new Set());
    setSavedMsg("");
  }

  function toggleLedger(id: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (checked.size === ledgers.length) {
      setChecked(new Set());
    } else {
      setChecked(new Set(ledgers.map((l) => l.id)));
    }
  }

  function handleSave() {
    setSaving(true);
    // Swap this for: await fetch("/api/master/ledger-unit-allocation", { method: "POST", body: JSON.stringify({ group: selectedGroup, ledgerIds: [...checked] }) });
    setTimeout(() => {
      setSaving(false);
      setSavedMsg(`Saved allocation for ${checked.size} ledger${checked.size === 1 ? "" : "s"}.`);
    }, 400);
  }

  const allChecked = ledgers.length > 0 && checked.size === ledgers.length;

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="mx-auto max-w-1xl overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        {/* Header bar */}
        <div className="border-t-4 border-t-sky-400 bg-gray-100 px-4 py-2">
          <h1 className="text-sm font-medium text-gray-700">Ledger Unit allocation</h1>
        </div>

        <div className="p-4">
          {/* Group selector */}
          <div className="mb-4 flex items-center gap-3">
            <label htmlFor="select-group" className="w-24 shrink-0 text-sm text-gray-700">
              Group
            </label>
            <select
              id="select-group"
              value={selectedGroup}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="w-full max-w-xs rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
            >
              <option value="">---Select---</option>
              {GROUP_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ledger table */}
          <div className="overflow-auto rounded border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="w-10 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      disabled={ledgers.length === 0}
                      className="h-4 w-4 accent-sky-600"
                    />
                  </th>
                  <th className="py-2 text-center font-semibold text-gray-700">Ledger</th>
                </tr>
              </thead>
              <tbody>
                {!selectedGroup ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-gray-400">
                      Select a group to view its ledgers
                    </td>
                  </tr>
                ) : ledgers.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-gray-400">
                      No ledgers found for this group
                    </td>
                  </tr>
                ) : (
                  ledgers.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => toggleLedger(l.id)}
                      className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checked.has(l.id)}
                          onChange={() => toggleLedger(l.id)}
                          className="h-4 w-4 accent-sky-600"
                        />
                      </td>
                      <td className="py-2 text-center text-gray-700">{l.name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Save */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!selectedGroup || saving}
              className="rounded bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {savedMsg && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check size={14} /> {savedMsg}
              </span>
            )}
          </div>
        </div>

        {/* Footer bar */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-center text-xs text-gray-500">
          © 2010 - 2026 - Global Tech Solutions Pvt. Ltd.
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Optional: swap the mock lookup for a real API call, e.g.
//
// async function fetchLedgersByGroup(groupValue: string): Promise<LedgerRow[]> {
//   const res = await fetch(`/api/master/ledger?group=${groupValue}`);
//   return res.json();
// }
//
// and fetch GROUP_OPTIONS from /api/master/account-group in a useEffect.
// ---------------------------------------------------------------------------