"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Search,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  Columns3,
} from "lucide-react";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  align?: "left" | "right" | "center";
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => string; // used for sort/filter/search when value isn't a plain string field
};

type DataTableProps<T extends { id: string | number }> = {
  title: string;
  columns: DataTableColumn<T>[];
  data: T[];
  pageSize?: number;
  topFilters?: React.ReactNode; // extra filter controls rendered above the action toolbar
};

export default function DataTable<T extends { id: string | number }>({
  title,
  columns,
  data,
  pageSize = 20,
  topFilters,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const getValue = (row: T, col: DataTableColumn<T>): string => {
    if (col.accessor) return col.accessor(row);
    const raw = (row as Record<string, unknown>)[col.key];
    return raw == null ? "" : String(raw);
  };

  const filtered = useMemo(() => {
    let rows = data;

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        columns.some((col) => getValue(row, col).toLowerCase().includes(q))
      );
    }

    Object.entries(colFilters).forEach(([key, value]) => {
      if (!value.trim()) return;
      const col = columns.find((c) => c.key === key);
      if (!col) return;
      rows = rows.filter((row) =>
        getValue(row, col).toLowerCase().includes(value.toLowerCase())
      );
    });

    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        rows = [...rows].sort((a, b) => {
          const av = getValue(a, col);
          const bv = getValue(b, col);
          const cmp = av.localeCompare(bv, undefined, { numeric: true });
          return sortDir === "asc" ? cmp : -cmp;
        });
      }
    }

    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, search, colFilters, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const pageNumbers = useMemo(() => {
    const nums: (number | "...")[] = [];
    const windowSize = 3;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - windowSize + 2 && i <= currentPage + 1)
      ) {
        nums.push(i);
      } else if (nums[nums.length - 1] !== "...") {
        nums.push("...");
      }
    }
    return nums;
  }, [totalPages, currentPage]);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-base font-medium text-slate-700 bg-slate-100 px-3 py-2 rounded">
          {title}
        </h1>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {topFilters && (
          <div className="flex flex-wrap items-center gap-6 mb-3 pb-3 border-b border-slate-100">
            {topFilters}
          </div>
        )}

        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50">
              <Copy size={13} /> Copy
            </button>
            <button className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50">
              <FileSpreadsheet size={13} /> Excel
            </button>
            <button className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50">
              <FileText size={13} /> PDF
            </button>
            <button className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50">
              <Printer size={13} /> Print
            </button>
            <button className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50">
              <Columns3 size={13} /> Column visibility
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Search:</span>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-6 pr-2 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto border border-slate-100 rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-2 font-medium whitespace-nowrap ${
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left"
                    }`}
                  >
                    <button
                      disabled={!col.sortable}
                      onClick={() => col.sortable && toggleSort(col.key)}
                      className={`inline-flex items-center gap-1 ${
                        col.sortable ? "hover:text-slate-900" : ""
                      }`}
                    >
                      {col.label}
                      {col.sortable && (
                        <ArrowUpDown
                          size={11}
                          className={
                            sortKey === col.key
                              ? "text-blue-600"
                              : "text-slate-300"
                          }
                        />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-slate-50 last:border-0 hover:bg-blue-50/40 ${
                    idx % 2 === 1 ? "bg-slate-50/40" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3 py-2 text-slate-700 whitespace-nowrap ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {col.render ? col.render(row) : getValue(row, col)}
                    </td>
                  ))}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-6 text-center text-slate-400 text-sm"
                  >
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/60 border-t border-slate-200">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-1.5">
                    {col.filterable === false ? null : (
                      <div className="relative">
                        <Search
                          size={11}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300"
                        />
                        <input
                          placeholder={col.label}
                          value={colFilters[col.key] ?? ""}
                          onChange={(e) => {
                            setColFilters((f) => ({
                              ...f,
                              [col.key]: e.target.value,
                            }));
                            setPage(1);
                          }}
                          className="w-full pl-6 pr-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                        />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* footer / pagination */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-slate-500">
          <span>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filtered.length)} of{" "}
            {filtered.length} entries
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            {pageNumbers.map((n, i) =>
              n === "..." ? (
                <span key={`dots-${i}`} className="px-2 text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-2.5 py-1 rounded border ${
                    n === currentPage
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {n}
                </button>
              )
            )}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}