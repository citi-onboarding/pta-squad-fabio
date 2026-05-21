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
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSelect(category: Category) {
    const newCategory = category === selectedCategory ? "" : category;
    onCategorySelect(newCategory);
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
              aria-selected={cat === selectedCategory}
              onClick={() => handleSelect(cat)}
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
  );
}

// ─────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  filterWrapper: {
    position: "relative",

    width: "180px",

    background: "#ffffff",
    borderRadius: "8px",

    flexShrink: 0,
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