"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { authFetch } from "@/lib/authFetch";

type SetupKind = "branch" | "companyUnit" | "fiscalYear" | "period" | "warehouse" | "location";
type Row = Record<string, unknown> & { id: number; code?: string; name?: string };
type Field = { key: string; label: string; type?: "text" | "date" | "number" | "checkbox" | "select"; required?: boolean; lookup?: "fiscalYears" | "warehouses"; choices?: string[] };
type Config = { title: string; description: string; endpoint: string; prefix?: string; fields: Field[] };

const CONFIG: Record<SetupKind, Config> = {
  branch: { title: "Branches", description: "Create operating branches for reporting, users and transactions.", endpoint: "/api/Branches", prefix: "BRN", fields: [{ key: "code", label: "Code", required: true }, { key: "name", label: "Branch name", required: true }, { key: "address", label: "Address" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "isActive", label: "Active", type: "checkbox" }] },
  companyUnit: { title: "Company Units", description: "Maintain legal, operational or reporting units within the company.", endpoint: "/api/CompanyUnits", prefix: "UNIT", fields: [{ key: "code", label: "Code", required: true }, { key: "name", label: "Unit name", required: true }, { key: "address", label: "Address" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "isActive", label: "Active", type: "checkbox" }] },
  fiscalYear: { title: "Fiscal Years", description: "Define the accounting year before creating its monthly periods.", endpoint: "/api/FiscalYear", prefix: "FY", fields: [{ key: "code", label: "Code", required: true }, { key: "name", label: "Name", required: true }, { key: "startDate", label: "Start date", type: "date", required: true }, { key: "endDate", label: "End date", type: "date", required: true }, { key: "isCurrent", label: "Current year", type: "checkbox" }, { key: "isActive", label: "Active", type: "checkbox" }] },
  period: { title: "Fiscal Year Periods", description: "Create periods inside a fiscal year. Opening dates and transactions use these boundaries.", endpoint: "/api/FiscalYearPeriod", prefix: "P", fields: [{ key: "fiscalYearId", label: "Fiscal year", type: "select", lookup: "fiscalYears", required: true }, { key: "periodNumber", label: "Period number", type: "number", required: true }, { key: "code", label: "Code", required: true }, { key: "name", label: "Name", required: true }, { key: "startDate", label: "Start date", type: "date", required: true }, { key: "endDate", label: "End date", type: "date", required: true }, { key: "isCurrent", label: "Current period", type: "checkbox" }, { key: "isActive", label: "Active", type: "checkbox" }] },
  warehouse: { title: "Warehouses", description: "Set up stock locations before entering opening stock or inventory transactions.", endpoint: "/api/Warehouse", prefix: "WH", fields: [{ key: "code", label: "Code", required: true }, { key: "name", label: "Warehouse name", required: true }, { key: "shortName", label: "Short name" }, { key: "city", label: "City" }, { key: "address", label: "Address" }, { key: "telNo", label: "Telephone" }, { key: "mobileNo", label: "Mobile" }, { key: "contactPerson", label: "Contact person" }, { key: "isActive", label: "Active", type: "checkbox" }] },
  location: { title: "Warehouse Locations", description: "Maintain racks, bins and sub-locations for accurate stock placement.", endpoint: "/api/WarehouseLocation", fields: [{ key: "warehouseId", label: "Warehouse", type: "select", lookup: "warehouses", required: true }, { key: "locCode", label: "Location code", required: true }, { key: "location", label: "Location" }, { key: "subLocation", label: "Sub-location" }, { key: "rack", label: "Rack" }, { key: "col", label: "Column" }, { key: "actualLocation", label: "Actual location" }, { key: "sequence", label: "Sequence", type: "number" }, { key: "memo", label: "Memo" }] },
};

const emptyValue = (field: Field): string | boolean => field.type === "checkbox" ? true : field.type === "number" ? "" : "";
const unwrap = <T,>(body: unknown): T => body && typeof body === "object" && "data" in body ? (body as { data: T }).data : body as T;
const dateText = (value: unknown) => value ? String(value).slice(0, 10) : "";

async function read<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body && typeof body === "object" && "message" in body ? String(body.message) : "Request failed.");
  return unwrap<T>(body);
}

function nextCode(rows: Row[], prefix: string) {
  const highest = rows.reduce((max, row) => {
    const match = String(row.code ?? "").match(new RegExp(`^${prefix}(\\d+)$`, "i"));
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0) + 1;
  return `${prefix}${String(highest).padStart(5, "0")}`;
}

export default function CompanySetupCrud({ kind }: { kind: SetupKind }) {
  const config = CONFIG[kind];
  const [rows, setRows] = useState<Row[]>([]);
  const [lookups, setLookups] = useState<Record<string, Row[]>>({});
  const [form, setForm] = useState<Record<string, string | boolean>>(() => Object.fromEntries(config.fields.map((field) => [field.key, emptyValue(field)])));
  const [editing, setEditing] = useState<Row | null>(null);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows((await read<Row[]>(await authFetch(config.endpoint))) ?? []); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load setup data."); }
    finally { setLoading(false); }
  }, [config.endpoint]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  useEffect(() => {
    const keys = Array.from(new Set(config.fields.map((field) => field.lookup).filter(Boolean))) as string[];
    if (!keys.length) return;
    const timer = window.setTimeout(() => { void Promise.all(keys.map(async (key) => [key, await read<Row[]>(await authFetch(key === "fiscalYears" ? "/api/FiscalYear" : "/api/Warehouse"))] as const)).then((entries) => setLookups(Object.fromEntries(entries))).catch(() => undefined); }, 0);
    return () => window.clearTimeout(timer);
  }, [config.fields]);

  const filtered = useMemo(() => { const query = search.trim().toLowerCase(); return query ? rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query)) : rows; }, [rows, search]);
  const setValue = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const openAdd = () => { setEditing(null); setForm(Object.fromEntries(config.fields.map((field) => [field.key, field.key === "periodNumber" ? String(rows.length + 1) : field.key === "code" && config.prefix ? nextCode(rows, config.prefix) : emptyValue(field)])) as Record<string, string | boolean>); setError(""); setModal(true); };
  const openEdit = (row: Row) => { setEditing(row); setForm(Object.fromEntries(config.fields.map((field) => [field.key, field.type === "date" ? dateText(row[field.key]) : row[field.key] ?? emptyValue(field)])) as Record<string, string | boolean>); setError(""); setModal(true); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: Record<string, unknown> = {};
    for (const field of config.fields) {
      const value = form[field.key];
      if (field.required && (value === "" || value == null)) { setError(`${field.label} is required.`); return; }
      payload[field.key] = field.type === "number" ? (value === "" ? null : Number(value)) : field.type === "select" && value === "" ? null : value;
    }
    if ((kind === "fiscalYear" || kind === "period") && String(form.endDate) < String(form.startDate)) { setError("End date cannot be earlier than start date."); return; }
    setError("");
    try { await read(await authFetch(editing ? `${config.endpoint}/${editing.id}` : config.endpoint, { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) })); setModal(false); await load(); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save record."); }
  };
  const remove = async (row: Row) => { if (!window.confirm(`Delete ${String(row.name ?? row.code ?? row.id)}?`)) return; try { await read(await authFetch(`${config.endpoint}/${row.id}`, { method: "DELETE" })); await load(); } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : "Unable to delete record."); } };
  const close = async (row: Row) => { try { await read(await authFetch(`${config.endpoint}/${row.id}/close`, { method: "POST" })); await load(); } catch (closeError) { setError(closeError instanceof Error ? closeError.message : "Unable to close record."); } };
  const label = (field: Field, value: unknown) => field.lookup ? `${String(lookups[field.lookup]?.find((item) => item.id === Number(value))?.code ?? value)} - ${String(lookups[field.lookup]?.find((item) => item.id === Number(value))?.name ?? "")}` : field.type === "date" ? dateText(value) : String(value ?? "-");
  const columns = config.fields.filter((field) => field.type !== "checkbox").slice(0, 6);

  return <div className="min-h-screen bg-slate-100 p-3 text-slate-700"><div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-600">Master / Company Setup</p><h1 className="text-xl font-semibold text-slate-900">{config.title}</h1><p className="mt-1 text-sm text-slate-500">{config.description}</p></div><button type="button" onClick={openAdd} className="flex items-center gap-2 rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white"><Plus size={16} /> Add {config.title.replace(/s$/, "")}</button></div>{error && <p className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 p-3"><span className="text-sm font-medium">{loading ? "Loading…" : `${filtered.length} record(s)`}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}`} className="w-full rounded border px-3 py-2 text-sm sm:w-72" /></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">#</th>{columns.map((field) => <th key={field.key} className="p-3">{field.label}</th>)}<th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.id} className="border-t"><td className="p-3 text-slate-400">{row.id}</td>{columns.map((field) => <td key={field.key} className="p-3">{field.type === "checkbox" ? "" : label(field, row[field.key])}</td>)}<td className="p-3">{row.isClosed ? "Closed" : row.isActive === false ? "Inactive" : row.isCurrent ? "Current" : "Active"}</td><td className="p-3 text-right"><button type="button" onClick={() => openEdit(row)} className="mr-3 text-teal-700"><Pencil size={15} /></button>{(kind === "fiscalYear" || kind === "period") && !row.isClosed && <button type="button" onClick={() => void close(row)} className="mr-3 text-amber-700"><CheckCircle2 size={15} /></button>}<button type="button" onClick={() => void remove(row)} className="text-red-600"><Trash2 size={15} /></button></td></tr>)}</tbody></table></div></div>{modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={save} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl"><h2 className="mb-4 text-lg font-semibold">{editing ? "Edit" : "Add"} {config.title}</h2><div className="grid gap-3 sm:grid-cols-2">{config.fields.map((field) => <label key={field.key} className={`text-xs font-medium text-slate-600 ${field.type === "checkbox" ? "flex items-center gap-2" : "block"}`}>{field.type === "checkbox" ? <><input type="checkbox" checked={Boolean(form[field.key])} onChange={(event) => setValue(field.key, event.target.checked)} />{field.label}</> : <>{field.label}{field.type === "select" ? <select required={field.required} value={String(form[field.key] ?? "")} onChange={(event) => setValue(field.key, event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm"><option value="">Select {field.label}</option>{(lookups[field.lookup ?? ""] ?? []).map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}</select> : <input required={field.required} type={field.type ?? "text"} min={field.type === "number" ? "0" : undefined} value={String(form[field.key] ?? "")} onChange={(event) => setValue(field.key, event.target.value)} readOnly={field.key === "code" && Boolean(config.prefix) && !editing} className="mt-1 w-full rounded border px-3 py-2 text-sm read-only:bg-slate-100" />}</>}</label>)}</div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setModal(false)} className="rounded border px-4 py-2 text-sm">Cancel</button><button className="rounded bg-teal-700 px-5 py-2 text-sm font-medium text-white">Save</button></div></form></div>}</div>;
}
