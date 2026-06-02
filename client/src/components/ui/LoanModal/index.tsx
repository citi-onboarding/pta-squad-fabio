"use client"
import { useState } from "react"
import { Button } from "../Button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { z } from "zod"
import { api } from "@/services/api"

type ModalEmprestimoProps = {
  isOpen: boolean
  onClose: () => void
  bookTitle: string
  bookId: string
  onEmprestimoSuccess?: () => void
}

const emprestimoSchema = z.object({
  nomeCliente: z.string().min(1, "*Nome do cliente é obrigatório"),
  emailCliente: z.string().email("*Email inválido"),
  dataDevolucao: z.string().min(1, "*Data de devolução é obrigatória"),
}).refine(
  (data) => new Date(data.dataDevolucao) >= new Date(),
  {
    message: "*A data de devolução não pode ser anterior à data de locação.",
    path: ["dataDevolucao"],
  }
)

export default function ModalEmprestimo({ isOpen, onClose, bookTitle, bookId, onEmprestimoSuccess }: ModalEmprestimoProps) {
  const [nomeCliente, setNomeCliente] = useState("")
  const [emailCliente, setEmailCliente] = useState("")
  const [dataDevolucao, setDataDevolucao] = useState("")
  const [errors, setError] = useState<Record<string, string>>({})

  const handleConfirm = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault()
    setError({})

    try {
      const dadosValidados = emprestimoSchema.parse({
        nomeCliente,
        emailCliente,
        dataDevolucao,
      })

      const dataDevolucaoISO = new Date(dataDevolucao).toISOString()

      await api.post("/loans", {
        livroId: bookId,
        nomeCliente: dadosValidados.nomeCliente,
        emailCliente: dadosValidados.emailCliente,
        dataPrevistaDevolucao: dataDevolucaoISO,
      })

      setNomeCliente("")
      setDataDevolucao("")
      setEmailCliente("")
    

      onClose()
      onEmprestimoSuccess?.()
  }catch (error: any) {
    if (error instanceof z.ZodError) {
        const novosErros: Record<string, string> = {}
        error.issues.forEach((err) => {
          const path = err.path[0] as string
          novosErros[path] = err.message
        })
        setError(novosErros)
      } 
  }
}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[350px] md:w-[393px] lg:w-[464px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Realizar Empréstimo
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleConfirm}
          className="flex flex-col gap-4 mt-4"
        >
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">
              Livro selecionado
            </p>
            <p className="text-base font-medium text-gray-900">
              {bookTitle}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">
              Nome do Cliente
            </label>
            <input
              type="text"
              value={nomeCliente}
              onChange={(e) =>
                setNomeCliente(e.target.value)
              }
              placeholder="Digite o nome do cliente"
              className='border rounded-lg border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]'
            />
            {errors.nomeCliente && (
              <p className="text-sm text-red-500">{errors.nomeCliente}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">
              Email do Cliente
            </label>
            <input
              value={emailCliente}
              onChange={(e) =>
                setEmailCliente(e.target.value)
              }
              placeholder="Digite o email do cliente"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]"
            />
            {errors.emailCliente && (
              <p className="text-sm text-red-500">{errors.emailCliente}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">
              Data Prevista de Devolução
            </label>
            <input
              type="date"
              value={dataDevolucao}
              onChange={(e) =>
                setDataDevolucao(e.target.value)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]"
            />
            {errors.dataDevolucao && (
              <p className="text-sm text-red-500">{errors.dataDevolucao}</p>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-[#FF0000]"
              onClick={onClose}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="flex-1"
            >
              Confirmar Empréstimo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}