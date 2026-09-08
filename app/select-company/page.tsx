"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowRight, ArrowLeft } from "lucide-react";
import DataTable, { DataTableColumn } from "@/components/dashboard/DataTable";
import { getAuthUser, type AuthUser } from "@/lib/authSession";

type CompanyRow = {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  fiscalYear: string;
};

export default function SelectCompanyPage() {
  const router = useRouter();
  const [fiscalYear] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem("biz-fiscal-year")
  );
  const [company] = useState<AuthUser | null>(() => getAuthUser());

  useEffect(() => {
    if (!fiscalYear) {
      router.replace("/select-fiscal-year");
      return;
    }

    if (!company) {
      router.replace("/login");
    }
  }, [company, fiscalYear, router]);

  const currentCompany: CompanyRow | null = company
    ? {
        id: String(company.id),
        code: company.companyCode,
        name: company.companyName,
        startDate: "-",
        endDate: "-",
        fiscalYear: fiscalYear ?? "",
      }
    : null;

  const handleSelect = (company: CompanyRow) => {
    window.localStorage.setItem("biz-company-code", company.code);
    window.localStorage.setItem("biz-company-name", company.name);
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

  if (!fiscalYear || !currentCompany) return null;

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
          data={[currentCompany]}
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
