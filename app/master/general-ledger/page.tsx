"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AddressBlock {
  addressI: string;
  country: string;
  telNoI: string;
  mobile: string;
  email: string;
  contactPerson: string;
  state: string;
  addressII: string;
  telNoII: string;
  fax: string;
}

interface UnitRow {
  code: string;
  name: string;
  selected: boolean;
}

interface InterestRow {
  id: number;
  startDays: string;
  endDays: string;
  percentage: string;
}

interface BankRow {
  id: number;
  bankName: string;
  branch: string;
  startDate: string;
  endDate: string;
  amount: string;
  collateral: string;
  attachment: string;
}

const EMPTY_ADDRESS: AddressBlock = {
  addressI: "",
  country: "",
  telNoI: "",
  mobile: "",
  email: "",
  contactPerson: "",
  state: "",
  addressII: "",
  telNoII: "",
  fax: "",
};

// Lookup options — replace with fetches to their respective master APIs
// (/api/master/account-group, account-sub-group, account-add-group1/2, etc.)
const GROUP_OPTIONS = ["A", "abc", "Administrative Expenses", "Current Assets", "SUNDRY DEBTORS"];
const SUBGROUP_OPTIONS = ["bca", "Beer", "dc", "sssss"];
const ADDGROUP1_OPTIONS = ["bbca", "fff", "musi bhaiiii"];
const ADDGROUP2_OPTIONS = ["bbbca", "fffff"];
const AREA_OPTIONS = ["Kathmandu", "Pokhara", "Biratnagar"];
const AGENT_OPTIONS = ["Agent A", "Agent B"];
const SCHEME_OPTIONS = ["Scheme 1", "Scheme 2"];
const CURRENCY_OPTIONS = ["NRS", "USD", "INR"];
const LEDGER_TYPE_OPTIONS = ["Regular", "Sub Ledger"];
const CATEGORY_OPTIONS = ["Other", "Customer", "Vendor", "Customer/Vendor", "Cash Book", "Bank Book"];
const WARNING_TYPE_OPTIONS = ["Warning", "Ignore", "Block"];

const COMPANY_UNITS: UnitRow[] = [
  { code: "U001", name: "Head Office", selected: false },
  { code: "U002", name: "Branch - Pokhara", selected: false },
  { code: "U003", name: "Branch - Biratnagar", selected: false },
];

type PanelKey = "general" | "address" | "unit" | "interest" | "bank";

export default function GeneralLedgerPage() {
  const [openPanel, setOpenPanel] = useState<PanelKey>("general");

  // General information
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [unicodeName, setUnicodeName] = useState("");
  const [group, setGroup] = useState("");
  const [subGroup, setSubGroup] = useState("");
  const [addGroup1, setAddGroup1] = useState("");
  const [addGroup2, setAddGroup2] = useState("");
  const [panNo, setPanNo] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [accCode, setAccCode] = useState("");
  const [acType, setAcType] = useState("");
  const [area, setArea] = useState("");
  const [agent, setAgent] = useState("");
  const [currency, setCurrency] = useState("");
  const [scheme, setScheme] = useState("");
  const [ledgerType, setLedgerType] = useState("");
  const [category, setCategory] = useState("Other");
  const [warningType, setWarningType] = useState("Warning");
  const [creditLimit, setCreditLimit] = useState("");
  const [creditDays, setCreditDays] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [subledger, setSubledger] = useState(false);
  const [documentAdj, setDocumentAdj] = useState(false);
  const [cardType, setCardType] = useState(false);
  const [vatApplicable, setVatApplicable] = useState(false);
  const [tdsApplicable, setTdsApplicable] = useState(false);

  // Address information
  const [address, setAddress] = useState<AddressBlock>(EMPTY_ADDRESS);
  const [shipping1, setShipping1] = useState<AddressBlock>(EMPTY_ADDRESS);
  const [shipping2, setShipping2] = useState<AddressBlock>(EMPTY_ADDRESS);
  const [lockForBilling, setLockForBilling] = useState(false);
  const [salesAmountNotification, setSalesAmountNotification] = useState(false);
  const [salesAmountLimit, setSalesAmountLimit] = useState("");
  const [blockBackDatedEntry, setBlockBackDatedEntry] = useState("");
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);

  // Unit
  const [units, setUnits] = useState<UnitRow[]>(COMPANY_UNITS);

  // Interest
  const [interestRows, setInterestRows] = useState<InterestRow[]>([
    { id: 1, startDays: "0", endDays: "", percentage: "" },
  ]);

  // Bank Guarantee
  const [bankRows, setBankRows] = useState<BankRow[]>([
    { id: 1, bankName: "", branch: "", startDate: "", endDate: "", amount: "", collateral: "", attachment: "" },
  ]);

  function togglePanel(key: PanelKey) {
    setOpenPanel((prev) => (prev === key ? prev : key));
  }

  // ---------------------------------------------------------------------
  // VAT / TDS mutual exclusivity
  // ---------------------------------------------------------------------
  function handleVatChange(checked: boolean) {
    setVatApplicable(checked);
    if (checked) setTdsApplicable(false);
  }

  // ---------------------------------------------------------------------
  // Address block field updater helper
  // ---------------------------------------------------------------------
  function updateAddress(
    setter: React.Dispatch<React.SetStateAction<AddressBlock>>,
    field: keyof AddressBlock,
    value: string
  ) {
    setter((prev) => ({ ...prev, [field]: value }));
  }

  // ---------------------------------------------------------------------
  // Unit helpers
  // ---------------------------------------------------------------------
  function selectAllUnits() {
    setUnits((prev) => prev.map((u) => ({ ...u, selected: true })));
  }
  function unselectAllUnits() {
    setUnits((prev) => prev.map((u) => ({ ...u, selected: false })));
  }
  function toggleUnit(code: string) {
    setUnits((prev) => prev.map((u) => (u.code === code ? { ...u, selected: !u.selected } : u)));
  }

  // ---------------------------------------------------------------------
  // Interest rows
  // ---------------------------------------------------------------------
  function addInterestRow() {
    setInterestRows((prev) => {
      const last = prev[prev.length - 1];
      const nextId = prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1;
      return [...prev, { id: nextId, startDays: last?.endDays || "0", endDays: "", percentage: "" }];
    });
  }
  function updateInterestRow(id: number, field: keyof InterestRow, value: string) {
    setInterestRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }
  function deleteInterestRow(id: number) {
    setInterestRows((prev) => prev.filter((r) => r.id !== id));
  }

  // ---------------------------------------------------------------------
  // Bank guarantee rows
  // ---------------------------------------------------------------------
  function addBankRow() {
    setBankRows((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1;
      return [
        ...prev,
        { id: nextId, bankName: "", branch: "", startDate: "", endDate: "", amount: "", collateral: "", attachment: "" },
      ];
    });
  }
  function updateBankRow(id: number, field: keyof BankRow, value: string) {
    setBankRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }
  function deleteBankRow(id: number) {
    setBankRows((prev) => prev.filter((r) => r.id !== id));
  }

  // ---------------------------------------------------------------------
  // Header action buttons
  // ---------------------------------------------------------------------
  function resetForm() {
    setName("");
    setAlias("");
    setUnicodeName("");
    setGroup("");
    setSubGroup("");
    setAddGroup1("");
    setAddGroup2("");
    setPanNo("");
    setShortCode("");
    setAccCode("");
    setAcType("");
    setArea("");
    setAgent("");
    setCurrency("");
    setScheme("");
    setLedgerType("");
    setCategory("Other");
    setWarningType("Warning");
    setCreditLimit("");
    setCreditDays("");
    setInterestRate("");
    setSubledger(false);
    setDocumentAdj(false);
    setCardType(false);
    setVatApplicable(false);
    setTdsApplicable(false);
    setAddress(EMPTY_ADDRESS);
    setShipping1(EMPTY_ADDRESS);
    setShipping2(EMPTY_ADDRESS);
    setLockForBilling(false);
    setSalesAmountNotification(false);
    setSalesAmountLimit("");
    setBlockBackDatedEntry("");
    setAttachmentNames([]);
    setUnits(COMPANY_UNITS);
    setInterestRows([{ id: 1, startDays: "0", endDays: "", percentage: "" }]);
    setBankRows([
      { id: 1, bankName: "", branch: "", startDate: "", endDate: "", amount: "", collateral: "", attachment: "" },
    ]);
  }

  function handleSave() {
    if (!name.trim() || !group.trim() || !shortCode.trim()) {
      alert("Name, Group and Code are required.");
      return;
    }
    // POST to /api/general-ledger here
    alert("Ledger saved (demo only — wire this to your API).");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setAttachmentNames(Array.from(e.target.files).map((f) => f.name));
  }

  // ---------------------------------------------------------------------
  // Reusable field renderers
  // ---------------------------------------------------------------------
  const inputCls =
    "w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400";
  const labelCls = "mb-1 block text-xs font-medium text-gray-600";

  function renderAddressBlock(
    title: string,
    block: AddressBlock,
    setter: React.Dispatch<React.SetStateAction<AddressBlock>>
  ) {
    return (
      <div className="rounded border border-gray-200 bg-sky-50/40 p-3">
        <h4 className="mb-2 text-xs font-semibold text-gray-700 underline">{title}</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Address I</label>
            <input className={inputCls} value={block.addressI} onChange={(e) => updateAddress(setter, "addressI", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input className={inputCls} value={block.country} onChange={(e) => updateAddress(setter, "country", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Phone (Off)</label>
            <input className={inputCls} value={block.telNoI} onChange={(e) => updateAddress(setter, "telNoI", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Mobile</label>
            <input className={inputCls} value={block.mobile} onChange={(e) => updateAddress(setter, "mobile", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} value={block.email} onChange={(e) => updateAddress(setter, "email", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Contact Person</label>
            <input className={inputCls} value={block.contactPerson} onChange={(e) => updateAddress(setter, "contactPerson", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>State</label>
            <input className={inputCls} value={block.state} onChange={(e) => updateAddress(setter, "state", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Address II</label>
            <input className={inputCls} value={block.addressII} onChange={(e) => updateAddress(setter, "addressII", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Phone (Res)</label>
            <input className={inputCls} value={block.telNoII} onChange={(e) => updateAddress(setter, "telNoII", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Fax</label>
            <input className={inputCls} value={block.fax} onChange={(e) => updateAddress(setter, "fax", e.target.value)} />
          </div>
        </div>
      </div>
      );
  }

  function renderSelect(
    label: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    options: string[],
    required = false
  ) {
    return (
      <div>
        <label className={labelCls}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <select
          className={inputCls}
          value={value}
          onChange={(e) => setter(e.target.value)}
        >
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function renderInput(
    label: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    type = "text",
    required = false
  ) {
    return (
      <div>
        <label className={labelCls}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          className={inputCls}
          type={type}
          value={value}
          onChange={(e) => setter(e.target.value)}
        />
      </div>
    );
  }

  function renderPanelHeader(key: PanelKey, title: string) {
    const active = openPanel === key;

    return (
      <button
        type="button"
        onClick={() => togglePanel(key)}
        className={`flex w-full items-center justify-between border-b px-4 py-2.5 text-left text-sm font-semibold ${
          active
            ? "border-sky-200 bg-sky-50 text-gray-700"
            : "border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span>{title}</span>
        <span className="text-xs text-gray-400">
          {active ? "▲" : "▼"}
        </span>
      </button>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-700">
      <div className="flex min-h-screen w-full flex-col">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-t-4 border-t-sky-400 bg-gray-100 px-5 py-3 lg:px-6">
          <div>
            <h1 className="text-sm font-medium text-gray-700">
              General Ledger
            </h1>
            <p className="mt-0.5 text-xs text-gray-400">
              Create and maintain general ledger information
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-400"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
            >
              Save
            </button>
          </div>
        </div>

        {/* Full-width content */}
        <main className="w-full flex-1 px-4 py-4 lg:px-6">
          <div className="w-full space-y-3">
            {/* General */}
            <section className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
              {renderPanelHeader("general", "General")}

              {openPanel === "general" && (
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {renderInput("Name", name, setName, "text", true)}
                    {renderInput("Alias", alias, setAlias)}
                    {renderInput("Unicode Name", unicodeName, setUnicodeName)}
                    {renderSelect("Group", group, setGroup, GROUP_OPTIONS, true)}
                    {renderSelect("Sub Group", subGroup, setSubGroup, SUBGROUP_OPTIONS)}
                    {renderSelect("Add Group 1", addGroup1, setAddGroup1, ADDGROUP1_OPTIONS)}
                    {renderSelect("Add Group 2", addGroup2, setAddGroup2, ADDGROUP2_OPTIONS)}
                    {renderInput("PAN No.", panNo, setPanNo)}
                    {renderInput("Short Code", shortCode, setShortCode, "text", true)}
                    {renderInput("A/C Code", accCode, setAccCode)}
                    {renderSelect("A/C Type", acType, setAcType, LEDGER_TYPE_OPTIONS)}
                    {renderSelect("Area", area, setArea, AREA_OPTIONS)}
                    {renderSelect("Agent", agent, setAgent, AGENT_OPTIONS)}
                    {renderSelect("Currency", currency, setCurrency, CURRENCY_OPTIONS)}
                    {renderSelect("Scheme", scheme, setScheme, SCHEME_OPTIONS)}
                    {renderSelect("Ledger Type", ledgerType, setLedgerType, LEDGER_TYPE_OPTIONS)}
                    {renderSelect("Category", category, setCategory, CATEGORY_OPTIONS)}
                    {renderSelect("Warning Type", warningType, setWarningType, WARNING_TYPE_OPTIONS)}
                    {renderInput("Credit Limit", creditLimit, setCreditLimit, "number")}
                    {renderInput("Credit Days", creditDays, setCreditDays, "number")}
                    {renderInput("Interest Rate", interestRate, setInterestRate, "number")}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <label className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={subledger}
                        onChange={(e) => setSubledger(e.target.checked)}
                      />
                      Subledger
                    </label>

                    <label className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={documentAdj}
                        onChange={(e) => setDocumentAdj(e.target.checked)}
                      />
                      Document Adjustment
                    </label>

                    <label className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={cardType}
                        onChange={(e) => setCardType(e.target.checked)}
                      />
                      Card Type
                    </label>

                    <label className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={vatApplicable}
                        onChange={(e) => handleVatChange(e.target.checked)}
                      />
                      VAT Applicable
                    </label>

                    <label className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={tdsApplicable}
                        disabled={vatApplicable}
                        onChange={(e) => {
                          setTdsApplicable(e.target.checked);
                          if (e.target.checked) setVatApplicable(false);
                        }}
                      />
                      TDS Applicable
                    </label>
                  </div>
                </div>
              )}
            </section>

            {/* Address */}
            <section className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
              {renderPanelHeader("address", "Address")}

              {openPanel === "address" && (
                <div className="space-y-3 p-4">
                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    {renderAddressBlock("Primary Address", address, setAddress)}
                    {renderAddressBlock("Shipping Address I", shipping1, setShipping1)}
                    {renderAddressBlock("Shipping Address II", shipping2, setShipping2)}
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={lockForBilling}
                        onChange={(e) => setLockForBilling(e.target.checked)}
                      />
                      Lock for Billing
                    </label>

                    <label className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={salesAmountNotification}
                        onChange={(e) =>
                          setSalesAmountNotification(e.target.checked)
                        }
                      />
                      Sales Amount Notification
                    </label>

                    <div>
                      <label className={labelCls}>Sales Amount Limit</label>
                      <input
                        className={inputCls}
                        type="number"
                        value={salesAmountLimit}
                        onChange={(e) => setSalesAmountLimit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Block Back Dated Entry</label>
                      <input
                        className={inputCls}
                        type="date"
                        value={blockBackDatedEntry}
                        onChange={(e) =>
                          setBlockBackDatedEntry(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Attachments</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="block w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm"
                    />

                    {attachmentNames.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {attachmentNames.map((file) => (
                          <span
                            key={file}
                            className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                          >
                            {file}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Unit */}
            <section className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
              {renderPanelHeader("unit", "Unit")}

              {openPanel === "unit" && (
                <div className="p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-gray-500">
                      Select the company units where this ledger is available.
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllUnits}
                        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Select All
                      </button>

                      <button
                        type="button"
                        onClick={unselectAllUnits}
                        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Unselect All
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded border border-gray-200">
                    <table className="w-full min-w-[500px] border-collapse text-sm">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                          <th className="w-16 px-3 py-2 text-left font-semibold">
                            #
                          </th>
                          <th className="px-3 py-2 text-left font-semibold">
                            Code
                          </th>
                          <th className="px-3 py-2 text-left font-semibold">
                            Unit
                          </th>
                          <th className="w-24 px-3 py-2 text-center font-semibold">
                            Select
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {units.map((unit, index) => (
                          <tr
                            key={unit.code}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-3 py-2">{index + 1}</td>
                            <td className="px-3 py-2">{unit.code}</td>
                            <td className="px-3 py-2">{unit.name}</td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={unit.selected}
                                onChange={() => toggleUnit(unit.code)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* Interest */}
            <section className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
              {renderPanelHeader("interest", "Interest")}

              {openPanel === "interest" && (
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Configure interest by day range.
                    </span>

                    <button
                      type="button"
                      onClick={addInterestRow}
                      className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      <Plus size={14} />
                      Add Row
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded border border-gray-200">
                    <table className="w-full min-w-[650px] border-collapse text-sm">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                          <th className="w-16 px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Start Days</th>
                          <th className="px-3 py-2 text-left">End Days</th>
                          <th className="px-3 py-2 text-left">Percentage</th>
                          <th className="w-20 px-3 py-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {interestRows.map((row, index) => (
                          <tr
                            key={row.id}
                            className="border-b border-gray-100"
                          >
                            <td className="px-3 py-2">{index + 1}</td>
                            <td className="px-3 py-2">
                              <input
                                className={inputCls}
                                value={row.startDays}
                                onChange={(e) =>
                                  updateInterestRow(
                                    row.id,
                                    "startDays",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                className={inputCls}
                                value={row.endDays}
                                onChange={(e) =>
                                  updateInterestRow(
                                    row.id,
                                    "endDays",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                className={inputCls}
                                value={row.percentage}
                                onChange={(e) =>
                                  updateInterestRow(
                                    row.id,
                                    "percentage",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => deleteInterestRow(row.id)}
                                className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* Bank Guarantee */}
            <section className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
              {renderPanelHeader("bank", "Bank Guarantee")}

              {openPanel === "bank" && (
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Maintain bank guarantee details.
                    </span>

                    <button
                      type="button"
                      onClick={addBankRow}
                      className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      <Plus size={14} />
                      Add Row
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded border border-gray-200">
                    <table className="w-full min-w-[1100px] border-collapse text-sm">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                          <th className="w-14 px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Bank Name</th>
                          <th className="px-3 py-2 text-left">Branch</th>
                          <th className="px-3 py-2 text-left">Start Date</th>
                          <th className="px-3 py-2 text-left">End Date</th>
                          <th className="px-3 py-2 text-left">Amount</th>
                          <th className="px-3 py-2 text-left">Collateral</th>
                          <th className="px-3 py-2 text-left">Attachment</th>
                          <th className="w-20 px-3 py-2 text-center">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {bankRows.map((row, index) => (
                          <tr
                            key={row.id}
                            className="border-b border-gray-100"
                          >
                            <td className="px-3 py-2">{index + 1}</td>

                            {(
                              [
                                ["bankName", "Bank Name"],
                                ["branch", "Branch"],
                                ["startDate", "Start Date"],
                                ["endDate", "End Date"],
                                ["amount", "Amount"],
                                ["collateral", "Collateral"],
                                ["attachment", "Attachment"],
                              ] as const
                            ).map(([field, placeholder]) => (
                              <td key={field} className="px-3 py-2">
                                <input
                                  className={inputCls}
                                  type={
                                    field === "startDate" ||
                                    field === "endDate"
                                      ? "date"
                                      : field === "amount"
                                      ? "number"
                                      : "text"
                                  }
                                  placeholder={placeholder}
                                  value={row[field]}
                                  onChange={(e) =>
                                    updateBankRow(
                                      row.id,
                                      field,
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                            ))}

                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => deleteBankRow(row.id)}
                                className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>

        <footer className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-2 text-center text-xs text-gray-500">
          © 2010 - 2026 - Global Tech Solutions Pvt. Ltd.
        </footer>
      </div>
    </div>
  );
}
