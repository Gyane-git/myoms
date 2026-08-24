"use client";

import MenuColumnsGrid from "@/components/dashboard/MenuColumnsGrid";
import type { MegaMenuColumn } from "@/lib/menuTypes";

export type { MegaMenuLink, MegaMenuSection, MegaMenuColumn } from "@/lib/menuTypes";

type MegaMenuProps = {
  columns: MegaMenuColumn[];
  onLinkClick?: () => void;
};

export default function MegaMenu({ columns, onLinkClick }: MegaMenuProps) {
  return (
    <div className="absolute left-0 top-full w-screen bg-white border-b border-slate-200 shadow-lg z-30">
      <div className="max-w-[1600px] mx-auto px-6 py-5">
        <MenuColumnsGrid columns={columns} onLinkClick={onLinkClick} />
      </div>
    </div>
  );
}