"use client";

import { useState } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import DataTable, { DataTableColumn } from "@/components/dashboard/DataTable";
import LabeledSelect from "@/components/dashboard/LabeledSelect";
import { SAMPLE_PRODUCTS, ProductRow } from "@/lib/sampleProducts";

const GROUP_OPTIONS = ["No Group"];
const SUB_GROUP_OPTIONS = ["No Sub Group"];

function RowActions({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        title="Edit"
        className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-blue-50 text-blue-600"
      >
        <SquarePen size={15} />
      </button>
      <button
        title="Delete"
        onClick={onDelete}
        className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-rose-50 text-rose-600"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export default function ProductCompositionPage() {
  const [group, setGroup] = useState("");
  const [subGroup, setSubGroup] = useState("");
  const [rows, setRows] = useState(SAMPLE_PRODUCTS);

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const columns: DataTableColumn<ProductRow>[] = [
    {
      key: "select",
      label: "",
      filterable: false,
      render: (row) => <RowActions onDelete={() => handleDelete(row.id)} />,
    },
    { key: "code", label: "Code", sortable: true },
    { key: "shortName", label: "Short Name", sortable: true },
    { key: "productName", label: "Product Name", sortable: true },
    { key: "unit", label: "Unit", sortable: true },
    { key: "group", label: "Group", sortable: true },
    { key: "subGroup", label: "Sub Group", sortable: true },
  ];

  const filteredRows = rows.filter(
    (r) => (!group || r.group === group) && (!subGroup || r.subGroup === subGroup)
  );

  return (
    <DataTable
      title="Product Composition"
      columns={columns}
      data={filteredRows}
      pageSize={20}
      topFilters={
        <>
          <LabeledSelect
            label="Group"
            options={GROUP_OPTIONS}
            value={group}
            onChange={setGroup}
          />
          <LabeledSelect
            label="Sub Group"
            options={SUB_GROUP_OPTIONS}
            placeholder="---None---"
            value={subGroup}
            onChange={setSubGroup}
          />
        </>
      }
    />
  );
}