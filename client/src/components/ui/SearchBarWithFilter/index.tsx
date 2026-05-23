"use client";

import React, {
  useState,
  useRef,
  useEffect,
} from "react";

// ─────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────
export type Category =
  | "Romance"
  | "Tecnologia"
  | "História"
  | "Ciências"
  | "Infantil";

export const CATEGORIES: Category[] = [
  "Romance",
  "Tecnologia",
  "História",
  "Ciências",
  "Infantil",
];

interface SearchBarWithFilterProps {
  onSearch?: (
    query: string,
    category: Category | ""
  ) => void;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────────
export default function SearchBarWithFilter({
  onSearch,
}: SearchBarWithFilterProps) {
  // ── Estados ──────────────────────────────────────────────────
  const [query, setQuery] =
    useState<string>("");

  const [selectedCategory, setSelectedCategory] =
    useState<Category | "">("");

  const [isDropdownOpen, setIsDropdownOpen] =
    useState<boolean>(false);

  // ── Ref Dropdown ─────────────────────────────────────────────
  const dropdownRef =
    useRef<HTMLDivElement>(null);

  // ── Fecha dropdown ao clicar fora ───────────────────────────
  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
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

  // ── Handlers ────────────────────────────────────────────────
  function handleQueryChange(value: string) {
    setQuery(value);
    onSearch?.(value, selectedCategory);
  }

  function handleCategorySelect(
    category: Category
  ) {
    const newCategory =
      category === selectedCategory
        ? ""
        : category;

    setSelectedCategory(newCategory);

    onSearch?.(query, newCategory);

    setIsDropdownOpen(false);
  }

  function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();
    onSearch?.(query, selectedCategory);
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="flex w-full items-stretch gap-3 rounded-[5px] border border-slate-300 bg-white p-5">
      {/* SEARCH BAR */}
      <div className="flex flex-1 items-center gap-2.5 rounded-[5px] border border-slate-300 bg-white px-3 py-2">
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 items-center gap-2.5"
        >
          <svg
            className="h-[18px] w-[18px] shrink-0 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
            />

            <line
              x1="21"
              y1="21"
              x2="16.65"
              y2="16.65"
            />
          </svg>

          <input
            type="text"
            placeholder="Buscar por título ou autor..."
            value={query}
            onChange={(e) =>
              handleQueryChange(
                e.target.value
              )
            }
            className="flex-1 border-none bg-transparent text-sm text-slate-800 outline-none"
            aria-label="Buscar livros"
          />
        </form>
      </div>

      {/* FILTER */}
      <div
        ref={dropdownRef}
        className="relative flex min-w-[180px] items-stretch rounded-[5px] border border-slate-300 bg-white"
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
          <span className={`text-sm font-normal ${selectedCategory ? "text-slate-600" : "text-slate-400"}`}>
            {selectedCategory || "Categoria"}
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
                  onClick={() =>
                    handleCategorySelect(cat)
                  }
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] ${isActive
                      ? "bg-red-50 font-semibold text-red-600"
                      : "text-slate-600"
                    }`}
                >
                  <span
                    className={`h-[7px] w-[7px] shrink-0 rounded-full ${isActive
                        ? "bg-red-500"
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
    </div>
  );
}