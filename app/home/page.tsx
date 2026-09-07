import { Landmark, ShoppingBag, PackageSearch, Banknote, Receipt, Users } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import SalesTrend from "@/components/dashboard/SalesTrend";
import LowStockAlert from "@/components/dashboard/LowStockAlert";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5 p-3">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Overview for fiscal year 2082/83, as of today
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Total Sales (MTD)" value="Rs 18.4 L" icon={ShoppingBag} changePct={12} accent="blue" />
        <StatCard label="Total Purchase (MTD)" value="Rs 11.2 L" icon={Landmark} changePct={-4} accent="violet" />
        <StatCard label="Stock Value" value="Rs 42.7 L" icon={PackageSearch} accent="amber" />
        <StatCard label="Receivable" value="Rs 6.8 L" icon={Receipt} changePct={5} accent="rose" />
        <StatCard label="Payable" value="Rs 3.1 L" icon={Banknote} changePct={-8} accent="green" />
        <StatCard label="Active Parties" value="248" icon={Users} accent="blue" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 flex flex-col gap-5">
          <SalesTrend />
          <RecentTransactions />
        </div>
        <div className="flex flex-col gap-5">
          <QuickActions />
          <LowStockAlert />
        </div>
      </div>
    </div>
  );
}