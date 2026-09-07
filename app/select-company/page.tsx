"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowRight, ArrowLeft } from "lucide-react";
import DataTable, { DataTableColumn } from "@/components/dashboard/DataTable";

type CompanyRow = {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  fiscalYear: string; // "2082/83" — which fiscal year this company record belongs to
};

// Replace with a call to your .NET API, e.g.
//   GET /api/auth/companies?fiscalYear=2083/84
// scoped to the logged-in user's account (from the JWT) and the fiscal
// year chosen on the previous screen.
const COMPANIES: CompanyRow[] = [
  { id: "BKGRP082", code: "BKGRP082", name: "B.K. GROUP PVT. LTD.", startDate: "01/04/2082", endDate: "32/03/2084", fiscalYear: "2082/83" },
  { id: "BKGRP083", code: "BKGRP083", name: "B.K. GROUP PVT. LTD. 2083/84", startDate: "01/04/2083", endDate: "32/03/2084", fiscalYear: "2083/84" },
  { id: "BKTRA082", code: "BKTRA082", name: "B.K. Traders And Suppliers", startDate: "01/04/2082", endDate: "32/03/2083", fiscalYear: "2082/83" },
  { id: "BKTRA083", code: "BKTRA083", name: "B.K. Traders And Suppliers - 2083/84", startDate: "01/04/2083", endDate: "32/03/2084", fiscalYear: "2083/84" },
  { id: "BABAE082", code: "BABAE082", name: "Baba Exim Pvt. Ltd.", startDate: "01/04/2082", endDate: "32/03/2084", fiscalYear: "2082/83" },
  { id: "BABAE083", code: "BABAE083", name: "Baba Exim Pvt. Ltd. - 2083/84", startDate: "01/04/2083", endDate: "32/03/2084", fiscalYear: "2083/84" },
  { id: "BK002526", code: "BK002526", name: "BK GROUP -2025-26", startDate: "01/04/2082", endDate: "32/03/2083", fiscalYear: "2082/83" },
  { id: "DEMO2082", code: "DEMO2082", name: "DEMO - bk", startDate: "01/04/2083", endDate: "32/03/2084", fiscalYear: "2083/84" },
];

export default function SelectCompanyPage() {
  const router = useRouter();
  const [fiscalYear, setFiscalYear] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("biz-fiscal-year");
    if (!saved) {
      // No fiscal year chosen yet — send them back to pick one first.
      router.replace("/select-fiscal-year");
      return;
    }
    setFiscalYear(saved);
  }, [router]);

  const filteredCompanies = useMemo(
    () => COMPANIES.filter((c) => c.fiscalYear === fiscalYear),
    [fiscalYear]
  );

  const handleSelect = (company: CompanyRow) => {
    window.localStorage.setItem("biz-company-code", company.code);
    router.push("/dashboard");
  };

  const columns: DataTableColumn<CompanyRow>[] = [
    { key: "code", label: "Initial", sortable: true },
    { key: "name", label: "Company Name", sortable: true },
    { key: "startDate", label: "Start Date", sortable: true },
    { key: "endDate", label: "End Date", sortable: true },
    {
      key: "action",
      label: "",
      filterable: false,
      render: (row) => (
        <button
          onClick={() => handleSelect(row)}
          className="biz-select-company__btn"
        >
          Select <ArrowRight size={13} />
        </button>
      ),
    },
  ];

  if (!fiscalYear) return null; // redirecting

  return (
    <div className="biz-select-company">
      

      <div className="biz-select-company__card">
        <div className="biz-select-company__meta">
          <a href="/select-fiscal-year" className="biz-select-company__back">
            <ArrowLeft size={13} /> Change fiscal year
          </a>
          <span className="biz-select-company__fy">FY {fiscalYear}</span>
        </div>

        <DataTable
          title="Select Company"
          columns={columns}
          data={filteredCompanies}
          pageSize={10}
        />
      </div>

      <style jsx>{`
        .biz-select-company {
          min-height: 100vh;
          background: #faf9f6;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .biz-select-company__brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
          font-weight: 600;
          color: #1c2b48;
        }
        .biz-select-company__card {
          width: 100%;
          max-width: 1000px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .biz-select-company__meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .biz-select-company__back {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12.5px;
          color: #1c2b48;
          text-decoration: none;
        }
        .biz-select-company__back:hover {
          text-decoration: underline;
        }
        .biz-select-company__fy {
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #c79a45;
        }
        .biz-select-company :global(.biz-select-company__btn) {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 6px;
          border: none;
          background: #1c2b48;
          color: #fff;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }
        .biz-select-company :global(.biz-select-company__btn:hover) {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}