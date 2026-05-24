"use client";

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export default function Input({
  label,
  placeholder,
  value,
  error,
  onChange,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-normal text-slate-700">
        {label}
      </label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-[5px] border px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-red-400 focus:ring-1 focus:ring-red-100 ${error ? "border-red-400" : "border-slate-300"
          }`}
      />
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}