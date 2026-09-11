
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import MegaMenu from "@/components/dashboard/ Megamenu";
import type { MegaMenuColumn } from "@/lib/menuTypes";
import { MASTER_MENU } from "@/lib/menuData";
import { getAuthPermissions, getAuthToken } from "@/lib/authSession";

type NavChild = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  href?: string;
  children?: NavChild[];
  megaMenu?: MegaMenuColumn[];
  permission?: string;
};

const HOME_MENU: MegaMenuColumn[] = [
  [
    {
      heading: "Workspace",
      links: [
        { label: "Main", href: "/main" },
        { label: "Dashboard", href: "/dashboard" },
      ],
    },
  ],
  [
    {
      heading: "Administration",
      links: [{ label: "Company Master", href: "/company-master" }],
    },
  ],
  [
    {
      heading: "Session",
      links: [{ label: "Logout", href: "/logout" }],
    },
  ],
];

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
  },

  {
    label: "Master",
    href: "/master",
    megaMenu: MASTER_MENU,
  },

  { label: "Finance", href: "/finance", permission: "PERM_FINANCE" },
  { label: "Sales", href: "/sales", permission: "PERM_SALES" },
  { label: "Purchase", href: "/purchase", permission: "PERM_PURCHASE" },
  { label: "Inventory", href: "/inventory", permission: "PERM_INVENTORY" },
  { label: "Fixed Asset", href: "/fixed-asset", permission: "PERM_FIXED_ASSET" },
  { label: "Smart Sales", href: "/smart-sales", permission: "PERM_SMART_SALES" },
  { label: "Auto Mobile", href: "/auto-mobile", permission: "PERM_AUTO_MOBILE" },
  { label: "Doc Management", href: "/doc-management", permission: "PERM_DOC_MANAGEMENT" },
  { label: "Utility", href: "/utility", permission: "PERM_UTILITY" },
  { label: "User", href: "/user", permission: "PERM_USER_MENU" },
  { label: "Task", href: "/task", permission: "PERM_TASK" },
  { label: "Help", href: "/help", permission: "PERM_HELP" },
];

export default function TopNavbar() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);
  const [permissions, setPermissions] = useState<string[] | null>(null);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const token = getAuthToken();
      if (!token) { setPermissions([]); return; }
      setPermissions(getAuthPermissions());
      try {
        const payload = JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as Record<string, unknown>;
        const roleClaim = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? payload.role;
        const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
        setIsAdmin(roles.some((role) => String(role).toUpperCase() === "ADMIN"));
        setIsCompanyAdmin(roles.some((role) => String(role).toUpperCase() === "COMPANY_ADMIN"));
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

  const homeMenu = isAdmin
    ? HOME_MENU
    : HOME_MENU.filter((column) => column[0]?.heading !== "Administration");

  return (
    <nav
      className="relative z-40 bg-teal-700 text-white"
      onMouseLeave={handleLeave}
    >
      <ul className="flex items-stretch overflow-visible">
        {NAV_ITEMS.filter((item) => !item.permission || permissions === null || permissions.includes(item.permission) || ((isCompanyAdmin || permissions?.includes("PERM_USER_MANAGEMENT")) && item.label === "User") || (isAdmin && item.label === "Home")).map((item) => {
          const isOpen = openItem === item.label;

          const hasDropdown =
            item.label === "Home" || Boolean(item.children?.length) || Boolean(item.megaMenu);

          return (
            <li
              key={item.label}
              className="relative shrink-0"
              onMouseEnter={() => handleEnter(item.label)}
            >
              {/* Use a button for dropdowns so click never navigates to '#'. */}
              {hasDropdown ? (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenItem(isOpen ? null : item.label)}
                  className={`flex items-center gap-1 whitespace-nowrap px-4 py-2.5 text-sm transition-colors hover:bg-teal-600 ${
                    isOpen ? "bg-teal-600" : ""
                  }`}
                >
                  {item.label}
                  <ChevronDown size={13} />
                </button>
              ) : (
                <a
                  href={item.href ?? "#"}
                  className="flex items-center gap-1 whitespace-nowrap px-4 py-2.5 text-sm transition-colors hover:bg-teal-600"
                >
                  {item.label}
                </a>
              )}

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

              {item.label === "Home" && isOpen && (
                <MegaMenu
                  columns={homeMenu}
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
