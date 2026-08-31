"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type MainGroup = "Assets" | "Liabilities" | "Income" | "Expenditure";

interface AccountGroupRow {
  id: number;
  description: string;
  code: string;
  schedule: number;
  mainGroup: MainGroup;
  tradingAccount: boolean;
}

const MAIN_GROUP_OPTIONS: MainGroup[] = ["Assets", "Liabilities", "Income", "Expenditure"];

// ---------------------------------------------------------------------------
// Seed data (replace with an API call — see fetchAccountGroups() below)
// ---------------------------------------------------------------------------
const SEED_DATA: AccountGroupRow[] = [
  { id: 1, description: "A", code: "A00001", schedule: 34, mainGroup: "Assets", tradingAccount: false },
  { id: 2, description: "abc", code: "ab00001", schedule: 33, mainGroup: "Assets", tradingAccount: false },
  { id: 3, description: "Administrative Expenses", code: "A000000001", schedule: 1, mainGroup: "Expenditure", tradingAccount: false },
  { id: 4, description: "Capital & Reserves", code: "C000000001", schedule: 2, mainGroup: "Liabilities", tradingAccount: false },
  { id: 5, description: "CASH N BANK", code: "CA00001", schedule: 23, mainGroup: "Assets", tradingAccount: false },
  { id: 6, description: "Cost of Goods Sold", code: "C000000004", schedule: 5, mainGroup: "Expenditure", tradingAccount: true },
  { id: 7, description: "Current Assets", code: "C000000003", schedule: 4, mainGroup: "Assets", tradingAccount: false },
  { id: 8, description: "Current Liabilities", code: "C000000002", schedule: 3, mainGroup: "Liabilities", tradingAccount: false },
  { id: 9, description: "SUNDRY DEBTORS", code: "SU00001", schedule: 18, mainGroup: "Assets", tradingAccount: false },
  { id: 10, description: "Income", code: "I000000001", schedule: 10, mainGroup: "Income", tradingAccount: false },
];

const PAGE_SIZE = 10;

type SortKey = "id" | "description" | "code" | "schedule" | "mainGroup";
type SortDir = "asc" | "desc";

export default function AccountGroupMasterPage() {
  const [rows, setRows] = useState<AccountGroupRow[]>(SEED_DATA);
  const [search, setSearch] = useState("");
  const [descFilter, setDescFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState("");
  const [mainGroupFilter, setMainGroupFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<AccountGroupRow | null>(null);
  const [form, setForm] = useState({
    description: "",
    code: "",
    schedule: "",
    mainGroup: "Assets" as MainGroup,
    tradingAccount: false,
  });

  // -------------------------------------------------------------------------
  // Derived data: filter -> sort -> paginate
  // -------------------------------------------------------------------------
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const globalMatch =
        !search ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.code.toLowerCase().includes(search.toLowerCase()) ||
        r.mainGroup.toLowerCase().includes(search.toLowerCase());
      const descMatch = !descFilter || r.description.toLowerCase().includes(descFilter.toLowerCase());
      const codeMatch = !codeFilter || r.code.toLowerCase().includes(codeFilter.toLowerCase());
      const scheduleMatch = !scheduleFilter || String(r.schedule).includes(scheduleFilter);
      const mainGroupMatch =
        !mainGroupFilter || r.mainGroup.toLowerCase().includes(mainGroupFilter.toLowerCase());
      return globalMatch && descMatch && codeMatch && scheduleMatch && mainGroupMatch;
    });
  }, [rows, search, descFilter, codeFilter, scheduleFilter, mainGroupFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // -------------------------------------------------------------------------
  // Add / Edit / Delete
  // -------------------------------------------------------------------------
  function openAddModal() {
    setEditingRow(null);
    setForm({ description: "", code: "", schedule: "", mainGroup: "Assets", tradingAccount: false });
    setModalOpen(true);
  }

  function openEditModal(row: AccountGroupRow) {
    setEditingRow(row);
    setForm({
      description: row.description,
      code: row.code,
      schedule: String(row.schedule),
      mainGroup: row.mainGroup,
      tradingAccount: row.tradingAccount,
    });
    setModalOpen(true);
  }

  function saveRow() {
    if (!form.description.trim() || !form.code.trim()) return;
    const scheduleNum = Number(form.schedule) || 0;

    if (editingRow) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingRow.id
            ? {
                ...r,
                description: form.description,
                code: form.code,
                schedule: scheduleNum,
                mainGroup: form.mainGroup,
                tradingAccount: form.tradingAccount,
              }
            : r
        )
      );
    } else {
      const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      setRows((prev) => [
        ...prev,
        {
          id: nextId,
          description: form.description,
          code: form.code,
          schedule: scheduleNum,
          mainGroup: form.mainGroup,
          tradingAccount: form.tradingAccount,
        },
      ]);
    }
    setModalOpen(false);
  }

  function deleteRow(id: number) {
    if (confirm("Delete this record?")) {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  }

  // -------------------------------------------------------------------------
  // Export helpers
  // -------------------------------------------------------------------------
  function copyToClipboard() {
    const text = [
      ["#", "Description", "Code", "Schedule", "Main Group", "Trading Account"].join("\t"),
      ...sorted.map((r) =>
        [r.id, r.description, r.code, r.schedule, r.mainGroup, r.tradingAccount ? "Yes" : "No"].join("\t")
      ),
    ].join("\n");
    navigator.clipboard.writeText(text);
  }

  function exportExcel() {
    const csv = [
      ["#", "Description", "Code", "Schedule", "Main Group", "Trading Account"].join(","),
      ...sorted.map((r) =>
        [
          r.id,
          `"${r.description}"`,
          r.code,
          r.schedule,
          r.mainGroup,
          r.tradingAccount ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "account-group.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function printTable() {
    window.print();
  }

  const sortIndicator = (key: SortKey) => (sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : "⇅");

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="mx-auto max-w-1xl overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        {/* Header bar */}
        <div className="flex items-center justify-between border-t-4 border-t-sky-400 bg-gray-100 px-4 py-2">
          <h1 className="text-sm font-medium text-gray-700">Account Group</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        <div className="p-4">
          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <button onClick={copyToClipboard} className="rounded border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">
                Copy
              </button>
              <button onClick={exportExcel} className="rounded border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">
                Excel
              </button>
              <button onClick={printTable} className="rounded border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">
                PDF
              </button>
              <button onClick={printTable} className="rounded border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">
                Print
              </button>
              <button className="rounded border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">
                Column visibility
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="global-search" className="text-gray-600">
                Search:
              </label>
              <input
                id="global-search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th
                    onClick={() => toggleSort("id")}
                    className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700"
                  >
                    # <span className="text-gray-400">{sortIndicator("id")}</span>
                  </th>
                  <th
                    onClick={() => toggleSort("description")}
                    className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700"
                  >
                    Description <span className="text-gray-400">{sortIndicator("description")}</span>
                  </th>
                  <th
                    onClick={() => toggleSort("code")}
                    className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700"
                  >
                    Code <span className="text-gray-400">{sortIndicator("code")}</span>
                  </th>
                  <th
                    onClick={() => toggleSort("schedule")}
                    className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700"
                  >
                    Schedule <span className="text-gray-400">{sortIndicator("schedule")}</span>
                  </th>
                  <th
                    onClick={() => toggleSort("mainGroup")}
                    className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700"
                  >
                    Main Group <span className="text-gray-400">{sortIndicator("mainGroup")}</span>
                  </th>
                  <th className="py-2 pr-2 font-semibold text-gray-700">Trading Account</th>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="py-1 pr-2">
                    <input
                      placeholder="#"
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-500"
                      disabled
                    />
                  </th>
                  <th className="py-1 pr-2">
                    <input
                      placeholder="Description"
                      value={descFilter}
                      onChange={(e) => {
                        setDescFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </th>
                  <th className="py-1 pr-2">
                    <input
                      placeholder="Code"
                      value={codeFilter}
                      onChange={(e) => {
                        setCodeFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </th>
                  <th className="py-1 pr-2">
                    <input
                      placeholder="Schedule"
                      value={scheduleFilter}
                      onChange={(e) => {
                        setScheduleFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </th>
                  <th className="py-1 pr-2">
                    <input
                      placeholder="Main Group"
                      value={mainGroupFilter}
                      onChange={(e) => {
                        setMainGroupFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </th>
                  <th className="py-1 pr-2" />
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400">
                      No matching records found
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(row)}
                            className="text-sky-600 hover:text-sky-800"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteRow(row.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="py-2 pr-2 text-gray-700">{row.description}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.code}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.schedule}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.mainGroup}</td>
                      <td className="py-2 pr-2 text-gray-700">
                        <input type="checkbox" checked={row.tradingAccount} disabled />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / pagination */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-sm text-gray-600">
            <span>
              Showing {sorted.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded border px-2 py-1 text-xs ${
                    p === currentPage
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-center text-xs text-gray-500">
          © 2010 - 2026 - Global Tech Solutions Pvt. Ltd.
        </div>
      </div>

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded bg-white p-4 shadow-lg">
            <h2 className="mb-3 text-sm font-semibold text-gray-800">
              {editingRow ? "Edit Account Group" : "Add Account Group"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Code</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Schedule</label>
                <input
                  type="number"
                  value={form.schedule}
                  onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Main Group</label>
                <select
                  value={form.mainGroup}
                  onChange={(e) => setForm((f) => ({ ...f, mainGroup: e.target.value as MainGroup }))}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
                >
                  {MAIN_GROUP_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="tradingAccount"
                  type="checkbox"
                  checked={form.tradingAccount}
                  onChange={(e) => setForm((f) => ({ ...f, tradingAccount: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="tradingAccount" className="text-xs font-medium text-gray-600">
                  Trading Account
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveRow}
                className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Optional: swap SEED_DATA for a real API call, e.g.
//
// async function fetchAccountGroups(): Promise<AccountGroupRow[]> {
//   const res = await fetch("/api/master/account-group");
//   return res.json();
// }
//
// then load it in a useEffect and setRows(data).
// ---------------------------------------------------------------------------