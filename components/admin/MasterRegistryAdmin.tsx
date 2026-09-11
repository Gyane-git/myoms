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
  const [user, setUser] = useState({ companyId: "", username: "", password: "", fullName: "" });
  const [role, setRole] = useState({ code: "", name: "", description: "" });
  const [permission, setPermission] = useState({ code: "", name: "", description: "" });
  const [assignment, setAssignment] = useState({ userId: "", roleId: "", permissionRoleId: "", permissionId: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [companiesResponse, usersResponse, rolesResponse, permissionsResponse] = await Promise.all([
        authFetch("/api/master-registry/companies"), authFetch("/api/master-registry/users"), authFetch("/api/master-registry/roles"), authFetch("/api/master-registry/permissions"),
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
  const createUser = async (event: React.FormEvent) => { event.preventDefault(); await request("/api/master-registry/users", { method: "POST", body: JSON.stringify({ ...user, companyId: Number(user.companyId) }) }); setUser({ companyId: "", username: "", password: "", fullName: "" }); };
  const createRole = async (event: React.FormEvent) => { event.preventDefault(); await request("/api/master-registry/roles", { method: "POST", body: JSON.stringify(role) }); setRole({ code: "", name: "", description: "" }); };
  const createPermission = async (event: React.FormEvent) => { event.preventDefault(); await request("/api/master-registry/permissions", { method: "POST", body: JSON.stringify(permission) }); setPermission({ code: "", name: "", description: "" }); };
  const provision = async (id: number) => { await request(`/api/master-registry/companies/${id}/provision`, { method: "POST" }); };
  const toggleCompany = async (row: Company) => { await request(`/api/master-registry/companies/${row.id}/status`, { method: "PATCH", body: JSON.stringify({ isActive: !row.isActive }) }); };
  const toggleUser = async (row: User) => { await request(`/api/master-registry/users/${row.id}/status`, { method: "PATCH", body: JSON.stringify({ isActive: !row.isActive }) }); };
  const assignRole = async (event: React.FormEvent) => { event.preventDefault(); await request("/api/master-registry/user-roles", { method: "POST", body: JSON.stringify({ userId: Number(assignment.userId), roleId: Number(assignment.roleId) }) }); };
  const assignPermission = async (event: React.FormEvent) => { event.preventDefault(); await request("/api/master-registry/role-permissions", { method: "POST", body: JSON.stringify({ roleId: Number(assignment.permissionRoleId), permissionId: Number(assignment.permissionId) }) }); };

  const tabs = useMemo(() => [{ id: "companies" as Tab, label: "Companies", icon: Building2 }, { id: "users" as Tab, label: "Users", icon: UserPlus }, { id: "security" as Tab, label: "Roles & Permissions", icon: ShieldCheck }, { id: "activity" as Tab, label: "Activity", icon: ClipboardList }], []);
  return <div className="min-h-screen bg-slate-100 p-3 text-slate-700"><div className="mb-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-600">BIZ Owner Console</p><h1 className="text-xl font-semibold text-slate-900">MasterRegistry Administration</h1><p className="mt-1 text-sm text-slate-500">Manage companies, tenant databases, users, roles, permissions and security activity.</p></div>
    {error && <p className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{notice && <p className="mb-3 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}
    <div className="mb-4 flex flex-wrap gap-2">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setTab(id)} className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium ${tab === id ? "bg-teal-700 text-white" : "border border-slate-300 bg-white text-slate-600"}`}><Icon size={16} />{label}</button>)}</div>
    {loading ? <Panel title="Loading">Loading MasterRegistry data…</Panel> : <>
      {tab === "companies" && <div className="grid gap-4 xl:grid-cols-[380px_1fr]"><Panel title="Create Company"><form onSubmit={createCompany} className="grid gap-3"><Field label="Company code" value={company.code} required onChange={(value) => setCompany({ ...company, code: value })} /><Field label="Company name" value={company.name} required onChange={(value) => setCompany({ ...company, name: value })} /><Field label="Database server" value={company.databaseServer} required onChange={(value) => setCompany({ ...company, databaseServer: value })} /><Field label="Database name" value={company.databaseName} required onChange={(value) => setCompany({ ...company, databaseName: value })} /><Field label="Subscription plan" value={company.subscriptionPlan} onChange={(value) => setCompany({ ...company, subscriptionPlan: value })} /><div className="grid grid-cols-2 gap-3"><Field label="Start date" type="date" value={company.subscriptionStart} onChange={(value) => setCompany({ ...company, subscriptionStart: value })} /><Field label="End date" type="date" value={company.subscriptionEnd} onChange={(value) => setCompany({ ...company, subscriptionEnd: value })} /></div><button className="flex items-center justify-center gap-2 rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white"><Plus size={16} /> Create company</button></form></Panel><Panel title={`Companies · ${companies.length}`}><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">Code</th><th className="p-3">Company</th><th className="p-3">Database</th><th className="p-3">Plan</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead><tbody>{companies.map((row) => <tr key={row.id} className="border-t"><td className="p-3 font-medium text-teal-800">{row.code}</td><td className="p-3">{row.name}</td><td className="p-3">{row.databaseServer}/{row.databaseName}</td><td className="p-3">{row.subscriptionPlan}</td><td className="p-3">{row.isActive ? "Active" : "Inactive"}</td><td className="p-3 text-right"><button type="button" onClick={() => void provision(row.id)} className="mr-3 text-teal-700">Provision</button><button type="button" onClick={() => void toggleCompany(row)} className="text-slate-600">{row.isActive ? "Disable" : "Enable"}</button></td></tr>)}</tbody></table></div></Panel></div>}
      {tab === "users" && <div className="grid gap-4 xl:grid-cols-[380px_1fr]"><Panel title="Create User"><form onSubmit={createUser} className="grid gap-3"><label className="block text-xs font-medium text-slate-600">Company<select required value={user.companyId} onChange={(event) => setUser({ ...user, companyId: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"><option value="">Select company</option>{companies.filter((item) => item.isActive).map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}</select></label><Field label="Full name" required value={user.fullName} onChange={(value) => setUser({ ...user, fullName: value })} /><Field label="Username" required value={user.username} onChange={(value) => setUser({ ...user, username: value })} /><Field label="Temporary password" type="password" required value={user.password} onChange={(value) => setUser({ ...user, password: value })} /><button className="flex items-center justify-center gap-2 rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white"><UserPlus size={16} /> Create user</button></form></Panel><Panel title={`Users · ${users.length}`}><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">User</th><th className="p-3">Company</th><th className="p-3">Roles</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr></thead><tbody>{users.map((row) => <tr key={row.id} className="border-t"><td className="p-3"><b>{row.fullName}</b><div className="text-xs text-slate-400">{row.username}</div></td><td className="p-3">{row.companyCode}</td><td className="p-3">{row.roles.join(", ") || "No role"}</td><td className="p-3">{row.isActive ? "Active" : "Inactive"}</td><td className="p-3 text-right"><button type="button" onClick={() => void toggleUser(row)} className="text-slate-600">{row.isActive ? "Disable" : "Enable"}</button></td></tr>)}</tbody></table></div></Panel></div>}
      {tab === "security" && <div className="grid gap-4 xl:grid-cols-2"><Panel title="Roles"><form onSubmit={createRole} className="mb-4 grid gap-3 sm:grid-cols-3"><Field label="Code" required value={role.code} onChange={(value) => setRole({ ...role, code: value })} /><Field label="Name" required value={role.name} onChange={(value) => setRole({ ...role, name: value })} /><Field label="Description" value={role.description} onChange={(value) => setRole({ ...role, description: value })} /><button className="rounded bg-teal-700 px-4 py-2 text-sm text-white sm:col-span-3">Create role</button></form><div className="space-y-2">{roles.map((item) => <div key={item.id} className="rounded border px-3 py-2"><b>{item.code}</b> · {item.name}<div className="text-xs text-slate-500">{item.description || "No description"}</div></div>)}</div></Panel><Panel title="Permissions"><form onSubmit={createPermission} className="mb-4 grid gap-3 sm:grid-cols-3"><Field label="Code" required value={permission.code} onChange={(value) => setPermission({ ...permission, code: value })} /><Field label="Name" required value={permission.name} onChange={(value) => setPermission({ ...permission, name: value })} /><Field label="Description" value={permission.description} onChange={(value) => setPermission({ ...permission, description: value })} /><button className="rounded bg-teal-700 px-4 py-2 text-sm text-white sm:col-span-3">Create permission</button></form><div className="space-y-2">{permissions.map((item) => <div key={item.id} className="rounded border px-3 py-2"><b>{item.code}</b> · {item.name}<div className="text-xs text-slate-500">{item.description || "No description"}</div></div>)}</div></Panel><Panel title="Assign role to user"><form onSubmit={assignRole} className="grid gap-3 sm:grid-cols-2"><select required value={assignment.userId} onChange={(event) => setAssignment({ ...assignment, userId: event.target.value })} className="rounded border px-3 py-2 text-sm"><option value="">Select user</option>{users.map((item) => <option key={item.id} value={item.id}>{item.username} · {item.companyCode}</option>)}</select><select required value={assignment.roleId} onChange={(event) => setAssignment({ ...assignment, roleId: event.target.value })} className="rounded border px-3 py-2 text-sm"><option value="">Select role</option>{roles.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select><button className="rounded bg-teal-700 px-4 py-2 text-sm text-white sm:col-span-2">Assign role</button></form></Panel><Panel title="Assign permission to role"><form onSubmit={assignPermission} className="grid gap-3 sm:grid-cols-2"><select required value={assignment.permissionRoleId} onChange={(event) => setAssignment({ ...assignment, permissionRoleId: event.target.value })} className="rounded border px-3 py-2 text-sm"><option value="">Select role</option>{roles.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select><select required value={assignment.permissionId} onChange={(event) => setAssignment({ ...assignment, permissionId: event.target.value })} className="rounded border px-3 py-2 text-sm"><option value="">Select permission</option>{permissions.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select><button className="rounded bg-teal-700 px-4 py-2 text-sm text-white sm:col-span-2">Assign permission</button></form></Panel></div>}
      {tab === "activity" && <div className="grid gap-4 xl:grid-cols-2"><Panel title="Login history"><LogTable rows={loginHistory} /></Panel><Panel title="Audit logs"><LogTable rows={auditLogs} /></Panel></div>}
    </>}
  </div>;
}

function LogTable({ rows }: { rows: LogRow[] }) {
  return <div className="max-h-[560px] overflow-auto"><table className="w-full text-xs"><tbody>{rows.map((row, index) => <tr key={index} className="border-b align-top"><td className="p-2 text-slate-500">{String(row.loginAt ?? row.createdAt ?? "-")}</td><td className="p-2">{String(row.action ?? row.isSuccess === true ? "Successful login" : row.failureReason ?? "-")}</td><td className="p-2 text-slate-500">{String(row.ipAddress ?? row.entityName ?? "-")}</td></tr>)}{rows.length === 0 && <tr><td className="p-4 text-center text-slate-400">No activity records.</td></tr>}</tbody></table></div>;
}
