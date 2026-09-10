"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil, CheckCircle2 } from "lucide-react";
import { authFetch } from "@/lib/authFetch";

type Item = { id: number; code?: string; name?: string; productId?: number };
type OpeningRow = { id: number; productId: string; quantity: string; unitCost: string; description: string };
type Opening = { id: number; openingNumber: string; openingDate: string; totalQuantity: number; totalValue: number; status: string; isPosted: boolean; lines?: { productId: number; quantity: number; unitCost: number; description?: string }[] };

const newRow = (id: number): OpeningRow => ({ id, productId: "", quantity: "", unitCost: "", description: "" });

function nextOpeningNumber(openings: Opening[]) {
  const next = openings.reduce((highest, opening) => {
    const match = opening.openingNumber.match(/^OP(?:N|-)(\d+)$/i);
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0) + 1;
  return `OPN${String(next).padStart(5, "0")}`;
}

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) return (body as { data: T }).data;
  return body as T;
}

async function request<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === "object" && "message" in body ? body.message : null;
    throw new Error(typeof message === "string" ? message : "Request failed.");
  }
  return unwrap<T>(body);
}

function dateValue(value: string) {
  return value ? value.slice(0, 10) : "";
}

export default function ProductOpeningEditor({ existingOnly = false }: { existingOnly?: boolean }) {
  const [products, setProducts] = useState<Item[]>([]);
  const [years, setYears] = useState<Item[]>([]);
  const [periods, setPeriods] = useState<(Item & { fiscalYearId?: number; startDate?: string; endDate?: string })[]>([]);
  const [warehouses, setWarehouses] = useState<Item[]>([]);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [yearId, setYearId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [openingNumber, setOpeningNumber] = useState("OPN00001");
  const [openingDate, setOpeningDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNumber, setReferenceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState<OpeningRow[]>([newRow(1)]);
  const [editing, setEditing] = useState<Opening | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [productResponse, yearResponse, warehouseResponse, openingResponse] = await Promise.all([
        authFetch("/api/Product"),
        authFetch("/api/FiscalYear"),
        authFetch("/api/Warehouse"),
        authFetch("/api/StockOpening"),
      ]);
      const [productData, yearData, warehouseData, openingData] = await Promise.all([
        request<Item[]>(productResponse),
        request<Item[]>(yearResponse),
        request<Item[]>(warehouseResponse),
        request<Opening[]>(openingResponse),
      ]);
      setProducts(productData ?? []);
      setYears(yearData ?? []);
      setWarehouses(warehouseData ?? []);
      setOpenings(openingData ?? []);
      setOpeningNumber((current) => current || nextOpeningNumber(openingData ?? []));
      if (!yearId && yearData?.[0]) setYearId(String(yearData[0].id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load stock opening data.");
    } finally {
      setLoading(false);
    }
  }, [yearId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!yearId) return;
    let active = true;
    void authFetch(`/api/FiscalYearPeriod/fiscal-year/${yearId}`)
      .then(request<(Item & { fiscalYearId?: number; startDate?: string; endDate?: string })[]>)
      .then((data) => {
        if (!active) return;
        setPeriods(data ?? []);
        if (!periodId && data?.[0]) {
          setPeriodId(String(data[0].id));
          if (!editing && data[0].startDate) setOpeningDate(dateValue(data[0].startDate));
        }
      })
      .catch((periodError) => { if (active) setError(periodError instanceof Error ? periodError.message : "Unable to load fiscal periods."); });
    return () => { active = false; };
  }, [yearId, periodId, editing]);

  const totals = useMemo(() => rows.reduce((result, row) => {
    const quantity = Number(row.quantity) || 0;
    const value = quantity * (Number(row.unitCost) || 0);
    return { quantity: result.quantity + quantity, value: result.value + value };
  }, { quantity: 0, value: 0 }), [rows]);

  const selectedPeriod = periods.find((period) => String(period.id) === periodId);

  useEffect(() => {
    if (!selectedPeriod?.startDate || editing) return;
    // Draft dates should always start inside the selected accounting period.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpeningDate(dateValue(selectedPeriod.startDate));
  }, [selectedPeriod, editing]);

  const productLabel = (product: Item) => `${product.code ?? product.id} - ${product.name ?? "Product"}`;
  const warehouseLabel = (warehouse: Item) => `${warehouse.code ?? warehouse.id} - ${warehouse.name ?? "Warehouse"}`;

  const reset = () => {
    setEditing(null);
    setOpeningNumber(nextOpeningNumber(openings));
    setOpeningDate(new Date().toISOString().slice(0, 10));
    setReferenceNumber("");
    setDescription("");
    setRows([newRow(1)]);
    setError("");
  };

  const editOpening = (opening: Opening) => {
    setEditing(opening);
    setOpeningNumber(opening.openingNumber);
    setOpeningDate(dateValue(opening.openingDate));
    setRows((opening.lines ?? []).map((line, index) => ({ id: index + 1, productId: String(line.productId), quantity: String(line.quantity), unitCost: String(line.unitCost), description: line.description ?? "" })) || [newRow(1)]);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateRow = (id: number, patch: Partial<OpeningRow>) => setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const validRows = rows.filter((row) => row.productId && Number(row.quantity) > 0 && Number(row.unitCost) >= 0);
    if (!yearId || !periodId) return setError("Select fiscal year and fiscal period.");
    if (!openingNumber.trim()) return setError("Opening number is required.");
    if (!validRows.length) return setError("Add at least one product line with quantity and unit cost.");
    const productIds = validRows.map((row) => row.productId);
    if (new Set(productIds).size !== productIds.length) return setError("A product can appear only once in the same opening voucher.");
    setSaving(true);
    setError("");
    try {
      const payload = {
        fiscalYearId: Number(yearId), fiscalYearPeriodId: Number(periodId), warehouseId: warehouseId ? Number(warehouseId) : null,
        openingNumber: openingNumber.trim(), openingDate, referenceNumber: referenceNumber.trim() || null, description: description.trim() || null,
        totalQuantity: totals.quantity, totalValue: totals.value, isActive: true,
        lines: validRows.map((row, index) => ({ productId: Number(row.productId), quantity: Number(row.quantity), unitCost: Number(row.unitCost), totalCost: Number(row.quantity) * Number(row.unitCost), description: row.description.trim() || null, lineNumber: index + 1 })),
      };
      const endpoint = editing ? `/api/StockOpening/${editing.id}` : "/api/StockOpening";
      await request(await authFetch(endpoint, { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) }));
      reset();
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save opening.");
    } finally { setSaving(false); }
  };

  const post = async (opening: Opening) => {
    if (!window.confirm(`Post ${opening.openingNumber}? Posted opening cannot be edited.`)) return;
    try { await request(await authFetch(`/api/StockOpening/${opening.id}/post`, { method: "POST" })); await load(); }
    catch (postError) { setError(postError instanceof Error ? postError.message : "Unable to post opening."); }
  };

  return <div className="min-h-screen bg-slate-100 p-3 text-slate-700">
    <div className="mb-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-600">Master / Product</p><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-xl font-semibold text-slate-900">{existingOnly ? "Existing Product Opening" : "Product Opening"}</h1><p className="mt-1 text-sm text-slate-500">Record opening stock by product, quantity, cost and warehouse before transactions begin.</p></div><button type="button" onClick={reset} className="flex items-center gap-2 rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white"><Plus size={16} /> New Opening</button></div></div>
    {error && <p className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={save} className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-4"><label className="text-xs font-medium">Fiscal year<select required value={yearId} onChange={(event) => { setYearId(event.target.value); setPeriodId(""); setOpeningDate(""); }} className="mt-1 w-full rounded border px-3 py-2 text-sm"><option value="">Select year</option>{years.map((year) => <option key={year.id} value={year.id}>{year.code ?? year.name ?? year.id}</option>)}</select></label><label className="text-xs font-medium">Period<select required value={periodId} onChange={(event) => setPeriodId(event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm"><option value="">Select period</option>{periods.map((period) => <option key={period.id} value={period.id}>{period.code ?? period.name ?? period.id}</option>)}</select>{selectedPeriod?.startDate && <span className="mt-1 block text-[11px] text-slate-400">Allowed: {dateValue(selectedPeriod.startDate)} to {dateValue(selectedPeriod.endDate ?? "")}</span>}</label><label className="text-xs font-medium">Opening number<input required value={openingNumber} onChange={(event) => setOpeningNumber(event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" /><span className="mt-1 block text-[11px] text-slate-400">Auto-generated; editable if your company uses a different voucher series.</span></label><label className="text-xs font-medium">Opening date<input required type="date" value={openingDate} min={dateValue(selectedPeriod?.startDate ?? "")} max={dateValue(selectedPeriod?.endDate ?? "")} onChange={(event) => setOpeningDate(event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" /></label><label className="text-xs font-medium">Warehouse<select value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm"><option value="">All / no warehouse</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouseLabel(warehouse)}</option>)}</select></label><label className="text-xs font-medium">Reference number<input value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" /></label><label className="text-xs font-medium md:col-span-2">Description<input value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" /></label></div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Product</th><th className="px-3 py-2">Quantity</th><th className="px-3 py-2">Unit cost</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">Description</th><th /></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id} className="border-b"><td className="px-3 py-2">{index + 1}</td><td className="px-3 py-2"><select value={row.productId} onChange={(event) => updateRow(row.id, { productId: event.target.value })} className="w-full rounded border px-2 py-2"><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{productLabel(product)}</option>)}</select></td><td className="px-3 py-2"><input type="number" min="0.0001" step="any" value={row.quantity} onChange={(event) => updateRow(row.id, { quantity: event.target.value })} className="w-28 rounded border px-2 py-2 text-right" /></td><td className="px-3 py-2"><input type="number" min="0" step="any" value={row.unitCost} onChange={(event) => updateRow(row.id, { unitCost: event.target.value })} className="w-28 rounded border px-2 py-2 text-right" /></td><td className="px-3 py-2 text-right">{((Number(row.quantity) || 0) * (Number(row.unitCost) || 0)).toFixed(2)}</td><td className="px-3 py-2"><input value={row.description} onChange={(event) => updateRow(row.id, { description: event.target.value })} className="w-full rounded border px-2 py-2" /></td><td className="px-3 py-2"><button type="button" onClick={() => setRows((current) => current.length > 1 ? current.filter((item) => item.id !== row.id) : current)} className="text-red-600"><Trash2 size={16} /></button></td></tr>)}</tbody><tfoot><tr className="font-semibold"><td colSpan={2} className="px-3 py-3">Totals</td><td className="px-3 py-3 text-right">{totals.quantity.toFixed(3)}</td><td /><td className="px-3 py-3 text-right">{totals.value.toFixed(2)}</td><td colSpan={2} /></tr></tfoot></table></div><div className="mt-3 flex flex-wrap justify-between gap-2"><button type="button" onClick={() => setRows((current) => [...current, newRow(Math.max(...current.map((row) => row.id), 0) + 1)])} className="flex items-center gap-2 rounded border px-3 py-2 text-sm"><Plus size={15} /> Add line</button><div className="flex gap-2"><button type="button" onClick={reset} className="rounded border px-4 py-2 text-sm">Clear</button><button type="submit" disabled={saving} className="rounded bg-teal-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-60">{saving ? "Saving…" : editing ? "Update Opening" : "Save Opening"}</button></div></div>
    </form>
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="border-b bg-slate-50 px-4 py-3 text-sm font-medium">Opening Register {loading ? "· Loading…" : `· ${openings.length} records`}</div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Opening no.</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Quantity</th><th className="px-4 py-3 text-right">Value</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{openings.map((opening) => <tr key={opening.id} className="border-t"><td className="px-4 py-3 font-medium text-teal-800">{opening.openingNumber}</td><td className="px-4 py-3">{dateValue(opening.openingDate)}</td><td className="px-4 py-3 text-right">{opening.totalQuantity}</td><td className="px-4 py-3 text-right">{opening.totalValue}</td><td className="px-4 py-3">{opening.isPosted ? "Posted" : opening.status}</td><td className="px-4 py-3 text-right">{!opening.isPosted && <><button type="button" onClick={() => editOpening(opening)} className="mr-3 text-teal-700"><Pencil size={15} /></button><button type="button" onClick={() => void post(opening)} className="text-emerald-700"><CheckCircle2 size={15} /></button></>}</td></tr>)}{!loading && openings.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No openings found.</td></tr>}</tbody></table></div></div>
  </div>;
}
