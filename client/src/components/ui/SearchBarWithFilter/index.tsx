"use client";

import React, { useState, useRef, useEffect } from "react";

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

interface SearchBarWithFilterProps {
  onSearch?: (query: string, category: Category | "") => void;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────────
export default function SearchBarWithFilter({
  onSearch,
}: SearchBarWithFilterProps) {
  // ── Estados ──────────────────────────────────────────────────
  const [query, setQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
  const [isDropdownOpen, setIsDropdownOpen] =
    useState<boolean>(false);

  // ── Ref Dropdown ─────────────────────────────────────────────
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fecha dropdown ao clicar fora ───────────────────────────
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

  // ── Handlers ────────────────────────────────────────────────
  function handleQueryChange(value: string) {
    setQuery(value);
    onSearch?.(value, selectedCategory);
  }

  function handleCategorySelect(category: Category) {
    const newCategory =
      category === selectedCategory ? "" : category;

    setSelectedCategory(newCategory);
    onSearch?.(query, newCategory);

    setIsDropdownOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.(query, selectedCategory);
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={styles.wrapper}>
      {/* SEARCH BAR */}
      <div style={styles.searchBar}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <svg
            style={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
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
              handleQueryChange(e.target.value)
            }
            style={styles.input}
            aria-label="Buscar livros"
          />
        </form>
      </div>

      {/* FILTER */}
      <div
        ref={dropdownRef}
        style={styles.filterWrapper}
      >
        <button
          type="button"
          onClick={() =>
            setIsDropdownOpen((prev) => !prev)
          }
          style={styles.filterButton}
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        >
          <span style={styles.categoryTag}>
            {selectedCategory || "\u00A0"}
          </span>
        </button>

        {isDropdownOpen && (
          <ul
            style={styles.dropdown}
            role="listbox"
            aria-label="Categorias"
          >
            {CATEGORIES.map((cat) => (
              <li
                key={cat}
                role="option"
                aria-selected={
                  cat === selectedCategory
                }
                onClick={() =>
                  handleCategorySelect(cat)
                }
                style={{
                  ...styles.dropdownItem,
                  ...(cat === selectedCategory
                    ? styles.dropdownItemActive
                    : {}),
                }}
              >
                <span
                  style={{
                    ...styles.dot,
                    background:
                      cat === selectedCategory
                        ? "#3b82f6"
                        : "#d1d5db",
                  }}
                />

                {cat}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100%",
    padding: "20px",
    background: "#ffffff",
    border: "0.5px solid #cbd5e1",
    borderRadius: "5px",
    display: "flex",
    alignItems: "stretch",
    gap: "12px",
  },

  // SEARCH
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ffffff",
    borderRadius: "5px",
    padding: "8px 12px",
    border: "0.5px solid #cbd5e1",
    flex: 1,
  },

  form: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
  },

  searchIcon: {
    width: "18px",
    height: "18px",
    color: "#94a3b8",
    flexShrink: 0,
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#1e293b",
    background: "transparent",
  },

  // FILTER
  filterWrapper: {
    position: "relative",
    background: "#ffffff",
    borderRadius: "5px",
    border: "0.5px solid #cbd5e1",
    display: "flex",
    alignItems: "stretch",
    minWidth: "180px",
  },

  filterButton: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px 14px",
  },

  categoryTag: {
    fontSize: "14px",
    fontWeight: 400,
    color: "#475569",
  },

  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    minWidth: "140px",
    background: "#ffffff",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
    listStyle: "none",
    padding: "6px",
    margin: 0,
    zIndex: 100,
  },

  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#475569",
  },

  dropdownItemActive: {
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: 600,
  },

  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
  },
};