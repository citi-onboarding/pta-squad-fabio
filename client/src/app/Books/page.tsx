"use client"
import BookCard from "@/components/ui/CardDeLivro"
import SearchBarWithFilter, { type Category} from "@/components/ui/SearchBarWithFilter"
import type { Categorias } from "@/components/ui/CardDeLivro"
import { api } from "@/services/api"
import { useEffect, useState } from "react"

type Livros = {
        id: string
        titulo: string
        autor: string
        categoria: Categorias
        quantidadeDisponivel: number
        quantidadeTotal: number
        isbn: string
        editora: string
        ano: number
    }

const mapCategoryToCardCategory = (category: Category): Categorias | null => {
  const categoryMap: Record<Category, Categorias> = {
    "Romance": "ROMANCE",
    "Tecnologia": "TECNOLOGIA",
    "História": "HISTORIA",
    "Ciências": "CIENCIAS",
    "Infantil": "INFANTIL",
  }
  return categoryMap[category] || null
}

export default function Home() {
    const [livros, setLivros] = useState<Livros[]>([])
    const [livrosFiltrados, setLivrosFiltrados] = useState<Livros[]>([])

    useEffect(() => {
        async function fetchLivros() {

        try {
            const response = await api.get("/book")

            setLivros(response.data)
            setLivrosFiltrados(response.data)
        } catch (error) {
            console.error(
            "Erro ao buscar livros:",
            error
            )
        }
        }
        fetchLivros()
      }, [])
     
    const handleSearch = (query: string, category: Category | "") => {
      let resultado = livros

      if (query.trim()) {
        resultado = resultado.filter((livro) =>
          livro.titulo.toLowerCase().includes(query.toLowerCase()) ||
          livro.autor.toLowerCase().includes(query.toLowerCase())
        )
      }

      if (category) {
        const categoriaCardFormat = mapCategoryToCardCategory(category)
        if (categoriaCardFormat) {
          resultado = resultado.filter(
            (livro) => livro.categoria === categoriaCardFormat
          )
        }
      }

      setLivrosFiltrados(resultado)
    }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">

      <section className="max-w-[1120px] mx-auto px-6 py-8">

        <div className="mb-8">

          <h1 className="text-3xl font-semibold text-gray-900">
            Livros
          </h1>

          <p className="text-gray-500 mt-1">
            Gerencie o acervo da biblioteca
          </p>

        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-8">

          <SearchBarWithFilter onSearch={handleSearch}/>

        </div>

        {livrosFiltrados.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Nenhum livro encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {livrosFiltrados.map((livro) => (
              <BookCard
                key={livro.id}
                id={livro.id}
                title={livro.titulo}
                author={livro.autor}
                category={livro.categoria}
                available={livro.quantidadeDisponivel}
                total={livro.quantidadeTotal}
                isbn={livro.isbn}
                editora={livro.editora}
                year={livro.ano}
              />
            ))}
          </div>
        )}

      </section>

    </main>
  )
}