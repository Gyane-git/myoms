"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpDown,
  Search,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  Columns3,
  Check,
} from "lucide-react";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  align?: "left" | "right" | "center";
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => string; // used for sort/filter/search when value isn't a plain string field
  /** Exclude from Copy/Excel/Print exports (e.g. an actions column with buttons, not data). */
  exportable?: boolean;
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
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const tableId = useRef(`biz-table-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        columnMenuRef.current &&
        !columnMenuRef.current.contains(e.target as Node)
      ) {
        setColumnMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenCols.has(c.key)),
    [columns, hiddenCols]
  );

  const exportableColumns = useMemo(
    () => visibleColumns.filter((c) => c.exportable !== false),
    [visibleColumns]
  );

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

  const toggleColumn = (key: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // --- Export helpers: all operate on the full filtered set, not just the current page ---

  const buildRows = () =>
    filtered.map((row) =>
      exportableColumns.map((col) => getValue(row, col))
    );

  const csvEscape = (value: string) => {
    if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
    return value;
  };

  const handleCopy = async () => {
    const header = exportableColumns.map((c) => c.label).join("\t");
    const body = buildRows()
      .map((r) => r.join("\t"))
      .join("\n");
    try {
      await navigator.clipboard.writeText(`${header}\n${body}`);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 1500);
    } catch {
      // Clipboard API may be blocked (permissions/insecure context) — fail quietly.
    }
  };

  const handleExportExcel = () => {
    const header = exportableColumns.map((c) => csvEscape(c.label)).join(",");
    const body = buildRows()
      .map((r) => r.map(csvEscape).join(","))
      .join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    // Print (or "Save as PDF" from the browser print dialog) just this
    // table's printable region, not the whole app chrome.
    const el = document.getElementById(tableId.current);
    if (!el) {
      window.print();
      return;
    }
    const win = window.open("", "_blank", "width=1024,height=768");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; }
            h1 { font-size: 16px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${el.outerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
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
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              {copyStatus === "copied" ? (
                <Check size={13} className="text-emerald-600" />
              ) : (
                <Copy size={13} />
              )}
              {copyStatus === "copied" ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <FileSpreadsheet size={13} /> Excel
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <FileText size={13} /> PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <Printer size={13} /> Print
            </button>

            <div className="relative" ref={columnMenuRef}>
              <button
                onClick={() => setColumnMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                <Columns3 size={13} /> Column visibility
              </button>
              {columnMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 max-h-72 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg z-20 py-1">
                  {columns
                    .filter((c) => c.label) // skip unlabeled action columns
                    .map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!hiddenCols.has(col.key)}
                          onChange={() => toggleColumn(col.key)}
                        />
                        {col.label}
                      </label>
                    ))}
                </div>
              )}
            </div>
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
          <table id={tableId.current} className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
                {visibleColumns.map((col) => (
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
                  {visibleColumns.map((col) => (
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
                    colSpan={visibleColumns.length}
                    className="px-3 py-6 text-center text-slate-400 text-sm"
                  >
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/60 border-t border-slate-200">
                {visibleColumns.map((col) => (
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