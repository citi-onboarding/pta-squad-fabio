"use client";

import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────
export type Category =
  | "Ficção"
  | "Técnico"
  | "Biografia"
  | "História"
  | "Ciência";

export const CATEGORIES: Category[] = [
  "Ficção",
  "Técnico",
  "Biografia",
  "História",
  "Ciência",
];

interface CategoryFilterProps {
  selectedCategory: Category | "";
  onCategorySelect: (category: Category | "") => void;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────────
export default function CategoryFilter({
  selectedCategory,
  onCategorySelect,
}: CategoryFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] =
    useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleSelect(category: Category) {
    const newCategory =
      category === selectedCategory ? "" : category;

    onCategorySelect(newCategory);
    setIsDropdownOpen(false);
  }

  return (
    <div
      ref={dropdownRef}
      className="relative w-[180px] shrink-0 rounded-lg bg-white"
    >
      <button
        type="button"
        onClick={() =>
          setIsDropdownOpen((prev) => !prev)
        }
        className="flex h-full w-full cursor-pointer items-center justify-center border-none bg-transparent px-4 py-2"
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
      >
        <span className="text-sm font-normal text-slate-600">
          {selectedCategory || "\u00A0"}
        </span>
      </button>

      {isDropdownOpen && (
        <ul
          className="absolute right-0 top-[calc(100%+8px)] z-[100] min-w-[140px] list-none rounded-xl border-[1.5px] border-slate-200 bg-white p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
          role="listbox"
          aria-label="Categorias"
        >
          {CATEGORIES.map((cat) => {
            const isActive =
              cat === selectedCategory;

            return (
              <li
                key={cat}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(cat)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] ${isActive
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "text-slate-600"
                  }`}
              >
                <span
                  className={`h-[7px] w-[7px] shrink-0 rounded-full ${isActive
                      ? "bg-blue-500"
                      : "bg-slate-300"
                    }`}
                />

                {cat}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}