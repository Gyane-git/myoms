import type { MegaMenuColumn } from "@/components/dashboard/MegaMenu";

const link = (label: string, slug: string) => ({
  label,
  href: `/master/${slug}`,
});

export const MASTER_MENU: MegaMenuColumn[] = [
  // Column 1 — Chart of Account
  [
    {
      heading: "Chart of Account",
      permission: "PERM_CHART_OF_ACCOUNTS",
      links: [
        link("Account Group", "account-group"),
        link("Account Sub Group", "account-sub-group"),
        link("Account Add Group1", "account-add-group1"),
        link("Account Add Group2", "account-add-group2"),
        link("General Ledger", "general-ledger"),
        link("Subledger", "subledger"),
        link("Ledger Unit Allocation", "ledger-unit-allocation"),
        link("Ledger Mapping", "ledger-mapping"),
        link("Ledger Opening", "ledger-opening"),
        link("Budget Ledger", "budget-ledger"),
        link("Billwise Opening", "billwise-opening"),
        link("Merge Ledger", "merge-ledger"),
        link("Ledger Scheme Mapping", "ledger-scheme-mapping"),
        link("Userwise Ledger Rights", "userwise-ledger-rights"),
      ],
    },
  ],
  // Column 2 — Product
  [
    {
      heading: "Product",
      permission: "PERM_PRODUCT_MASTER",
      links: [
        link("Products", "item-product"),
        link("Product Category", "group-1"),
        link("Product Group", "group"),
        link("Product Sub Group", "sub-group"),
        link("Brand", "brand"),
        link("Model", "model"),
        link("Unit", "unit"),
        link("Unit Conversion", "unit-conversion"),
        link("Product Units", "product-unit"),
        link("Product Variants", "product-variant"),
        link("Product Attributes", "product-attribute"),
        link("Product Barcodes", "product-barcode"),
        link("Product Batches", "product-batch"),
        link("Product Serials", "product-serial"),
        link("Product Images", "product-image"),
        link("Location", "location"),
        link("Product Opening", "product-opening"),
        link("Product Opening (Existing product)", "product-opening-existing"),
        link("Product Scheme", "product-scheme"),
        link("Product Monthly Closing Rate", "product-monthly-closing-rate"),
        link("Value Added List", "value-added-list"),
        link("Product Composition", "product-composition"),
      ],
    },
  ],
  // Column 3 — Billing Term, Area/Agent, Division
  [
    {
      heading: "Billing Term",
      permission: "PERM_SALES",
      links: [
        link("Purchase Term", "purchase-term"),
        link("Sales Term", "sales-term"),
      ],
    },
    {
      heading: "Area/Agent",
      permission: "PERM_SALES",
      links: [
        link("Main Area", "main-area"),
        link("Region", "region"),
      ],
    },
    {
      heading: "Division",
      permission: "PERM_UTILITY",
      links: [
        link("Type", "division-type"),
        link("Master", "division-master"),
      ],
    },
  ],
  // Column 4 — Others
  [
    {
      heading: "Others",
      permission: "PERM_WAREHOUSE_MASTER",
      links: [
        link("Branches", "branch"),
        link("Company Units", "company-unit"),
        link("Fiscal Years", "fiscal-year"),
        link("Fiscal Year Periods", "fiscal-year-period"),
        link("Warehouses", "warehouse"),
        link("Warehouse Locations", "location"),
        link("Godown", "godown"),
        link("Cost Center", "cost-center"),
        link("Currency", "currency"),
        link("Master Listing", "master-listing"),
      ],
    },
  ],
  // Column 5 — Mechanic Apps
  [
    {
      heading: "Mechanic Apps",
      permission: "PERM_INVENTORY",
      links: [
        link("Mechanic Redeem Points", "mechanic-redeem-points"),
        link("Mechanic Login", "mechanic-login"),
        link("Mechanic Product Approve", "mechanic-product-approve"),
        link("Dispatch QrCode", "dispatch-qrcode"),
        link("Mechanic Point Register", "mechanic-point-register"),
        link("Product Point Scheme", "product-point-scheme"),
      ],
    },
  ],
  // Column 6 — SMS
  [
    {
      heading: "SMS",
      permission: "PERM_UTILITY",
      links: [
        link("Contact Master", "contact-master"),
        link("SMS API Setting", "sms-api-setting"),
        link("Send Single SMS", "send-single-sms"),
        link("Group SMS Template", "group-sms-template"),
        link("SMS Template", "sms-template"),
        link("Send SMS", "send-sms"),
        link("Send Email", "send-email"),
        link("Send Member Group SMS", "send-member-group-sms"),
        link("Sent SMS", "sent-sms"),
        link("Send Group SMS", "send-group-sms"),
        link("Sent Email", "sent-email"),
        link("Email Setup", "email-setup"),
        link("Email Template", "email-template"),
        link("Bulk Sms (Excel)", "bulk-sms-excel"),
      ],
    },
  ],
];

// Add other modules here the same way as you build them out —
// e.g. FINANCE_MENU, SALES_MENU, PURCHASE_MENU, INVENTORY_MENU...
