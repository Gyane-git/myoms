import { Bell, Search } from "lucide-react";

type InfoBarProps = {
  companyCode: string;
  companyName: string;
  startDate: string;
  endDate: string;
  userName: string;
  unreadCount?: number;
};

export default function InfoBar({
  companyCode,
  companyName,
  startDate,
  endDate,
  userName,
  unreadCount = 0,
}: InfoBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2.5 bg-white border-b border-slate-200 text-sm">
      <span className="text-blue-700">
        CODE : <span className="font-medium">{companyCode}</span>
      </span>
      <span className="text-blue-700">
        Company Name : <span className="font-medium">{companyName}</span>
      </span>
      <span className="text-blue-700">Start Date : {startDate}</span>
      <span className="text-blue-700">End Date : {endDate}</span>

      <button
        onClick={() =>
          window.dispatchEvent(
            new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
          )
        }
        className="flex items-center gap-2 px-2.5 py-1 text-xs text-slate-400 border border-slate-200 rounded-md hover:bg-slate-50"
      >
        <Search size={12} />
        Search
        <kbd className="ml-1 px-1 py-0.5 border border-slate-200 rounded text-[10px]">
          Ctrl K
        </kbd>
      </button>

      <span className="ml-auto flex items-center gap-1.5 text-blue-700">
        User : <span className="font-medium">{userName}</span>
        <span className="relative inline-flex">
          <Bell size={14} className="text-red-500" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-3.5 min-w-3.5 px-0.5 rounded-full bg-red-500 text-white text-[9px] leading-3.5 text-center">
              {unreadCount}
            </span>
          )}
        </span>
      </span>
    </div>
  );
}