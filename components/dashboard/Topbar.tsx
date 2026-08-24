"use client";

import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import MegaMenu from "@/components/dashboard/ Megamenu";
import type { MegaMenuColumn } from "@/lib/menuTypes";
import { MASTER_MENU } from "@/lib/menuData";

type NavItem = {
  label: string;
  href: string;
  megaMenu?: MegaMenuColumn[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard" },
  { label: "Master", href: "/master", megaMenu: MASTER_MENU },
  { label: "Finance", href: "/finance" },
  { label: "Sales", href: "/sales" },
  { label: "Purchase", href: "/purchase" },
  { label: "Inventory", href: "/inventory" },
  { label: "Fixed Asset", href: "/fixed-asset" },
  { label: "Smart Sales", href: "/smart-sales" },
  { label: "Auto Mobile", href: "/auto-mobile" },
  { label: "Doc Management", href: "/doc-management" },
  { label: "Utility", href: "/utility" },
  { label: "User", href: "/user" },
  { label: "Task", href: "/task" },
  { label: "Help", href: "/help" },
];

export default function TopNavbar() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenItem(label);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpenItem(null), 150);
  };

  return (
    <nav
      className="relative bg-teal-700 text-white"
      onMouseLeave={handleLeave}
    >
      <ul className="flex items-stretch overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isOpen = openItem === item.label;
          return (
            <li
              key={item.label}
              className="relative shrink-0"
              onMouseEnter={() => handleEnter(item.label)}
            >
              <a
                href={item.href}
                className={`flex items-center gap-1 px-4 py-2.5 text-sm whitespace-nowrap hover:bg-teal-600 transition-colors ${
                  isOpen ? "bg-teal-600" : ""
                }`}
              >
                {item.label}
                {item.megaMenu && <ChevronDown size={13} />}
              </a>

              {item.megaMenu && isOpen && (
                <MegaMenu
                  columns={item.megaMenu}
                  onLinkClick={() => setOpenItem(null)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}