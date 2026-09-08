"use client";

import { useEffect, useState } from "react";
import InfoBar from "@/components/dashboard/ Infobar";
import TopNavbar from "@/components/dashboard/Topbar";
import { authFetch } from "@/lib/authFetch";
import { getAuthUser, type AuthUser } from "@/lib/authSession";

type FiscalYear = {
  startDate: string;
  endDate: string;
};

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB").format(date);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [fiscalYear, setFiscalYear] = useState<FiscalYear | null>(null);

  useEffect(() => {
    const userLoadFrame = window.requestAnimationFrame(() => {
      setUser(getAuthUser());
    });

    const fiscalYearId = window.localStorage.getItem("biz-fiscal-year-id");
    if (!fiscalYearId) {
      return () => window.cancelAnimationFrame(userLoadFrame);
    }

    let active = true;

    async function loadFiscalYear() {
      try {
        const response = await authFetch(`/api/FiscalYear/${fiscalYearId}`);
        if (!response.ok) return;

        const data = (await response.json().catch(() => null)) as FiscalYear | null;
        if (active && data) setFiscalYear(data);
      } catch {
        // The company and user data can still be shown if fiscal-year loading fails.
      }
    }

    void loadFiscalYear();

    return () => {
      window.cancelAnimationFrame(userLoadFrame);
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <InfoBar
        companyCode={user?.companyCode ?? "-"}
        companyName={user?.companyName ?? "-"}
        startDate={formatDate(fiscalYear?.startDate)}
        endDate={formatDate(fiscalYear?.endDate)}
        userName={user?.username ?? "-"}
      />
      <TopNavbar />
      <main className=" md:p-0">{children}</main>
    </div>
  );
}
