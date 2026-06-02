"use client";

interface InputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;

  variant?: "text" | "number" | "isbn";
  maxLength?: number;
}

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  error,
  variant = "text",
  maxLength,
}: InputProps) {
  function handleInputChange(inputValue: string) {
    let formattedValue = inputValue;

    if (variant === "number") {
      formattedValue = inputValue.replace(/\D/g, "");
    }


    if (variant === "isbn") {
      const digits = inputValue
        .replace(/\D/g, "")
        .slice(0, 13);

      const parts = [];

      if (digits.length > 0) {
        parts.push(digits.slice(0, 3));
      }

      if (digits.length > 3) {
        parts.push(digits.slice(3, 5));
      }

      if (digits.length > 5) {
        parts.push(digits.slice(5, 8));
      }

      if (digits.length > 8) {
        parts.push(digits.slice(8, 12));
      }

      if (digits.length > 12) {
        parts.push(digits.slice(12, 13));
      }

      formattedValue = parts.join("-");
    }

    onChange(formattedValue);
  }

  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => handleInputChange(e.target.value)}
        className={`
    rounded-[5px]
    border
    px-3
    py-2.5
    text-sm
    outline-none
    transition-all

    ${error
            ? "border-red-500 bg-red-50"
            : "border-slate-300"
          }

    focus:border-red-500
    focus:bg-red-50
  `}
      />

      {error && (
        <span className="mt-1 text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}