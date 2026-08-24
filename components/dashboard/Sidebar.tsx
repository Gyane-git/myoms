"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Database,
  Wallet,
  ShoppingCart,
  Boxes,
  Building2,
  BarChart3,
  Car,
  FileStack,
  Settings,
  Users,
  ListChecks,
  HelpCircle,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: { label: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  {
    label: "Master",
    icon: Database,
    children: [
      { label: "Item Master", href: "/master/item" },
      { label: "Customer / Supplier", href: "/master/party" },
      { label: "Account Master", href: "/master/account" },
      { label: "Unit / Category", href: "/master/unit-category" },
    ],
  },
  {
    label: "Finance",
    icon: Wallet,
    children: [
      { label: "Journal Voucher", href: "/finance/journal" },
      { label: "Ledger", href: "/finance/ledger" },
      { label: "Trial Balance", href: "/finance/trial-balance" },
      { label: "Bank Reconciliation", href: "/finance/bank-reconciliation" },
    ],
  },
  {
    label: "Sales",
    icon: BarChart3,
    children: [
      { label: "Sales Order", href: "/sales/order" },
      { label: "Sales Invoice", href: "/sales/invoice" },
      { label: "Sales Return", href: "/sales/return" },
    ],
  },
  {
    label: "Purchase",
    icon: ShoppingCart,
    children: [
      { label: "Purchase Order", href: "/purchase/order" },
      { label: "Purchase Bill", href: "/purchase/bill" },
      { label: "Purchase Return", href: "/purchase/return" },
    ],
  },
  {
    label: "Inventory",
    icon: Boxes,
    children: [
      { label: "Stock Ledger", href: "/inventory/stock-ledger" },
      { label: "Stock Transfer", href: "/inventory/transfer" },
      { label: "Stock Adjustment", href: "/inventory/adjustment" },
    ],
  },
  { label: "Fixed Asset", icon: Building2, href: "/fixed-asset" },
  { label: "Auto Mobile", icon: Car, href: "/auto-mobile" },
  { label: "Doc Management", icon: FileStack, href: "/doc-management" },
  { label: "Task", icon: ListChecks, href: "/task" },
  { label: "User", icon: Users, href: "/user" },
  { label: "Utility", icon: Settings, href: "/utility" },
  { label: "Help", icon: HelpCircle, href: "/help" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>("Master");

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-150 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between h-14 px-3 border-b border-slate-800">
        {!collapsed && (
          <span className="font-semibold text-sm tracking-wide text-white">
            OMS<span className="text-blue-400">next</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;
          const isOpen = openGroup === item.label;

          return (
            <div key={item.label} className="px-2">
              <button
                onClick={() =>
                  hasChildren
                    ? setOpenGroup(isOpen ? null : item.label)
                    : undefined
                }
                className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Icon size={17} className="shrink-0 text-slate-400" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {hasChildren && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </>
                )}
              </button>

              {!collapsed && hasChildren && isOpen && (
                <div className="ml-8 mb-1 flex flex-col gap-0.5 border-l border-slate-800 pl-3">
                  {item.children!.map((child) => (
                    <a
                      key={child.href}
                      href={child.href}
                      className="text-xs text-slate-400 hover:text-blue-400 py-1.5"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-800 text-[11px] text-slate-500">
          v1.0 &middot; ERP DEMO COMPANY
        </div>
      )}
    </aside>
  );
}