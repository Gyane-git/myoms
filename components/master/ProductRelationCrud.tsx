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
  | "unitConversion"
  | "location"
  | "scheme"
  | "composition"
  | "valueAdded";

type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "checkbox" | "select";
  optionKey?: string;
  required?: boolean;
  defaultValue?: string | boolean;
  choices?: string[];
};

type RecordValue = Record<string, unknown>;
type Option = { id: number; label: string };
type RelationConfig = { title: string; description: string; endpoint: string; fields: Field[] };

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

const CONFIG: Record<RelationKind, RelationConfig> = {
  product: { title: "Product", description: "Create reusable product masters for stock, service, retail, wholesale and manufacturing workflows.", endpoint: "/api/Product", fields: productFields },
  attribute: {
    title: "Product Attribute",
    description: "Store flexible properties such as material, capacity, grade, warranty or technical specifications.",
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
    description: "Maintain alternate and primary barcodes for each product and selling unit.",
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
    description: "Track lot-wise quantities, rates, manufacturing dates and expiry dates.",
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
    description: "Maintain product photos and documents used by sales, purchase and product listings.",
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
    description: "Track individually identifiable items, warranty periods and availability status.",
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
    description: "Define purchase, sales and base units with conversion quantities and unit-wise rates.",
    endpoint: "/api/ProductUnit",
    fields: [
      { key: "productId", label: "Product", type: "select", optionKey: "products", required: true },
      { key: "unitId", label: "Unit", type: "select", optionKey: "units", required: true },
      { key: "conversionQuantity", label: "Conversion quantity", type: "number", defaultValue: "1" },
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
    description: "Create size, colour, specification or model variations under one product master.",
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
    description: "Maintain brand-wise models for products that need manufacturer or model tracking.",
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
    description: "Maintain the standard units used across inventory, purchasing, sales and production.",
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
    description: "Define reusable conversions such as 1 carton = 24 pieces or 1 kg = 1000 grams.",
    endpoint: "/api/UnitConversion",
    fields: [
      { key: "fromUnitId", label: "From unit", type: "select", optionKey: "units", required: true },
      { key: "toUnitId", label: "To unit", type: "select", optionKey: "units", required: true },
      { key: "conversionFactor", label: "Conversion factor", type: "number", required: true },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  location: {
    title: "Warehouse Location",
    description: "Maintain warehouse bins, racks and sub-locations for accurate stock placement.",
    endpoint: "/api/WarehouseLocation",
    fields: [
      { key: "warehouseId", label: "Warehouse", type: "select", optionKey: "warehouses", required: true },
      { key: "locCode", label: "Location code" },
      { key: "location", label: "Location" },
      { key: "subLocation", label: "Sub-location" },
      { key: "rack", label: "Rack" },
      { key: "col", label: "Column" },
      { key: "actualLocation", label: "Actual location" },
      { key: "sequence", label: "Sequence", type: "number" },
      { key: "memo", label: "Memo" },
    ],
  },
  scheme: {
    title: "Product Scheme",
    description: "Create date-bound product, group or sub-group discount and free-quantity schemes.",
    endpoint: "/api/ProductScheme",
    fields: [
      { key: "schemeCode", label: "Scheme code", required: true },
      { key: "schemeName", label: "Scheme name", required: true },
      { key: "schemeType", label: "Scheme type", type: "select", choices: ["Quantity", "Product", "Group"] },
      { key: "fromDate", label: "From date", type: "date", required: true },
      { key: "toDate", label: "To date", type: "date" },
      { key: "productId", label: "Product", type: "select", optionKey: "products", required: true },
      { key: "minimumQuantity", label: "Minimum quantity", type: "number", required: true, defaultValue: "1" },
      { key: "maximumQuantity", label: "Maximum quantity", type: "number" },
      { key: "discountPercent", label: "Discount %", type: "number", defaultValue: "0" },
      { key: "discountAmount", label: "Discount amount", type: "number", defaultValue: "0" },
      { key: "freeQuantity", label: "Free quantity", type: "number", defaultValue: "0" },
      { key: "description", label: "Description" },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  composition: {
    title: "Product Composition",
    description: "Define bill-of-materials recipes with a finished product and its component lines.",
    endpoint: "/api/ProductComposition",
    fields: [
      { key: "productId", label: "Finished product", type: "select", optionKey: "products", required: true },
      { key: "compositionName", label: "Composition name", required: true },
      { key: "description", label: "Description" },
      { key: "componentProductId", label: "Component product", type: "select", optionKey: "products" },
      { key: "componentName", label: "Component name", required: true },
      { key: "quantity", label: "Quantity", type: "number", required: true, defaultValue: "1" },
      { key: "unit", label: "Unit" },
      { key: "percentage", label: "Percentage", type: "number", defaultValue: "0" },
      { key: "lineDescription", label: "Line description" },
      { key: "lineNumber", label: "Line number", type: "number", defaultValue: "1" },
      { key: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  valueAdded: {
    title: "Value Added List",
    description: "Maintain packaging, labour, freight and other additional product value or cost components.",
    endpoint: "/api/ValueAddedList",
    fields: [
      { key: "code", label: "Code", required: true },
      { key: "name", label: "Value-added item", required: true },
      { key: "description", label: "Description" },
      { key: "defaultAmount", label: "Default amount", type: "number", defaultValue: "0" },
      { key: "amountType", label: "Amount type", type: "select", choices: ["Fixed", "Percentage"], defaultValue: "Fixed" },
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
  warehouses: "/api/Warehouse",
};

const GENERATED_FIELDS = new Set(["code", "schemeCode", "variantCode", "barcode", "batchNumber", "serialNumber"]);

const GENERATED_PREFIXES: Partial<Record<RelationKind, { field: string; prefix: string }>> = {
  product: { field: "code", prefix: "PRD" },
  model: { field: "code", prefix: "MOD" },
  unit: { field: "code", prefix: "UNT" },
  variant: { field: "variantCode", prefix: "VAR" },
  barcode: { field: "barcode", prefix: "BC" },
  batch: { field: "batchNumber", prefix: "BAT" },
  serial: { field: "serialNumber", prefix: "SER" },
  scheme: { field: "schemeCode", prefix: "SCH" },
  valueAdded: { field: "code", prefix: "VAD" },
};

function nextRelationCode(rows: RecordValue[], kind: RelationKind) {
  const setup = GENERATED_PREFIXES[kind];
  if (!setup) return "";

  const next = rows.reduce((highest, row) => {
    const value = String(row[setup.field] ?? "");
    const match = value.match(new RegExp(`^${setup.prefix}(\\d+)$`));
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0) + 1;

  return `${setup.prefix}${String(next).padStart(5, "0")}`;
}

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
  if (kind === "productUnits") return `Product #${row.productId ?? ""} / Unit #${row.unitId ?? ""}`;
  if (kind === "variants") return `${row.variantCode ?? ""} - ${row.variantName ?? ""}`;
  if (kind === "batches") return String(row.batchNumber ?? row.id ?? "");
  return `${row.code ?? ""} - ${row.name ?? ""}`;
}

function optionLabel(options: Record<string, Option[]>, field: Field, value: unknown) {
  if (field.type !== "select") return String(value ?? "-");
  if (field.choices) return String(value ?? "-");
  return options[field.optionKey ?? ""]?.find((option) => option.id === Number(value))?.label ?? String(value ?? "-");
}

function emptyValue(field: Field): string | boolean {
  if (field.defaultValue !== undefined) return field.defaultValue;
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
    const initialForm = Object.fromEntries(
      config.fields.map((field) => [field.key, emptyValue(field)])
    );
    const generated = GENERATED_PREFIXES[kind];
    if (generated) initialForm[generated.field] = nextRelationCode(rows, kind);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (row: RecordValue) => {
    setEditing(row);
    const line = Array.isArray(row.lines) ? (row.lines[0] as RecordValue | undefined) : undefined;
    const editForm = Object.fromEntries(config.fields.map((field) => [field.key, row[field.key] ?? emptyValue(field)]));
    if (kind === "scheme" && line) {
      editForm.productId = line.productId ?? "";
      editForm.minimumQuantity = line.minimumQuantity ?? "1";
      editForm.maximumQuantity = line.maximumQuantity ?? "";
      editForm.discountPercent = line.discountPercent ?? "0";
      editForm.discountAmount = line.discountAmount ?? "0";
      editForm.freeQuantity = line.freeQuantity ?? "0";
    }
    if (kind === "composition" && line) {
      editForm.componentProductId = line.componentProductId ?? "";
      editForm.componentName = line.componentName ?? "";
      editForm.quantity = line.quantity ?? "1";
      editForm.unit = line.unit ?? "";
      editForm.percentage = line.percentage ?? "0";
      editForm.lineDescription = line.description ?? "";
      editForm.lineNumber = line.lineNumber ?? "1";
    }
    setForm(editForm);
    setError("");
    setModalOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    for (const field of config.fields) {
      if (GENERATED_FIELDS.has(field.key)) continue;
      if (field.required && (form[field.key] === "" || form[field.key] == null || String(form[field.key]).trim() === "")) {
        setError(`${field.label} is required.`);
        return;
      }
      if (field.type === "number" && form[field.key] !== "" && form[field.key] != null && (!Number.isFinite(Number(form[field.key])) || Number(form[field.key]) < 0)) {
        setError(`${field.label} must be a valid non-negative number.`);
        return;
      }
    }

    if (kind === "productUnit" && Number(form.conversionQuantity || 0) <= 0) {
      setError("Conversion quantity must be greater than zero.");
      return;
    }

    if (kind === "unitConversion" && Number(form.conversionFactor || 0) <= 0) {
      setError("Conversion factor must be greater than zero.");
      return;
    }

    if (kind === "batch" && form.manufacturingDate && form.expiryDate && String(form.expiryDate) < String(form.manufacturingDate)) {
      setError("Expiry date cannot be earlier than manufacturing date.");
      return;
    }

    if (kind === "serial" && form.warrantyStartDate && form.warrantyEndDate && String(form.warrantyEndDate) < String(form.warrantyStartDate)) {
      setError("Warranty end date cannot be earlier than warranty start date.");
      return;
    }

    const payload: RecordValue = {};
    for (const field of config.fields) {
      const value = form[field.key];
      payload[field.key] = field.type === "number" ? (value === "" ? (field.defaultValue === undefined ? null : Number(field.defaultValue)) : Number(value)) : value;
      if (field.type === "select" && value === "") payload[field.key] = null;
    }

    if (kind === "scheme") {
      payload.lines = [{
        productId: Number(form.productId),
        minimumQuantity: Number(form.minimumQuantity),
        maximumQuantity: form.maximumQuantity === "" ? null : Number(form.maximumQuantity),
        discountPercent: Number(form.discountPercent || 0),
        discountAmount: Number(form.discountAmount || 0),
        freeQuantity: Number(form.freeQuantity || 0),
        description: null,
        lineNumber: 1,
      }];
      delete payload.productId;
      delete payload.minimumQuantity;
      delete payload.maximumQuantity;
      delete payload.discountPercent;
      delete payload.discountAmount;
      delete payload.freeQuantity;
    }

    if (kind === "composition") {
      payload.lines = [{
        componentProductId: form.componentProductId === "" ? null : Number(form.componentProductId),
        componentName: String(form.componentName ?? "").trim(),
        quantity: Number(form.quantity || 0),
        unit: form.unit === "" ? null : String(form.unit),
        percentage: Number(form.percentage || 0),
        description: form.lineDescription === "" ? null : String(form.lineDescription),
        lineNumber: Number(form.lineNumber || 1),
      }];
      delete payload.componentProductId;
      delete payload.componentName;
      delete payload.quantity;
      delete payload.unit;
      delete payload.percentage;
      delete payload.lineDescription;
      delete payload.lineNumber;
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
      <div className="mb-3 rounded border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-600">Master / Product</p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div><h1 className="text-xl font-semibold text-slate-900">{config.title}</h1><p className="mt-1 max-w-3xl text-sm text-slate-500">{config.description}</p></div>
          <button type="button" onClick={openAdd} className="flex items-center gap-1 rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 p-3">
          <span className="text-xs font-medium text-slate-500">{loading ? "Loading…" : `${filteredRows.length} record(s)`}</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}`} className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 sm:w-72" />
        </div>
        {error && <p className="bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">#</th>{displayFields.map((field) => <th key={field.key} className="px-4 py-3">{field.label}</th>)}<th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => <tr key={String(row.id)} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 text-slate-400">{String(row.id)}</td>{displayFields.map((field) => <td key={field.key} className="px-4 py-3">{optionLabel(options, field, row[field.key])}</td>)}<td className="px-4 py-3">{row.isActive === false ? <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">Inactive</span> : <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Active</span>}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => openEdit(row)} className="mr-3 text-teal-700" aria-label={`Edit ${config.title}`}><Pencil size={15} /></button><button type="button" onClick={() => void remove(row)} className="text-red-600" aria-label={`Delete ${config.title}`}><Trash2 size={15} /></button></td></tr>)}
              {!loading && filteredRows.length === 0 && <tr><td colSpan={displayFields.length + 3} className="px-4 py-10 text-center text-slate-400">No records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"><form onSubmit={save} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-xl"><h2 className="mb-4 text-base font-semibold">{editing ? `Edit ${config.title}` : `Add ${config.title}`}</h2><div className="grid gap-3 sm:grid-cols-2">{config.fields.map((field) => <label key={field.key} className={`block text-xs font-medium text-slate-600 ${field.type === "checkbox" ? "flex items-center gap-2" : ""}`}>{field.type === "checkbox" ? <><input type="checkbox" checked={Boolean(form[field.key])} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.checked }))} />{field.label}</> : <>{field.label}{field.type === "select" ? <select value={String(form[field.key] ?? "")} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} className="mt-1 w-full rounded border border-slate-300 px-2 py-2 text-sm"><option value="">Select {field.label}</option>{field.choices?.map((choice) => <option key={choice} value={choice}>{choice}</option>)}{(options[field.optionKey ?? ""] ?? []).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select> : <input type={field.type ?? "text"} value={String(form[field.key] ?? "")} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} readOnly={GENERATED_FIELDS.has(field.key)} placeholder={GENERATED_FIELDS.has(field.key) ? "Auto-generated" : undefined} className="mt-1 w-full rounded border border-slate-300 px-2 py-2 text-sm outline-none focus:border-teal-500 read-only:bg-slate-100" />}</>}</label>)}</div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded border border-slate-300 px-3 py-2">Cancel</button><button type="submit" disabled={saving} className="rounded bg-teal-700 px-4 py-2 text-white disabled:opacity-60">{saving ? "Saving…" : "Save"}</button></div></form></div>}
    </div>
  );
}
