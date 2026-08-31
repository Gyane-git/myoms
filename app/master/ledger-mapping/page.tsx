"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Save, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface GroupOption {
  value: string;
  label: string;
}

interface LedgerMappingRow {
  id: number;
  glCode: string;
  particular: string; // GlDesc
  shortName: string; // GlShortName / Code column
  panNo: string;
  group: string; // filled from selected A/c Group label
  subGroup: string;
  group1: string; // Account Add Group1
  group2: string; // Account Add Group2
  agent: string;
  area: string;
  scheme: string;
  mobileNo: string;
  address: string;
  creditLimit: string;
  creditDay: string;
  expenses: boolean;
}

// ---------------------------------------------------------------------------
// Mirrors <select id="SelectAccountGroup"> from the legacy page
// ---------------------------------------------------------------------------
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
  { value: "9", label: "Finance Cost" },
  { value: "10", label: "Fixed Assets" },
  { value: "11", label: "GENERAL" },
  { value: "12", label: "Income" },
  { value: "14", label: "LOAN" },
  { value: "13", label: "Long Term Borrowings" },
  { value: "15", label: "Non-Current Assets" },
  { value: "17", label: "Other Expenses" },
  { value: "16", label: "Other Liabilities" },
  { value: "18", label: "OTHER LOAN" },
  { value: "19", label: "Prepaid Expenses" },
  { value: "20", label: "PROVISION" },
  { value: "21", label: "Resurve & Surplus" },
  { value: "23", label: "SUNDRY CREDITORS" },
  { value: "26", label: "SUNDRY DEBTOR SEMI RED ALERT" },
  { value: "22", label: "SUNDRY DEBTORS" },
  { value: "25", label: "SUNDRY DEBTORS - RED ALERT" },
  { value: "24", label: "SUNDRY DEBTORS CASH" },
  { value: "27", label: "SUNDRY DEBTORS SOHANLAL JI" },
  { value: "28", label: "Tax & Charges" },
];

// Lookup pick-lists — replace with real fetches (Agent, Area, Scheme, Subgroup, Group1, Group2)
const SUBGROUP_OPTIONS_BY_GROUP: Record<string, GroupOption[]> = {
  "6": [
    { value: "sg1", label: "Bank Accounts" },
    { value: "sg2", label: "Cash Accounts" },
  ],
  "22": [
    { value: "sg3", label: "Local Debtors" },
    { value: "sg4", label: "Export Debtors" },
  ],
};

const AGENT_OPTIONS = ["", "Ravi Agent", "Sam Agent", "Milan Agent"];
const AREA_OPTIONS = ["", "Kathmandu", "Pokhara", "Biratnagar"];
const SCHEME_OPTIONS = ["", "Festival Scheme", "Bulk Discount", "None"];

// Mock ledgers per group — replace with fetchLedgersByGroup() at the bottom
const MOCK_LEDGERS_BY_GROUP: Record<string, Omit<LedgerMappingRow, "group" | "subGroup">[]> = {
  "6": [
    { id: 1, glCode: "CA00001", particular: "Cash In Hand", shortName: "Cash", panNo: "", group1: "", group2: "", agent: "", area: "", scheme: "", mobileNo: "", address: "", creditLimit: "0.00", creditDay: "0", expenses: false },
    { id: 2, glCode: "NB00001", particular: "Nabil Bank", shortName: "Nabil", panNo: "", group1: "", group2: "", agent: "", area: "", scheme: "", mobileNo: "", address: "", creditLimit: "0.00", creditDay: "0", expenses: false },
  ],
  "22": [
    { id: 3, glCode: "AN00001", particular: "ANKHU ENTERPRISES", shortName: "AN00001", panNo: "123444444", group1: "", group2: "", agent: "", area: "", scheme: "", mobileNo: "9999999999", address: "PUTALISADAK", creditLimit: "0.00", creditDay: "0", expenses: false },
    { id: 4, glCode: "SU00001", particular: "Sujal Suppliers-V", shortName: "SU00001", panNo: "", group1: "", group2: "", agent: "", area: "", scheme: "", mobileNo: "", address: "", creditLimit: "0.00", creditDay: "0", expenses: false },
  ],
  "8": [
    { id: 5, glCode: "TR00001", particular: "TRANSPORT EXPENSES", shortName: "TR00001", panNo: "", group1: "", group2: "", agent: "", area: "", scheme: "", mobileNo: "", address: "", creditLimit: "0.00", creditDay: "0", expenses: true },
    { id: 6, glCode: "FR00001", particular: "FRIEGHT", shortName: "FR00001", panNo: "", group1: "", group2: "", agent: "", area: "", scheme: "", mobileNo: "", address: "", creditLimit: "0.00", creditDay: "0", expenses: false },
  ],
};

function fetchLedgersByGroup(groupCode: string, groupLabel: string, subGroupLabel: string): LedgerMappingRow[] {
  // Swap for: const res = await fetch(`/api/master/ledger?group=${groupCode}&subgroup=${subGroupCode}`);
  const base = MOCK_LEDGERS_BY_GROUP[groupCode] ?? [];
  return base.map((r) => ({ ...r, group: groupLabel, subGroup: subGroupLabel }));
}

export default function LedgerMappingPage() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubgroup, setSelectedSubgroup] = useState("");
  const [rows, setRows] = useState<LedgerMappingRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const groupLabel = useMemo(
    () => GROUP_OPTIONS.find((g) => g.value === selectedGroup)?.label ?? "",
    [selectedGroup]
  );
  const subgroupOptions = useMemo(
    () => (selectedGroup ? SUBGROUP_OPTIONS_BY_GROUP[selectedGroup] ?? [] : []),
    [selectedGroup]
  );
  const subgroupLabel = useMemo(
    () => subgroupOptions.find((s) => s.value === selectedSubgroup)?.label ?? "",
    [selectedSubgroup, subgroupOptions]
  );

  // Load ledgers whenever group or subgroup changes (mirrors BindLedger / BindLedgerAccountSubGroup)
  useEffect(() => {
    if (!selectedGroup) {
      setRows([]);
      return;
    }
    setRows(fetchLedgersByGroup(selectedGroup, groupLabel, subgroupLabel));
  }, [selectedGroup, subgroupLabel, groupLabel]);

  function handleGroupChange(value: string) {
    setSelectedGroup(value);
    setSelectedSubgroup("");
    setSavedMsg("");
  }

  function handleSubgroupChange(value: string) {
    setSelectedSubgroup(value);
    setSavedMsg("");
  }

  function updateRow<K extends keyof LedgerMappingRow>(id: number, key: K, value: LedgerMappingRow[K]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  function handleSave() {
    setSaving(true);
    // Swap for: await fetch("/api/master/ledger-mapping", { method: "POST", body: JSON.stringify(rows) });
    setTimeout(() => {
      setSaving(false);
      setSavedMsg(`Saved mapping for ${rows.length} ledger${rows.length === 1 ? "" : "s"}.`);
    }, 400);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="mx-auto max-w-1xl overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        {/* Header bar */}
        <div className="border-t-4 border-t-sky-400 bg-gray-100 px-4 py-2">
          <h1 className="text-sm font-medium text-gray-700">Ledger Mapping</h1>
        </div>

        <div className="p-4">
          {/* Group / Subgroup selectors */}
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="select-acc-group" className="text-sm text-gray-700">
                A/c Group
              </label>
              <select
                id="select-acc-group"
                value={selectedGroup}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-56 rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
              >
                <option value="">---Select---</option>
                {GROUP_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="select-acc-subgroup" className="text-sm text-gray-700">
                A/c Subgroup
              </label>
              <select
                id="select-acc-subgroup"
                value={selectedSubgroup}
                onChange={(e) => handleSubgroupChange(e.target.value)}
                disabled={!selectedGroup}
                className="w-56 rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:bg-gray-100"
              >
                <option value="">---Select---</option>
                {subgroupOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ledger mapping grid */}
          <div className="overflow-auto rounded border border-gray-200" style={{ maxHeight: 420 }}>
            <table className="w-full min-w-[1600px] border-collapse text-xs">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-200 text-left">
                  <th className="w-10 px-2 py-2 font-semibold text-gray-700">SNo.</th>
                  <th className="w-56 px-2 py-2 font-semibold text-gray-700">Particular</th>
                  <th className="w-24 px-2 py-2 font-semibold text-gray-700">Code</th>
                  <th className="w-28 px-2 py-2 font-semibold text-gray-700">Pan No</th>
                  <th className="w-32 px-2 py-2 font-semibold text-gray-700">Group</th>
                  <th className="w-32 px-2 py-2 font-semibold text-gray-700">Subgroup</th>
                  <th className="w-32 px-2 py-2 font-semibold text-gray-700">Group 1</th>
                  <th className="w-32 px-2 py-2 font-semibold text-gray-700">Group 2</th>
                  <th className="w-32 px-2 py-2 font-semibold text-gray-700">Agent</th>
                  <th className="w-32 px-2 py-2 font-semibold text-gray-700">Area</th>
                  <th className="w-32 px-2 py-2 font-semibold text-gray-700">Scheme</th>
                  <th className="w-28 px-2 py-2 font-semibold text-gray-700">Mobile No</th>
                  <th className="w-40 px-2 py-2 font-semibold text-gray-700">Address</th>
                  <th className="w-24 px-2 py-2 font-semibold text-gray-700">Cr Limit</th>
                  <th className="w-20 px-2 py-2 font-semibold text-gray-700">Cr Days</th>
                  <th className="w-20 px-2 py-2 font-semibold text-gray-700">Expenses</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="py-8 text-center text-gray-400">
                      {selectedGroup ? "No ledgers found for this group" : "Select an A/c Group to load ledgers"}
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-2 py-1 text-gray-600">{idx + 1}</td>
                      <td className="px-2 py-1">
                        <input
                          value={row.particular}
                          readOnly
                          className="w-full rounded border border-gray-200 bg-gray-50 px-1.5 py-1 text-xs text-gray-700"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          value={row.shortName}
                          readOnly
                          className="w-full rounded border border-gray-200 bg-gray-50 px-1.5 py-1 text-xs text-gray-700"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          value={row.panNo}
                          onChange={(e) => updateRow(row.id, "panNo", e.target.value)}
                          className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          value={row.group}
                          readOnly
                          className="w-full rounded border border-gray-200 bg-gray-50 px-1.5 py-1 text-xs text-gray-700"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          value={row.subGroup}
                          readOnly
                          className="w-full rounded border border-gray-200 bg-gray-50 px-1.5 py-1 text-xs text-gray-700"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <LookupField value={row.group1} onChange={(v) => updateRow(row.id, "group1", v)} placeholder="Search group1..." />
                      </td>
                      <td className="px-2 py-1">
                        <LookupField value={row.group2} onChange={(v) => updateRow(row.id, "group2", v)} placeholder="Search group2..." />
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
                        <select
                          value={row.area}
                          onChange={(e) => updateRow(row.id, "area", e.target.value)}
                          className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                        >
                          {AREA_OPTIONS.map((a) => (
                            <option key={a} value={a}>
                              {a || "---Select---"}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1">
                        <select
                          value={row.scheme}
                          onChange={(e) => updateRow(row.id, "scheme", e.target.value)}
                          className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                        >
                          {SCHEME_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s || "---Select---"}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1">
                        <input
                          value={row.mobileNo}
                          onChange={(e) => updateRow(row.id, "mobileNo", e.target.value)}
                          className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          value={row.address}
                          onChange={(e) => updateRow(row.id, "address", e.target.value)}
                          className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          value={row.creditLimit}
                          onChange={(e) => updateRow(row.id, "creditLimit", e.target.value)}
                          className="w-full rounded border border-gray-300 px-1.5 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          value={row.creditDay}
                          onChange={(e) => updateRow(row.id, "creditDay", e.target.value)}
                          className="w-full rounded border border-gray-300 px-1.5 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={row.expenses}
                          onChange={(e) => updateRow(row.id, "expenses", e.target.checked)}
                          className="h-4 w-4 accent-sky-600"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Save / Cancel */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={rows.length === 0 || saving}
              className="flex items-center gap-1 rounded bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setSelectedGroup("");
                setSelectedSubgroup("");
                setSavedMsg("");
              }}
              className="flex items-center gap-1 rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <X size={14} /> Cancel
            </button>
            {savedMsg && <span className="text-sm text-green-600">{savedMsg}</span>}
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
// A lightweight stand-in for the legacy "search picker" fields (Group1/Group2
// used a modal + table picker; simplified here to a plain text input with a
// search icon). Swap the icon button's onClick for a real picker modal/drawer
// if you need the full pick-list UX back.
// ---------------------------------------------------------------------------
function LookupField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
      />
      <button type="button" className="shrink-0 text-gray-400 hover:text-sky-600" title="Search">
        <Search size={12} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Optional: swap the mock lookups for real API calls, e.g.
//
// async function fetchLedgersByGroup(groupCode: string, subGroupCode: string): Promise<LedgerMappingRow[]> {
//   const res = await fetch(`/api/master/ledger?group=${groupCode}&subgroup=${subGroupCode}`);
//   return res.json();
// }
//
// and fetch GROUP_OPTIONS / SUBGROUP_OPTIONS_BY_GROUP / AGENT_OPTIONS / AREA_OPTIONS /
// SCHEME_OPTIONS from their respective master-data endpoints.
// ---------------------------------------------------------------------------