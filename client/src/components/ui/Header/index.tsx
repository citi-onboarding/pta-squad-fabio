"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoCITi, house, book, plus } from "@/assets";

function useScreenSize() {
  const [size, setSize] = useState<
    "compactMobile" | "mobile" | "desktop" | "ultrawide"
  >("desktop");

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w <= 425) setSize("compactMobile");
      else if (w < 640) setSize("mobile");
      else if (w < 1920) setSize("desktop");
      else setSize("ultrawide");
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

export default function Header() {
  const pathname = usePathname();
  const screen = useScreenSize();

  const isUltrawide = screen === "ultrawide";
  const isCompactMobile = screen === "compactMobile";
  const isMobile = screen === "mobile";

  const navLinkClass = (path: string) =>
    `flex items-center transition-colors rounded-md font-medium ${
      pathname === path
        ? "bg-green-50 text-green-600"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    } ${
      isUltrawide
        ? "gap-3 px-6 py-3 text-xl"
        : isMobile
        ? "gap-1.5 px-2.5 py-2 text-xs"
        : "gap-2 px-3 py-2 text-sm"
    }`;

  return (
    <header
      className="w-full border-b border-gray-200 bg-white"
      style={{
        height: isUltrawide ? "88px" : isMobile ? "56px" : "64px",
      }}
    >
      <div
        className="h-full flex items-center justify-between"
        style={{
          padding: isUltrawide
            ? "0 120px"
            : isMobile
            ? "0 16px"
            : "0 clamp(16px, 4vw, 80px)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center"
          style={{ gap: isUltrawide ? "16px" : "10px" }}
        >
          <div
            style={{
              width: isUltrawide ? "52px" : isMobile ? "28px" : "36px",
              height: isUltrawide ? "52px" : isMobile ? "28px" : "36px",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <Image
              src={LogoCITi}
              alt="CITi Logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <span
            className="font-semibold text-gray-800 whitespace-nowrap"
            style={{
              fontSize: isUltrawide ? "22px" : isMobile ? "13px" : "16px",
            }}
          >
            Biblioteca Escolar
          </span>
        </div>

        {/* Nav */}
        <nav
          className="flex items-center"
          style={{ gap: isUltrawide ? "12px" : isMobile ? "4px" : "8px" }}
        >
          <Link href="/" className={navLinkClass("/")}>
            <Image
              src={house}
              alt=""
              width={isUltrawide ? 22 : 16}
              height={isUltrawide ? 22 : 16}
            />
            <span>Dashboard</span>
          </Link>

          <Link href="/livros" className={navLinkClass("/livros")}>
            <Image
              src={book}
              alt=""
              width={isUltrawide ? 22 : 16}
              height={isUltrawide ? 22 : 16}
            />
            <span>Livros</span>
          </Link>

          <Link
            href="/createbook"
            className="flex items-center bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
            style={{
              gap: isUltrawide ? "12px" : isCompactMobile ? "2px" : isMobile ? "4px" : "8px",
              padding: isUltrawide
                ? "12px 28px"
                : isCompactMobile
                ? "4px 6px"
                : isMobile
                ? "6px 8px"
                : "8px 16px",
              fontSize: isUltrawide
                ? "20px"
                : isCompactMobile
                ? "8px"
                : isMobile
                ? "10px"
                : "14px",
              marginLeft: isUltrawide ? "16px" : "8px",
            }}
          >
            <Image
              src={plus}
              alt=""
              width={isUltrawide ? 22 : isCompactMobile ? 12 : isMobile ? 14 : 16}
              height={isUltrawide ? 22 : isCompactMobile ? 12 : isMobile ? 14 : 16}
            />
            <span>Novo Livro</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}