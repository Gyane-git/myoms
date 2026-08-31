"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus, Upload, Download, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SubledgerRow {
  id: number;
  description: string;
  code: string;
  country: string;
  address: string;
  telNo: string;
  mobile: string;
  email: string;
  panNo: string;
  ledger: string;
  email1: string;
  interestRate: number;
}

// ---------------------------------------------------------------------------
// Seed data (mirrors the legacy Subledger list) — replace with an API call,
// see fetchSubledgers() near the bottom of this file.
// ---------------------------------------------------------------------------
const SEED_DATA: SubledgerRow[] = [
  { id: 8, description: "ANKHU ENTERPRISES", code: "AN00001", country: "NEPAL", address: "PUTALISADAK", telNo: "", mobile: "9999999999", email: "", panNo: "123444444", ledger: "NITESH ADHIKARI", email1: "", interestRate: 0 },
  { id: 1, description: "BANK COMMISSION", code: "BA00001", country: "", address: "", telNo: "", mobile: "", email: "", panNo: "", ledger: "", email1: "", interestRate: 0 },
  { id: 4, description: "CUSTOM DUTY", code: "CU00001", country: "", address: "", telNo: "", mobile: "", email: "", panNo: "", ledger: "", email1: "", interestRate: 0 },
  { id: 3, description: "DOCUMENT EXPENSES", code: "DO00001", country: "", address: "", telNo: "", mobile: "", email: "", panNo: "", ledger: "", email1: "", interestRate: 0 },
  { id: 10, description: "fdfggfdgf", code: "fd00001", country: "", address: "", telNo: "", mobile: "", email: "", panNo: "", ledger: "dddddd", email1: "", interestRate: 0 },
  { id: 5, description: "FRIEGHT", code: "FR00001", country: "", address: "", telNo: "", mobile: "", email: "", panNo: "", ledger: "", email1: "", interestRate: 0 },
  { id: 2, description: "INSURANCDE EXP.", code: "IN00001", country: "", address: "", telNo: "", mobile: "", email: "", panNo: "", ledger: "", email1: "", interestRate: 0 },
  { id: 7, description: "LOAD/UNLOAD", code: "LO00001", country: "", address: "", telNo: "", mobile: "", email: "", panNo: "", ledger: "", email1: "", interestRate: 0 },
  { id: 12, description: "Milan", code: "Mi00001", country: "", address: "", telNo: "", mobile: "", email: "", panNo: "", ledger: "", email1: "", interestRate: 0 },
  { id: 11, description: "sssss", code: "ss00001", country: "", address: "", telNo: "", mobile: "", email: "", panNo: "", ledger: "bikesh kumar GUPTA", email1: "", interestRate: 0 },
  { id: 9, description: "Sujal Suppliers-V", code: "Su00001", country: "", address: "", telNo: "", mobile: "", email: "", panNo: "", ledger: "", email1: "", interestRate: 0 },
  { id: 6, description: "TRANSPORT EXPENSES", code: "TR00001", country: "", address: "", telNo: "", mobile: "", email: "", panNo: "", ledger: "", email1: "", interestRate: 0 },
];

const PAGE_SIZE = 10;

type SortKey = keyof Pick<
  SubledgerRow,
  "id" | "description" | "code" | "country" | "address" | "mobile" | "panNo" | "ledger" | "interestRate"
>;
type SortDir = "asc" | "desc";

const EMPTY_FORM = {
  description: "",
  code: "",
  country: "",
  address: "",
  telNo: "",
  mobile: "",
  email: "",
  panNo: "",
  ledger: "",
  email1: "",
  interestRate: "0",
};

export default function SubledgerMasterPage() {
  const [rows, setRows] = useState<SubledgerRow[]>(SEED_DATA);

  // global + per-column filters
  const [search, setSearch] = useState("");
  const [descFilter, setDescFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("description");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<SubledgerRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // -------------------------------------------------------------------------
  // Derived data: filter -> sort -> paginate
  // -------------------------------------------------------------------------
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return rows.filter((r) => {
      const globalMatch =
        !s ||
        r.description.toLowerCase().includes(s) ||
        r.code.toLowerCase().includes(s) ||
        r.country.toLowerCase().includes(s) ||
        r.ledger.toLowerCase().includes(s) ||
        r.panNo.toLowerCase().includes(s);
      const descMatch = !descFilter || r.description.toLowerCase().includes(descFilter.toLowerCase());
      const codeMatch = !codeFilter || r.code.toLowerCase().includes(codeFilter.toLowerCase());
      const countryMatch = !countryFilter || r.country.toLowerCase().includes(countryFilter.toLowerCase());
      return globalMatch && descMatch && codeMatch && countryMatch;
    });
  }, [rows, search, descFilter, codeFilter, countryFilter]);

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
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(row: SubledgerRow) {
    setEditingRow(row);
    setForm({
      description: row.description,
      code: row.code,
      country: row.country,
      address: row.address,
      telNo: row.telNo,
      mobile: row.mobile,
      email: row.email,
      panNo: row.panNo,
      ledger: row.ledger,
      email1: row.email1,
      interestRate: String(row.interestRate),
    });
    setModalOpen(true);
  }

  function saveRow() {
    if (!form.description.trim() || !form.code.trim()) return;
    const interestRate = Number(form.interestRate) || 0;

    if (editingRow) {
      setRows((prev) =>
        prev.map((r) => (r.id === editingRow.id ? { ...r, ...form, interestRate } : r))
      );
    } else {
      const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      setRows((prev) => [...prev, { id: nextId, ...form, interestRate }]);
    }
    setModalOpen(false);
  }

  function deleteRow(id: number) {
    if (confirm("Do You Want Delete...?")) {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  }

  // -------------------------------------------------------------------------
  // Export / import helpers
  // -------------------------------------------------------------------------
  const COLUMNS = [
    "#", "Subledger Desc", "Code", "Country", "Address", "Tel No",
    "Mobile", "Email", "PAN No", "Ledger", "Email 1", "Interest Rate",
  ];

  function rowToArray(r: SubledgerRow) {
    return [r.id, r.description, r.code, r.country, r.address, r.telNo, r.mobile, r.email, r.panNo, r.ledger, r.email1, r.interestRate.toFixed(6)];
  }

  function copyToClipboard() {
    const text = [COLUMNS.join("\t"), ...sorted.map((r) => rowToArray(r).join("\t"))].join("\n");
    navigator.clipboard.writeText(text);
  }

  function exportExcel() {
    const csv = [
      COLUMNS.join(","),
      ...sorted.map((r) =>
        rowToArray(r)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subledger.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function printTable() {
    window.print();
  }

  function downloadTemplate() {
    const csv = COLUMNS.slice(1).join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subledger-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const [importFileName, setImportFileName] = useState("");

  function sortIndicator(key: SortKey) {
    return sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : "⇅";
  }

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="mx-auto max-w-1xl overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t-4 border-t-sky-400 bg-gray-100 px-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download size={13} /> Download Template
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Upload size={13} /> Import
            </button>
            <h1 className="ml-2 text-sm font-semibold text-gray-700">Subledger</h1>
          </div>
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
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 pr-2 font-semibold text-gray-700">#</th>
                  <th onClick={() => toggleSort("description")} className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700">
                    Subledger Desc <span className="text-gray-400">{sortIndicator("description")}</span>
                  </th>
                  <th onClick={() => toggleSort("code")} className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700">
                    Code <span className="text-gray-400">{sortIndicator("code")}</span>
                  </th>
                  <th onClick={() => toggleSort("country")} className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700">
                    Country <span className="text-gray-400">{sortIndicator("country")}</span>
                  </th>
                  <th onClick={() => toggleSort("address")} className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700">
                    Address <span className="text-gray-400">{sortIndicator("address")}</span>
                  </th>
                  <th className="py-2 pr-2 font-semibold text-gray-700">Tel No</th>
                  <th onClick={() => toggleSort("mobile")} className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700">
                    Mobile <span className="text-gray-400">{sortIndicator("mobile")}</span>
                  </th>
                  <th className="py-2 pr-2 font-semibold text-gray-700">Email</th>
                  <th onClick={() => toggleSort("panNo")} className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700">
                    PAN No <span className="text-gray-400">{sortIndicator("panNo")}</span>
                  </th>
                  <th onClick={() => toggleSort("ledger")} className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700">
                    Ledger <span className="text-gray-400">{sortIndicator("ledger")}</span>
                  </th>
                  <th className="py-2 pr-2 font-semibold text-gray-700">Email 1</th>
                  <th onClick={() => toggleSort("interestRate")} className="cursor-pointer select-none py-2 pr-2 font-semibold text-gray-700">
                    Interest Rate <span className="text-gray-400">{sortIndicator("interestRate")}</span>
                  </th>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="py-1 pr-2" />
                  <th className="py-1 pr-2">
                    <input
                      placeholder="Subledger Desc"
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
                      placeholder="Country"
                      value={countryFilter}
                      onChange={(e) => {
                        setCountryFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </th>
                  <th colSpan={8} className="py-1 pr-2" />
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-6 text-center text-gray-400">
                      No matching records found
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(row)} className="text-sky-600 hover:text-sky-800" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteRow(row.id)} className="text-red-500 hover:text-red-700" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="py-2 pr-2 text-gray-700">{row.description}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.code}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.country}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.address}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.telNo}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.mobile}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.email}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.panNo}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.ledger}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.email1}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.interestRate.toFixed(6)}</td>
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
                    p === currentPage ? "border-sky-500 bg-sky-500 text-white" : "border-gray-300 text-gray-700"
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
          <div className="w-full max-w-lg rounded bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                {editingRow ? "Edit Subledger" : "Add Subledger"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Subledger Desc" full value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
              <Field label="Code" value={form.code} onChange={(v) => setForm((f) => ({ ...f, code: v }))} />
              <Field label="Country" value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} />
              <Field label="Address" full value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
              <Field label="Tel No" value={form.telNo} onChange={(v) => setForm((f) => ({ ...f, telNo: v }))} />
              <Field label="Mobile" value={form.mobile} onChange={(v) => setForm((f) => ({ ...f, mobile: v }))} />
              <Field label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
              <Field label="PAN No" value={form.panNo} onChange={(v) => setForm((f) => ({ ...f, panNo: v }))} />
              <Field label="Ledger" value={form.ledger} onChange={(v) => setForm((f) => ({ ...f, ledger: v }))} />
              <Field label="Email 1" value={form.email1} onChange={(v) => setForm((f) => ({ ...f, email1: v }))} />
              <Field label="Interest Rate" value={form.interestRate} onChange={(v) => setForm((f) => ({ ...f, interestRate: v }))} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveRow} className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Import SubLedger</h2>
              <button onClick={() => setImportOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <label className="flex cursor-pointer items-center justify-between rounded border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50">
              <span>{importFileName || "Choose Excel File..."}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => setImportFileName(e.target.files?.[0]?.name ?? "")}
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
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
// Small reusable labeled input for the Add/Edit form
// ---------------------------------------------------------------------------
function Field({
  label,
  value,
  onChange,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Optional: swap SEED_DATA for a real API call, e.g.
//
// async function fetchSubledgers(): Promise<SubledgerRow[]> {
//   const res = await fetch("/api/master/subledger");
//   return res.json();
// }
//
// then load it in a useEffect and setRows(data).
// ---------------------------------------------------------------------------