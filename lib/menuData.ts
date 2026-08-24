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
      links: [
        link("Item Product", "item-product"),
        link("Group", "group"),
        link("Group 1", "group-1"),
        link("Group 2", "group-2"),
        link("Sub Group", "sub-group"),
        link("Unit", "unit"),
        link("Brand", "brand"),
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
      links: [
        link("Purchase Term", "purchase-term"),
        link("Sales Term", "sales-term"),
      ],
    },
    {
      heading: "Area/Agent",
      links: [
        link("Main Area", "main-area"),
        link("Region", "region"),
      ],
    },
    {
      heading: "Division",
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
      links: [
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