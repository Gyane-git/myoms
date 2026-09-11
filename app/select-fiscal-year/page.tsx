"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";

import { authFetch } from "@/lib/authFetch";

type FiscalYear = {
  id: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isClosed: boolean;
  isActive: boolean;
};

export default function SelectFiscalYearPage() {
  const router = useRouter();
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadFiscalYears() {
      try {
        const response = await authFetch("/api/FiscalYear");
        const data = (await response.json().catch(() => null)) as
          | FiscalYear[]
          | { message?: string }
          | null;

        if (!response.ok || !Array.isArray(data)) {
          throw new Error(
            !Array.isArray(data) && data?.message
              ? data.message
              : "Unable to load fiscal years."
          );
        }

        const selectableYears = data.filter(
          (fiscalYear) => fiscalYear.isActive && !fiscalYear.isClosed
        );

        if (active) {
          setFiscalYears(selectableYears);
          setSelected(
            String(
              selectableYears.find((fiscalYear) => fiscalYear.isCurrent)?.id ??
                selectableYears[0]?.id ??
                ""
            )
          );
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load fiscal years."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFiscalYears();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedFiscalYear = fiscalYears.find(
      (fiscalYear) => String(fiscalYear.id) === selected
    );

    if (!selectedFiscalYear) {
      setError("Please select a fiscal year.");
      return;
    }

    setSubmitting(true);

    window.localStorage.setItem(
      "biz-fiscal-year-id",
      String(selectedFiscalYear.id)
    );
    window.localStorage.setItem(
      "biz-fiscal-year",
      selectedFiscalYear.name || selectedFiscalYear.code
    );

    router.push("/select-company");
  };

  return (
    <AuthLayout
      eyebrow="BIZ — Business Integration System"
      title="Select fiscal year"
      subtitle="Choose the fiscal year you want to work in for this session."
    >
      <form onSubmit={handleSubmit} className="biz-fy-form">
        <label htmlFor="fiscalYear" className="biz-fy-form__label">
          Fiscal year
        </label>
        <div className="biz-fy-form__control">
          <CalendarRange size={15} className="biz-fy-form__icon" />
          <select
            id="fiscalYear"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={loading || fiscalYears.length === 0}
          >
            <option value="">
              {loading ? "Loading fiscal years…" : "Select fiscal year"}
            </option>
            {fiscalYears.map((fiscalYear) => (
              <option key={fiscalYear.id} value={fiscalYear.id}>
                {fiscalYear.name || fiscalYear.code}
                {fiscalYear.code && fiscalYear.name !== fiscalYear.code
                  ? ` (${fiscalYear.code})`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        {!loading && fiscalYears.length === 0 && !error && (
          <div className="biz-fy-form__empty">
            <strong>No fiscal year is configured for this company.</strong>
            <span>Create the first fiscal year to continue using the ERP.</span>
            <button
              type="button"
              className="biz-fy-form__setup"
              onClick={() => router.push("/master/fiscal-year")}
            >
              Create Fiscal Year
            </button>
          </div>
        )}

        {error && <p className="biz-fy-form__error">{error}</p>}

        <button
          type="submit"
          className="biz-fy-form__submit"
          disabled={loading || submitting || fiscalYears.length === 0}
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="biz-fy-form__spinner" />
              Loading workspace…
            </>
          ) : (
            "Submit"
          )}
        </button>
      </form>

      <style jsx>{`
        .biz-fy-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .biz-fy-form__label {
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          color: #1c2b48;
        }
        .biz-fy-form__control {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          border: 1px solid rgba(28, 43, 72, 0.16);
          border-radius: 7px;
          background: #fff;
          margin-bottom: 18px;
        }
        .biz-fy-form__control:focus-within {
          border-color: #c79a45;
          box-shadow: 0 0 0 3px rgba(199, 154, 69, 0.15);
        }
        .biz-fy-form__icon {
          color: #8890a0;
          flex-shrink: 0;
        }
        .biz-fy-form__control select {
          flex: 1;
          border: none;
          outline: none;
          padding: 10px 0;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 14px;
          color: #1c2b48;
          background: transparent;
        }
        .biz-fy-form__submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px;
          border: none;
          border-radius: 7px;
          background: #1c2b48;
          color: #fff;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .biz-fy-form__submit:hover {
          opacity: 0.92;
        }
        .biz-fy-form__submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .biz-fy-form__error {
          margin: -8px 0 2px;
          color: #b42318;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12px;
        }
        .biz-fy-form__empty {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin: 0 0 18px;
          padding: 13px;
          border: 1px solid #ead9b3;
          border-radius: 7px;
          background: #fffaf0;
          color: #6f5424;
          font-size: 12px;
        }
        .biz-fy-form__empty strong {
          color: #4c3919;
          font-size: 13px;
        }
        .biz-fy-form__setup {
          align-self: flex-start;
          margin-top: 5px;
          padding: 8px 12px;
          border: 0;
          border-radius: 6px;
          background: #1c2b48;
          color: #fff;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }
        .biz-fy-form__spinner {
          animation: biz-spin 0.8s linear infinite;
        }
        @keyframes biz-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </AuthLayout>
  );
}
