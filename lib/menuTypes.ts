export type MegaMenuLink = { label: string; href: string };
export type MegaMenuSection = { heading: string; links: MegaMenuLink[] };
export type MegaMenuColumn = MegaMenuSection[];