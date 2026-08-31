"use client";

import { useMemo, useState } from "react";
import { Plus, Copy, FileSpreadsheet, FileText, Printer } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MergeLedgerRow {
  vNo: number;
  description: string;
  code: string;
}

// ---------------------------------------------------------------------------
// Mock master data — replace with a real fetch (see bottom of file)
// ---------------------------------------------------------------------------
const MERGE_LEDGER_ROWS: MergeLedgerRow[] = [
  // Populate from GET /MasterEntry/GetMergeLedgerList (or your API's equivalent)
];

export default function MergeLedgerPage() {
  const [descSearch, setDescSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");

  const filteredRows = useMemo(() => {
    return MERGE_LEDGER_ROWS.filter(
      (r) =>
        r.description.toLowerCase().includes(descSearch.trim().toLowerCase()) &&
        r.code.toLowerCase().includes(codeSearch.trim().toLowerCase())
    );
  }, [descSearch, codeSearch]);

  function handleAddNew() {
    // Swap for: router.push("/masterentry/merge-ledger/new")
    window.location.href = "/MasterEntry/FrmMergeLedger?VNo=&Tag=NEW";
  }

  async function handleCopy() {
    const text = filteredRows.map((r) => `${r.description}\t${r.code}`).join("\n");
    await navigator.clipboard.writeText(text);
  }

  function handleExportExcel() {
    const header = "Description,Code";
    const csv = [
      header,
      ...filteredRows.map((r) => `"${r.description.replace(/"/g, '""')}","${r.code}"`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Merge Ledger List.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportPdf() {
    // Legacy DataTables used the pdf export button; wire a real PDF lib (e.g. jsPDF) here.
    // Falling back to print-to-PDF for now.
    window.print();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="mx-auto max-w-1xl overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t-4 border-t-sky-400 bg-gray-100 px-4 py-2">
          <h1 className="text-sm font-medium text-gray-700">Merge Ledger</h1>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
          >
            <Plus size={13} /> Add
          </button>
        </div>

        <div className="p-4">
          {/* DataTable-style export toolbar */}
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Copy size={13} /> Copy
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileSpreadsheet size={13} /> Excel
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileText size={13} /> PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Printer size={13} /> Print
            </button>
          </div>

          {/* Table */}
          <div className="overflow-auto rounded border border-gray-200">
            <table className="w-full table-fixed border-collapse text-xs">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-left">
                  <th className="w-12 px-2 py-2 font-semibold text-gray-700">#</th>
                  <th className="px-2 py-2 font-semibold text-gray-700">Description</th>
                  <th className="w-40 px-2 py-2 font-semibold text-gray-700">Code</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr key={row.vNo} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 py-1.5 text-gray-600">{idx + 1}</td>
                    <td className="truncate px-2 py-1.5 text-gray-700">{row.description}</td>
                    <td className="truncate px-2 py-1.5 text-gray-700">{row.code}</td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-2 py-6 text-center text-gray-400">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
              {/* tfoot search row — mirrors the legacy $('#tblMyMaster tfoot th') injection,
                  skipping the '#' column exactly as the original script does */}
              <tfoot className="bg-gray-50">
                <tr className="border-t border-gray-200">
                  <th className="px-2 py-1.5"></th>
                  <th className="px-2 py-1.5">
                    <input
                      value={descSearch}
                      onChange={(e) => setDescSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </th>
                  <th className="px-2 py-1.5">
                    <input
                      value={codeSearch}
                      onChange={(e) => setCodeSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </th>
                </tr>
              </tfoot>
            </table>
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
// Optional: swap the mock for a real API call, e.g.
//
// async function fetchMergeLedgers(): Promise<MergeLedgerRow[]> {
//   const res = await fetch("/api/masterentry/merge-ledger");
//   return res.json();
// }
//
// and load it in a useEffect (or as a server component prop) instead of the
// hardcoded MERGE_LEDGER_ROWS array above. handleAddNew's target route should
// point at your Next.js "new merge ledger" page.
// ---------------------------------------------------------------------------