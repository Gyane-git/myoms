"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Copy as CopyIcon,
  FileSpreadsheet,
  FileText,
  Printer,
  Columns3,
  Search,
  Pencil,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & mock data (swap for a real API call, e.g. GET /api/product-scheme)
// ---------------------------------------------------------------------------

type SchemeType = "Group" | "Sub Group" | "Product";

interface SchemeRow {
  id: number;
  description: string;
  date: string; // yyyy/mm/dd
  type: SchemeType;
}

const SCHEME_DATA: SchemeRow[] = [
  { id: 1, description: "testgroupscheme", date: "2026/05/06", type: "Group" },
  { id: 2, description: "testproductscheme", date: "2026/06/11", type: "Product" },
];

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function SortIcon({ active, dir }: { active: boolean; dir?: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 text-slate-300" />;
  return dir === "asc" ? (
    <ChevronUp className="h-3 w-3 text-teal-600" />
  ) : (
    <ChevronDown className="h-3 w-3 text-teal-600" />
  );
}

function ToolbarButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50">
      {icon}
      {label}
    </button>
  );
}

function FilterInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-slate-300 py-1 pl-2 pr-6 text-[12px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
      />
      <Search className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProductSchemePage() {
  const [search, setSearch] = useState("");
  const [colFilters, setColFilters] = useState({ description: "", date: "", type: "" });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: keyof SchemeRow | null; dir: "asc" | "desc" }>({
    key: null,
    dir: "asc",
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SCHEME_DATA.filter((row) => {
      if (q && !`${row.description} ${row.date} ${row.type}`.toLowerCase().includes(q)) {
        return false;
      }
      if (
        colFilters.description &&
        !row.description.toLowerCase().includes(colFilters.description.toLowerCase())
      )
        return false;
      if (colFilters.date && !row.date.toLowerCase().includes(colFilters.date.toLowerCase()))
        return false;
      if (colFilters.type && !row.type.toLowerCase().includes(colFilters.type.toLowerCase()))
        return false;
      return true;
    });
  }, [search, colFilters]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const key = sort.key;
    return [...filtered].sort((a, b) => {
      const av = String(a[key]);
      const bv = String(b[key]);
      return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sort]);

  const toggleSort = (key: keyof SchemeRow) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  const columns: { key: keyof SchemeRow; label: string }[] = [
    { key: "description", label: "Description" },
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
  ];

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const start = sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, sorted.length);

  return (
    <div className="min-h-screen bg-slate-100 text-[13px] text-slate-700">
      {/* top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

      {/* page title bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-200/70 px-4 py-2.5">
        <h1 className="text-[15px] font-semibold text-slate-700">Product Scheme</h1>
        <div className="flex flex-wrap gap-2">
          <button className="rounded bg-emerald-500 px-3 py-1.5 text-[12px] font-medium text-white shadow-sm hover:bg-emerald-600">
            Add Sub Group wise Scheme
          </button>
          <button className="rounded bg-emerald-500 px-3 py-1.5 text-[12px] font-medium text-white shadow-sm hover:bg-emerald-600">
            Add Group wise Scheme
          </button>
          <button className="rounded bg-emerald-600 px-3 py-1.5 text-[12px] font-medium text-white shadow-sm hover:bg-emerald-700">
            Add Produt wise Scheme
          </button>
        </div>
      </div>

      <main className="p-1">
        <div className="rounded border border-slate-200 bg-white shadow-sm">
          {/* toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <ToolbarButton icon={<CopyIcon className="h-3.5 w-3.5" />} label="Copy" />
              <ToolbarButton icon={<FileSpreadsheet className="h-3.5 w-3.5" />} label="Excel" />
              <ToolbarButton icon={<FileText className="h-3.5 w-3.5" />} label="PDF" />
              <ToolbarButton icon={<Printer className="h-3.5 w-3.5" />} label="Print" />
              <ToolbarButton icon={<Columns3 className="h-3.5 w-3.5" />} label="Column visibility" />
            </div>

            <label className="flex items-center gap-2 text-[12px] text-slate-600">
              Search:
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  className="w-44 rounded border border-slate-300 py-1 pl-7 pr-2 text-[12px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
                />
              </div>
            </label>
          </div>

          {/* table */}
          <div className="overflow-x-auto">
            <table className="w-full border-t border-slate-200 text-left">
              <thead>
                <tr className="bg-slate-50 text-[12px] font-semibold text-slate-600">
                  <th
                    className="w-16 cursor-pointer select-none whitespace-nowrap px-4 py-2"
                    onClick={() => toggleSort("id")}
                  >
                    <div className="flex items-center gap-1">
                      # <SortIcon active={sort.key === "id"} dir={sort.dir} />
                    </div>
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="cursor-pointer select-none whitespace-nowrap px-4 py-2"
                      onClick={() => toggleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label} <SortIcon active={sort.key === col.key} dir={sort.dir} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`border-t border-slate-100 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    } hover:bg-teal-50/60`}
                  >
                    <td className="whitespace-nowrap px-4 py-2">
                      <div className="flex items-center gap-2 text-sky-500">
                        <button className="hover:text-sky-700" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button className="hover:text-sky-700" title="Duplicate">
                          <CopyIcon className="h-3.5 w-3.5" />
                        </button>
                        <button className="hover:text-sky-700" title="Print">
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-slate-700">
                      {row.description}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">{row.date}</td>
                    <td className="whitespace-nowrap px-4 py-2">{row.type}</td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-slate-400">
                      No matching records found
                    </td>
                  </tr>
                )}

                {/* column filter row */}
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td className="px-4 py-2 text-slate-400">#</td>
                  <td className="px-4 py-2">
                    <FilterInput
                      value={colFilters.description}
                      onChange={(v) => setColFilters((f) => ({ ...f, description: v }))}
                      placeholder="Description"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <FilterInput
                      value={colFilters.date}
                      onChange={(v) => setColFilters((f) => ({ ...f, date: v }))}
                      placeholder="Date"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <FilterInput
                      value={colFilters.type}
                      onChange={(v) => setColFilters((f) => ({ ...f, type: v }))}
                      placeholder="Type"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* footer / pagination */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-[12px] text-slate-500">
            <span>
              Showing {start} to {end} of {sorted.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-slate-500 disabled:opacity-40"
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded border px-2.5 py-1 ${
                    page === p
                      ? "border-teal-500 bg-teal-500 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-slate-500 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}