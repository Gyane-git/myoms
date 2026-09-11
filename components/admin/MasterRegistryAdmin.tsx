"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, ClipboardList, Plus, ShieldCheck, UserPlus } from "lucide-react";
import { authFetch } from "@/lib/authFetch";

type Company = { id: number; code: string; name: string; databaseServer: string; databaseName: string; isActive: boolean; subscriptionPlan: string; subscriptionStart?: string; subscriptionEnd?: string };
type User = { id: number; companyId: number; companyCode: string; username: string; fullName: string; isActive: boolean; roles: string[] };
type Role = { id: number; code: string; name: string; description?: string; isActive: boolean };
type Permission = { id: number; code: string; name: string; description?: string; isActive: boolean };
type LogRow = Record<string, unknown>;
type Tab = "companies" | "users" | "security" | "activity";

function permissionCode(name: string) {
  return `PERM_${name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
}

function nextRoleCode(roles: Role[]) {
  const highest = roles.reduce((max, role) => {
    const match = role.code.match(/^ROLE(\d+)$/i);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0) + 1;
  return `ROLE${String(highest).padStart(3, "0")}`;
}

async function read<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null) as Record<string, unknown> | T | null;
  if (!response.ok) throw new Error(body && typeof body === "object" && "message" in body ? String(body.message) : "Request failed.");
  return body && typeof body === "object" && "data" in body ? body.data as T : body as T;
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="block text-xs font-medium text-slate-600">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500" /></label>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 className="mb-4 border-b border-slate-100 pb-2 text-sm font-semibold uppercase tracking-wide text-teal-800">{title}</h2>{children}</section>;
}

export default function MasterRegistryAdmin() {
  const [tab, setTab] = useState<Tab>("companies");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loginHistory, setLoginHistory] = useState<LogRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<LogRow[]>([]);
  const [company, setCompany] = useState({ code: "", name: "", databaseServer: "localhost", databaseName: "", subscriptionPlan: "Basic", subscriptionStart: "", subscriptionEnd: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [companiesResponse, usersResponse, rolesResponse, permissionsResponse] = await Promise.all([
        authFetch("/api/master-registry/companies"), authFetch("/api/master-registry/users"), authFetch("/api/master-registry/roles"), authFetch("/api/master-registry/permissions/sync-system", { method: "POST", body: JSON.stringify({}) }),
      ]);
      setCompanies(await read<Company[]>(companiesResponse));
      setUsers(await read<User[]>(usersResponse));
      setRoles(await read<Role[]>(rolesResponse));
      setPermissions(await read<Permission[]>(permissionsResponse));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load BIZ administration data.");
    } finally { setLoading(false); }
  }, []);

  const loadActivity = async () => {
    try {
      const [loginResponse, auditResponse] = await Promise.all([authFetch("/api/master-registry/login-history?take=100"), authFetch("/api/master-registry/audit-logs?take=100")]);
      setLoginHistory(await read<LogRow[]>(loginResponse));
      setAuditLogs(await read<LogRow[]>(auditResponse));
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load activity."); }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    if (tab !== "activity") return;
    const timer = window.setTimeout(() => void loadActivity(), 0);
    return () => window.clearTimeout(timer);
  }, [tab]);

  const request = async (path: string, init: RequestInit = {}) => {
    setError(""); setNotice("");
    try { await read(await authFetch(path, init)); setNotice("Saved successfully."); await load(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Request failed."); }
  };

  const createCompany = async (event: React.FormEvent) => { event.preventDefault(); await request("/api/master-registry/companies", { method: "POST", body: JSON.stringify({ ...company, subscriptionStart: company.subscriptionStart || null, subscriptionEnd: company.subscriptionEnd || null }) }); setCompany({ code: "", name: "", databaseServer: "localhost", databaseName: "", subscriptionPlan: "Basic", subscriptionStart: "", subscriptionEnd: "" }); };
  const provision = async (id: number) => { await request(`/api/master-registry/companies/${id}/provision`, { method: "POST" }); };
  const toggleCompany = async (row: Company) => { await request(`/api/master-registry/companies/${row.id}/status`, { method: "PATCH", body: JSON.stringify({ isActive: !row.isActive }) }); };

  const tabs = useMemo(() => [{ id: "companies" as Tab, label: "Companies", icon: Building2 }, { id: "users" as Tab, label: "Users", icon: UserPlus }, { id: "security" as Tab, label: "Roles & Permissions", icon: ShieldCheck }, { id: "activity" as Tab, label: "Activity", icon: ClipboardList }], []);
  return <div className="min-h-screen bg-slate-100 p-3 text-slate-700"><div className="mb-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-600">BIZ Owner Console</p><h1 className="text-xl font-semibold text-slate-900">MasterRegistry Administration</h1><p className="mt-1 text-sm text-slate-500">Manage companies, tenant databases, users, roles, permissions and security activity.</p></div>
    {error && <p className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{notice && <p className="mb-3 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}
    <div className="mb-4 flex flex-wrap gap-2">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setTab(id)} className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium ${tab === id ? "bg-teal-700 text-white" : "border border-slate-300 bg-white text-slate-600"}`}><Icon size={16} />{label}</button>)}</div>
    {loading ? <Panel title="Loading">Loading MasterRegistry data…</Panel> : <>
      {tab === "companies" && <div className="grid gap-4 xl:grid-cols-[380px_1fr]"><Panel title="Create Company"><form onSubmit={createCompany} className="grid gap-3"><Field label="Company code" value={company.code} required onChange={(value) => setCompany({ ...company, code: value })} /><Field label="Company name" value={company.name} required onChange={(value) => setCompany({ ...company, name: value })} /><Field label="Database server" value={company.databaseServer} required onChange={(value) => setCompany({ ...company, databaseServer: value })} /><Field label="Database name" value={company.databaseName} required onChange={(value) => setCompany({ ...company, databaseName: value })} /><Field label="Subscription plan" value={company.subscriptionPlan} onChange={(value) => setCompany({ ...company, subscriptionPlan: value })} /><div className="grid grid-cols-2 gap-3"><Field label="Start date" type="date" value={company.subscriptionStart} onChange={(value) => setCompany({ ...company, subscriptionStart: value })} /><Field label="End date" type="date" value={company.subscriptionEnd} onChange={(value) => setCompany({ ...company, subscriptionEnd: value })} /></div><button className="flex items-center justify-center gap-2 rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white"><Plus size={16} /> Create company</button></form></Panel><Panel title={`Companies · ${companies.length}`}><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">Code</th><th className="p-3">Company</th><th className="p-3">Database</th><th className="p-3">Plan</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead><tbody>{companies.map((row) => <tr key={row.id} className="border-t"><td className="p-3 font-medium text-teal-800">{row.code}</td><td className="p-3">{row.name}</td><td className="p-3">{row.databaseServer}/{row.databaseName}</td><td className="p-3">{row.subscriptionPlan}</td><td className="p-3">{row.isActive ? "Active" : "Inactive"}</td><td className="p-3 text-right"><button type="button" onClick={() => void provision(row.id)} className="mr-3 text-teal-700">Provision</button><button type="button" onClick={() => void toggleCompany(row)} className="text-slate-600">{row.isActive ? "Disable" : "Enable"}</button></td></tr>)}</tbody></table></div></Panel></div>}
      {tab === "users" && <UserManagementPanel companies={companies} users={users} roles={roles} onRefresh={load} />}
      {tab === "security" && <SystemPermissionPanel roles={roles} permissions={permissions} users={users} onRefresh={load} />}
      {tab === "activity" && <div className="grid gap-4 xl:grid-cols-2"><Panel title="Login history"><LogTable rows={loginHistory} /></Panel><Panel title="Audit logs"><LogTable rows={auditLogs} /></Panel></div>}
    </>}
  </div>;
}

function UserManagementPanel({ companies, users, roles, onRefresh }: { companies: Company[]; users: User[]; roles: Role[]; onRefresh: () => Promise<void> }) {
  const [draft, setDraft] = useState({ companyId: "", username: "", password: "", fullName: "", roleId: "" });
  const [editing, setEditing] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [message, setMessage] = useState("");

  const saveUser = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const path = editing ? `/api/master-registry/users/${editing.id}` : "/api/master-registry/users";
      const body = editing
        ? { companyId: Number(draft.companyId), username: draft.username, fullName: draft.fullName, roleId: draft.roleId ? Number(draft.roleId) : null, isActive: editing.isActive }
        : { companyId: Number(draft.companyId), username: draft.username, fullName: draft.fullName, password: draft.password, roleId: draft.roleId ? Number(draft.roleId) : null };
      const response = await authFetch(path, { method: editing ? "PUT" : "POST", body: JSON.stringify(body) });
      await read(response); setMessage(editing ? "User updated." : "User created."); setEditing(null); setDraft({ companyId: "", username: "", password: "", fullName: "", roleId: "" }); await onRefresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save user."); }
  };
  const toggle = async (row: User) => { try { await read(await authFetch(`/api/master-registry/users/${row.id}/status`, { method: "PATCH", body: JSON.stringify({ isActive: !row.isActive }) })); await onRefresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update user status."); } };
  const reset = async (event: React.FormEvent) => { event.preventDefault(); try { await read(await authFetch(`/api/master-registry/users/${resetUser?.id}/password`, { method: "PATCH", body: JSON.stringify({ password: resetPassword }) })); setResetUser(null); setResetPassword(""); setMessage("Password reset successfully."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to reset password."); } };
  const edit = (row: User) => { setEditing(row); setDraft({ companyId: String(row.companyId), username: row.username, password: "", fullName: row.fullName, roleId: roles.find((role) => row.roles.includes(role.code))?.id.toString() ?? "" }); };

  return <div className="grid gap-4 xl:grid-cols-[380px_1fr]"><Panel title={editing ? "Edit User" : "Create User"}><form onSubmit={saveUser} className="grid gap-3"><label className="block text-xs font-medium text-slate-600">Company<select required value={draft.companyId} onChange={(event) => setDraft({ ...draft, companyId: event.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-sm"><option value="">Select company</option>{companies.filter((item) => item.isActive).map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}</select></label><Field label="Full name" required value={draft.fullName} onChange={(value) => setDraft({ ...draft, fullName: value })} /><Field label="Username" required value={draft.username} onChange={(value) => setDraft({ ...draft, username: value })} />{!editing && <Field label="Temporary password" type="password" required value={draft.password} onChange={(value) => setDraft({ ...draft, password: value })} />}<label className="block text-xs font-medium text-slate-600">Role<select required value={draft.roleId} onChange={(event) => setDraft({ ...draft, roleId: event.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-sm"><option value="">Select role</option>{roles.filter((item) => item.isActive).map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}</select></label><div className="flex gap-2"><button className="flex-1 rounded bg-teal-700 px-4 py-2 text-sm text-white">{editing ? "Update user" : "Create user"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setDraft({ companyId: "", username: "", password: "", fullName: "", roleId: "" }); }} className="rounded border px-4 py-2 text-sm">Cancel</button>}</div></form>{message && <p className="mt-3 rounded bg-slate-50 px-3 py-2 text-xs text-slate-600">{message}</p>}</Panel><Panel title={`Users · ${users.length}`}><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">User</th><th className="p-3">Company</th><th className="p-3">Roles</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead><tbody>{users.map((row) => <tr key={row.id} className="border-t"><td className="p-3"><b>{row.fullName}</b><div className="text-xs text-slate-400">{row.username}</div></td><td className="p-3">{row.companyCode}</td><td className="p-3">{row.roles.join(", ") || "No role"}</td><td className="p-3">{row.isActive ? "Active" : "Inactive"}</td><td className="p-3 text-right"><button type="button" onClick={() => edit(row)} className="mr-3 text-teal-700">Edit</button><button type="button" onClick={() => { setResetUser(row); setResetPassword(""); }} className="mr-3 text-amber-700">Reset password</button><button type="button" onClick={() => void toggle(row)} className="text-slate-600">{row.isActive ? "Disable" : "Enable"}</button></td></tr>)}</tbody></table></div></Panel>{resetUser && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={reset} className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"><h2 className="text-lg font-semibold">Reset password</h2><p className="mt-1 text-sm text-slate-500">{resetUser.username}</p><Field label="New password" type="password" required value={resetPassword} onChange={setResetPassword} /><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setResetUser(null)} className="rounded border px-4 py-2 text-sm">Cancel</button><button className="rounded bg-teal-700 px-4 py-2 text-sm text-white">Reset password</button></div></form></div>}</div>;
}

function SystemPermissionPanel({ roles, permissions, users, onRefresh }: { roles: Role[]; permissions: Permission[]; users: User[]; onRefresh: () => Promise<void> }) {
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [permissionForm, setPermissionForm] = useState({ name: "", description: "" });
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserRoleId, setSelectedUserRoleId] = useState("");
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!selectedRoleId) {
      const timer = window.setTimeout(() => setAssignedPermissionIds([]), 0);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      void authFetch(`/api/master-registry/roles/${selectedRoleId}/permissions`)
        .then((response) => read<Permission[]>(response))
        .then((items) => setAssignedPermissionIds(items.map((item) => item.id)))
        .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Unable to load role permissions."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedRoleId]);

  const post = async (path: string, body: unknown) => {
    const response = await authFetch(path, { method: "POST", body: JSON.stringify(body) });
    await read(response);
  };

  const createRole = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roleForm.name.trim()) return;
    setSaving(true);
    try {
      await post("/api/master-registry/roles", { code: nextRoleCode(roles), name: roleForm.name.trim(), description: roleForm.description.trim() || null });
      setRoleForm({ name: "", description: "" }); setMessage("Role created successfully."); await onRefresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to create role."); }
    finally { setSaving(false); }
  };

  const createPermission = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = permissionForm.name.trim();
    if (!name) return;
    setSaving(true);
    try {
      await post("/api/master-registry/permissions", { code: permissionCode(name), name, description: permissionForm.description.trim() || null });
      setPermissionForm({ name: "", description: "" }); setMessage("Permission created successfully."); await onRefresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to create permission."); }
    finally { setSaving(false); }
  };

  const syncSystemPermissions = async () => {
    setSaving(true);
    try {
      await read(await authFetch("/api/master-registry/permissions/sync-system", { method: "POST", body: JSON.stringify({}) }));
      setMessage("System permission catalog is ready."); await onRefresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to sync system permissions."); }
    finally { setSaving(false); }
  };

  const togglePermission = async (permission: Permission, checked: boolean) => {
    if (!selectedRoleId) { setMessage("Select a role before ticking permissions."); return; }
    try {
      const path = "/api/master-registry/role-permissions";
      const body = { roleId: Number(selectedRoleId), permissionId: permission.id };
      const response = await authFetch(path, { method: checked ? "POST" : "DELETE", body: JSON.stringify(body) });
      await read(response);
      setAssignedPermissionIds((current) => checked ? [...new Set([...current, permission.id])] : current.filter((id) => id !== permission.id));
      setMessage(`${permission.name} ${checked ? "assigned" : "removed"}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update permission."); }
  };

  const assignRole = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await post("/api/master-registry/user-roles", { userId: Number(selectedUserId), roleId: Number(selectedUserRoleId) }); setMessage("Role assigned to user."); await onRefresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to assign role."); }
  };

  return <div className="grid gap-4 xl:grid-cols-2">
    <Panel title="Roles"><form onSubmit={createRole} className="mb-4 grid gap-3 sm:grid-cols-2"><label className="block text-xs font-medium text-slate-600">Role code<input readOnly value={nextRoleCode(roles)} className="mt-1 w-full rounded border bg-slate-100 px-3 py-2 text-sm" /></label><Field label="Role name" required value={roleForm.name} onChange={(value) => setRoleForm({ ...roleForm, name: value })} /><Field label="Description" value={roleForm.description} onChange={(value) => setRoleForm({ ...roleForm, description: value })} /><button disabled={saving} className="rounded bg-teal-700 px-4 py-2 text-sm text-white sm:col-span-2">Create role</button></form><div className="space-y-2">{roles.map((item) => <div key={item.id} className="rounded border px-3 py-2"><b>{item.code}</b> · {item.name}<div className="text-xs text-slate-500">{item.description || "No description"}</div></div>)}</div></Panel>
    <Panel title="Permissions"><form onSubmit={createPermission} className="mb-3 grid gap-3 sm:grid-cols-2"><label className="block text-xs font-medium text-slate-600">Generated permission code<input readOnly value={permissionForm.name ? permissionCode(permissionForm.name) : "PERM_..."} className="mt-1 w-full rounded border bg-slate-100 px-3 py-2 text-sm" /></label><Field label="Permission name" required value={permissionForm.name} onChange={(value) => setPermissionForm({ ...permissionForm, name: value })} /><Field label="Description" value={permissionForm.description} onChange={(value) => setPermissionForm({ ...permissionForm, description: value })} /><button disabled={saving} className="rounded bg-teal-700 px-4 py-2 text-sm text-white sm:col-span-2">Create permission</button></form><button type="button" disabled={saving} onClick={() => void syncSystemPermissions()} className="mb-3 rounded border border-teal-300 px-3 py-2 text-xs font-medium text-teal-800">Sync all system permissions</button><div className="max-h-[390px] space-y-2 overflow-y-auto pr-1">{permissions.map((item) => <div key={item.id} className="rounded border px-3 py-2"><b>{item.code}</b> · {item.name}<div className="text-xs text-slate-500">{item.description || "No description"}</div></div>)}</div></Panel>
    <Panel title="Assign role to user"><form onSubmit={assignRole} className="grid gap-3 sm:grid-cols-2"><select required value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className="rounded border px-3 py-2 text-sm"><option value="">Select user</option>{users.map((item) => <option key={item.id} value={item.id}>{item.username} · {item.companyCode}</option>)}</select><select required value={selectedUserRoleId} onChange={(event) => setSelectedUserRoleId(event.target.value)} className="rounded border px-3 py-2 text-sm"><option value="">Select role</option>{roles.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select><button className="rounded bg-teal-700 px-4 py-2 text-sm text-white sm:col-span-2">Assign role</button></form></Panel>
    <Panel title="Role permission checklist"><select value={selectedRoleId} onChange={(event) => { setSelectedRoleId(event.target.value); setAssignedPermissionIds([]); }} className="mb-3 w-full rounded border px-3 py-2 text-sm"><option value="">Select role to configure permissions</option>{roles.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select><p className="mb-3 text-xs text-slate-500">Tick a function to assign it to the selected role. Untick removes it.</p><div className="grid max-h-[430px] gap-2 overflow-y-auto sm:grid-cols-2">{permissions.map((item) => <label key={item.id} className="flex cursor-pointer items-start gap-2 rounded border px-3 py-2 text-sm hover:bg-slate-50"><input type="checkbox" disabled={!selectedRoleId} checked={assignedPermissionIds.includes(item.id)} onChange={(event) => void togglePermission(item, event.target.checked)} className="mt-0.5 accent-teal-700" /><span><b>{item.name}</b><small className="block text-[11px] text-slate-400">{item.code}</small></span></label>)}</div>{message && <p className="mt-3 rounded bg-slate-50 px-3 py-2 text-xs text-slate-600">{message}</p>}</Panel>
  </div>;
}

function LogTable({ rows }: { rows: LogRow[] }) {
  return <div className="max-h-[560px] overflow-auto"><table className="w-full text-xs"><tbody>{rows.map((row, index) => <tr key={index} className="border-b align-top"><td className="p-2 text-slate-500">{String(row.loginAt ?? row.createdAt ?? "-")}</td><td className="p-2">{String(row.action ?? row.isSuccess === true ? "Successful login" : row.failureReason ?? "-")}</td><td className="p-2 text-slate-500">{String(row.ipAddress ?? row.entityName ?? "-")}</td></tr>)}{rows.length === 0 && <tr><td className="p-4 text-center text-slate-400">No activity records.</td></tr>}</tbody></table></div>;
}
