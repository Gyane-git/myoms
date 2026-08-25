"use client";
import InfoBar from "@/components/dashboard/ Infobar";
import TopNavbar from "@/components/dashboard/Topnavbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <InfoBar
        companyCode="ERPDEMO1"
        companyName="ERP DEMO COMPANY"
        startDate="01/04/2082"
        endDate="32/03/2084"
        userName="demo"
        unreadCount={3}
        
      />
      <TopNavbar />
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}