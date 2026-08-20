"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Plus,
  FileEdit,
  X,
  FileDown,
  Upload,
  RotateCw,
  List,
  MoreHorizontal,
  Search,
  ScanSearch,
  Save,
  Undo2,
  ChevronDown,
  ChevronRight,
  Bell,
} from "lucide-react";

const DB_NAME = "ERPDEMO101";

type GroupOption = {
  group: string;
  subGroup: string;
};

function toNumber(value: string) {
  if (!value.trim()) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

// ---------- Reusable field primitives ----------

function TextField({
  label,
  required,
  value,
  onChange,
  disabled,
  withSearch,
  withScan,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  withSearch?: boolean;
  withScan?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3">
      <label className="text-sm text-slate-600">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      <div className="flex gap-1.5">
        <input
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`h-9 w-full rounded-md border px-3 text-sm outline-none transition-colors
            ${disabled ? "bg-slate-100 border-slate-200 text-slate-400" : "bg-white border-slate-300"}
            ${!disabled && value === "" && required ? "border-amber-300 bg-amber-50/60" : ""}
            focus:border-sky-400 focus:ring-2 focus:ring-sky-100`}
        />
        {withSearch && (
          <button
            type="button"
            aria-label={`Search ${label}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100"
          >
            <Search size={15} />
          </button>
        )}
        {withScan && (
          <button
            type="button"
            aria-label="Advanced search"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-sky-300 bg-sky-50 text-sky-600 hover:bg-sky-100"
          >
            <ScanSearch size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3">
      <label className="text-sm text-slate-600">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o || "—"}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 text-sm text-slate-600 select-none">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
      />
    </label>
  );
}

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 border-b border-purple-200 pb-1.5 text-[15px] font-semibold text-purple-800 underline decoration-purple-300 underline-offset-4">
      {children}
    </h3>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  disabled,
  highlight,
  href,
}: {
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
  highlight?: boolean;
  href?: string;
}) {
  const className = `flex items-center gap-1.5 text-[13px] transition-colors
        ${disabled ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:text-slate-900"}`;

  const content = (
    <>
      <span
        className={`grid h-6 w-6 place-items-center rounded-full border
          ${disabled ? "border-slate-200" : "border-slate-400"}
          ${highlight ? "border-teal-500 text-teal-600" : ""}`}
      >
        <Icon size={13} />
      </span>
      {label}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={className}
    >
      {content}
    </button>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 bg-slate-50 px-6 py-3 text-left text-lg text-slate-700 hover:bg-slate-100"
      >
        {open ? (
          <ChevronDown size={18} className="text-slate-400" />
        ) : (
          <ChevronRight size={18} className="text-slate-400" />
        )}
        {title}
      </button>
      {open && <div className="px-6 py-5">{children}</div>}
    </div>
  );
}

// ---------- Page ----------

export default function ProductNewPage() {
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [group, setGroup] = useState("");
  const [subGroup, setSubGroup] = useState("");
  const [group2, setGroup2] = useState("");
  const [group3, setGroup3] = useState("");
  const [group4, setGroup4] = useState("");
  const [code, setCode] = useState("");
  const [productCategory, setProductCategory] = useState("Inventory");
  const [menu, setMenu] = useState("");
  const [grading, setGrading] = useState("");
  const [hsCode, setHsCode] = useState("");

  const [costRate, setCostRate] = useState("");
  const [marginPct, setMarginPct] = useState("");
  const [mrp, setMrp] = useState("");
  const [rate, setRate] = useState("");
  const [trade, setTrade] = useState("");
  const [mop, setMop] = useState("");

  const [type, setType] = useState("Finished Goods");
  const [method, setMethod] = useState("FIFO");
  const [unit, setUnit] = useState("");
  const [altUnit, setAltUnit] = useState("");
  const [division, setDivision] = useState("");
  const [factor1, setFactor1] = useState("");
  const [factor2, setFactor2] = useState("");

  const [batch, setBatch] = useState(false);
  const [size, setSize] = useState(false);
  const [serial, setSerial] = useState(false);
  const [lock, setLock] = useState(false);
  const [exportFlag, setExportFlag] = useState(false);

  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadGroups() {
      setGroupLoading(true);
      setGroupError("");

      try {
        const res = await fetch("/api/product-groups", {
          cache: "no-store",
        });

        const data = (await res.json()) as {
          groups?: GroupOption[];
          message?: string;
        };

        if (!res.ok) {
          throw new Error(data.message || "Failed to load groups");
        }

        if (active) {
          setGroupOptions(data.groups || []);
        }
      } catch (error) {
        if (!active) return;
        setGroupError(
          error instanceof Error ? error.message : "Failed to load groups"
        );
      } finally {
        if (active) setGroupLoading(false);
      }
    }

    loadGroups();

    return () => {
      active = false;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveMessage("");
    setSaveError("");

    try {
      if (!name.trim()) {
        throw new Error("Product name is required");
      }

      if (!group.trim()) {
        throw new Error("Group is required");
      }

      const payload = {
        objLedgerDetails: [
          {
            GroupName: group.trim(),
            DbName: DB_NAME,
            SubGroupName: subGroup.trim(),
            ProductUnit: unit.trim(),
            ProductAltUnit: altUnit.trim(),
            SalesRate: toNumber(mrp || rate),
            MRP: toNumber(mrp),
            TradeRate: toNumber(trade),
            PurchaseRate: toNumber(trade),
            ProductCode: code.trim(),
            ProductName: name.trim(),
          },
        ],
      };

      const res = await fetch("/api/product-save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Product save failed");
      }

      setSaveMessage(data.message || "Product saved successfully");
      setName("");
      setAlias("");
      setGroup("");
      setSubGroup("");
      setCode("");
      setCostRate("");
      setMarginPct("");
      setMrp("");
      setRate("");
      setTrade("");
      setMop("");
      setUnit("");
      setAltUnit("");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Product save failed"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 via-sky-400 to-teal-400" />

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-6 border-b border-slate-200 px-6 py-3">
        <ToolbarButton icon={Plus} label="New" />
        <ToolbarButton icon={FileEdit} label="Edit" disabled />
        <ToolbarButton icon={X} label="Delete" disabled />
        <ToolbarButton icon={FileDown} label="Download Templete" />
        <ToolbarButton icon={Upload} label="Import" />
        <ToolbarButton icon={RotateCw} label="Update" />
        <ToolbarButton icon={List} label="List" href="/product" />
        <ToolbarButton icon={MoreHorizontal} label="Branch Rate" />
        <ToolbarButton icon={MoreHorizontal} label="Product List" />
        <div className="ml-auto flex items-center gap-2 text-xl font-semibold tracking-wide text-slate-800">
          PRODUCT
          <span className="rounded bg-teal-500 px-2 py-0.5 text-xs font-bold text-white">
            NEW
          </span>
        </div>
      </div>

      {/* General information */}
      <div className="bg-slate-50 px-6 py-3 text-lg text-slate-700">
        General Information
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 rounded-md border border-sky-100 bg-sky-50/40 p-5 lg:grid-cols-3">
          {/* Info panel */}
          <div className="rounded-md border border-sky-100 bg-sky-50/60 p-5">
            <PanelHeading>Info</PanelHeading>
            <div className="space-y-3">
              <TextField label="Product Name" required value={name} onChange={setName} withSearch withScan />
              <TextField label="Alias" value={alias} onChange={setAlias} />
              <div className="grid grid-cols-[110px_1fr] items-center gap-3">
                <label className="text-sm text-slate-600">
                  Group<span className="text-rose-500"> *</span>
                </label>
                <select
                  value={group}
                  onChange={(e) => {
                    const nextGroup = e.target.value;
                    setGroup(nextGroup);
                    const matched = groupOptions.find(
                      (option) => option.group === nextGroup
                    );
                    setSubGroup(matched?.subGroup || "");
                  }}
                  disabled={groupLoading}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {groupLoading ? "Loading groups..." : "Select a group"}
                  </option>
                  {groupOptions.map((option) => (
                    <option key={option.group} value={option.group}>
                      {option.group}
                    </option>
                  ))}
                </select>
              </div>
              <TextField label="Sub Group" value={subGroup} onChange={setSubGroup} withSearch />
              {/* <TextField label="Catagory" value={category} onChange={setCategory} withSearch /> */}
              <TextField label="Group 2" value={group2} onChange={setGroup2} withSearch />
              <TextField label="Group 3" value={group3} onChange={setGroup3} withSearch disabled />
              <TextField label="Group 4" value={group4} onChange={setGroup4} withSearch disabled />

              <div className="grid grid-cols-2 gap-3">
                <div className="grid grid-cols-[60px_1fr] items-center gap-2">
                  <label className="text-sm text-slate-600">Code</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                    <span className="text-amber-500">✻</span>
                  </div>
                </div>
                <div className="grid grid-cols-[70px_1fr] items-center gap-2">
                  <label className="text-sm text-slate-600">Category</label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  >
                    <option>Inventory</option>
                    <option>Service</option>
                    <option>Asset</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="grid grid-cols-[50px_1fr] items-center gap-2">
                  <label className="text-sm text-slate-600">Menu</label>
                  <select
                    value={menu}
                    onChange={(e) => setMenu(e.target.value)}
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">—</option>
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
                <div className="grid grid-cols-[56px_1fr] items-center gap-2">
                  <label className="text-sm text-slate-600">Grading</label>
                  <input
                    value={grading}
                    onChange={(e) => setGrading(e.target.value)}
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div className="grid grid-cols-[60px_1fr] items-center gap-2">
                  <label className="text-sm text-slate-600">HSCode</label>
                  <input
                    value={hsCode}
                    onChange={(e) => setHsCode(e.target.value)}
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>
              {groupError && <p className="text-xs text-rose-600">{groupError}</p>}
            </div>
          </div>

          {/* Price Details panel */}
          <div className="rounded-md border border-sky-100 bg-sky-50/60 p-5">
            <PanelHeading>Price Details</PanelHeading>
            <div className="space-y-3">
              <TextField label="Cost Rate" value={costRate} onChange={setCostRate} />
              <TextField label="Margin %" value={marginPct} onChange={setMarginPct} />
              <TextField label="MRP" value={mrp} onChange={setMrp} />
              <TextField label="Rate" value={rate} onChange={setRate} />
              <TextField label="Trade" value={trade} onChange={setTrade} />
              <TextField label="MOP" value={mop} onChange={setMop} />
            </div>
          </div>

          {/* Utilities panel */}
          <div className="rounded-md border border-sky-100 bg-sky-50/60 p-5">
            <PanelHeading>Utilities</PanelHeading>
            <div className="space-y-3">
              <SelectField
                label="Type"
                required
                value={type}
                onChange={setType}
                options={["Finished Goods", "Raw Material", "Semi Finished", "Service"]}
              />
              <SelectField
                label="Method"
                value={method}
                onChange={setMethod}
                options={["FIFO", "LIFO", "Weighted Average"]}
              />
              <SelectField label="Unit" value={unit} onChange={setUnit} options={["", "Pcs", "Kg", "Ltr", "Box"]} />
              <SelectField
                label="Alt Unit"
                value={altUnit}
                onChange={setAltUnit}
                options={["", "Pcs", "Kg", "Ltr", "Box"]}
              />
              <TextField label="Division" value={division} onChange={setDivision} withSearch />

              <div className="grid grid-cols-[110px_1fr_1fr] items-center gap-2">
                <label className="text-sm text-slate-600">Factor</label>
                <input
                  value={factor1}
                  onChange={(e) => setFactor1(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
                <input
                  value={factor2}
                  onChange={(e) => setFactor2(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <CheckField label="Batch" checked={batch} onChange={setBatch} />
                <CheckField label="Size" checked={size} onChange={setSize} />
                <CheckField label="Serial" checked={serial} onChange={setSerial} />
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <CheckField label="Lock" checked={lock} onChange={setLock} />
                <CheckField label="Export" checked={exportFlag} onChange={setExportFlag} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible sections */}
      <CollapsibleSection title="Ledger Information">
        <p className="text-sm text-slate-500">Ledger mapping fields go here.</p>
      </CollapsibleSection>
      <CollapsibleSection title="Other Information">
        <p className="text-sm text-slate-500">Additional product attributes go here.</p>
      </CollapsibleSection>
      <CollapsibleSection title="Unit Conversion">
        <p className="text-sm text-slate-500">Unit conversion table goes here.</p>
      </CollapsibleSection>
      <CollapsibleSection title="Scheme">
        <p className="text-sm text-slate-500">Scheme / discount rules go here.</p>
      </CollapsibleSection>

      {/* Footer actions */}
      {(saveMessage || saveError) && (
        <div
          className={`mx-6 mt-4 rounded-md border px-4 py-3 text-sm ${
            saveError
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {saveError || saveMessage}
        </div>
      )}
      <div className="flex items-center justify-end gap-6 border-t border-slate-200 px-6 py-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full border border-slate-400">
            <Save size={14} />
          </span>
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setName("");
            setAlias("");
            setGroup("");
            setSubGroup("");
            setCode("");
            setCostRate("");
            setMarginPct("");
            setMrp("");
            setRate("");
            setTrade("");
            setMop("");
            setUnit("");
            setAltUnit("");
            setSaveMessage("");
            setSaveError("");
          }}
          className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full border border-slate-400">
            <Undo2 size={14} />
          </span>
          Cancel
        </button>
      </div>

      {/* floating notification button, mirroring the reference screenshot */}
      <button
        type="button"
        aria-label="Notifications"
        className="fixed bottom-6 right-6 grid h-12 w-12 place-items-center rounded-full bg-rose-500 text-white shadow-lg hover:bg-rose-600"
      >
        <Bell size={18} />
      </button>
    </div>
  );
}
