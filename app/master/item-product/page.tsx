"use client";

/**
 * app/master/itemproduct/page.tsx
 *
 * Item / Product master page.
 * Mirrors the OMS "Product" screen: New / Edit / Delete / Download Template /
 * Import / Update / List / Branch Rate / Product List toolbar, three-panel
 * "General Information" (Info / Price Details / Utilities), and four
 * collapsible sections (Ledger Information, Other Information,
 * Unit Conversion, Scheme).
 *
 * Backend: ASP.NET Web API. Set NEXT_PUBLIC_API_BASE_URL in .env.local,
 * e.g. NEXT_PUBLIC_API_BASE_URL=https://localhost:5001/api
 *
 * No UI kit dependency on purpose — plain Tailwind so it's easy to restyle
 * later without fighting a component library. Swap fetch() calls for your
 * real endpoints; every call site is marked with a TODO/endpoint comment.
 */

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LookupOption {
  id: string;
  code: string;
  name: string;
}

interface UnitConversionRow {
  id: string;
  unit: string;
  altUnit: string;
  factor: number;
}

interface SchemeRow {
  id: string;
  name: string;
  type: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
}

interface ProductForm {
  id: string | null;
  // Info
  name: string;
  alias: string;
  group: LookupOption | null;
  subGroup: LookupOption | null;
  catagory: LookupOption | null; // free-text lookup field (as in source screen)
  group2: LookupOption | null;
  group3: LookupOption | null;
  group4: LookupOption | null;
  code: string;
  category: string; // dropdown: Inventory / Service / Asset ...
  menu: string;
  grading: string;
  hsCode: string;
  // Price Details
  costRate: string;
  marginPercent: string;
  mrp: string;
  rate: string;
  trade: string;
  mop: string;
  // Utilities
  type: string; // Finished Goods / Raw Material / ...
  method: string; // FIFO / LIFO / ...
  unit: string;
  altUnit: string;
  division: LookupOption | null;
  factorFrom: string;
  factorTo: string;
  batch: boolean;
  size: boolean;
  serial: boolean;
  lock: boolean;
  export: boolean;
  // Ledger Information
  salesLedger: LookupOption | null;
  purchaseLedger: LookupOption | null;
  salesReturnLedger: LookupOption | null;
  purchaseReturnLedger: LookupOption | null;
  directIncomeLedger: LookupOption | null;
  directExpenseLedger: LookupOption | null;
  vatLedger: LookupOption | null;
  // Other Information
  reorderLevel: string;
  reorderQty: string;
  minStock: string;
  maxStock: string;
  shelfLifeDays: string;
  warrantyMonths: string;
  remarks: string;
  // Unit Conversion / Scheme
  unitConversions: UnitConversionRow[];
  schemes: SchemeRow[];
}

type LookupField =
  | "group"
  | "subGroup"
  | "catagory"
  | "group2"
  | "group3"
  | "group4"
  | "division"
  | "salesLedger"
  | "purchaseLedger"
  | "salesReturnLedger"
  | "purchaseReturnLedger"
  | "directIncomeLedger"
  | "directExpenseLedger"
  | "vatLedger";

const emptyForm = (): ProductForm => ({
  id: null,
  name: "",
  alias: "",
  group: null,
  subGroup: null,
  catagory: null,
  group2: null,
  group3: null,
  group4: null,
  code: "",
  category: "Inventory",
  menu: "",
  grading: "",
  hsCode: "",
  costRate: "",
  marginPercent: "",
  mrp: "",
  rate: "",
  trade: "",
  mop: "",
  type: "Finished Goods",
  method: "FIFO",
  unit: "",
  altUnit: "",
  division: null,
  factorFrom: "",
  factorTo: "",
  batch: false,
  size: false,
  serial: false,
  lock: false,
  export: false,
  salesLedger: null,
  purchaseLedger: null,
  salesReturnLedger: null,
  purchaseReturnLedger: null,
  directIncomeLedger: null,
  directExpenseLedger: null,
  vatLedger: null,
  reorderLevel: "",
  reorderQty: "",
  minStock: "",
  maxStock: "",
  shelfLifeDays: "",
  warrantyMonths: "",
  remarks: "",
  unitConversions: [],
  schemes: [],
});

// ---------------------------------------------------------------------------
// Small helper primitives
// ---------------------------------------------------------------------------

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-2 py-1">
      <label className="text-[13px] text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div>{children}</div>
    </div>
  );
}

const inputCls =
  "w-full rounded border border-slate-300 bg-white px-2 py-1 text-[13px] text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

function LookupInput({
  value,
  placeholder,
  onOpen,
  onClear,
}: {
  value: LookupOption | null;
  placeholder?: string;
  onOpen: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-stretch gap-1">
      <input
        readOnly
        value={value ? `${value.code} - ${value.name}` : ""}
        placeholder={placeholder}
        onClick={onOpen}
        className={`${inputCls} cursor-pointer`}
      />
      {value && (
        <button
          type="button"
          title="Clear"
          onClick={onClear}
          className="rounded border border-slate-300 px-2 text-slate-500 hover:bg-slate-100"
        >
          ×
        </button>
      )}
      <button
        type="button"
        title="Search"
        onClick={onOpen}
        className="rounded border border-slate-300 px-2 text-slate-500 hover:bg-slate-100"
      >
        🔍
      </button>
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-[13px] text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-teal-600"
      />
      {label}
    </label>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded border border-sky-100 bg-sky-50/60 p-3">
      <h3 className="mb-2 border-b border-sky-200 pb-1 text-[13px] font-semibold text-fuchsia-700">{title}</h3>
      {children}
    </div>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-slate-100 px-4 py-2 text-left text-[14px] font-medium text-slate-700 hover:bg-slate-200"
      >
        {title}
        <span className="text-slate-400">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function ToolbarButton({
  label,
  icon,
  onClick,
  disabled,
  primary,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[13px] disabled:opacity-40 ${
        primary ? "text-teal-700 hover:bg-teal-50" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// API layer — replace paths with your real .NET Web API routes
// ---------------------------------------------------------------------------

async function apiGetLookup(field: LookupField, search: string): Promise<LookupOption[]> {
  // GET /api/lookups/{field}?search=xyz
  const res = await fetch(`${API_BASE}/lookups/${field}?search=${encodeURIComponent(search)}`);
  if (!res.ok) throw new Error("Lookup failed");
  return res.json();
}

async function apiGetNextCode(): Promise<string> {
  // GET /api/products/next-code
  const res = await fetch(`${API_BASE}/products/next-code`);
  if (!res.ok) throw new Error("Could not fetch next code");
  const data = await res.json();
  return data.code as string;
}

async function apiSaveProduct(form: ProductForm): Promise<{ id: string }> {
  // POST /api/products   or   PUT /api/products/{id}
  const res = await fetch(`${API_BASE}/products${form.id ? `/${form.id}` : ""}`, {
    method: form.id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error("Save failed");
  return res.json();
}

async function apiDeleteProduct(id: string): Promise<void> {
  // DELETE /api/products/{id}
  const res = await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

async function apiImportProducts(file: File): Promise<{ imported: number; errors: string[] }> {
  // POST /api/products/import (multipart/form-data)
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${API_BASE}/products/import`, { method: "POST", body });
  if (!res.ok) throw new Error("Import failed");
  return res.json();
}

function downloadTemplate() {
  // GET /api/products/template  — server streams the xlsx template
  window.open(`${API_BASE}/products/template`, "_blank");
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ItemProductPage() {
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [lookupField, setLookupField] = useState<LookupField | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function notify(type: "ok" | "error", text: string) {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4000);
  }

  // ---- toolbar actions ----------------------------------------------------

  async function handleNew() {
    setForm(emptyForm());
    try {
      const code = await apiGetNextCode();
      set("code", code);
    } catch {
      // non-fatal — user can still type a code manually
    }
  }

  function handleEdit() {
    if (!form.id) {
      notify("error", "Open a product from List first.");
      return;
    }
    // Form is already editable inline; nothing extra to toggle in this design.
    notify("ok", "Editing " + (form.name || form.code));
  }

  async function handleDelete() {
    if (!form.id) {
      notify("error", "Nothing to delete — open a product first.");
      return;
    }
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    try {
      await apiDeleteProduct(form.id);
      notify("ok", "Product deleted.");
      setForm(emptyForm());
    } catch {
      notify("error", "Delete failed.");
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const result = await apiImportProducts(file);
      notify("ok", `Imported ${result.imported} product(s).${result.errors.length ? ` ${result.errors.length} row(s) skipped.` : ""}`);
    } catch {
      notify("error", "Import failed.");
    }
  }

  function handleUpdate() {
    handleSave();
  }

  function handleList() {
    // TODO: route to /master/itemproduct/list
    window.location.href = "/master/itemproduct/list";
  }

  function handleBranchRate() {
    if (!form.id) {
      notify("error", "Open a product first to view branch rates.");
      return;
    }
    window.location.href = `/master/itemproduct/${form.id}/branch-rate`;
  }

  function handleProductList() {
    window.location.href = "/master/itemproduct/product-list";
  }

  async function handleSave() {
    if (!form.name.trim()) {
      notify("error", "Name is required.");
      return;
    }
    setSaving(true);
    try {
      const result = await apiSaveProduct(form);
      set("id", result.id);
      notify("ok", "Product saved.");
    } catch {
      notify("error", "Save failed — check the form and try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm(emptyForm());
  }

  // ---- lookup modal ---------------------------------------------------

  function openLookup(field: LookupField) {
    setLookupField(field);
  }

  function applyLookup(field: LookupField, option: LookupOption) {
    set(field, option);
    setLookupField(null);
  }

  // ---- unit conversion / scheme table rows -----------------------------

  function addUnitConversionRow() {
    set("unitConversions", [...form.unitConversions, { id: uid(), unit: "", altUnit: "", factor: 1 }]);
  }
  function updateUnitConversionRow(id: string, patch: Partial<UnitConversionRow>) {
    set(
      "unitConversions",
      form.unitConversions.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }
  function removeUnitConversionRow(id: string) {
    set("unitConversions", form.unitConversions.filter((r) => r.id !== id));
  }

  function addSchemeRow() {
    set("schemes", [
      ...form.schemes,
      { id: uid(), name: "", type: "Discount", discountPercent: 0, validFrom: "", validTo: "" },
    ]);
  }
  function updateSchemeRow(id: string, patch: Partial<SchemeRow>) {
    set("schemes", form.schemes.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function removeSchemeRow(id: string) {
    set("schemes", form.schemes.filter((r) => r.id !== id));
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-1.5">
        <ToolbarButton label="New" icon="＋" onClick={handleNew} primary />
        <ToolbarButton label="Edit" icon="✎" onClick={handleEdit} />
        <ToolbarButton label="Delete" icon="✕" onClick={handleDelete} />
        <ToolbarButton label="Download Template" icon="⬇" onClick={downloadTemplate} />
        <ToolbarButton label="Import" icon="⬆" onClick={handleImportClick} />
        <input ref={fileInputRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={handleImportFile} />
        <ToolbarButton label="Update" icon="⟳" onClick={handleUpdate} disabled={saving} />
        <ToolbarButton label="List" icon="≣" onClick={handleList} />
        <ToolbarButton label="Branch Rate" icon="⎘" onClick={handleBranchRate} />
        <ToolbarButton label="Product List" icon="⎘" onClick={handleProductList} />
        <span className="ml-auto text-[13px] font-semibold text-slate-500">PRODUCT</span>
      </div>

      {message && (
        <div
          className={`px-4 py-1.5 text-[13px] ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="px-4 py-3">
        <h2 className="mb-2 text-[15px] font-medium text-slate-700">General Information</h2>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Info */}
          <Panel title="Info">
            <Field label="Name" required>
              <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Alias">
              <TextInput value={form.alias} onChange={(e) => set("alias", e.target.value)} />
            </Field>
            <Field label="Group">
              <LookupInput value={form.group} onOpen={() => openLookup("group")} onClear={() => set("group", null)} />
            </Field>
            <Field label="Sub Group">
              <LookupInput
                value={form.subGroup}
                onOpen={() => openLookup("subGroup")}
                onClear={() => set("subGroup", null)}
              />
            </Field>
            <Field label="Catagory">
              <LookupInput
                value={form.catagory}
                onOpen={() => openLookup("catagory")}
                onClear={() => set("catagory", null)}
              />
            </Field>
            <Field label="Group 2">
              <LookupInput value={form.group2} onOpen={() => openLookup("group2")} onClear={() => set("group2", null)} />
            </Field>
            <Field label="Group 3">
              <LookupInput value={form.group3} onOpen={() => openLookup("group3")} onClear={() => set("group3", null)} />
            </Field>
            <Field label="Group 4">
              <LookupInput value={form.group4} onOpen={() => openLookup("group4")} onClear={() => set("group4", null)} />
            </Field>

            <div className="mt-1 grid grid-cols-2 gap-3">
              <Field label="Code">
                <TextInput value={form.code} onChange={(e) => set("code", e.target.value)} />
              </Field>
              <div className="grid grid-cols-[70px_1fr] items-center gap-2">
                <label className="text-[13px] text-slate-600">Category</label>
                <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
                  <option>Inventory</option>
                  <option>Service</option>
                  <option>Fixed Asset</option>
                  <option>Non-Inventory</option>
                </Select>
              </div>
            </div>

            <div className="mt-1 grid grid-cols-3 gap-3">
              <div>
                <label className="text-[13px] text-slate-600">Menu</label>
                <Select className="mt-1" value={form.menu} onChange={(e) => set("menu", e.target.value)}>
                  <option value="">—</option>
                  <option value="pos">POS</option>
                  <option value="sales">Sales</option>
                  <option value="hidden">Hidden</option>
                </Select>
              </div>
              <div>
                <label className="text-[13px] text-slate-600">Grading</label>
                <TextInput className="mt-1" value={form.grading} onChange={(e) => set("grading", e.target.value)} />
              </div>
              <div>
                <label className="text-[13px] text-slate-600">HSCode</label>
                <TextInput className="mt-1" value={form.hsCode} onChange={(e) => set("hsCode", e.target.value)} />
              </div>
            </div>
          </Panel>

          {/* Price Details */}
          <Panel title="Price Details">
            <Field label="Cost Rate">
              <TextInput inputMode="decimal" value={form.costRate} onChange={(e) => set("costRate", e.target.value)} />
            </Field>
            <Field label="Margin %">
              <TextInput inputMode="decimal" value={form.marginPercent} onChange={(e) => set("marginPercent", e.target.value)} />
            </Field>
            <Field label="MRP">
              <TextInput inputMode="decimal" value={form.mrp} onChange={(e) => set("mrp", e.target.value)} />
            </Field>
            <Field label="Rate">
              <TextInput inputMode="decimal" value={form.rate} onChange={(e) => set("rate", e.target.value)} />
            </Field>
            <Field label="Trade">
              <TextInput inputMode="decimal" value={form.trade} onChange={(e) => set("trade", e.target.value)} />
            </Field>
            <Field label="MOP">
              <TextInput value={form.mop} onChange={(e) => set("mop", e.target.value)} />
            </Field>
          </Panel>

          {/* Utilities */}
          <Panel title="Utilities">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option>Finished Goods</option>
                <option>Raw Material</option>
                <option>Semi Finished</option>
                <option>Service</option>
              </Select>
            </Field>
            <Field label="Method">
              <Select value={form.method} onChange={(e) => set("method", e.target.value)}>
                <option>FIFO</option>
                <option>LIFO</option>
                <option>Weighted Average</option>
                <option>Standard Cost</option>
              </Select>
            </Field>
            <Field label="Unit">
              <Select value={form.unit} onChange={(e) => set("unit", e.target.value)}>
                <option value="">—</option>
                <option value="pcs">Pcs</option>
                <option value="kg">Kg</option>
                <option value="ltr">Ltr</option>
                <option value="box">Box</option>
              </Select>
            </Field>
            <Field label="Alt Unit">
              <Select value={form.altUnit} onChange={(e) => set("altUnit", e.target.value)}>
                <option value="">—</option>
                <option value="pcs">Pcs</option>
                <option value="kg">Kg</option>
                <option value="ltr">Ltr</option>
                <option value="box">Box</option>
              </Select>
            </Field>
            <Field label="Division">
              <LookupInput
                value={form.division}
                onOpen={() => openLookup("division")}
                onClear={() => set("division", null)}
              />
            </Field>
            <Field label="Factor">
              <div className="flex gap-2">
                <TextInput
                  placeholder="From"
                  value={form.factorFrom}
                  onChange={(e) => set("factorFrom", e.target.value)}
                />
                <TextInput placeholder="To" value={form.factorTo} onChange={(e) => set("factorTo", e.target.value)} />
              </div>
            </Field>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
              <Checkbox label="Batch" checked={form.batch} onChange={(v) => set("batch", v)} />
              <Checkbox label="Size" checked={form.size} onChange={(v) => set("size", v)} />
              <Checkbox label="Serial" checked={form.serial} onChange={(v) => set("serial", v)} />
              <Checkbox label="Lock" checked={form.lock} onChange={(v) => set("lock", v)} />
              <Checkbox label="Export" checked={form.export} onChange={(v) => set("export", v)} />
            </div>
          </Panel>
        </div>
      </div>

      {/* Ledger Information */}
      <CollapsibleSection title="Ledger Information">
        <div className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
          <Field label="Sales Ledger">
            <LookupInput
              value={form.salesLedger}
              onOpen={() => openLookup("salesLedger")}
              onClear={() => set("salesLedger", null)}
            />
          </Field>
          <Field label="Purchase Ledger">
            <LookupInput
              value={form.purchaseLedger}
              onOpen={() => openLookup("purchaseLedger")}
              onClear={() => set("purchaseLedger", null)}
            />
          </Field>
          <Field label="Sales Return">
            <LookupInput
              value={form.salesReturnLedger}
              onOpen={() => openLookup("salesReturnLedger")}
              onClear={() => set("salesReturnLedger", null)}
            />
          </Field>
          <Field label="Purchase Return">
            <LookupInput
              value={form.purchaseReturnLedger}
              onOpen={() => openLookup("purchaseReturnLedger")}
              onClear={() => set("purchaseReturnLedger", null)}
            />
          </Field>
          <Field label="Direct Income">
            <LookupInput
              value={form.directIncomeLedger}
              onOpen={() => openLookup("directIncomeLedger")}
              onClear={() => set("directIncomeLedger", null)}
            />
          </Field>
          <Field label="Direct Expense">
            <LookupInput
              value={form.directExpenseLedger}
              onOpen={() => openLookup("directExpenseLedger")}
              onClear={() => set("directExpenseLedger", null)}
            />
          </Field>
          <Field label="VAT Ledger">
            <LookupInput
              value={form.vatLedger}
              onOpen={() => openLookup("vatLedger")}
              onClear={() => set("vatLedger", null)}
            />
          </Field>
        </div>
      </CollapsibleSection>

      {/* Other Information */}
      <CollapsibleSection title="Other Information">
        <div className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
          <Field label="Reorder Level">
            <TextInput inputMode="decimal" value={form.reorderLevel} onChange={(e) => set("reorderLevel", e.target.value)} />
          </Field>
          <Field label="Reorder Qty">
            <TextInput inputMode="decimal" value={form.reorderQty} onChange={(e) => set("reorderQty", e.target.value)} />
          </Field>
          <Field label="Min Stock">
            <TextInput inputMode="decimal" value={form.minStock} onChange={(e) => set("minStock", e.target.value)} />
          </Field>
          <Field label="Max Stock">
            <TextInput inputMode="decimal" value={form.maxStock} onChange={(e) => set("maxStock", e.target.value)} />
          </Field>
          <Field label="Shelf Life (days)">
            <TextInput inputMode="numeric" value={form.shelfLifeDays} onChange={(e) => set("shelfLifeDays", e.target.value)} />
          </Field>
          <Field label="Warranty (mo)">
            <TextInput inputMode="numeric" value={form.warrantyMonths} onChange={(e) => set("warrantyMonths", e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <label className="text-[13px] text-slate-600">Remarks</label>
            <textarea
              className={`${inputCls} mt-1`}
              rows={3}
              value={form.remarks}
              onChange={(e) => set("remarks", e.target.value)}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Unit Conversion */}
      <CollapsibleSection title="Unit Conversion">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-1 font-medium">Unit</th>
              <th className="py-1 font-medium">Alt Unit</th>
              <th className="py-1 font-medium">Factor</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {form.unitConversions.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-1 pr-2">
                  <TextInput value={row.unit} onChange={(e) => updateUnitConversionRow(row.id, { unit: e.target.value })} />
                </td>
                <td className="py-1 pr-2">
                  <TextInput
                    value={row.altUnit}
                    onChange={(e) => updateUnitConversionRow(row.id, { altUnit: e.target.value })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <TextInput
                    inputMode="decimal"
                    value={row.factor}
                    onChange={(e) => updateUnitConversionRow(row.id, { factor: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="py-1 text-center">
                  <button type="button" onClick={() => removeUnitConversionRow(row.id)} className="text-red-500">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addUnitConversionRow} className="mt-2 text-[13px] text-teal-700 hover:underline">
          + Add row
        </button>
      </CollapsibleSection>

      {/* Scheme */}
      <CollapsibleSection title="Scheme">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-1 font-medium">Scheme Name</th>
              <th className="py-1 font-medium">Type</th>
              <th className="py-1 font-medium">Discount %</th>
              <th className="py-1 font-medium">Valid From</th>
              <th className="py-1 font-medium">Valid To</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {form.schemes.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-1 pr-2">
                  <TextInput value={row.name} onChange={(e) => updateSchemeRow(row.id, { name: e.target.value })} />
                </td>
                <td className="py-1 pr-2">
                  <Select value={row.type} onChange={(e) => updateSchemeRow(row.id, { type: e.target.value })}>
                    <option>Discount</option>
                    <option>Buy X Get Y</option>
                    <option>Bundle</option>
                  </Select>
                </td>
                <td className="py-1 pr-2">
                  <TextInput
                    inputMode="decimal"
                    value={row.discountPercent}
                    onChange={(e) => updateSchemeRow(row.id, { discountPercent: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <TextInput
                    type="date"
                    value={row.validFrom}
                    onChange={(e) => updateSchemeRow(row.id, { validFrom: e.target.value })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <TextInput
                    type="date"
                    value={row.validTo}
                    onChange={(e) => updateSchemeRow(row.id, { validTo: e.target.value })}
                  />
                </td>
                <td className="py-1 text-center">
                  <button type="button" onClick={() => removeSchemeRow(row.id)} className="text-red-500">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addSchemeRow} className="mt-2 text-[13px] text-teal-700 hover:underline">
          + Add row
        </button>
      </CollapsibleSection>

      {/* Save / Cancel */}
      <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-teal-600 px-4 py-1.5 text-[13px] font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded border border-slate-300 px-4 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>

      {lookupField && (
        <LookupModal field={lookupField} onClose={() => setLookupField(null)} onSelect={applyLookup} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic lookup modal — reused for every search-icon field on the page
// ---------------------------------------------------------------------------

const lookupTitles: Record<LookupField, string> = {
  group: "Select Group",
  subGroup: "Select Sub Group",
  catagory: "Select Catagory",
  group2: "Select Group 2",
  group3: "Select Group 3",
  group4: "Select Group 4",
  division: "Select Division",
  salesLedger: "Select Sales Ledger",
  purchaseLedger: "Select Purchase Ledger",
  salesReturnLedger: "Select Sales Return Ledger",
  purchaseReturnLedger: "Select Purchase Return Ledger",
  directIncomeLedger: "Select Direct Income Ledger",
  directExpenseLedger: "Select Direct Expense Ledger",
  vatLedger: "Select VAT Ledger",
};

function LookupModal({
  field,
  onClose,
  onSelect,
}: {
  field: LookupField;
  onClose: () => void;
  onSelect: (field: LookupField, option: LookupOption) => void;
}) {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<LookupOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGetLookup(field, search)
      .then((res) => {
        if (!cancelled) setOptions(res);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [field, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[420px] max-w-[92vw] rounded bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <h3 className="text-[14px] font-medium text-slate-700">{lookupTitles[field]}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        <div className="p-3">
          <TextInput
            autoFocus
            placeholder="Type to search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-2 max-h-64 overflow-y-auto">
            {loading && <div className="py-4 text-center text-[13px] text-slate-400">Loading…</div>}
            {!loading && options.length === 0 && (
              <div className="py-4 text-center text-[13px] text-slate-400">No results.</div>
            )}
            {!loading &&
              options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSelect(field, opt)}
                  className="flex w-full items-center justify-between border-b border-slate-100 px-2 py-1.5 text-left text-[13px] hover:bg-slate-50"
                >
                  <span className="text-slate-700">{opt.name}</span>
                  <span className="text-slate-400">{opt.code}</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}