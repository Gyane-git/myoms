"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AccountAddGroup2Row {
  id: number;
  description: string;
  code: string;
  addGroup: string;
}

// Options for the Add Group dropdown — should mirror Account Add Group1 descriptions.
// Replace with a fetch from /api/master/account-add-group1 when wiring the real API.
const ADD_GROUP_OPTIONS = ["bbca", "fff", "musi bhaiiii"];

// ---------------------------------------------------------------------------
// Seed data (replace with an API call — see fetchAccountAddGroup2() below)
// ---------------------------------------------------------------------------
const SEED_DATA: AccountAddGroup2Row[] = [
  { id: 1, description: "bbbca", code: "bb00001", addGroup: "bbca" },
  { id: 2, description: "fffff", code: "ff00001", addGroup: "fff" },
];

const PAGE_SIZE = 10;

type SortKey = "id" | "description" | "code" | "addGroup";
type SortDir = "asc" | "desc";

export default function AccountAddGroup2MasterPage() {
  const [rows, setRows] = useState<AccountAddGroup2Row[]>(SEED_DATA);
  const [search, setSearch] = useState("");
  const [descFilter, setDescFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [addGroupFilter, setAddGroupFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<AccountAddGroup2Row | null>(null);
  const [form, setForm] = useState({ description: "", code: "", addGroup: ADD_GROUP_OPTIONS[0] });

  // -------------------------------------------------------------------------
  // Derived data: filter -> sort -> paginate
  // -------------------------------------------------------------------------
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const globalMatch =
        !search ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.code.toLowerCase().includes(search.toLowerCase()) ||
        r.addGroup.toLowerCase().includes(search.toLowerCase());
      const descMatch = !descFilter || r.description.toLowerCase().includes(descFilter.toLowerCase());
      const codeMatch = !codeFilter || r.code.toLowerCase().includes(codeFilter.toLowerCase());
      const addGroupMatch =
        !addGroupFilter || r.addGroup.toLowerCase().includes(addGroupFilter.toLowerCase());
      return globalMatch && descMatch && codeMatch && addGroupMatch;
    });
  }, [rows, search, descFilter, codeFilter, addGroupFilter]);

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
    setForm({ description: "", code: "", addGroup: ADD_GROUP_OPTIONS[0] });
    setModalOpen(true);
  }

  function openEditModal(row: AccountAddGroup2Row) {
    setEditingRow(row);
    setForm({ description: row.description, code: row.code, addGroup: row.addGroup });
    setModalOpen(true);
  }

  function saveRow() {
    if (!form.description.trim() || !form.code.trim()) return;

    if (editingRow) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingRow.id
            ? { ...r, description: form.description, code: form.code, addGroup: form.addGroup }
            : r
        )
      );
    } else {
      const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      setRows((prev) => [
        ...prev,
        { id: nextId, description: form.description, code: form.code, addGroup: form.addGroup },
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
      ["#", "Desc", "Code", "Add Group"].join("\t"),
      ...sorted.map((r) => [r.id, r.description, r.code, r.addGroup].join("\t")),
    ].join("\n");
    navigator.clipboard.writeText(text);
  }

  function exportExcel() {
    const csv = [
      ["#", "Desc", "Code", "Add Group"].join(","),
      ...sorted.map((r) => [r.id, `"${r.description}"`, r.code, `"${r.addGroup}"`].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "account-add-group2.csv";
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
          <h1 className="text-sm font-medium text-gray-700">Account Group2</h1>
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
                    Desc <span className="text-gray-400">{sortIndicator("description")}</span>
                  </th>
                  <th
                    onClick={() => toggleSort("code")}
                    className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700"
                  >
                    Code <span className="text-gray-400">{sortIndicator("code")}</span>
                  </th>
                  <th
                    onClick={() => toggleSort("addGroup")}
                    className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700"
                  >
                    Add Group <span className="text-gray-400">{sortIndicator("addGroup")}</span>
                  </th>
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
                      placeholder="Desc"
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
                      placeholder="Add Group"
                      value={addGroupFilter}
                      onChange={(e) => {
                        setAddGroupFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
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
                      <td className="py-2 pr-2 text-gray-700">{row.addGroup}</td>
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
              {editingRow ? "Edit Account Group2" : "Add Account Group2"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Desc</label>
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
                <label className="mb-1 block text-xs font-medium text-gray-600">Add Group</label>
                <select
                  value={form.addGroup}
                  onChange={(e) => setForm((f) => ({ ...f, addGroup: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
                >
                  {ADD_GROUP_OPTIONS.map((ag) => (
                    <option key={ag} value={ag}>
                      {ag}
                    </option>
                  ))}
                </select>
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
// Optional: swap SEED_DATA and ADD_GROUP_OPTIONS for real API calls, e.g.
//
// async function fetchAccountAddGroup2(): Promise<AccountAddGroup2Row[]> {
//   const res = await fetch("/api/master/account-add-group2");
//   return res.json();
// }
//
// async function fetchAddGroupOptions(): Promise<string[]> {
//   const res = await fetch("/api/master/account-add-group1");
//   const groups = await res.json();
//   return groups.map((g: { description: string }) => g.description);
// }
//
// then load both in a useEffect and setRows(data) / setAddGroupOptions(data).
// ---------------------------------------------------------------------------