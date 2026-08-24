import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  changePct?: number; // positive or negative
  accent?: "blue" | "green" | "amber" | "rose" | "violet";
};

const ACCENT_MAP: Record<
  NonNullable<StatCardProps["accent"]>,
  { bg: string; text: string }
> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
  rose: { bg: "bg-rose-50", text: "text-rose-600" },
  violet: { bg: "bg-violet-50", text: "text-violet-600" },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  changePct,
  accent = "blue",
}: StatCardProps) {
  const colors = ACCENT_MAP[accent];
  const isPositive = (changePct ?? 0) >= 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1.5 text-xl font-semibold text-slate-800">{value}</p>
        {typeof changePct === "number" && (
          <div
            className={`mt-1.5 inline-flex items-center gap-0.5 text-xs font-medium ${
              isPositive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}
            {Math.abs(changePct)}% vs last month
          </div>
        )}
      </div>
      <div className={`h-9 w-9 rounded-md flex items-center justify-center ${colors.bg}`}>
        <Icon size={18} className={colors.text} />
      </div>
    </div>
  );
}