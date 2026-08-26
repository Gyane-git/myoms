"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  Columns3,
  Search,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & mock data (swap for a real API call, e.g. GET /api/groups)
// ---------------------------------------------------------------------------

interface GroupRow {
  id: number;
  desc: string;
  code: string;
  printerName: string;
  point: string;
  assignTarget: { edit: boolean; add: boolean; delete: boolean; view: boolean };
}

const GROUP_DATA: GroupRow[] = [
  { id: 1, desc: "MAKHAN FABRICS", code: "MAKHA", printerName: "KOT", point: "100", assignTarget: { edit: true, add: true, delete: true, view: true } },
  { id: 2, desc: "VELVET 9000", code: "VE00002", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 3, desc: "MOSQUITO NET", code: "MO00001", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 4, desc: "SILK FABRICS", code: "SI00002", printerName: "", point: "", assignTarget: { edit: true, add: true, delete: true, view: true } },
  { id: 5, desc: "KOREAN DYED", code: "KO00001", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 6, desc: "POLAR ROLL", code: "PO00002", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 7, desc: "GEORGETT DYED", code: "GE00001", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 8, desc: "BEDSHEET SET", code: "BE00002", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 9, desc: "MINI BHELA", code: "MI00002", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 10, desc: "SIRAK BORDER PRINT", code: "SI00003", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 11, desc: "MALMAL PRINT", code: "MA00001", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 12, desc: "VELVET BEDSHEET A/C", code: "VE00001", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 13, desc: "TOWEL", code: "TO00001", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 14, desc: "MOSQUITO", code: "MO00002", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 15, desc: "COTTON BHELA", code: "CO00002", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 16, desc: "CARPET", code: "CA00001", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 17, desc: "MOSQUITO TENT ZHOOL", code: "MO00003", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 18, desc: "SUMMER QUILT", code: "SU00002", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 19, desc: "WINTER QUILT", code: "WI00001", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
  { id: 20, desc: "GARMENT ITEM", code: "GA00001", printerName: "", point: "", assignTarget: { edit: true, add: false, delete: true, view: true } },
];

const TOTAL_ENTRIES = 59;
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

function AssignTargetIcons({ value }: { value: GroupRow["assignTarget"] }) {
  // 4 diamond/plus style glyphs: edit(teal) / add(green or red) / delete(teal) / view(teal)
  const dot = (on: boolean, color: string) => (
    <span
      className={`inline-block h-2.5 w-2.5 rotate-45 ${on ? color : "bg-slate-300"}`}
    />
  );
  return (
    <div className="flex items-center gap-1.5">
      {dot(true, "bg-teal-500")}
      {dot(true, value.add ? "bg-emerald-500" : "bg-rose-500")}
      {dot(true, "bg-teal-400")}
      {dot(true, "bg-teal-400")}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GroupMasterPage() {
  const [search, setSearch] = useState("");
  const [colFilters, setColFilters] = useState({
    desc: "",
    code: "",
    printerName: "",
    assignTarget: "",
  });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: keyof GroupRow | null; dir: "asc" | "desc" }>({
    key: null,
    dir: "asc",
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GROUP_DATA.filter((row) => {
      if (q && !`${row.desc} ${row.code} ${row.printerName}`.toLowerCase().includes(q)) {
        return false;
      }
      if (colFilters.desc && !row.desc.toLowerCase().includes(colFilters.desc.toLowerCase())) return false;
      if (colFilters.code && !row.code.toLowerCase().includes(colFilters.code.toLowerCase())) return false;
      if (
        colFilters.printerName &&
        !row.printerName.toLowerCase().includes(colFilters.printerName.toLowerCase())
      )
        return false;
      return true;
    });
  }, [search, colFilters]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const key = sort.key;
    return [...filtered].sort((a, b) => {
      const av = String(a[key as keyof GroupRow] ?? "");
      const bv = String(b[key as keyof GroupRow] ?? "");
      return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sort]);

  const toggleSort = (key: keyof GroupRow) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const columns: { key: keyof GroupRow; label: string }[] = [
    { key: "desc", label: "Group Desc" },
    { key: "code", label: "Code" },
    { key: "printerName", label: "Printer Name" },
    { key: "point", label: "Point" },
    { key: "assignTarget", label: "Assign Target" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-[13px] text-slate-700">
      {/* top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

      {/* header */}
     

      {/* page title bar */}
      <div className="flex items-center justify-between bg-slate-200/70 px-4 py-2">
        <h1 className="text-[15px] font-semibold text-slate-700">Group</h1>
        <button className="flex items-center gap-1 rounded bg-emerald-500 px-4 py-1.5 text-[13px] font-medium text-white shadow-sm hover:bg-emerald-600">
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      <main className="p-1">
        <div className="rounded border border-slate-200 bg-white shadow-sm">
          {/* import row + term setup */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 pt-3">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1 text-[12px] text-slate-600 hover:bg-slate-50">
                <Plus className="h-3.5 w-3.5" />
                Import Group
              </button>
              <button className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1 text-[12px] text-slate-600 hover:bg-slate-50">
                <Plus className="h-3.5 w-3.5" />
                Import Group Scheme
              </button>
            </div>
            <button className="rounded bg-emerald-500 px-4 py-1.5 text-[13px] font-medium text-white hover:bg-emerald-600">
              Term Setup
            </button>
          </div>

          {/* toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <ToolbarButton icon={<Copy className="h-3.5 w-3.5" />} label="Copy" />
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
                  onChange={(e) => setPage(1) || setSearch(e.target.value)}
                  className="w-44 rounded border border-slate-300 py-1 pl-7 pr-2 text-[12px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300"
                  placeholder=""
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
                    className="cursor-pointer select-none whitespace-nowrap px-4 py-2"
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
                      <div className="flex items-center gap-2 text-slate-500">
                        <button className="text-sky-500 hover:text-sky-700" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button className="text-rose-500 hover:text-rose-700" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-slate-700">
                      {row.desc}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">{row.code}</td>
                    <td className="whitespace-nowrap px-4 py-2">{row.printerName}</td>
                    <td className="whitespace-nowrap px-4 py-2">{row.point}</td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <AssignTargetIcons value={row.assignTarget} />
                    </td>
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
                      value={colFilters.desc}
                      onChange={(v) => setColFilters((f) => ({ ...f, desc: v }))}
                      placeholder="Group Desc"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <FilterInput
                      value={colFilters.code}
                      onChange={(v) => setColFilters((f) => ({ ...f, code: v }))}
                      placeholder="Code"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <FilterInput
                      value={colFilters.printerName}
                      onChange={(v) => setColFilters((f) => ({ ...f, printerName: v }))}
                      placeholder="Printer Name"
                    />
                  </td>
                  <td className="px-4 py-2" />
                  <td className="px-4 py-2">
                    <FilterInput
                      value={colFilters.assignTarget}
                      onChange={(v) => setColFilters((f) => ({ ...f, assignTarget: v }))}
                      placeholder=""
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* footer / pagination */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-[12px] text-slate-500">
            <span>
              Showing 1 to {Math.min(PAGE_SIZE, sorted.length)} of {TOTAL_ENTRIES} entries
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
              {[1, 2, 3].map((p) => (
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
                onClick={() => setPage((p) => Math.min(3, p + 1))}
                className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-slate-500"
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

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

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