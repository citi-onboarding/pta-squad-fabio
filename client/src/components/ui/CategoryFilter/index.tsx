import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────
export type Category =
  | "Categoria"
  | "Ficção"
  | "Técnico"
  | "Biografia"
  | "História"
  | "Ciência";

export const CATEGORIES: Category[] = [
  "Categoria",
  "Ficção",
  "Técnico",
  "Biografia",
  "História",
  "Ciência",
];

interface CategoryFilterProps {
  selectedCategory: Category;
  onCategorySelect: (category: Category) => void;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────────
export default function CategoryFilter({
  selectedCategory,
  onCategorySelect,
}: CategoryFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Fecha o dropdown ao clicar fora
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(category: Category) {
    onCategorySelect(category);
    setIsDropdownOpen(false);
  }

  return (
    <div ref={dropdownRef} style={styles.filterWrapper}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        style={styles.filterButton}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
      >
        <span style={styles.categoryTag}>{selectedCategory}</span>
        <svg
          style={{
            ...styles.arrow,
            transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isDropdownOpen && (
        <ul style={styles.dropdown} role="listbox" aria-label="Categorias">
          {CATEGORIES.map((cat) => (
            <li
              key={cat}
              role="option"
              aria-selected={cat === selectedCategory}
              onClick={() => handleSelect(cat)}
              style={{
                ...styles.dropdownItem,
                ...(cat === selectedCategory ? styles.dropdownItemActive : {}),
              }}
            >
              <span
                style={{
                  ...styles.dot,
                  background:
                    cat === selectedCategory ? "#3b82f6" : "#d1d5db",
                }}
              />
              {cat}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  filterWrapper: {
    position: "relative",
    flexShrink: 0,
  },
  filterButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px 6px",
    borderRadius: "8px",
  },
  categoryTag: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#3b82f6",
    background: "#eff6ff",
    padding: "3px 10px",
    borderRadius: "20px",
  },
  arrow: {
    width: "14px",
    height: "14px",
    color: "#64748b",
    transition: "transform 0.2s ease",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    minWidth: "160px",
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