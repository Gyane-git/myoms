export type MegaMenuLink = { label: string; href: string; permission?: string };
export type MegaMenuSection = { heading: string; links: MegaMenuLink[]; permission?: string };
export type MegaMenuColumn = MegaMenuSection[];
