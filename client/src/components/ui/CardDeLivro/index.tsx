"use client"
import Image from "next/image";
import { ciencias, historia, infantil, romance, tecnologia, deleteicon, eye } from "@/assets"
import { Button } from "../Button";
import { Bookmark } from "lucide-react";
import { useState } from "react";

type Categorias = "Romance" | "Tecnologia" | "História" | "Ciências" | "Infantil"

type BookCardProps = {
  title: string,
  author: string,
  category: Categorias,
  available: number
}

const Cover = {
  Romance: romance,
  Ciências: ciencias,
  História: historia,
  Infantil: infantil,
  Tecnologia: tecnologia
}

type ModalType = "ver" | "emprestar" | "deletar" | null

export default function BookCard({ title, author, category, available }: BookCardProps) {
  const chosen_cover = Cover[category]
  const [openModal, setOpenModal] = useState<ModalType>(null)

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col w-full max-w-[395px] p-4">

      <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden rounded-lg">
        <Image
          src={chosen_cover}
          alt={category}
          fill
        />
      </div>

      <div className="flex flex-col gap-1 md:gap-2 mt-3 md:mt-4">
        <h2 className="text-base md:text-lg lg:text-xl font-semibold text-black leading-tight">
          {title}
        </h2>
        <p className="text-xs md:text-sm text-gray-400 font-medium">
          {author}
        </p>
        <p className="text-xs md:text-sm text-green-400 font-medium">
          {category}
        </p>
        <p className="text-xs md:text-sm text-gray-900 font-medium">
          Disponível: {available} unidade(s)
        </p>
      </div>

      <div className="flex items-center gap-2 mt-4 md:mt-6 h-10 md:h-11 lg:h-[47px]">
        <Button variant="outline" className="flex-1 gap-1 h-full text-xs md:text-sm" onClick={() => setOpenModal("ver")}>
          <Image src={eye} alt="Ver" width={16} height={16} />
          Ver
        </Button>

        <Button className="flex-1 gap-1 h-full text-xs md:text-sm" onClick={() => setOpenModal("emprestar")}>
          <Bookmark size={14} className="md:w-4 md:h-4" />
          Emprestar
        </Button>

        <Button variant="destructive" size="icon" className="h-full w-10 md:w-11 lg:w-[47px]" onClick={() => setOpenModal("deletar")}>
          <Image src={deleteicon} alt="Deletar" className="w-3 h-3 md:w-4 md:h-4 invert" />
        </Button>
      </div>
    </div>
  )
}