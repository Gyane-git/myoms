"use client";

import { useMemo, useState } from "react";
import { Plus, RefreshCw, Search, BookOpen, Copy, FileSpreadsheet, Printer } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LedgerRow {
  vNo: number;
  glCode: string;
  shortName: string;
  ledgerName: string;
}

// ---------------------------------------------------------------------------
// Mock master data — replace with a real fetch (see bottom of file)
// ---------------------------------------------------------------------------
const LEDGER_ROWS: LedgerRow[] = [
  { vNo: 1135, glCode: "1135", shortName: "3200001", ledgerName: "323 bales cstm differnce a/c - codrise / flatin" },
  { vNo: 772, glCode: "772", shortName: "AA00013", ledgerName: "AALAM EMBOIDERY A/C" },
  { vNo: 1333, glCode: "1333", shortName: "SA00007av", ledgerName: "Anil SBI A/C -" },
  { vNo: 629, glCode: "629", shortName: "BA00013", ledgerName: "BANK CHARGES" },
  { vNo: 649, glCode: "649", shortName: "BI00008", ledgerName: "BINOD- BRJ EXP" },
  { vNo: 1149, glCode: "1149", shortName: "BR00008", ledgerName: "BRIBES A/C" },
  { vNo: 644, glCode: "644", shortName: "BR00006", ledgerName: "BRJ- DIESEL EXP" },
  { vNo: 284, glCode: "284", shortName: "BR00004", ledgerName: "BRJ OFF. EXP." },
  { vNo: 1417, glCode: "1417", shortName: "BR00001", ledgerName: "BROKERAGE" },
  { vNo: 135, glCode: "135", shortName: "CL00001", ledgerName: "CLEANER SALARY" },
  { vNo: 1380, glCode: "1380", shortName: "A000000004", ledgerName: "Closing Stock P/L" },
  { vNo: 1686, glCode: "1686", shortName: "KK000072", ledgerName: "DEPREACTION A/C" },
  { vNo: 620, glCode: "620", shortName: "KK00007E", ledgerName: "DEPRICIATION A/C" },
  { vNo: 1434, glCode: "1434", shortName: "DI00001", ledgerName: "DISCOUNT A/C" },
  { vNo: 41, glCode: "41", shortName: "DO00002", ledgerName: "DOCUMENT EXPENSES" },
  { vNo: 42, glCode: "42", shortName: "DO00003", ledgerName: "DOCUMENT INSURANCE A/C" },
  { vNo: 632, glCode: "632", shortName: "DO00004", ledgerName: "DONATION A/C" },
  { vNo: 560, glCode: "560", shortName: "EX00001", ledgerName: "EXCHANGE DIFF." },
  { vNo: 1281, glCode: "1281", shortName: "FO00004", ledgerName: "FOTON EXPENSE  A/C" },
  { vNo: 635, glCode: "635", shortName: "GH00004", ledgerName: "GHOOSH -  BRIBERY A/C" },
  { vNo: 1725, glCode: "1725", shortName: "HG00001", ledgerName: "HGDKSDG" },
  { vNo: 244, glCode: "244", shortName: "IN00001", ledgerName: "INDRA, COOLIE" },
  { vNo: 886, glCode: "886", shortName: "IN00004", ledgerName: "INSURANCE A/C" },
  { vNo: 1462, glCode: "1462", shortName: "IOt1048", ledgerName: "INTEREST" },
  { vNo: 841, glCode: "841", shortName: "IN00003", ledgerName: "INTEREST 2079/80" },
  { vNo: 621, glCode: "621", shortName: "IN00002", ledgerName: "INTEREST INCOME" },
  { vNo: 1467, glCode: "1467", shortName: "JSOt001", ledgerName: "JSR" },
  { vNo: 12, glCode: "12", shortName: "KA00005", ledgerName: "KAPIL SALARY" },
  { vNo: 163, glCode: "163", shortName: "L/00004", ledgerName: "L/C -59200 EXPENSES A/C" },
  { vNo: 162, glCode: "162", shortName: "L/00003", ledgerName: "L/C -65000 EXPENSE A/C" },
  { vNo: 1696, glCode: "1696", shortName: "LA00010", ledgerName: "LABOUR EXPENSES" },
  { vNo: 1697, glCode: "1697", shortName: "LU00002", ledgerName: "LUBRICANT EXPNESES" },
  { vNo: 26, glCode: "26", shortName: "M.00001", ledgerName: "M. SINGH PEROSNAL A/C" },
  { vNo: 1430, glCode: "1430", shortName: "DE00002", ledgerName: "MANOJ MAJHI-SALARY" },
  { vNo: 1259, glCode: "1259", shortName: "MI00005", ledgerName: "MISCELLENIOUS EXPENSES" },
  { vNo: 1531, glCode: "1531", shortName: "OFOt001", ledgerName: "OFF. EXP. INDRACHOWK" },
  { vNo: 1704, glCode: "1704", shortName: "SA000021", ledgerName: "OFFICE EXPENSES" },
  { vNo: 1381, glCode: "1381", shortName: "A000000006", ledgerName: "Opening Stock P/L" },
  { vNo: 647, glCode: "647", shortName: "PA00015", ledgerName: "PAWAN JI- POLAR" },
  { vNo: 134, glCode: "134", shortName: "PE00002", ledgerName: "PETROL EXP" },
  { vNo: 1550, glCode: "1550", shortName: "PRABHU00002", ledgerName: "PRABHU" },
  { vNo: 1535, glCode: "1535", shortName: "P000000001", ledgerName: "Printing & Stationery" },
  { vNo: 1554, glCode: "1554", shortName: "PU00001", ledgerName: "Purchase A/C" },
  { vNo: 1555, glCode: "1555", shortName: "PU00002", ledgerName: "Purchase Return A/C" },
  { vNo: 1627, glCode: "1627", shortName: "SOt1030", ledgerName: "RAJEEV SALARY A/C" },
  { vNo: 10, glCode: "10", shortName: "RIND", ledgerName: "RAM INDREY SALARY" },
  { vNo: 1563, glCode: "1563", shortName: "RAM", ledgerName: "RAM SALARY" },
  { vNo: 1567, glCode: "1567", shortName: "REOt001", ledgerName: "RENT A/C" },
  { vNo: 479, glCode: "479", shortName: "RE00007", ledgerName: "RENT A/C - DILIBAZAR" },
  { vNo: 1566, glCode: "1566", shortName: "RE00001", ledgerName: "RENT A/C - INDIRA KC SHAH" },
  { vNo: 287, glCode: "287", shortName: "RE00006", ledgerName: "RENT A/C BRJ - NEW" },
  { vNo: 1234, glCode: "1234", shortName: "RI00011", ledgerName: "RENT A/C- SATUNGAL" },
  { vNo: 141, glCode: "141", shortName: "Re00004", ledgerName: "Rent Brj -2 A/C" },
  { vNo: 140, glCode: "140", shortName: "RE00003", ledgerName: "Rent Brj. New Godwon A/C" },
  { vNo: 152, glCode: "152", shortName: "Re00005", ledgerName: "RENT THULOBHAIYANG A/C" },
  { vNo: 83, glCode: "83", shortName: "SA00019", ledgerName: "SALARY A/C" },
  { vNo: 1164, glCode: "1164", shortName: "SH00047R", ledgerName: "SALARY A/C-RIDDHIMA" },
  { vNo: 1590, glCode: "1590", shortName: "SA00011", ledgerName: "SALARY- ANITA" },
  { vNo: 1329, glCode: "1329", shortName: "SH00047JKPCJO", ledgerName: "SALARY- BIBEK" },
  { vNo: 537, glCode: "537", shortName: "SA00037", ledgerName: "SALARY- BINOD YADAV" },
  { vNo: 1588, glCode: "1588", shortName: "SA00009", ledgerName: "SALARY- BUDDHA" },
  { vNo: 1581, glCode: "1581", shortName: "SA00002", ledgerName: "SALARY DIL" },
  { vNo: 663, glCode: "663", shortName: "SA00044", ledgerName: "SALARY- KRISHNA CHOWDHARY" },
  { vNo: 1328, glCode: "1328", shortName: "SH0004716131", ledgerName: "SALARY- PRATAP" },
  { vNo: 592, glCode: "592", shortName: "SA00041", ledgerName: "SALARY- RABIN DRIVER" },
  { vNo: 801, glCode: "801", shortName: "SH000470", ledgerName: "SALARY- RAM BHUJEL" },
  { vNo: 581, glCode: "581", shortName: "SA00039", ledgerName: "SALARY- ROSHAN THAMI" },
  { vNo: 662, glCode: "662", shortName: "SA00043", ledgerName: "SALARY- SACHIP PATEL" },
  { vNo: 495, glCode: "495", shortName: "Ro00008", ledgerName: "SALARY- SAROJ ADHIKARI" },
  { vNo: 1279, glCode: "1279", shortName: "SH00047654651", ledgerName: "SALARY- SHANTA" },
  { vNo: 1589, glCode: "1589", shortName: "SA00010", ledgerName: "SALARY-KAILASH" },
  { vNo: 22, glCode: "22", shortName: "SA00014", ledgerName: "SALARY-MANGAL" },
  { vNo: 1621, glCode: "1621", shortName: "SL00001", ledgerName: "Sales Return A/C" },
  { vNo: 1379, glCode: "1379", shortName: "A000000003", ledgerName: "Sales Revenue A/C" },
  { vNo: 498, glCode: "498", shortName: "JU00001", ledgerName: "SANTOSH SALARY" },
  { vNo: 1630, glCode: "1630", shortName: "SOt1049", ledgerName: "SARDA DI SALARY A/C" },
  { vNo: 1304, glCode: "1304", shortName: "OF00001", ledgerName: "SATUNGAL OFF. EXP" },
  { vNo: 1628, glCode: "1628", shortName: "SOt1031", ledgerName: "SHYAM SALARY A/C" },
  { vNo: 1043, glCode: "1043", shortName: "NA00017A", ledgerName: "SILAI A/C" },
  { vNo: 339, glCode: "339", shortName: "SO00006", ledgerName: "Sophiya" },
  { vNo: 496, glCode: "496", shortName: "SU00024", ledgerName: "SUJAN SALARY" },
  { vNo: 1629, glCode: "1629", shortName: "SOt1032", ledgerName: "SWIPPER ALARY A/C" },
  { vNo: 1649, glCode: "1649", shortName: "TOt1025", ledgerName: "TAX  A/C" },
  { vNo: 769, glCode: "769", shortName: "TA00004", ledgerName: "TAX REFUND A/C" },
  { vNo: 136, glCode: "136", shortName: "TE00002", ledgerName: "TELEPHONE EXP" },
  { vNo: 1648, glCode: "1648", shortName: "TIOt001", ledgerName: "TICKET A/C" },
  { vNo: 11, glCode: "11", shortName: "KI00003", ledgerName: "TILAK MAJHI- SALARY" },
  { vNo: 1651, glCode: "1651", shortName: "TR00001", ledgerName: "TRANSPORT INCOME" },
  { vNo: 1258, glCode: "1258", shortName: "Tr00004", ledgerName: "TRANSPORT INCOME -  SATUNGAL" },
  { vNo: 1650, glCode: "1650", shortName: "TOt1043", ledgerName: "TRAVELLING EXP." },
  { vNo: 497, glCode: "497", shortName: "NA00012", ledgerName: "VARUN SALARY" },
];

export default function BudgetLedgerPage() {
  const [searchText, setSearchText] = useState("");
  const [copiedMsg, setCopiedMsg] = useState("");

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return LEDGER_ROWS;
    return LEDGER_ROWS.filter(
      (r) =>
        r.glCode.toLowerCase().includes(q) ||
        r.shortName.toLowerCase().includes(q) ||
        r.ledgerName.toLowerCase().includes(q)
    );
  }, [searchText]);

  function handleTargetClick(row: LedgerRow) {
    // Swap for: router.push(`/masterentry/budget-ledger-target?VNo=${row.vNo}`)
    window.location.href = `/MasterEntry/FrmBudgerLedgerTarget?VNo=${row.vNo}`;
  }

  async function handleCopy() {
    const text = filteredRows
      .map((r) => `${r.glCode}\t${r.shortName}\t${r.ledgerName}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedMsg(`Copied ${filteredRows.length} rows to clipboard`);
    setTimeout(() => setCopiedMsg(""), 2000);
  }

  function handleExportCsv() {
    const header = "Gl Code,Short Name,Ledger Name";
    const csv = [
      header,
      ...filteredRows.map(
        (r) => `${r.glCode},"${r.shortName}","${r.ledgerName.replace(/"/g, '""')}"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Budget Ledger.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="mx-auto max-w-1xl overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t-4 border-t-sky-400 bg-gray-100 px-4 py-2">
          <h1 className="text-sm font-medium text-gray-700">Budget Ledger</h1>
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              <Plus size={13} /> New
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Copy size={13} /> Copy
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileSpreadsheet size={13} /> Excel
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Printer size={13} /> Print
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Toolbar: search + count */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="relative w-full max-w-xs">
              <Search size={13} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search Gl Code, Short Name, Ledger Name..."
                className="w-full rounded border border-gray-300 py-1.5 pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {copiedMsg && <span className="text-green-600">{copiedMsg}</span>}
              <span>
                {filteredRows.length} of {LEDGER_ROWS.length} records
              </span>
              <button
                onClick={() => setSearchText("")}
                title="Reset"
                className="text-gray-400 hover:text-sky-600"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto rounded border border-gray-200">
            <table className="w-full min-w-[700px] border-collapse text-xs">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-200 text-left">
                  <th className="w-10 px-2 py-2 font-semibold text-gray-700">#</th>
                  <th className="w-28 px-2 py-2 font-semibold text-gray-700">Gl Code</th>
                  <th className="w-40 px-2 py-2 font-semibold text-gray-700">Short Name</th>
                  <th className="px-2 py-2 font-semibold text-gray-700">Ledger Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.vNo} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 py-1.5">
                      <button
                        onClick={() => handleTargetClick(row)}
                        title="Target"
                        className="text-sky-600 hover:text-sky-800"
                      >
                        <BookOpen size={13} />
                      </button>
                    </td>
                    <td className="px-2 py-1.5 text-gray-700">{row.glCode}</td>
                    <td className="px-2 py-1.5 text-gray-700">{row.shortName}</td>
                    <td className="px-2 py-1.5 text-gray-700">{row.ledgerName}</td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-2 py-6 text-center text-gray-400">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
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
// async function fetchBudgetLedgers(): Promise<LedgerRow[]> {
//   const res = await fetch("/api/masterentry/budget-ledger");
//   return res.json();
// }
//
// and load it in a useEffect (or as a server component prop) instead of the
// hardcoded LEDGER_ROWS array above.
// ---------------------------------------------------------------------------