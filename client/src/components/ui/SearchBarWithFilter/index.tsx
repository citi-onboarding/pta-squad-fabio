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
  const [selectedCategory, setSelectedCategory] = useState<Category>("Categoria");

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
        {/* Campo de busca */}
        <SearchBar
          query={query}
          onQueryChange={handleQueryChange}
          onSubmit={handleSubmit}
        />

        {/* Divisor visual */}
        <div style={styles.divider} />

        {/* Filtro de categorias */}
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
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "16px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "10px 16px",
    border: "1.5px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  divider: {
    width: "1px",
    height: "22px",
    background: "#e2e8f0",
    flexShrink: 0,
  },
};