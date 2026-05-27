"use client";
import Image, { StaticImageData } from "next/image";
import { Category } from "../types";

interface CategoryCardProps {
  category: Category;
  image: StaticImageData;
  selected: boolean;
  onSelect: (category: Category) => void;
}

export default function CategoryCard({
  category,
  image,
  selected,
  onSelect,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className={`
        flex
        flex-col
        items-center
        justify-center
        rounded-lg
        border
        p-3
        transition-all
        ${selected
          ? "border-red-500 bg-red-50"
          : "border-slate-200 hover:border-slate-300"
        }
      `}
    >
      <Image
        src={image}
        alt={category}
        className="mb-2 h-24 w-16 object-cover"
      />

      <span className="text-sm text-slate-700">
        {category}
      </span>
    </button>
  );
}