"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { NepaliDate } from "@/lib/nepaliDate";

function buildFiscalYearOptions(): string[] {
  // BS fiscal year runs roughly Shrawan–Ashad, e.g. "2081/82".
  // Generate a small range centred on the current BS year so this
  // never needs manual updates.
  const currentYear = NepaliDate.now().getYear();
  const years: string[] = [];
  for (let y = currentYear - 3; y <= currentYear + 1; y++) {
    years.push(`${y}/${String(y + 1).slice(-2)}`);
  }
  return years;
}

export default function SelectFiscalYearPage() {
  const router = useRouter();
  const fiscalYears = useMemo(buildFiscalYearOptions, []);
  const [selected, setSelected] = useState(
    fiscalYears[fiscalYears.length - 2] ?? fiscalYears[0]
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Persist the choice for the rest of the session. Swap this for a
    // call to your .NET API if fiscal year needs to be validated /
    // stored server-side (e.g. POST /api/session/fiscal-year).
    window.localStorage.setItem("biz-fiscal-year", selected);

    await new Promise((r) => setTimeout(r, 400)); // placeholder for the real call
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
          >
            {fiscalYears.map((fy) => (
              <option key={fy} value={fy}>
                {fy}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="biz-fy-form__submit" disabled={submitting}>
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