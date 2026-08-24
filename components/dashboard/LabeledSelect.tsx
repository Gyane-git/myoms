type LabeledSelectProps = {
  label: string;
  options: string[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export default function LabeledSelect({
  label,
  options,
  placeholder = "---Select---",
  value,
  onChange,
}: LabeledSelectProps) {
  return (
    <label className="flex items-center gap-3 text-sm text-slate-600">
      {label}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="min-w-[200px] px-2.5 py-1.5 text-sm rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}