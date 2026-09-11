"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import DataTable, { DataTableColumn } from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import { useToast } from "@/components/global/ToastProvider";
import { useConfirm } from "@/components/global/ConfirmProvider";
import {
  Boxes,
  CheckCircle2,
  XCircle,
  LayoutGrid,
} from "lucide-react";

type Product = Record<string, unknown> & { id: number; code: string; name: string };
type Lookup = { id: number; code: string; name: string; productGroupId?: number };
type FormValue = string | boolean;
type ProductForm = Record<string, FormValue>;

// ---------------------------------------------------------------------------
// Data contract — UNCHANGED from the original component. These match the
// .NET API's field names and payload shape exactly; don't rename these.
// ---------------------------------------------------------------------------

const numericFields = new Set([
  "MRP", "tradeRate", "buyRate", "salesRate", "dealerPrice", "discountRate", "margin",
  "vat", "exciseRate", "beforeVat", "maxStock", "reorderLevel", "reorderQty", "productPoint",
]);

const emptyForm = (code = ""): ProductForm => ({
  code,
  name: "",
  shortName: "",
  category: "",
  valuationMethod: "FIFO",
  productGroupCode: "",
  productSubGroupCode: "",
  MRP: "",
  tradeRate: "",
  buyRate: "",
  salesRate: "",
  dealerPrice: "",
  discountRate: "",
  margin: "",
  vat: "",
  exciseRate: "",
  beforeVat: "",
  maxStock: "",
  reorderLevel: "",
  reorderQty: "",
  currencyCode: "NPR",
  hasBatch: false,
  hasExpiryDate: false,
  hasManufacturingDate: false,
  isFavourite: false,
  isInsurableItem: false,
  isRestaurantProduct: false,
  productPoint: "",
  HSCode: "",
  purchaseGLCode: "",
  purchaseReturnGLCode: "",
  salesGLCode: "",
  salesReturnGLCode: "",
  isActive: true,
});

function readData<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) return (body as { data: T }).data;
  return body as T;
}

async function jsonRequest<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === "object" && "message" in body ? body.message : null;
    throw new Error(typeof message === "string" ? message : "Request failed.");
  }
  return readData<T>(body);
}

function nextProductCode(products: Product[]) {
  const next = products.reduce((highest, product) => {
    const match = product.code.match(/^PRD(\d+)$/);
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0) + 1;
  return `PRD${String(next).padStart(5, "0")}`;
}

function apiKeyFor(key: string) {
  if (key === "MRP") return "mrp";
  if (key === "HSCode") return "hsCode";
  return `${key.charAt(0).toLowerCase()}${key.slice(1)}`;
}

/** Maps a loaded Product record back into editable ProductForm shape — used by
 * both "Edit" and "Duplicate", so both stay in sync with the same logic. */
function mapProductToForm(product: Product): ProductForm {
  const next = emptyForm(String(product.code ?? ""));
  for (const key of Object.keys(next)) {
    next[key] =
      (product[apiKeyFor(key)] as FormValue) ??
      (product[key] as FormValue) ??
      next[key];
  }
  return next;
}

function buildPayload(form: ProductForm): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(form)) {
    payload[apiKeyFor(key)] = numericFields.has(key) ? (value === "" ? null : Number(value)) : value;
  }
  return payload;
}

// ---------------------------------------------------------------------------
// Validation — grouped by tab, so the tab bar can flag which section has
// the problem instead of leaving the user hunting through a long form.
// ---------------------------------------------------------------------------

const TABS = [
  { id: "basic", label: "Basic Information", fields: ["code", "name", "shortName", "category", "HSCode", "valuationMethod"] },
  { id: "classification", label: "Classification", fields: ["productGroupCode", "productSubGroupCode", "currencyCode", "productPoint"] },
  { id: "pricing", label: "Pricing & Tax", fields: ["buyRate", "salesRate", "MRP", "tradeRate", "dealerPrice", "discountRate", "margin", "vat", "exciseRate", "beforeVat"] },
  { id: "inventory", label: "Inventory Controls", fields: ["maxStock", "reorderLevel", "reorderQty", "isActive", "hasBatch", "hasExpiryDate", "hasManufacturingDate", "isFavourite", "isInsurableItem", "isRestaurantProduct"] },
  { id: "accounting", label: "Accounting References", fields: ["purchaseGLCode", "purchaseReturnGLCode", "salesGLCode", "salesReturnGLCode"] },
] as const;

type TabId = (typeof TABS)[number]["id"];

function validate(
  form: ProductForm,
  products: Product[],
  editingId: number | null
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!String(form.name).trim()) {
    errors.name = "Product name is required.";
  }

  for (const field of numericFields) {
    const value = form[field];
    if (value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
      errors[field] = "Must be a valid non-negative number.";
    }
  }

  if (Boolean(form.hasExpiryDate) && !Boolean(form.hasBatch)) {
    errors.hasExpiryDate = "Expiry tracking requires batch tracking — enable Has batch first.";
  }

  const duplicateCode = products.some(
    (p) => p.code === form.code && p.id !== editingId
  );
  if (duplicateCode) {
    errors.code = "This product code is already in use.";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 border-b border-slate-100 pb-2 text-sm font-semibold uppercase tracking-wide text-teal-800">{title}</h2>
      {children}
    </section>
  );
}

function TextField({
  label, value, onChange, readOnly = false, type = "text", required = false, min, error, hint,
}: {
  label: string; value: FormValue; onChange: (value: string) => void; readOnly?: boolean;
  type?: string; required?: boolean; min?: string; error?: string; hint?: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}
      <input
        type={type}
        value={String(value)}
        required={required}
        min={min}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 w-full rounded border px-3 py-2 text-sm text-slate-800 outline-none read-only:bg-slate-100 ${
          error ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-teal-500"
        }`}
      />
      {error && <span className="mt-1 block text-[11px] font-normal text-red-600">{error}</span>}
      {!error && hint}
    </label>
  );
}

function SelectField({
  label, value, options, onChange, error,
}: {
  label: string; value: FormValue; options: { value: string; label: string }[];
  onChange: (value: string) => void; error?: string;
}) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}
      <select
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 w-full rounded border bg-white px-3 py-2 text-sm text-slate-800 outline-none ${
          error ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-teal-500"
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <span className="mt-1 block text-[11px] font-normal text-red-600">{error}</span>}
    </label>
  );
}

function CheckField({ label, checked, onChange, error }: { label: string; checked: boolean; onChange: (checked: boolean) => void; error?: string }) {
  return (
    <div>
      <label className={`flex items-center gap-2 rounded border px-3 py-2 text-sm text-slate-700 ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-teal-600" />
        {label}
      </label>
      {error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}
    </div>
  );
}

/** Compact pill toggle used for the quick Active/Inactive switch in the table. */
function StatusToggle({ active, busy, onToggle }: { active: boolean; busy: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onToggle}
      title={active ? "Click to mark inactive" : "Click to mark active"}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {busy ? <Loader2 size={12} className="animate-spin" /> : active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {active ? "Active" : "Inactive"}
    </button>
  );
}

function formatCurrency(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `Rs ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------

export default function ProductEditor() {
  const toast = useToast();
  const confirm = useConfirm();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [groups, setGroups] = useState<Lookup[]>([]);
  const [subGroups, setSubGroups] = useState<Lookup[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const initialSnapshot = useRef<string>("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authFetch("/api/Product");
      setProducts((await jsonRequest<Product[]>(response)) ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProducts(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  useEffect(() => {
    let active = true;
    async function loadLookups() {
      try {
        const [categoryResponse, groupResponse, subGroupResponse] = await Promise.all([
          authFetch("/api/ProductCategory"),
          authFetch("/api/ProductGroup"),
          authFetch("/api/ProductSubGroup"),
        ]);
        const [categoryData, groupData, subGroupData] = await Promise.all([
          jsonRequest<Lookup[]>(categoryResponse),
          jsonRequest<Lookup[]>(groupResponse),
          jsonRequest<Lookup[]>(subGroupResponse),
        ]);
        if (active) {
          setCategories(categoryData ?? []);
          setGroups(groupData ?? []);
          setSubGroups(subGroupData ?? []);
        }
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Unable to load product lookups.");
      }
    }
    void loadLookups();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts while the editor is open: Esc to close (guarded), Ctrl/Cmd+S to save.
  useEffect(() => {
    if (!showEditor) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        void attemptClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEditor, form, editing]);

  // Warn on tab close / navigation away while there are unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (showEditor && isDirty()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEditor, form]);

  const isDirty = () => JSON.stringify(form) !== initialSnapshot.current;

  const attemptClose = async () => {
    if (isDirty()) {
      const ok = await confirm({
        title: "Discard unsaved changes?",
        description: "You have unsaved edits on this product. Closing now will lose them.",
        confirmLabel: "Discard",
        destructive: true,
      });
      if (!ok) return;
    }
    setShowEditor(false);
  };

  const selectedGroup = groups.find((group) => group.code === form.productGroupCode);
  const availableSubGroups = subGroups.filter((group) => group.productGroupId === selectedGroup?.id);

  const categoryLabel = (code: unknown) =>
    categories.find((c) => c.code === code)?.name ?? (code ? String(code) : "-");
  const groupLabel = (code: unknown) =>
    groups.find((g) => g.code === code)?.name ?? (code ? String(code) : "-");

  const setValue = (key: string, value: FormValue) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const openAdd = () => {
    const next = emptyForm(nextProductCode(products));
    setEditing(null);
    setForm(next);
    setFieldErrors({});
    setActiveTab("basic");
    initialSnapshot.current = JSON.stringify(next);
    setShowEditor(true);
  };

  const openEdit = (product: Product) => {
    const next = mapProductToForm(product);
    setEditing(product);
    setForm(next);
    setFieldErrors({});
    setActiveTab("basic");
    initialSnapshot.current = JSON.stringify(next);
    setShowEditor(true);
  };

  const openDuplicate = (product: Product) => {
    const next = mapProductToForm(product);
    next.code = nextProductCode(products);
    next.name = `${next.name} (Copy)`;
    setEditing(null); // duplicating always creates a new record
    setForm(next);
    setFieldErrors({});
    setActiveTab("basic");
    initialSnapshot.current = ""; // force dirty so an accidental close warns
    setShowEditor(true);
    toast.info({ title: "Duplicated", description: `Review and save "${next.name}" as a new product.` });
  };

  const save = async (options?: { andAddAnother?: boolean }) => {
    const errors = validate(form, products, editing?.id ?? null);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstTab = TABS.find((tab) => tab.fields.some((f) => errors[f]));
      if (firstTab) setActiveTab(firstTab.id);
      toast.error({ title: "Please fix the highlighted fields", description: "Some values need attention before this can be saved." });
      return;
    }

    setSaving(true);
    try {
      const endpoint = editing ? `/api/Product/${editing.id}` : "/api/Product";
      const response = await authFetch(endpoint, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(buildPayload(form)),
      });
      await jsonRequest<unknown>(response);

      toast.success({
        title: editing ? "Product updated" : "Product saved",
        description: String(form.name),
      });

      await loadProducts();

      if (options?.andAddAnother) {
        const next = emptyForm(nextProductCode([...products]));
        setEditing(null);
        setForm(next);
        setFieldErrors({});
        initialSnapshot.current = JSON.stringify(next);
      } else {
        setShowEditor(false);
      }
    } catch (error) {
      toast.error({ title: "Unable to save product", description: error instanceof Error ? error.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product: Product) => {
    const ok = await confirm({
      title: `Delete "${product.name}"?`,
      description: "This removes the product permanently. This action can't be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;

    try {
      const response = await authFetch(`/api/Product/${product.id}`, { method: "DELETE" });
      await jsonRequest<unknown>(response);
      toast.success({ title: "Deleted", description: `"${product.name}" was removed.` });
      setSelectedIds((s) => {
        const next = new Set(s);
        next.delete(product.id);
        return next;
      });
      await loadProducts();
    } catch (error) {
      toast.error({ title: "Unable to delete product", description: error instanceof Error ? error.message : undefined });
    }
  };

  const toggleActive = async (product: Product) => {
    setTogglingIds((s) => new Set(s).add(product.id));
    try {
      const nextForm = mapProductToForm(product);
      nextForm.isActive = !Boolean(product.isActive);
      const response = await authFetch(`/api/Product/${product.id}`, {
        method: "PUT",
        body: JSON.stringify(buildPayload(nextForm)),
      });
      await jsonRequest<unknown>(response);
      toast.success({ title: nextForm.isActive ? "Marked active" : "Marked inactive", description: String(product.name) });
      await loadProducts();
    } catch (error) {
      toast.error({ title: "Unable to update status", description: error instanceof Error ? error.message : undefined });
    } finally {
      setTogglingIds((s) => {
        const next = new Set(s);
        next.delete(product.id);
        return next;
      });
    }
  };

  const bulkSetActive = async (active: boolean) => {
    const targets = products.filter((p) => selectedIds.has(p.id));
    if (targets.length === 0) return;
    setBulkBusy(true);
    try {
      const results = await Promise.allSettled(
        targets.map((p) => {
          const nextForm = mapProductToForm(p);
          nextForm.isActive = active;
          return authFetch(`/api/Product/${p.id}`, { method: "PUT", body: JSON.stringify(buildPayload(nextForm)) }).then(jsonRequest);
        })
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) toast.error({ title: `${failed} of ${targets.length} failed to update` });
      else toast.success({ title: `${targets.length} product${targets.length > 1 ? "s" : ""} updated` });
      setSelectedIds(new Set());
      await loadProducts();
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkDelete = async () => {
    const targets = products.filter((p) => selectedIds.has(p.id));
    if (targets.length === 0) return;
    const ok = await confirm({
      title: `Delete ${targets.length} selected product${targets.length > 1 ? "s" : ""}?`,
      description: "This removes them permanently. This action can't be undone.",
      confirmLabel: "Delete all",
      destructive: true,
    });
    if (!ok) return;

    setBulkBusy(true);
    try {
      const results = await Promise.allSettled(
        targets.map((p) => authFetch(`/api/Product/${p.id}`, { method: "DELETE" }).then(jsonRequest))
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) toast.error({ title: `${failed} of ${targets.length} failed to delete` });
      else toast.success({ title: `${targets.length} product${targets.length > 1 ? "s" : ""} deleted` });
      setSelectedIds(new Set());
      await loadProducts();
    } finally {
      setBulkBusy(false);
    }
  };

  // --- Table columns -------------------------------------------------------

  const columns: DataTableColumn<Product>[] = useMemo(
    () => [
      {
        key: "__select",
        label: "",
        exportable: false,
        filterable: false,
        render: (row) => (
          <input
            type="checkbox"
            checked={selectedIds.has(row.id)}
            onChange={(e) =>
              setSelectedIds((s) => {
                const next = new Set(s);
                if (e.target.checked) next.add(row.id);
                else next.delete(row.id);
                return next;
              })
            }
          />
        ),
      },
      { key: "code", label: "Code", sortable: true },
      {
        key: "name",
        label: "Product",
        sortable: true,
        render: (row) => (
          <div>
            <div className="font-medium text-slate-800">{String(row.name)}</div>
            <div className="text-xs text-slate-400">{String(row.shortName ?? "") || "No short name"}</div>
          </div>
        ),
      },
      {
        key: "category",
        label: "Category",
        sortable: true,
        accessor: (row) => categoryLabel(row.category),
      },
      {
        key: "productGroupCode",
        label: "Group",
        sortable: true,
        accessor: (row) => groupLabel(row.productGroupCode),
      },
      {
        key: "salesRate",
        label: "Sales rate",
        sortable: true,
        align: "right",
        accessor: (row) => (row.salesRate == null ? "" : String(row.salesRate)),
        render: (row) => formatCurrency(row.salesRate),
      },
      {
        key: "isActive",
        label: "Status",
        sortable: true,
        accessor: (row) => (row.isActive === false ? "Inactive" : "Active"),
        render: (row) => (
          <StatusToggle
            active={row.isActive !== false}
            busy={togglingIds.has(row.id)}
            onToggle={() => toggleActive(row)}
          />
        ),
      },
      {
        key: "__actions",
        label: "",
        exportable: false,
        filterable: false,
        align: "right",
        render: (row) => (
          <div className="flex items-center justify-end gap-3">
            <button type="button" title="Duplicate" onClick={() => openDuplicate(row)} className="text-slate-400 hover:text-teal-700">
              <Copy size={15} />
            </button>
            <button type="button" title="Edit" onClick={() => openEdit(row)} className="text-teal-700 hover:text-teal-900">
              <Pencil size={15} />
            </button>
            <button type="button" title="Delete" onClick={() => void remove(row)} className="text-red-500 hover:text-red-700">
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIds, togglingIds, categories, groups]
  );

  // --- Stats strip -----------------------------------------------------------

  const totalCount = products.length;
  const activeCount = products.filter((p) => p.isActive !== false).length;
  const inactiveCount = totalCount - activeCount;
  const categoryCount = new Set(products.map((p) => p.category).filter(Boolean)).size;

  // --- Margin suggestion (pricing tab convenience, never auto-applied) ------

  const buyRateNum = Number(form.buyRate);
  const salesRateNum = Number(form.salesRate);
  const suggestedMarkup =
    Number.isFinite(buyRateNum) && buyRateNum > 0 && Number.isFinite(salesRateNum)
      ? (((salesRateNum - buyRateNum) / buyRateNum) * 100).toFixed(2)
      : null;
  const sellsBelowCost =
    Number.isFinite(buyRateNum) && buyRateNum > 0 && Number.isFinite(salesRateNum) && salesRateNum > 0 && salesRateNum < buyRateNum;

  return (
    <div className="min-h-screen bg-slate-100 p-3 text-slate-700">
      <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Inventory Master</p>
          <h1 className="text-xl font-semibold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Maintain product identity, classification, pricing and inventory controls.</p>
        </div>
        <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loadError && (
        <p className="mb-3 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={15} /> {loadError}
        </p>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Products" value={String(totalCount)} icon={Boxes} accent="blue" />
        <StatCard label="Active" value={String(activeCount)} icon={CheckCircle2} accent="green" />
        <StatCard label="Inactive" value={String(inactiveCount)} icon={XCircle} accent="rose" />
        <StatCard label="Categories in use" value={String(categoryCount)} icon={LayoutGrid} accent="amber" />
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm text-teal-800">
          <span>{selectedIds.size} selected</span>
          <div className="flex items-center gap-2">
            <button disabled={bulkBusy} onClick={() => void bulkSetActive(true)} className="rounded border border-teal-300 bg-white px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100 disabled:opacity-50">
              Mark Active
            </button>
            <button disabled={bulkBusy} onClick={() => void bulkSetActive(false)} className="rounded border border-teal-300 bg-white px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100 disabled:opacity-50">
              Mark Inactive
            </button>
            <button disabled={bulkBusy} onClick={() => void bulkDelete()} className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {bulkBusy ? "Working…" : "Delete selected"}
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-teal-700 underline">
              Clear
            </button>
          </div>
        </div>
      )}

      <DataTable
        title={`Product Register${loading ? " · Loading…" : ""}`}
        columns={columns}
        data={products}
        pageSize={20}
      />

      {showEditor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4">
          <div className="mx-auto max-w-6xl rounded-xl bg-slate-100 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Product Master</p>
                <h2 className="text-xl font-semibold text-slate-900">{editing ? "Edit Product" : "Add Product"}</h2>
              </div>
              <button type="button" onClick={() => void attemptClose()} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm">
                Close
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
              {TABS.map((tab) => {
                const hasError = tab.fields.some((f) => fieldErrors[f]);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative rounded-t px-3 py-2 text-xs font-medium ${
                      activeTab === tab.id
                        ? "border-b-2 border-teal-700 text-teal-800"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                    {hasError && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-middle" />}
                  </button>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              {activeTab === "basic" && (
                <Section title="Basic Information">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <TextField label="Product code" value={form.code} readOnly onChange={() => undefined} error={fieldErrors.code} />
                      <p className="mt-1 text-[11px] text-slate-400">Auto-generated for reliable stock and transaction references.</p>
                    </div>
                    <TextField label="Product name" value={form.name} required onChange={(value) => setValue("name", value)} error={fieldErrors.name} />
                    <TextField label="Short name" value={form.shortName} onChange={(value) => setValue("shortName", value)} />
                    <SelectField label="Category (optional)" value={form.category} options={categories.map((item) => ({ value: item.code, label: `${item.code} - ${item.name}` }))} onChange={(value) => setValue("category", value)} />
                    <TextField label="HS code" value={form.HSCode} onChange={(value) => setValue("HSCode", value)} />
                    <SelectField label="Valuation" value={form.valuationMethod} options={["FIFO", "LIFO", "Weighted Average"].map((value) => ({ value, label: value }))} onChange={(value) => setValue("valuationMethod", value)} />
                  </div>
                </Section>
              )}

              {activeTab === "classification" && (
                <Section title="Classification">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectField label="Product group" value={form.productGroupCode} options={groups.map((item) => ({ value: item.code, label: `${item.code} - ${item.name}` }))} onChange={(value) => { setValue("productGroupCode", value); setValue("productSubGroupCode", ""); }} />
                    <SelectField label="Product sub group" value={form.productSubGroupCode} options={availableSubGroups.map((item) => ({ value: item.code, label: `${item.code} - ${item.name}` }))} onChange={(value) => setValue("productSubGroupCode", value)} />
                    <TextField label="Currency" value={form.currencyCode} onChange={(value) => setValue("currencyCode", value)} />
                    <TextField label="Product point" type="number" value={form.productPoint} onChange={(value) => setValue("productPoint", value)} error={fieldErrors.productPoint} />
                  </div>
                </Section>
              )}

              {activeTab === "pricing" && (
                <Section title="Pricing & Tax">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField label="Buy rate" type="number" value={form.buyRate} onChange={(value) => setValue("buyRate", value)} error={fieldErrors.buyRate} />
                    <TextField
                      label="Sales rate"
                      type="number"
                      value={form.salesRate}
                      onChange={(value) => setValue("salesRate", value)}
                      error={fieldErrors.salesRate}
                      hint={
                        sellsBelowCost ? (
                          <span className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
                            <AlertTriangle size={11} /> This is below the buy rate — confirm this is intentional.
                          </span>
                        ) : undefined
                      }
                    />
                    <TextField label="MRP" type="number" value={form.MRP} onChange={(value) => setValue("MRP", value)} error={fieldErrors.MRP} />
                    <TextField label="Trade rate" type="number" value={form.tradeRate} onChange={(value) => setValue("tradeRate", value)} error={fieldErrors.tradeRate} />
                    <TextField label="Dealer price" type="number" value={form.dealerPrice} onChange={(value) => setValue("dealerPrice", value)} error={fieldErrors.dealerPrice} />
                    <TextField label="Discount rate" type="number" value={form.discountRate} onChange={(value) => setValue("discountRate", value)} error={fieldErrors.discountRate} />
                    <TextField
                      label="Margin"
                      type="number"
                      value={form.margin}
                      onChange={(value) => setValue("margin", value)}
                      error={fieldErrors.margin}
                      hint={
                        suggestedMarkup ? (
                          <button
                            type="button"
                            onClick={() => setValue("margin", suggestedMarkup)}
                            className="mt-1 flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:underline"
                          >
                            <Sparkles size={11} /> Suggested markup: {suggestedMarkup}% — use this
                          </button>
                        ) : undefined
                      }
                    />
                    <TextField label="VAT" type="number" value={form.vat} onChange={(value) => setValue("vat", value)} error={fieldErrors.vat} />
                    <TextField label="Excise rate" type="number" value={form.exciseRate} onChange={(value) => setValue("exciseRate", value)} error={fieldErrors.exciseRate} />
                    <TextField label="Before VAT" type="number" value={form.beforeVat} onChange={(value) => setValue("beforeVat", value)} error={fieldErrors.beforeVat} />
                  </div>
                </Section>
              )}

              {activeTab === "inventory" && (
                <Section title="Inventory Controls">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField label="Maximum stock" type="number" value={form.maxStock} onChange={(value) => setValue("maxStock", value)} error={fieldErrors.maxStock} />
                    <TextField label="Reorder level" type="number" value={form.reorderLevel} onChange={(value) => setValue("reorderLevel", value)} error={fieldErrors.reorderLevel} />
                    <TextField label="Reorder quantity" type="number" value={form.reorderQty} onChange={(value) => setValue("reorderQty", value)} error={fieldErrors.reorderQty} />
                    <div className="grid gap-2 sm:col-span-2 sm:grid-cols-3">
                      <CheckField label="Active" checked={Boolean(form.isActive)} onChange={(value) => setValue("isActive", value)} />
                      <CheckField label="Has batch" checked={Boolean(form.hasBatch)} onChange={(value) => setValue("hasBatch", value)} />
                      <CheckField label="Expiry date" checked={Boolean(form.hasExpiryDate)} onChange={(value) => setValue("hasExpiryDate", value)} error={fieldErrors.hasExpiryDate} />
                      <CheckField label="Manufacturing date" checked={Boolean(form.hasManufacturingDate)} onChange={(value) => setValue("hasManufacturingDate", value)} />
                      <CheckField label="Favourite" checked={Boolean(form.isFavourite)} onChange={(value) => setValue("isFavourite", value)} />
                      <CheckField label="Insurable item" checked={Boolean(form.isInsurableItem)} onChange={(value) => setValue("isInsurableItem", value)} />
                      <CheckField label="Active restaurant item" checked={Boolean(form.isRestaurantProduct)} onChange={(value) => setValue("isRestaurantProduct", value)} />
                    </div>
                  </div>
                </Section>
              )}

              {activeTab === "accounting" && (
                <Section title="Accounting References">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField label="Purchase GL" value={form.purchaseGLCode} onChange={(value) => setValue("purchaseGLCode", value)} />
                    <TextField label="Purchase return GL" value={form.purchaseReturnGLCode} onChange={(value) => setValue("purchaseReturnGLCode", value)} />
                    <TextField label="Sales GL" value={form.salesGLCode} onChange={(value) => setValue("salesGLCode", value)} />
                    <TextField label="Sales return GL" value={form.salesReturnGLCode} onChange={(value) => setValue("salesReturnGLCode", value)} />
                  </div>
                </Section>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => void attemptClose()} className="rounded border border-slate-300 bg-white px-4 py-2 text-sm">
                  Cancel
                </button>
                {!editing && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void save({ andAddAnother: true })}
                    className="rounded border border-teal-700 px-4 py-2 text-sm font-medium text-teal-700 disabled:opacity-60"
                  >
                    Save &amp; Add Another
                  </button>
                )}
                <button type="submit" disabled={saving} className="flex items-center gap-2 rounded bg-teal-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-60">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Saving…" : editing ? "Update Product" : "Save Product"}
                </button>
              </div>
              <p className="mt-2 text-right text-[11px] text-slate-400">Tip: Ctrl/Cmd+S to save, Esc to close</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}