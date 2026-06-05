"use client"
import { Button } from "../Button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/services/api";
import { useState } from "react";

type ModalDeleteProps = {
    isOpen: boolean;
    onClose: () => void;
    booktitle: string;
    bookId: string;
    totalQuantidade: number;
    onDeleteSuccess?: () => void;
}

type Acao = "inicial" | "reduzir" | "deletar";

export default function ModalDelete({ 
    isOpen, 
    onClose, 
    booktitle, 
    bookId, 
    totalQuantidade,
    onDeleteSuccess
}: ModalDeleteProps){
    const [acao, setAcao] = useState<Acao>("inicial")
    const [quantidadeAReduzir, setQuantidadeAReduzir] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleReduzir = async () => {
        setError(null)

        if (!quantidadeAReduzir || Number(quantidadeAReduzir) <= 0) {
            setError("Digite uma quantidade válida")
            return
        }

        if (Number(quantidadeAReduzir) > totalQuantidade) {
            setError(`Máximo de ${totalQuantidade} cópias`)
            return
        }

        try {
            await api.patch(`/book/${bookId}`, {
                quantidadeARemover: Number(quantidadeAReduzir)
            })

            setAcao("inicial")
            setQuantidadeAReduzir("")
            onClose()
            onDeleteSuccess?.()

        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao reduzir quantidade")
        } 
    }

    const handleDeletar = async () => {
        setError(null)

        try {
            await api.delete(`/book/${bookId}`)
            setAcao("inicial")
            onClose()
            onDeleteSuccess?.()

        }  catch (err: any) {
            const backendMessage =
                err.response?.data?.message ||
                err.response?.data?.messageFromDelete

            const message =
                backendMessage === "Something Wrong. The value was NOT deleted"
                    ? "Não foi possível deletar o livro."
                    : backendMessage || "Não foi possível deletar o livro."

            setError(message)
        }
    }

    const handleClose = () => {
        setAcao("inicial")
        setQuantidadeAReduzir("")
        setError(null)
        onClose()
    }

    return(
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-[350px] md:w-[393px] lg:w-[464px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {acao === "inicial" && "Gerenciar Livro"}
                        {acao === "reduzir" && "Remover Cópias"}
                        {acao === "deletar" && "Excluir Livro"}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-4">
                    
                    {acao === "inicial" && (
                        <>
                            <p className="text-sm text-gray-600">
                                O que deseja fazer com o livro{" "}
                                <span className="font-semibold text-gray-900">{booktitle}</span>?
                            </p>
                            <p className="text-sm text-gray-500">
                                Total de cópias: <span className="font-semibold">{totalQuantidade}</span>
                            </p>

                            <div className="flex flex-col gap-2 mt-2">
                                <Button 
                                    className="w-full bg-yellow-500 hover:bg-yellow-600"
                                    onClick={() => setAcao("reduzir")}
                                >
                                    Remover Cópias
                                </Button>

                                <Button 
                                    className="w-full bg-red-500 hover:bg-red-600"
                                    onClick={() => setAcao("deletar")}
                                >
                                    Deletar Livro Inteiro
                                </Button>

                                <Button 
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleClose}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </>
                    )}

                    {acao === "reduzir" && (
                        <>
                            <p className="text-sm text-gray-600">
                                Quantas cópias deseja remover?
                            </p>
                            <p className="text-xs text-gray-500">
                                Máximo: <span className="font-semibold">{totalQuantidade}</span>
                            </p>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <input
                                type="number"
                                min="1"
                                max={totalQuantidade}
                                value={quantidadeAReduzir}
                                onChange={(e) => setQuantidadeAReduzir(e.target.value)}
                                placeholder="Digite a quantidade"
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:bg-gray-100"
                            />

                            <div className="flex gap-3 mt-2">
                                <Button 
                                    variant="outline"
                                    className="flex-1 text-gray-600"
                                    onClick={() => {
                                        setAcao("inicial")
                                        setQuantidadeAReduzir("")
                                        setError(null)
                                    }}
                                >
                                    Voltar
                                </Button>

                                <Button 
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                                    onClick={handleReduzir}                                  
                                >
                                  Confirmar Redução                                   
                                </Button>
                            </div>
                        </>
                    )}

                    {acao === "deletar" && (
                        <>
                            <p className="text-sm text-gray-600">
                                Tem certeza que deseja excluir o livro{" "}
                                <span className="font-semibold text-gray-900">{booktitle}</span>?
                                Esta ação não pode ser desfeita.
                            </p>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 mt-2">
                                <Button 
                                    variant="outline"
                                    className="flex-1 text-gray-600"
                                    onClick={() => {
                                        setAcao("inicial")
                                        setError(null)
                                    }}
                                >
                                    Voltar
                                </Button>

                                <Button 
                                    className="flex-1 bg-red-500 hover:bg-red-600"
                                    onClick={handleDeletar}                                   
                                >
                                  Confirmar Exclusão
                                </Button>
                            </div>
                        </>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    )
}