"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { authFetch } from "@/lib/authFetch";

type RelationKind =
  | "product"
  | "attribute"
  | "barcode"
  | "batch"
  | "image"
  | "serial"
  | "productUnit"
  | "variant"
  | "model"
  | "unit"
  | "unitConversion";

type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "checkbox" | "select";
  optionKey?: string;
  required?: boolean;
};

type RecordValue = Record<string, unknown>;
type Option = { id: number; label: string };

const productFields: Field[] = [
  { key: "code", label: "Code", required: true },
  { key: "name", label: "Name", required: true },
  { key: "shortName", label: "Short name" },
  { key: "category", label: "Category" },
  { key: "productGroupCode", label: "Group code" },
  { key: "productSubGroupCode", label: "Sub-group code" },
  { key: "valuationMethod", label: "Valuation method" },
  { key: "MRP", label: "MRP", type: "number" },
  { key: "buyRate", label: "Buy rate", type: "number" },
  { key: "salesRate", label: "Sales rate", type: "number" },
  { key: "isActive", label: "Active", type: "checkbox" },
];

const CONFIG: Record<RelationKind, { title: string; endpoint: string; fields: Field[] }> = {
  product: { title: "Product", endpoint: "/api/Product", fields: productFields },
  attribute: {
    title: "Product Attribute",
    endpoint: "/api/ProductAttribute",
    fields: [
      { key: "productId", label: "Product", type: "select", optionKey: "products", required: true },
      { key: "attributeName", label: "Attribute name", required: true },
      { key: "attributeValue", label: "Attribute value", required: true },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  barcode: {
    title: "Product Barcode",
    endpoint: "/api/ProductBarcode",
    fields: [
      { key: "productId", label: "Product", type: "select", optionKey: "products", required: true },
      { key: "productUnitId", label: "Product unit", type: "select", optionKey: "productUnits" },
      { key: "barcode", label: "Barcode", required: true },
      { key: "isPrimary", label: "Primary", type: "checkbox" },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  batch: {
    title: "Product Batch",
    endpoint: "/api/ProductBatch",
    fields: [
      { key: "productId", label: "Product", type: "select", optionKey: "products", required: true },
      { key: "productVariantId", label: "Variant", type: "select", optionKey: "variants" },
      { key: "batchNumber", label: "Batch number", required: true },
      { key: "manufacturingDate", label: "Manufacturing date", type: "date" },
      { key: "expiryDate", label: "Expiry date", type: "date" },
      { key: "openingQuantity", label: "Opening quantity", type: "number" },
      { key: "currentQuantity", label: "Current quantity", type: "number" },
      { key: "purchaseRate", label: "Purchase rate", type: "number" },
      { key: "salesRate", label: "Sales rate", type: "number" },
      { key: "MRP", label: "MRP", type: "number" },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  image: {
    title: "Product Image",
    endpoint: "/api/ProductImage",
    fields: [
      { key: "productId", label: "Product", type: "select", optionKey: "products", required: true },
      { key: "imageUrl", label: "Image URL", required: true },
      { key: "altText", label: "Alt text" },
      { key: "displayOrder", label: "Display order", type: "number" },
      { key: "isPrimary", label: "Primary", type: "checkbox" },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  serial: {
    title: "Product Serial",
    endpoint: "/api/ProductSerial",
    fields: [
      { key: "productId", label: "Product", type: "select", optionKey: "products", required: true },
      { key: "productVariantId", label: "Variant", type: "select", optionKey: "variants" },
      { key: "productBatchId", label: "Batch", type: "select", optionKey: "batches" },
      { key: "serialNumber", label: "Serial number", required: true },
      { key: "purchaseDate", label: "Purchase date", type: "date" },
      { key: "warrantyStartDate", label: "Warranty start", type: "date" },
      { key: "warrantyEndDate", label: "Warranty end", type: "date" },
      { key: "status", label: "Status" },
      { key: "remarks", label: "Remarks" },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  productUnit: {
    title: "Product Unit",
    endpoint: "/api/ProductUnit",
    fields: [
      { key: "productId", label: "Product", type: "select", optionKey: "products", required: true },
      { key: "unitId", label: "Unit", type: "select", optionKey: "units", required: true },
      { key: "conversionQuantity", label: "Conversion quantity", type: "number" },
      { key: "isBaseUnit", label: "Base unit", type: "checkbox" },
      { key: "isPurchaseUnit", label: "Purchase unit", type: "checkbox" },
      { key: "isSalesUnit", label: "Sales unit", type: "checkbox" },
      { key: "purchaseRate", label: "Purchase rate", type: "number" },
      { key: "salesRate", label: "Sales rate", type: "number" },
      { key: "MRP", label: "MRP", type: "number" },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  variant: {
    title: "Product Variant",
    endpoint: "/api/ProductVariant",
    fields: [
      { key: "productId", label: "Product", type: "select", optionKey: "products", required: true },
      { key: "variantCode", label: "Variant code", required: true },
      { key: "variantName", label: "Variant name", required: true },
      { key: "color", label: "Color" },
      { key: "size", label: "Size" },
      { key: "specification", label: "Specification" },
      { key: "purchaseRate", label: "Purchase rate", type: "number" },
      { key: "salesRate", label: "Sales rate", type: "number" },
      { key: "MRP", label: "MRP", type: "number" },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  model: {
    title: "Model",
    endpoint: "/api/Model",
    fields: [
      { key: "brandId", label: "Brand", type: "select", optionKey: "brands", required: true },
      { key: "code", label: "Code", required: true },
      { key: "name", label: "Name", required: true },
      { key: "description", label: "Description" },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  unit: {
    title: "Unit",
    endpoint: "/api/Unit",
    fields: [
      { key: "code", label: "Code", required: true },
      { key: "name", label: "Name", required: true },
      { key: "symbol", label: "Symbol" },
      { key: "description", label: "Description" },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  unitConversion: {
    title: "Unit Conversion",
    endpoint: "/api/UnitConversion",
    fields: [
      { key: "fromUnitId", label: "From unit", type: "select", optionKey: "units", required: true },
      { key: "toUnitId", label: "To unit", type: "select", optionKey: "units", required: true },
      { key: "conversionFactor", label: "Conversion factor", type: "number", required: true },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
};

const LOOKUPS: Record<string, string> = {
  products: "/api/Product",
  productUnits: "/api/ProductUnit",
  variants: "/api/ProductVariant",
  batches: "/api/ProductBatch",
  units: "/api/Unit",
  brands: "/api/Brand",
};

const GENERATED_FIELDS = new Set(["code", "variantCode", "barcode", "batchNumber", "serialNumber"]);

async function readData<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as RecordValue | T | null;
  if (!response.ok) {
    const message = body && typeof body === "object" && "message" in body ? body.message : null;
    throw new Error(typeof message === "string" ? message : "Request failed.");
  }
  return body && typeof body === "object" && "data" in body ? (body.data as T) : (body as T);
}

function labelFor(kind: string, row: RecordValue) {
  if (kind === "products") return `${row.code ?? ""} - ${row.name ?? ""}`;
  if (kind === "productUnits") return `Product unit #${row.id}`;
  if (kind === "variants") return `${row.variantCode ?? ""} - ${row.variantName ?? ""}`;
  if (kind === "batches") return String(row.batchNumber ?? row.id ?? "");
  return `${row.code ?? ""} - ${row.name ?? ""}`;
}

function emptyValue(field: Field): string | boolean {
  return field.type === "checkbox" ? true : "";
}

export default function ProductRelationCrud({ kind }: { kind: RelationKind }) {
  const config = CONFIG[kind];
  const [rows, setRows] = useState<RecordValue[]>([]);
  const [options, setOptions] = useState<Record<string, Option[]>>({});
  const [form, setForm] = useState<RecordValue>(() =>
    Object.fromEntries(config.fields.map((field) => [field.key, emptyValue(field)]))
  );
  const [editing, setEditing] = useState<RecordValue | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authFetch(config.endpoint);
      setRows((await readData<RecordValue[]>(response)) ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }, [config.endpoint]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRows(), 0);
    return () => window.clearTimeout(timer);
  }, [loadRows]);

  useEffect(() => {
    const keys = Array.from(new Set(config.fields.map((field) => field.optionKey).filter(Boolean))) as string[];
    if (keys.length === 0) return;

    let active = true;
    async function loadOptions() {
      const entries = await Promise.all(
        keys.map(async (key) => {
          try {
            const response = await authFetch(LOOKUPS[key]);
            const data = await readData<RecordValue[]>(response);
            return [key, (data ?? []).map((row) => ({ id: Number(row.id), label: labelFor(key, row) }))] as const;
          } catch {
            return [key, []] as const;
          }
        })
      );
      if (active) setOptions(Object.fromEntries(entries));
    }

    void loadOptions();
    return () => {
      active = false;
    };
  }, [config.fields]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query));
  }, [rows, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(Object.fromEntries(config.fields.map((field) => [field.key, emptyValue(field)])));
    setError("");
    setModalOpen(true);
  };

  const openEdit = (row: RecordValue) => {
    setEditing(row);
    setForm(Object.fromEntries(config.fields.map((field) => [field.key, row[field.key] ?? emptyValue(field)])));
    setError("");
    setModalOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    for (const field of config.fields) {
      if (GENERATED_FIELDS.has(field.key)) continue;
      if (field.required && (form[field.key] === "" || form[field.key] == null)) {
        setError(`${field.label} is required.`);
        return;
      }
    }

    const payload: RecordValue = {};
    for (const field of config.fields) {
      const value = form[field.key];
      payload[field.key] = field.type === "number" ? (value === "" ? null : Number(value)) : value;
      if (field.type === "select" && value === "") payload[field.key] = null;
    }

    setSaving(true);
    setError("");
    try {
      const endpoint = editing ? `${config.endpoint}/${editing.id}` : config.endpoint;
      const response = await authFetch(endpoint, { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) });
      await readData<unknown>(response);
      setModalOpen(false);
      await loadRows();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save record.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: RecordValue) => {
    if (!window.confirm(`Delete record #${row.id}?`)) return;
    try {
      const response = await authFetch(`${config.endpoint}/${row.id}`, { method: "DELETE" });
      await readData<unknown>(response);
      await loadRows();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete record.");
    }
  };

  const displayFields = config.fields.filter((field) => field.type !== "checkbox").slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-100 p-3 text-sm text-slate-700">
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-t-4 border-teal-500 bg-slate-50 px-4 py-3">
          <h1 className="font-semibold">{config.title}</h1>
          <button type="button" onClick={openAdd} className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700">
            <Plus size={15} /> Add
          </button>
        </div>
        <div className="flex items-center justify-between border-b border-slate-200 p-3">
          <span className="text-xs text-slate-500">{loading ? "Loading…" : `${filteredRows.length} record(s)`}</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="w-64 rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-teal-500" />
        </div>
        {error && <p className="bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">#</th>{displayFields.map((field) => <th key={field.key} className="px-4 py-3">{field.label}</th>)}<th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => <tr key={String(row.id)} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3">{String(row.id)}</td>{displayFields.map((field) => <td key={field.key} className="px-4 py-3">{String(row[field.key] ?? "-")}</td>)}<td className="px-4 py-3">{row.isActive === false ? "Inactive" : "Active"}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => openEdit(row)} className="mr-2 text-teal-700"><Pencil size={15} /></button><button type="button" onClick={() => void remove(row)} className="text-red-600"><Trash2 size={15} /></button></td></tr>)}
              {!loading && filteredRows.length === 0 && <tr><td colSpan={displayFields.length + 3} className="px-4 py-10 text-center text-slate-400">No records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"><form onSubmit={save} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-xl"><h2 className="mb-4 text-base font-semibold">{editing ? `Edit ${config.title}` : `Add ${config.title}`}</h2><div className="grid gap-3 sm:grid-cols-2">{config.fields.map((field) => <label key={field.key} className={`block text-xs font-medium text-slate-600 ${field.type === "checkbox" ? "flex items-center gap-2" : ""}`}>{field.type === "checkbox" ? <><input type="checkbox" checked={Boolean(form[field.key])} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.checked }))} />{field.label}</> : <>{field.label}{field.type === "select" ? <select value={String(form[field.key] ?? "")} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} className="mt-1 w-full rounded border border-slate-300 px-2 py-2 text-sm"><option value="">Select {field.label}</option>{(options[field.optionKey ?? ""] ?? []).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select> : <input type={field.type ?? "text"} value={String(form[field.key] ?? "")} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} readOnly={GENERATED_FIELDS.has(field.key)} placeholder={GENERATED_FIELDS.has(field.key) ? "Auto-generated" : undefined} className="mt-1 w-full rounded border border-slate-300 px-2 py-2 text-sm outline-none focus:border-teal-500 read-only:bg-slate-100" />}</>}</label>)}</div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded border border-slate-300 px-3 py-2">Cancel</button><button type="submit" disabled={saving} className="rounded bg-teal-700 px-4 py-2 text-white disabled:opacity-60">{saving ? "Saving…" : "Save"}</button></div></form></div>}
    </div>
  );
}
