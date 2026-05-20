"use client";
import { useState } from "react";
import SearchBar from "../SearchBar";
import CategoryFilter, { Category } from "../CategoryFilter";

interface SearchBarWithFilterProps {
  onSearch?: (query: string, category: Category) => void;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE PAI
// Detém o estado compartilhado (query + category) e repassa
// via props para SearchBar e CategoryFilter.
// ─────────────────────────────────────────────────────────────────
export default function SearchBarWithFilter({
  onSearch,
}: SearchBarWithFilterProps) {
  const [query, setQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");

  // ── Handlers ─────────────────────────────────────────────────

  function handleQueryChange(value: string) {
    setQuery(value);
    onSearch?.(value, selectedCategory);
  }

  function handleCategorySelect(category: Category) {
    setSelectedCategory(category);
    onSearch?.(query, category);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.(query, selectedCategory);
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={styles.wrapper}>
      <div style={styles.searchBar}>
        <SearchBar
          query={query}
          onQueryChange={handleQueryChange}
          onSubmit={handleSubmit}
        />
      </div>
      <div style={styles.filterWrapper}>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>
    </div>
  );
}

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
  filterWrapper: {
    background: "#ffffff",
    borderRadius: "5px",
    border: "0.5px solid #cbd5e1",
    padding: 0,
    display: "flex",
    alignItems: "stretch",
  },
};