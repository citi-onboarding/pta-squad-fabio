"use client";
import React from "react";

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE
// Recebe query e handlers do pai — sem estado interno.
// ─────────────────────────────────────────────────────────────────
export default function SearchBar({
  query,
  onQueryChange,
  onSubmit,
}: SearchBarProps) {
  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <svg
        style={styles.searchIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        placeholder="Buscar por título ou autor..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        style={styles.input}
        aria-label="Buscar livros"
      />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
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
};