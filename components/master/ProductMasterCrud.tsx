"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { authFetch } from "@/lib/authFetch";

type MasterKind = "brand" | "category" | "group" | "subgroup";

type MasterRow = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  productGroupId?: number;
};

type GroupOption = {
  id: number;
  code: string;
  name: string;
};

const CONFIG: Record<MasterKind, { title: string; endpoint: string }> = {
  brand: { title: "Brand", endpoint: "/api/Brand" },
  category: { title: "Category", endpoint: "/api/ProductCategory" },
  group: { title: "Group", endpoint: "/api/ProductGroup" },
  subgroup: { title: "Sub Group", endpoint: "/api/ProductSubGroup" },
};

const GENERATED_CODE_FIELDS = new Set(["code"]);

const CODE_PREFIXES: Record<MasterKind, string> = {
  brand: "BRD",
  category: "CAT",
  group: "GRP",
  subgroup: "SUB",
};

function nextCode(rows: MasterRow[], prefix: string) {
  const next = rows.reduce((highest, row) => {
    const match = row.code.match(new RegExp(`^${prefix}(\\d+)$`));
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0) + 1;

  return `${prefix}${String(next).padStart(5, "0")}`;
}

async function readApiData<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | { data?: T; message?: string }
    | T
    | null;

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? body.message
        : undefined;
    throw new Error(message || "The request could not be completed.");
  }

  if (body && typeof body === "object" && "data" in body) {
    return body.data as T;
  }

  return body as T;
}

export default function ProductMasterCrud({ kind }: { kind: MasterKind }) {
  const config = CONFIG[kind];
  const [rows, setRows] = useState<MasterRow[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MasterRow | null>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
    productGroupId: "",
  });

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await authFetch(config.endpoint);
      const data = await readApiData<MasterRow[]>(response);
      setRows(data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, [config.endpoint]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRows();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRows]);

  useEffect(() => {
    if (kind !== "subgroup") return;

    let active = true;
    async function loadGroups() {
      try {
        const response = await authFetch("/api/ProductGroup");
        const data = await readApiData<GroupOption[]>(response);
        if (active) setGroups(data ?? []);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load groups.");
        }
      }
    }

    void loadGroups();
    return () => {
      active = false;
    };
  }, [kind]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) =>
      `${row.code} ${row.name} ${row.description ?? ""}`.toLowerCase().includes(query)
    );
  }, [rows, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      code: nextCode(rows, CODE_PREFIXES[kind]),
      name: "",
      description: "",
      isActive: true,
      productGroupId: groups[0] ? String(groups[0].id) : "",
    });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (row: MasterRow) => {
    setEditing(row);
    setForm({
      code: row.code,
      name: row.name,
      description: row.description ?? "",
      isActive: row.isActive,
      productGroupId: row.productGroupId ? String(row.productGroupId) : "",
    });
    setError("");
    setModalOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (kind === "subgroup" && !form.productGroupId) {
      setError("Please select a product group.");
      return;
    }

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      isActive: form.isActive,
      ...(kind === "subgroup" ? { productGroupId: Number(form.productGroupId) } : {}),
    };

    setSaving(true);
    setError("");
    try {
      const endpoint = editing ? `${config.endpoint}/${editing.id}` : config.endpoint;
      const response = await authFetch(endpoint, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      await readApiData<unknown>(response);
      setModalOpen(false);
      await loadRows();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save record.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: MasterRow) => {
    if (!window.confirm(`Delete ${row.name}?`)) return;

    setError("");
    try {
      const response = await authFetch(`${config.endpoint}/${row.id}`, { method: "DELETE" });
      await readApiData<unknown>(response);
      await loadRows();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete record.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-3 text-sm text-slate-700">
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-t-4 border-teal-500 bg-slate-50 px-4 py-3">
          <h1 className="font-semibold">{config.title}</h1>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
          >
            <Plus size={15} /> Add
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-3">
          <span className="text-xs text-slate-500">
            {loading ? "Loading…" : `${filteredRows.length} record${filteredRows.length === 1 ? "" : "s"}`}
          </span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search code or name"
            className="w-64 rounded border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-teal-500"
          />
        </div>

        {error && <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                {kind === "subgroup" && <th className="px-4 py-3">Group</th>}
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={kind === "subgroup" ? 7 : 6} className="px-4 py-10 text-center text-slate-400">
                    No records found.
                  </td>
                </tr>
              )}
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{row.id}</td>
                  <td className="px-4 py-3 font-medium">{row.code}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  {kind === "subgroup" && (
                    <td className="px-4 py-3">
                      {groups.find((group) => group.id === row.productGroupId)?.name ?? row.productGroupId ?? "-"}
                    </td>
                  )}
                  <td className="px-4 py-3">{row.description || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={row.isActive ? "text-emerald-600" : "text-slate-400"}>
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => openEdit(row)} className="mr-2 text-teal-700 hover:text-teal-900" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button type="button" onClick={() => void remove(row)} className="text-red-600 hover:text-red-800" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={save} className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-base font-semibold">{editing ? `Edit ${config.title}` : `Add ${config.title}`}</h2>
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-600">
                Code
                <input
                  value={form.code}
                  onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                  readOnly={GENERATED_CODE_FIELDS.has("code")}
                  placeholder="Auto-generated"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 read-only:bg-slate-100"
                  autoFocus
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Name
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
                />
              </label>
              {kind === "subgroup" && (
                <label className="block text-xs font-medium text-slate-600">
                  Product group
                  <select
                    value={form.productGroupId}
                    onChange={(event) => setForm((current) => ({ ...current, productGroupId: event.target.value }))}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
                  >
                    <option value="">Select group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.code} - {group.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="block text-xs font-medium text-slate-600">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="mt-1 min-h-20 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                />
                Active
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded border border-slate-300 px-3 py-2 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded bg-teal-700 px-4 py-2 text-sm text-white disabled:opacity-60">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
