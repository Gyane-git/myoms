
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import MegaMenu from "@/components/dashboard/ Megamenu";
import type { MegaMenuColumn } from "@/lib/menuTypes";
import { MASTER_MENU } from "@/lib/menuData";
import { getAuthToken } from "@/lib/authSession";

type NavChild = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  href?: string;
  children?: NavChild[];
  megaMenu?: MegaMenuColumn[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    children: [
      { label: "Main", href: "/main" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Company Master", href: "/company-master" },
      { label: "Logout", href: "/logout" },
    ],
  },

  {
    label: "Master",
    href: "/master",
    megaMenu: MASTER_MENU,
  },

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
  const [isAdmin, setIsAdmin] = useState(false);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const token = getAuthToken();
      if (!token) return;
      try {
        const payload = JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as Record<string, unknown>;
        const roleClaim = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? payload.role;
        const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
        setIsAdmin(roles.some((role) => String(role).toUpperCase() === "ADMIN"));
      } catch {
        setIsAdmin(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleEnter = (label: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    setOpenItem(label);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => {
      setOpenItem(null);
    }, 150);
  };

  return (
    <nav
      className="relative bg-teal-700 text-white"
      onMouseLeave={handleLeave}
    >
      <ul className="flex items-stretch overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isOpen = openItem === item.label;

          const hasDropdown =
            Boolean(item.children?.length) || Boolean(item.megaMenu);

          return (
            <li
              key={item.label}
              className="relative shrink-0"
              onMouseEnter={() => handleEnter(item.label)}
            >
              {/* NAV ITEM */}
                <a
                  href={item.href ?? "#"}
                className={`flex items-center gap-1 whitespace-nowrap px-4 py-2.5 text-sm transition-colors hover:bg-teal-600 ${
                  isOpen ? "bg-teal-600" : ""
                }`}
              >
                {item.label}

                {hasDropdown && <ChevronDown size={13} />}
              </a>

              {/* HOME DROPDOWN */}
              {item.children && isOpen && (
                <div
                  className="absolute left-0 top-full z-50 min-w-[190px] overflow-hidden rounded-b-md bg-white text-gray-800 shadow-lg"
                  onMouseEnter={() => {
                    if (closeTimer.current) {
                      clearTimeout(closeTimer.current);
                    }
                  }}
                >
                  {item.children.filter((child) => child.label !== "Company Master" || isAdmin).map((child) => (
                    <a
                      key={child.label}
                      href={child.href}
                      className="block px-4 py-2.5 text-sm transition-colors hover:bg-gray-100"
                      onClick={() => setOpenItem(null)}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}

              {/* MASTER MEGA MENU */}
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
