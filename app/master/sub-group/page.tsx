"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus, Crosshair } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SubGroupRow {
  id: number;
  subGroup: string;
  code: string;
  group: string;
}

// ---------------------------------------------------------------------------
// Seed data (replace with an API call — see fetchSubGroups() below)
// ---------------------------------------------------------------------------
const SEED_DATA: SubGroupRow[] = [
  { id: 1, subGroup: "", code: "45", group: "RAWMATERIAL" },
  { id: 2, subGroup: "9001", code: "9000001", group: "surveillince Audit" },
  { id: 3, subGroup: "BEDSHEET FABRICS", code: "BE00001", group: "BEDSHEET FABRICS" },
  { id: 4, subGroup: "BEDSHEET SET", code: "BE00002", group: "BEDSHEET SET" },
  { id: 5, subGroup: "CARPET", code: "CA00001", group: "CARPET" },
  { id: 6, subGroup: "CODRIZE FABRICS", code: "CO00001", group: "CODRIZE FABRICS" },
  { id: 7, subGroup: "COMFORTER", code: "CO00004", group: "COMFORTER" },
  { id: 8, subGroup: "COTTON BHELA", code: "CO00002", group: "COTTON BHELA" },
  { id: 9, subGroup: "COTTON JEAN", code: "CO00003", group: "COTTON JEAN" },
  { id: 10, subGroup: "DASANA FABRICS", code: "DA00001", group: "DASANA FABRICS" },
  { id: 11, subGroup: "DHAKA PRINT", code: "DH00001", group: "DHAKA PRINT" },
  { id: 12, subGroup: "DUPER", code: "DU00001", group: "DUPER" },
  { id: 13, subGroup: "EMBOSSED", code: "EM00001", group: "EMBOSSED" },
  { id: 14, subGroup: "FIXED ASSETS", code: "FI00001", group: "FIXED ASSETS" },
  { id: 15, subGroup: "FLATIN FABRICS", code: "FL00001", group: "FLATIN FABRICS" },
  { id: 16, subGroup: "GARMENT INTEM", code: "GA00001", group: "GARMENT INTEM" },
  { id: 17, subGroup: "GEORGETT DYED", code: "GE00001", group: "GEORGETT DYED" },
  { id: 18, subGroup: "guru", code: "gu00001", group: "bikesh" },
  { id: 19, subGroup: "HOTEL BEDSHEET", code: "HO00001", group: "HOTEL BEDSHEET" },
  { id: 20, subGroup: "HYNECK", code: "HY00001", group: "HYNECK" },
];

// Options for the "Group" dropdown in the Add/Edit modal — mirrors the
// Category (master/group1) list. Wire this up to the real group list/API.
const GROUP_OPTIONS = Array.from(new Set(SEED_DATA.map((r) => r.group))).filter(Boolean);

const PAGE_SIZE = 20;

type SortKey = "id" | "subGroup" | "code" | "group";
type SortDir = "asc" | "desc";

export default function SubGroupMasterPage() {
  const [rows, setRows] = useState<SubGroupRow[]>(SEED_DATA);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<SubGroupRow | null>(null);
  const [form, setForm] = useState({ subGroup: "", code: "", group: GROUP_OPTIONS[0] ?? "" });

  const [targetModalRow, setTargetModalRow] = useState<SubGroupRow | null>(null);

  // -------------------------------------------------------------------------
  // Derived data: filter -> sort -> paginate
  // -------------------------------------------------------------------------
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const globalMatch =
        !search ||
        r.subGroup.toLowerCase().includes(search.toLowerCase()) ||
        r.code.toLowerCase().includes(search.toLowerCase()) ||
        r.group.toLowerCase().includes(search.toLowerCase());
      const subGroupMatch = !subGroupFilter || r.subGroup.toLowerCase().includes(subGroupFilter.toLowerCase());
      const codeMatch = !codeFilter || r.code.toLowerCase().includes(codeFilter.toLowerCase());
      const groupMatch = !groupFilter || r.group.toLowerCase().includes(groupFilter.toLowerCase());
      return globalMatch && subGroupMatch && codeMatch && groupMatch;
    });
  }, [rows, search, subGroupFilter, codeFilter, groupFilter]);

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
    setForm({ subGroup: "", code: "", group: GROUP_OPTIONS[0] ?? "" });
    setModalOpen(true);
  }

  function openEditModal(row: SubGroupRow) {
    setEditingRow(row);
    setForm({ subGroup: row.subGroup, code: row.code, group: row.group });
    setModalOpen(true);
  }

  function saveRow() {
    if (!form.code.trim() || !form.group.trim()) return;

    if (editingRow) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingRow.id
            ? { ...r, subGroup: form.subGroup, code: form.code, group: form.group }
            : r
        )
      );
    } else {
      const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      setRows((prev) => [
        ...prev,
        { id: nextId, subGroup: form.subGroup, code: form.code, group: form.group },
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
      ["#", "Sub Group", "Code", "Group"].join("\t"),
      ...sorted.map((r) => [r.id, r.subGroup, r.code, r.group].join("\t")),
    ].join("\n");
    navigator.clipboard.writeText(text);
  }

  function exportExcel() {
    const csv = [
      ["#", "Sub Group", "Code", "Group"].join(","),
      ...sorted.map((r) => [r.id, `"${r.subGroup}"`, r.code, `"${r.group}"`].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subgroup.csv";
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
          <h1 className="text-sm font-medium text-gray-700">Sub Group</h1>
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
                    onClick={() => toggleSort("subGroup")}
                    className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700"
                  >
                    Sub Group <span className="text-gray-400">{sortIndicator("subGroup")}</span>
                  </th>
                  <th
                    onClick={() => toggleSort("code")}
                    className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700"
                  >
                    Code <span className="text-gray-400">{sortIndicator("code")}</span>
                  </th>
                  <th
                    onClick={() => toggleSort("group")}
                    className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700"
                  >
                    Group <span className="text-gray-400">{sortIndicator("group")}</span>
                  </th>
                  <th className="py-2 pr-2 font-semibold text-gray-700">Assign Target</th>
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
                      placeholder="Sub Group"
                      value={subGroupFilter}
                      onChange={(e) => {
                        setSubGroupFilter(e.target.value);
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
                      placeholder="Group"
                      value={groupFilter}
                      onChange={(e) => {
                        setGroupFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </th>
                  <th className="py-1 pr-2">
                    <input
                      placeholder="Assign Target"
                      disabled
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-400"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
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
                      <td className="py-2 pr-2 text-gray-700">{row.subGroup}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.code}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.group}</td>
                      <td className="py-2 pr-2">
                        <button
                          onClick={() => setTargetModalRow(row)}
                          className="text-sky-500 hover:text-sky-700"
                          title="Assign Target"
                        >
                          <Crosshair size={16} />
                        </button>
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
              {editingRow ? "Edit Sub Group" : "Add Sub Group"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Sub Group</label>
                <input
                  value={form.subGroup}
                  onChange={(e) => setForm((f) => ({ ...f, subGroup: e.target.value }))}
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
                <label className="mb-1 block text-xs font-medium text-gray-600">Group</label>
                <select
                  value={form.group}
                  onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
                >
                  {GROUP_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
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

      {/* Assign Target modal */}
      {targetModalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded bg-white p-4 shadow-lg">
            <h2 className="mb-3 text-sm font-semibold text-gray-800">
              Assign Target — {targetModalRow.subGroup || targetModalRow.code}
            </h2>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Target Value</label>
              <input
                type="number"
                placeholder="Enter target"
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setTargetModalRow(null)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setTargetModalRow(null)}
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
// async function fetchSubGroups(): Promise<SubGroupRow[]> {
//   const res = await fetch("/api/master/subgroup");
//   return res.json();
// }
//
// then load it in a useEffect and setRows(data). Similarly, GROUP_OPTIONS
// should come from the Category (master/group1) endpoint instead of being
// derived from this page's own rows.
// ---------------------------------------------------------------------------