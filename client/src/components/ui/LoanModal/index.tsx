"use client"
import { useState } from "react"
import { Button } from "../Button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ModalEmprestimoProps = {
  isOpen: boolean
  onClose: () => void
  bookTitle: string
}

export default function ModalEmprestimo({ isOpen, onClose, bookTitle }: ModalEmprestimoProps) {
  const [nomeCliente, setNomeCliente] = useState("")
  const [emailCliente, setEmailCliente] = useState("")
  const [dataLocacao, setDataLocacao] = useState("")
  const [dataDevolucao, setDataDevolucao] = useState("")

  const handleConfirm = (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault()

    if (dataDevolucao < dataLocacao) {
      alert(
        "A data de devolução não pode ser anterior à data de locação."
      )
      return
    }
    onClose()
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
              required
              value={nomeCliente}
              onChange={(e) =>
                setNomeCliente(e.target.value)
              }
              placeholder="Digite o nome do cliente"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">
              Email do Cliente
            </label>
            <input
              type="email"
              required
              value={emailCliente}
              onChange={(e) =>
                setEmailCliente(e.target.value)
              }
              placeholder="Digite o email do cliente"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">
              Data da Locação
            </label>
            <input
              type="date"
              required
              value={dataLocacao}
              onChange={(e) =>
                setDataLocacao(e.target.value)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">
              Data Prevista de Devolução
            </label>
            <input
              type="date"
              required
              value={dataDevolucao}
              onChange={(e) =>
                setDataDevolucao(e.target.value)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
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