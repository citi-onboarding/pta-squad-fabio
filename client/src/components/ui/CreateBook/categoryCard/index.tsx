"use client";

import { Category } from "../types";

interface CategoryCardProps {
  category: Category;
  selected: boolean;
  onSelect: (category: Category) => void;
}

export default function CategoryCard({
  category,
  selected,
  onSelect,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className={`flex flex-col items-center justify-end rounded-[5px] border pb-3 pt-0 transition-all cursor-pointer aspect-square ${selected
          ? "border-red-400 bg-red-50"
          : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      aria-pressed={selected}
    >
      <div className="flex-1 w-full" />
      <span
        className={`text-sm ${selected
            ? "font-medium text-red-600"
            : "font-normal text-slate-600"
          }`}
      >
        {category}
      </span>
    </button>
  );
}