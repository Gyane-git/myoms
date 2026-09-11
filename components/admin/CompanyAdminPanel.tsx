"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import {
  ShieldCheck,
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

type Role = { id: number; code: string; name: string; description?: string };
type Permission = {
  id: number;
  code: string;
  name: string;
  description?: string;
};
type User = {
  id: number;
  username: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
};

async function read<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as (T & {
    message?: string;
  }) | null;
  if (!response.ok) throw new Error(body?.message || `Request failed (${response.status}).`);
  return body as T;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function CompanyAdminPanel() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roleId, setRoleId] = useState("");
  const [assigned, setAssigned] = useState<number[]>([]);
  const [role, setRole] = useState({ code: "", name: "", description: "" });
  const [user, setUser] = useState({
    username: "",
    fullName: "",
    password: "",
    roleId: "",
  });
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionQuery, setPermissionQuery] = useState("");

  const load = async () => {
    const [roleResponse, permissionResponse, userResponse] = await Promise.all([
      authFetch("/api/company-admin/roles"),
      authFetch("/api/company-admin/permissions"),
      authFetch("/api/company-admin/users"),
    ]);
    setRoles(await read<Role[]>(roleResponse));
    setPermissions(await read<Permission[]>(permissionResponse));
    setUsers(await read<User[]>(userResponse));
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
        .catch((error: unknown) =>
          setMessage({
            text: error instanceof Error ? error.message : "Unable to load company administration.",
            type: "error",
          }),
        )
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!roleId) {
      const timer = window.setTimeout(() => setAssigned([]), 0);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      void authFetch(`/api/company-admin/roles/${roleId}/permissions`)
        .then((response) => read<Permission[]>(response))
        .then((items) => setAssigned(items.map((item) => item.id)))
        .catch(() => setMessage({ text: "Unable to load role permissions.", type: "error" }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [roleId]);

  const createRole = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await read(
        await authFetch("/api/company-admin/roles", {
          method: "POST",
          body: JSON.stringify(role),
        }),
      );
      setRole({ code: "", name: "", description: "" });
      setMessage({ text: "Company role created.", type: "success" });
      await load();
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Unable to create role.",
        type: "error",
      });
    }
  };

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await read(
        await authFetch("/api/company-admin/users", {
          method: "POST",
          body: JSON.stringify({
            ...user,
            roleId: user.roleId ? Number(user.roleId) : null,
          }),
        }),
      );
      setUser({ username: "", fullName: "", password: "", roleId: "" });
      setMessage({ text: "Company user created.", type: "success" });
      await load();
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Unable to create user.",
        type: "error",
      });
    }
  };

  const toggle = async (permission: Permission, checked: boolean) => {
    if (!roleId) return;
    const body = JSON.stringify({
      roleId: Number(roleId),
      permissionId: permission.id,
    });
    try {
      await read(
        await authFetch("/api/company-admin/role-permissions", {
          method: checked ? "POST" : "DELETE",
          body,
        }),
      );
      setAssigned((current) =>
        checked
          ? [...new Set([...current, permission.id])]
          : current.filter((id) => id !== permission.id),
      );
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Unable to update permission.",
        type: "error",
      });
    }
  };

  const filteredPermissions = permissions.filter(
    (item) =>
      item.name.toLowerCase().includes(permissionQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(permissionQuery.toLowerCase()),
  );

  const selectableRoles = roles.filter((item) => item.code !== "COMPANY_ADMIN");

  if (loading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2 text-black">
        {[0, 1].map((i) => (
          <section key={i} className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading company administration…</span>
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2 text-black">
      <section className="rounded-lg border bg-white p-4">
        <div className="mb-1 flex items-center gap-2">
          <UserPlus size={18} className="text-teal-700" />
          <h1 className="text-lg font-semibold text-teal-800">Company administration</h1>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Create company users and assign only operational permissions. BIZ registry is not
          available here.
        </p>

        <form onSubmit={createRole} className="grid gap-2 rounded-md border border-slate-100 bg-slate-50/60 p-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            New role
          </p>
          <input
            required
            placeholder="Role code, e.g. SALES"
            value={role.code}
            onChange={(e) => setRole({ ...role, code: e.target.value })}
            className="rounded border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
          <input
            required
            placeholder="Role name"
            value={role.name}
            onChange={(e) => setRole({ ...role, name: e.target.value })}
            className="rounded border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
          <input
            placeholder="Description (optional)"
            value={role.description}
            onChange={(e) => setRole({ ...role, description: e.target.value })}
            className="rounded border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
          <button className="mt-1 rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 active:scale-[0.99]">
            Create company role
          </button>
        </form>

        <form
          onSubmit={createUser}
          className="mt-4 grid gap-2 rounded-md border border-slate-100 bg-slate-50/60 p-3"
        >
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            New user
          </p>
          <input
            required
            placeholder="Full name"
            value={user.fullName}
            onChange={(e) => setUser({ ...user, fullName: e.target.value })}
            className="rounded border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
          <input
            required
            placeholder="Username"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="rounded border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
          <input
            required
            type="password"
            placeholder="Temporary password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            className="rounded border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
          <select
            required
            value={user.roleId}
            onChange={(e) => setUser({ ...user, roleId: e.target.value })}
            className="rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          >
            <option value="">Select company role</option>
            {selectableRoles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button className="mt-1 rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 active:scale-[0.99]">
            Create company user
          </button>
        </form>

        {message && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={14} className="shrink-0" />
            ) : (
              <AlertCircle size={14} className="shrink-0" />
            )}
            {message.text}
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck size={16} className="text-teal-700" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-800">
            Role permissions
          </h2>
        </div>

        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="mb-2 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
        >
          <option value="">Select role</option>
          {selectableRoles.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.code}
            </option>
          ))}
        </select>

        {!roleId && (
          <p className="mb-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-400">
            Select a role above to view and edit its permissions.
          </p>
        )}

        {roleId && (
          <div className="relative mb-3">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search permissions"
              value={permissionQuery}
              onChange={(e) => setPermissionQuery(e.target.value)}
              className="w-full rounded border border-slate-200 py-2 pl-8 pr-3 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>
        )}

        <div className="grid max-h-[480px] gap-2 overflow-y-auto sm:grid-cols-2">
          {filteredPermissions.length === 0 && permissions.length > 0 && (
            <p className="col-span-full py-4 text-center text-xs text-slate-400">
              No permissions match “{permissionQuery}”.
            </p>
          )}
          {permissions.length === 0 && (
            <p className="col-span-full py-4 text-center text-xs text-slate-400">
              No permissions configured yet.
            </p>
          )}
          {filteredPermissions.map((item) => {
            const checked = assigned.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex gap-2 rounded border p-2 text-sm transition-colors ${
                  checked ? "border-teal-200 bg-teal-50/60" : "border-slate-200"
                } ${!roleId ? "opacity-60" : "cursor-pointer hover:border-teal-300"}`}
              >
                <input
                  type="checkbox"
                  disabled={!roleId}
                  checked={checked}
                  onChange={(e) => void toggle(item, e.target.checked)}
                  className="mt-1 accent-teal-700"
                />
                <span>
                  <span className="block font-medium text-slate-800">{item.name}</span>
                  <small className="block text-[11px] text-slate-400">{item.code}</small>
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-2 border-t pt-4">
          <Users size={14} className="text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-700">
            Company users <span className="text-slate-400">({users.length})</span>
          </h2>
        </div>

        {users.length === 0 && (
          <p className="py-4 text-center text-xs text-slate-400">No company users yet.</p>
        )}

        <div className="divide-y">
          {users.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2.5 text-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">
                {initials(item.fullName) || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{item.fullName}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      item.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="truncate text-xs text-slate-500">
                  {item.username} · {item.roles.join(", ") || "No role assigned"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}