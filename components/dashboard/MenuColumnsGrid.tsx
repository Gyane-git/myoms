"use client";

import { useEffect, useState } from "react";
import { getAuthPermissions } from "@/lib/authSession";
import type { MegaMenuColumn } from "@/lib/menuTypes";

type MenuColumnsGridProps = {
  columns: MegaMenuColumn[];
  onLinkClick?: () => void;
};

export default function MenuColumnsGrid({
  columns,
  onLinkClick,
}: MenuColumnsGridProps) {
  const [permissions, setPermissions] = useState<string[] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setPermissions(getAuthPermissions()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const canSee = (permission?: string) => !permission || permissions === null || permissions.includes(permission);

  return (
    <div
      className="grid gap-x-8 gap-y-6"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
      }}
    >
      {columns.map((column, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-5">
          {column.filter((section) => canSee(section.permission)).map((section) => (
            <div key={section.heading}>
              <h4 className="text-sm font-semibold text-amber-600 mb-1.5">
                {section.heading}
              </h4>
              <ul className="flex flex-col gap-1">
                {section.links.filter((link) => canSee(link.permission)).map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={onLinkClick}
                      className="block text-sm text-blue-700 hover:text-blue-900 hover:underline py-0.5"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
