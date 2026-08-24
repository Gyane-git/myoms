import MenuColumnsGrid from "@/components/dashboard/MenuColumnsGrid";
import { MASTER_MENU } from "@/lib/menuData";

export default function MasterPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Master</h1>
        <p className="text-sm text-slate-500">
          All master setup screens, grouped by area
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <MenuColumnsGrid columns={MASTER_MENU} />
      </div>
    </div>
  );
}