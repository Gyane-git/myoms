"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Save } from "lucide-react";
import { authFetch } from "@/lib/authFetch";

type Product = Record<string, unknown> & { id: number; code: string; name: string };

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) return (body as { data: T }).data;
  return body as T;
}

async function read<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body && typeof body === "object" && "message" in body && typeof body.message === "string" ? body.message : "Request failed.");
  return unwrap<T>(body);
}

export default function ProductRateRegister() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [salesRate, setSalesRate] = useState("");
  const [mrp, setMrp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts((await read<Product[]>(await authFetch("/api/Product"))) ?? []); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load products."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? products.filter((product) => `${product.code} ${product.name}`.toLowerCase().includes(query)) : products;
  }, [products, search]);

  const openEdit = (product: Product) => { setEditing(product); setSalesRate(String(product.salesRate ?? "")); setMrp(String(product.mrp ?? product.MRP ?? "")); setError(""); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    if (Number(salesRate) < 0 || Number(mrp) < 0) { setError("Rates cannot be negative."); return; }
    setSaving(true); setError("");
    try {
      await read(await authFetch(`/api/Product/${editing.id}`, { method: "PUT", body: JSON.stringify({ ...editing, salesRate: salesRate === "" ? null : Number(salesRate), mrp: mrp === "" ? null : Number(mrp) }) }));
      setEditing(null); await load();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to update rates."); }
    finally { setSaving(false); }
  };

  return <div className="min-h-screen bg-slate-100 p-3 text-slate-700"><div className="mb-4 rounded-lg border bg-white px-5 py-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-600">Master / Product</p><h1 className="text-xl font-semibold text-slate-900">Product Monthly Closing Rate</h1><p className="mt-1 text-sm text-slate-500">Review and update the current product sales rate and MRP from the real product master.</p></div>{error && <p className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="overflow-hidden rounded-lg border bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 p-3"><span className="text-sm font-medium">Product rates {loading ? "· Loading…" : `· ${filtered.length} records`}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search code or product" className="w-full rounded border px-3 py-2 text-sm sm:w-72" /></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Product</th><th className="px-4 py-3 text-right">Buy rate</th><th className="px-4 py-3 text-right">Sales rate</th><th className="px-4 py-3 text-right">MRP</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody>{filtered.map((product) => <tr key={product.id} className="border-t hover:bg-slate-50"><td className="px-4 py-3 font-medium text-teal-800">{product.code}</td><td className="px-4 py-3">{product.name}</td><td className="px-4 py-3 text-right">{String(product.buyRate ?? "-")}</td><td className="px-4 py-3 text-right">{String(product.salesRate ?? "-")}</td><td className="px-4 py-3 text-right">{String(product.mrp ?? product.MRP ?? "-")}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => openEdit(product)} className="text-teal-700" aria-label="Edit rates"><Pencil size={16} /></button></td></tr>)}{!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No products found.</td></tr>}</tbody></table></div></div>{editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={save} className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"><h2 className="text-lg font-semibold text-slate-900">Update product rate</h2><p className="mt-1 text-sm text-slate-500">{editing.code} - {editing.name}</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium">Sales rate<input type="number" min="0" step="any" value={salesRate} onChange={(event) => setSalesRate(event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" /></label><label className="text-xs font-medium">MRP<input type="number" min="0" step="any" value={mrp} onChange={(event) => setMrp(event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" /></label></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded border px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={saving} className="flex items-center gap-2 rounded bg-teal-700 px-4 py-2 text-sm text-white disabled:opacity-60"><Save size={15} />{saving ? "Saving…" : "Save rates"}</button></div></form></div>}</div>;
}
