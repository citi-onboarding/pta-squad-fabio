"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoCITi, house, book, plus } from "@/assets";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b border-gray-200 bg-white px-2 md:px-8 py-3 md:py-4 flex items-center justify-between">      <div className="flex items-center gap-2 md:gap-3">
        <Image src={LogoCITi} alt="CITi Logo" width={40} height={40} />
        <span className="text-xs md:text-lg font-semibold text-gray-800">
          Biblioteca Escolar
        </span>
      </div>

      <nav className="flex items-center gap-2 md:gap-6">
        <Link
          href="/"
          className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-md transition-colors ${
            pathname === "/"
              ? "bg-green-100 text-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Image src={house} alt="Dashboard" width={16} height={16} />
          Dashboard
        </Link>
        <Link
          href="/livros"
          className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-md transition-colors ${
            pathname === "/livros"
              ? "bg-green-100 text-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Image src={book} alt="Livros" width={16} height={16} />
          Livros
        </Link>
        <button className="flex items-center gap-1 md:gap-2 bg-green-500 hover:bg-green-600 text-white text-xs md:text-sm font-medium px-2 md:px-4 py-2 rounded-md">
          <Image src={plus} alt="Novo Livro" width={16} height={16} />
          Novo Livro
        </button>
      </nav>
    </header>
  );
}