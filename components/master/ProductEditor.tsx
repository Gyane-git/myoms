"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { authFetch } from "@/lib/authFetch";

type Product = Record<string, unknown> & { id: number; code: string; name: string };
type Lookup = { id: number; code: string; name: string; productGroupId?: number };
type FormValue = string | boolean;
type ProductForm = Record<string, FormValue>;

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 border-b border-slate-100 pb-2 text-sm font-semibold uppercase tracking-wide text-teal-800">{title}</h2>
      {children}
    </section>
  );
}

function TextField({ label, value, onChange, readOnly = false, type = "text", required = false, min }: { label: string; value: FormValue; onChange: (value: string) => void; readOnly?: boolean; type?: string; required?: boolean; min?: string }) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}
      <input type={type} value={String(value)} required={required} min={min} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 read-only:bg-slate-100" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: FormValue; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}
      <select value={String(value)} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500">
        <option value="">Select {label}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-teal-600" />{label}</label>;
}

export default function ProductEditor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [groups, setGroups] = useState<Lookup[]>([]);
  const [subGroups, setSubGroups] = useState<Lookup[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authFetch("/api/Product");
      setProducts((await jsonRequest<Product[]>(response)) ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load products.");
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
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load product lookups.");
      }
    }
    void loadLookups();
    return () => { active = false; };
  }, []);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => `${product.code} ${product.name} ${product.shortName}`.toLowerCase().includes(query));
  }, [products, search]);

  const selectedGroup = groups.find((group) => group.code === form.productGroupCode);
  const availableSubGroups = subGroups.filter((group) => group.productGroupId === selectedGroup?.id);

  const setValue = (key: string, value: FormValue) => setForm((current) => ({ ...current, [key]: value }));

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm(nextProductCode(products)));
    setError("");
    setShowEditor(true);
  };

  const openEdit = (product: Product) => {
    const next = emptyForm(String(product.code ?? ""));
    for (const key of Object.keys(next)) next[key] = (product[apiKeyFor(key)] as FormValue) ?? (product[key] as FormValue) ?? next[key];
    setEditing(product);
    setForm(next);
    setError("");
    setShowEditor(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!String(form.name).trim()) {
      setError("Product name is required.");
      return;
    }
    for (const field of numericFields) {
      const value = form[field];
      if (value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
        setError(`${field} must be a valid non-negative number.`);
        return;
      }
    }
    if (Boolean(form.hasExpiryDate) && !Boolean(form.hasBatch)) {
      setError("Expiry tracking requires batch tracking. Enable Has batch first.");
      return;
    }
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(form)) {
      payload[apiKeyFor(key)] = numericFields.has(key) ? (value === "" ? null : Number(value)) : value;
    }

    setSaving(true);
    setError("");
    try {
      const endpoint = editing ? `/api/Product/${editing.id}` : "/api/Product";
      const response = await authFetch(endpoint, { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) });
      await jsonRequest<unknown>(response);
      setShowEditor(false);
      await loadProducts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      const response = await authFetch(`/api/Product/${product.id}`, { method: "DELETE" });
      await jsonRequest<unknown>(response);
      await loadProducts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete product.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-3 text-slate-700">
      <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Inventory Master</p><h1 className="text-xl font-semibold text-slate-900">Products</h1><p className="mt-1 text-sm text-slate-500">Maintain product identity, classification, pricing and inventory controls.</p></div>
        <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"><Plus size={16} /> Add Product</button>
      </div>

      {error && <p className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><span className="text-sm font-medium">Product Register {loading ? "· Loading…" : `· ${visibleProducts.length} records`}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search code or product name" className="w-72 rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500" /></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] border-collapse text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Group</th><th className="px-4 py-3 text-right">Sales rate</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody>{visibleProducts.map((product) => <tr key={product.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-medium text-teal-800">{String(product.code)}</td><td className="px-4 py-3"><div className="font-medium text-slate-800">{String(product.name)}</div><div className="text-xs text-slate-400">{String(product.shortName ?? "") || "No short name"}</div></td><td className="px-4 py-3">{String(product.category ?? "-")}</td><td className="px-4 py-3">{String(product.productGroupCode ?? "-")}</td><td className="px-4 py-3 text-right">{product.salesRate == null ? "-" : String(product.salesRate)}</td><td className="px-4 py-3">{product.isActive === false ? "Inactive" : "Active"}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => openEdit(product)} className="mr-3 text-teal-700"><Pencil size={15} /></button><button type="button" onClick={() => void remove(product)} className="text-red-600"><Trash2 size={15} /></button></td></tr>)}{!loading && visibleProducts.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No products found.</td></tr>}</tbody></table></div>
      </div>

      {showEditor && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4"><form onSubmit={save} className="mx-auto max-w-6xl rounded-xl bg-slate-100 p-5 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Product Master</p><h2 className="text-xl font-semibold text-slate-900">{editing ? "Edit Product" : "Add Product"}</h2></div><button type="button" onClick={() => setShowEditor(false)} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm">Close</button></div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Basic Information"><div className="grid gap-3 sm:grid-cols-2"><div><TextField label="Product code" value={form.code} readOnly onChange={() => undefined} /><p className="mt-1 text-[11px] text-slate-400">Auto-generated for reliable stock and transaction references.</p></div><TextField label="Product name" value={form.name} required onChange={(value) => setValue("name", value)} /><TextField label="Short name" value={form.shortName} onChange={(value) => setValue("shortName", value)} /><SelectField label="Category (optional)" value={form.category} options={categories.map((item) => ({ value: item.code, label: `${item.code} - ${item.name}` }))} onChange={(value) => setValue("category", value)} /><TextField label="HS code" value={form.HSCode} onChange={(value) => setValue("HSCode", value)} /><SelectField label="Valuation" value={form.valuationMethod} options={["FIFO", "LIFO", "Weighted Average"].map((value) => ({ value, label: value }))} onChange={(value) => setValue("valuationMethod", value)} /></div></Section>
          <Section title="Classification"><div className="grid gap-3 sm:grid-cols-2"><SelectField label="Product group" value={form.productGroupCode} options={groups.map((item) => ({ value: item.code, label: `${item.code} - ${item.name}` }))} onChange={(value) => { setValue("productGroupCode", value); setValue("productSubGroupCode", ""); }} /><SelectField label="Product sub group" value={form.productSubGroupCode} options={availableSubGroups.map((item) => ({ value: item.code, label: `${item.code} - ${item.name}` }))} onChange={(value) => setValue("productSubGroupCode", value)} /><TextField label="Currency" value={form.currencyCode} onChange={(value) => setValue("currencyCode", value)} /><TextField label="Product point" type="number" value={form.productPoint} onChange={(value) => setValue("productPoint", value)} /></div></Section>
          <Section title="Pricing & Tax"><div className="grid gap-3 sm:grid-cols-2"><TextField label="Buy rate" type="number" value={form.buyRate} onChange={(value) => setValue("buyRate", value)} /><TextField label="Sales rate" type="number" value={form.salesRate} onChange={(value) => setValue("salesRate", value)} /><TextField label="MRP" type="number" value={form.MRP} onChange={(value) => setValue("MRP", value)} /><TextField label="Trade rate" type="number" value={form.tradeRate} onChange={(value) => setValue("tradeRate", value)} /><TextField label="Dealer price" type="number" value={form.dealerPrice} onChange={(value) => setValue("dealerPrice", value)} /><TextField label="Discount rate" type="number" value={form.discountRate} onChange={(value) => setValue("discountRate", value)} /><TextField label="Margin" type="number" value={form.margin} onChange={(value) => setValue("margin", value)} /><TextField label="VAT" type="number" value={form.vat} onChange={(value) => setValue("vat", value)} /><TextField label="Excise rate" type="number" value={form.exciseRate} onChange={(value) => setValue("exciseRate", value)} /><TextField label="Before VAT" type="number" value={form.beforeVat} onChange={(value) => setValue("beforeVat", value)} /></div></Section>
          <Section title="Inventory Controls"><div className="grid gap-3 sm:grid-cols-2"><TextField label="Maximum stock" type="number" value={form.maxStock} onChange={(value) => setValue("maxStock", value)} /><TextField label="Reorder level" type="number" value={form.reorderLevel} onChange={(value) => setValue("reorderLevel", value)} /><TextField label="Reorder quantity" type="number" value={form.reorderQty} onChange={(value) => setValue("reorderQty", value)} /><div className="grid gap-2 sm:col-span-2 sm:grid-cols-3"><CheckField label="Active" checked={Boolean(form.isActive)} onChange={(value) => setValue("isActive", value)} /><CheckField label="Has batch" checked={Boolean(form.hasBatch)} onChange={(value) => setValue("hasBatch", value)} /><CheckField label="Expiry date" checked={Boolean(form.hasExpiryDate)} onChange={(value) => setValue("hasExpiryDate", value)} /><CheckField label="Manufacturing date" checked={Boolean(form.hasManufacturingDate)} onChange={(value) => setValue("hasManufacturingDate", value)} /><CheckField label="Favourite" checked={Boolean(form.isFavourite)} onChange={(value) => setValue("isFavourite", value)} /><CheckField label="Insurable item" checked={Boolean(form.isInsurableItem)} onChange={(value) => setValue("isInsurableItem", value)} /><CheckField label="Active restaurant item" checked={Boolean(form.isRestaurantProduct)} onChange={(value) => setValue("isRestaurantProduct", value)} /></div></div></Section>
          <Section title="Accounting References"><div className="grid gap-3 sm:grid-cols-2"><TextField label="Purchase GL" value={form.purchaseGLCode} onChange={(value) => setValue("purchaseGLCode", value)} /><TextField label="Purchase return GL" value={form.purchaseReturnGLCode} onChange={(value) => setValue("purchaseReturnGLCode", value)} /><TextField label="Sales GL" value={form.salesGLCode} onChange={(value) => setValue("salesGLCode", value)} /><TextField label="Sales return GL" value={form.salesReturnGLCode} onChange={(value) => setValue("salesReturnGLCode", value)} /></div></Section>
        </div>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setShowEditor(false)} className="rounded border border-slate-300 bg-white px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={saving} className="rounded bg-teal-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-60">{saving ? "Saving…" : editing ? "Update Product" : "Save Product"}</button></div>
      </form></div>}
    </div>
  );
}
