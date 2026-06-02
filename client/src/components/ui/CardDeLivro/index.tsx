"use client"
import Image from "next/image";
import { ciencias, historia, infantil, romance, tecnologia, delete_red, eye_red } from "@/assets"
import { Button } from "../Button";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import ModalEmprestimo from "../LoanModal";
import ModalSee from "../SeeModal";
import ModalDelete from "../DeleteModal";
import { api } from "@/services/api";


export type Categorias = "ROMANCE" | "TECNOLOGIA" | "HISTORIA" | "CIENCIAS" | "INFANTIL"

type BookCardProps = {
  id: string           
  title: string
  author: string
  category: Categorias
  available: number
  total: number        
  isbn: string         
  editora: string      
  year: number        
}

export const Cover = {
  ROMANCE: romance,
  CIENCIAS: ciencias,
  HISTORIA: historia,
  INFANTIL: infantil,
  TECNOLOGIA: tecnologia
}

export const categoriaLabel: Record<Categorias, string> = {
  ROMANCE: "Romance",
  TECNOLOGIA: "Tecnologia",
  HISTORIA: "História",
  CIENCIAS: "Ciências",
  INFANTIL: "Infantil",
}


export default function BookCard({ id, title, author, category, available, 
  total, isbn, editora, year
}: BookCardProps) {
  const chosen_cover = Cover[category]
  const [isVerOpen, setIsVerOpen] = useState(false)
  const [isEmprestimoOpen, setIsEmprestimoOpen] = useState(false)
  const [isDeletarOpen, setIsDeletarOpen] = useState(false)
  const [emprestimos, setEmprestimos] = useState([])

  async function handleVerOpen() {
    setIsVerOpen(true)
    try{
      const response = await api.get(`/loans/book/${id}`)
      setEmprestimos(response.data)
    }catch (error) {
      console.error("Erro ao buscar empréstimos: ", error)
    }
  }
  
  const handleSuccess = () => {
    window.location.reload()
  }

  return (
    <>
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
          <p className="text-xs md:text-sm text-[#FF0000] font-medium">
            {categoriaLabel[category]}
          </p>
          <p className="text-xs md:text-sm text-gray-900 font-medium">
            Disponível: {available} unidade(s)
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-6 h-10 md:h-11 lg:h-[47px]">
          <Button variant="outline" className="flex-1 gap-1 h-full text-xs text-[#FF0000] md:text-sm" onClick={handleVerOpen}>
            <Image src={eye_red} alt="Ver" width={16} height={16} />
            Ver
          </Button>

          <Button className="flex-1 gap-1 h-full text-xs md:text-sm" onClick={() => setIsEmprestimoOpen(true)}>
            <Bookmark size={14} className="md:w-4 md:h-4" />
            Emprestar
          </Button>

          <Button variant="destructive" size="icon" className="h-full w-10 md:w-11 lg:w-[47px]" onClick={() => setIsDeletarOpen(true)}>
            <Image src={delete_red} alt="Deletar" className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>
      </div>

      <ModalEmprestimo 
        isOpen={isEmprestimoOpen}
        onClose={() => setIsEmprestimoOpen(false)}
        bookTitle={title}
        bookId={id}
        onEmprestimoSuccess={handleSuccess}
      />

      <ModalSee
        isOpen={isVerOpen}
        onClose={() => setIsVerOpen(false)}
        booktitle={title}
        author={author}
        category={category}
        available={available}
        year = {year}
        total = {total}
        isbn = {isbn}
        editora={editora}
        emprestimos={emprestimos}
        onDevolvidoSuccess={handleSuccess}
        />

      <ModalDelete
        isOpen={isDeletarOpen}
        onClose={() => setIsDeletarOpen(false)}
        booktitle={title}
        bookId={id}
        totalQuantidade={total}
        onDeleteSuccess={handleSuccess}
      />
    </>
  )
}