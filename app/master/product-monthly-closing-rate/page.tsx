"use client";

import { Crosshair, FileEdit } from "lucide-react";
import DataTable, { DataTableColumn } from "@/components/dashboard/DataTable";

type ProductRow = {
  id: string;
  code: string;
  shortName: string;
  productName: string;
  unit: string;
  group: string;
  subGroup: string;
};

const DATA: ProductRow[] = [
  { id: "998", code: "998", shortName: "998", productName: "185/65 R 14 MARSHAL", unit: "", group: "No Group", subGroup: "No Sub Group" },
  { id: "1002", code: "1002", shortName: "1002", productName: "2223-76-23000HOSE", unit: "", group: "No Group", subGroup: "No Sub Group" },
  { id: "1003", code: "1003", shortName: "1003", productName: "2223-76-24000HOSE", unit: "", group: "No Group", subGroup: "No Sub Group" },
  { id: "1001", code: "1001", shortName: "1001", productName: "2223-76-27000HOSE", unit: "", group: "No Group", subGroup: "No Sub Group" },
  { id: "999", code: "999", shortName: "999", productName: "BATCH PRODUCT", unit: "KGS", group: "No Group", subGroup: "No Sub Group" },
  { id: "1044", code: "1044", shortName: "1044", productName: "BATCH PRODUCT -1", unit: "kg", group: "No Group", subGroup: "No Sub Group" },
  { id: "1018", code: "1018", shortName: "1018", productName: "CAGATI", unit: "GRMS", group: "No Group", subGroup: "No Sub Group" },
  { id: "991", code: "991", shortName: "1400007", productName: "CEMENT 999", unit: "KGS", group: "No Group", subGroup: "No Sub Group" },
  { id: "1042", code: "1042", shortName: "1042", productName: "Consultancy fee", unit: "", group: "No Group", subGroup: "No Sub Group" },
  { id: "993", code: "993", shortName: "1400009", productName: "Gorkha", unit: "PIECES", group: "No Group", subGroup: "No Sub Group" },
  { id: "1035", code: "1035", shortName: "iP00003", productName: "iP00003", unit: "", group: "No Group", subGroup: "No Sub Group" },
  { id: "1038", code: "1038", shortName: "1038", productName: "kalanki to koteshwer", unit: "", group: "No Group", subGroup: "No Sub Group" },
  { id: "1036", code: "1036", shortName: "1036", productName: "Kalanki To Sitapaila", unit: "", group: "No Group", subGroup: "No Sub Group" },
  { id: "1017", code: "1017", shortName: "1017", productName: "LAPTOP DELL M2020-16GB", unit: "", group: "No Group", subGroup: "No Sub Group" },
  { id: "994", code: "994", shortName: "1400010", productName: "Nepal ice", unit: "PIECES", group: "No Group", subGroup: "No Sub Group" },
  { id: "1030", code: "1030", shortName: "1030", productName: "Noodles", unit: "", group: "No Group", subGroup: "No Sub Group" },
  { id: "1021", code: "1021", shortName: "1021", productName: "PANTRY UNIT 1900-2200 MM", unit: "", group: "No Group", subGroup: "No Sub Group" },
  { id: "1015", code: "1015", shortName: "T1998", productName: "PEBBLE SINK MIXER", unit: "", group: "No Group", subGroup: "No Sub Group" },
  { id: "1040", code: "1040", shortName: "1040", productName: "PEN", unit: "PIECES", group: "No Group", subGroup: "No Sub Group" },
  { id: "1029", code: "1029", shortName: "1400013", productName: "raw milk", unit: "", group: "No Group", subGroup: "No Sub Group" },
];

function TargetIconButton({ label }: { label: string }) {
  return (
    <button
      title={label}
      className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-blue-50 text-blue-500"
    >
      <Crosshair size={15} />
    </button>
  );
}

const columns: DataTableColumn<ProductRow>[] = [
  {
    key: "select",
    label: "",
    filterable: false,
    render: () => (
      <button className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-slate-100 text-blue-500">
        <FileEdit size={14} />
      </button>
    ),
  },
  { key: "code", label: "Code", sortable: true },
  { key: "shortName", label: "Short Name", sortable: true },
  { key: "productName", label: "Product Name", sortable: true },
  { key: "unit", label: "Unit", sortable: true },
  { key: "group", label: "Group", sortable: true },
  { key: "subGroup", label: "Sub Group", sortable: true },
  {
    key: "agentTarget",
    label: "Agent Target",
    filterable: true,
    render: () => <TargetIconButton label="Set agent target" />,
  },
  {
    key: "customerTarget",
    label: "Customer Target",
    filterable: true,
    render: () => <TargetIconButton label="Set customer target" />,
  },
  {
    key: "areaTarget",
    label: "Area Target",
    filterable: true,
    render: () => <TargetIconButton label="Set area target" />,
  },
  {
    key: "productTarget",
    label: "Product Target",
    filterable: true,
    render: () => <TargetIconButton label="Set product target" />,
  },
  {
    key: "rateUpdate",
    label: "Rate Update",
    filterable: true,
    render: () => <TargetIconButton label="Update rate" />,
  },
];

export default function ProductMonthlyClosingRatePage() {
  return <DataTable title="Product Monthly Closing Rate" columns={columns} data={DATA} pageSize={20} />;
}