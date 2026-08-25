import { MASTER_MENU } from "@/lib/menuData";
import type { MegaMenuColumn } from "@/lib/menuTypes";

export type SearchItem = {
  label: string;
  href: string;
  group: string;
};

const TOP_LEVEL: SearchItem[] = [
  { label: "Dashboard", href: "/dashboard", group: "Pages" },
  { label: "Master", href: "/master", group: "Pages" },
];

function flattenColumns(columns: MegaMenuColumn[], group: string): SearchItem[] {
  return columns.flatMap((column) =>
    column.flatMap((section) =>
      section.links.map((link) => ({
        label: link.label,
        href: link.href,
        group: `${group} — ${section.heading}`,
      }))
    )
  );
}

// As you add FINANCE_MENU, SALES_MENU, etc. to lib/menuData.ts, flatten
// them here too so they show up in global search automatically.
export const SEARCH_INDEX: SearchItem[] = [
  ...TOP_LEVEL,
  ...flattenColumns(MASTER_MENU, "Master"),
];