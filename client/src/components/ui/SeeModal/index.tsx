"use client"
import { Button } from "../Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mail } from "@/assets"
import Image from "next/image";
import type { Categorias } from "../CardDeLivro";
import { Cover } from "../CardDeLivro";

type StatusEmprestimo = "Em andamento" | "Atrasado" | "Devolvido";

type Emprestimo = {
  nomeCliente: string;
  email: string;
  dataLocacao: string;
  dataPrevisao: string;
  status: StatusEmprestimo;
};

type ModalSeeProps = {
    isOpen: boolean;
    onClose: () => void;
    booktitle: string;
    category: Categorias;
    year: number;
    author: string;
    total: number;
    available: number;
    isbn: string;
    editora: string;
    emprestimos: Emprestimo[];
}

const statusStyles = {
    "Em andamento": "bg-yellow-100 text-yellow-800",
    "Atrasado": "bg-red-100 text-red-800",
    "Devolvido": "bg-green-100 text-green-800",
}

export default function ModalSee({
    isOpen, onClose, booktitle, category, year,
    author, total, available, isbn, editora,
    emprestimos
}:ModalSeeProps){
    const chosen_cover = Cover[category]

    return(
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1040px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                 <DialogTitle className="text-xl font-semibold">Detalhes do Livro</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 mt-4">
                    <div className="grid grid-cols-[160px_1fr] md:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr] gap-6">
                        <div className="relative w-full h-full rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                            src={chosen_cover}
                            alt={category}
                            fill
                        />
                        </div>

                        <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">{booktitle}</h2>
                            <p className="text-base text-gray-500 mt-1">{author}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            <div>
                            <p className="text-sm text-gray-500">ISBN</p>
                            <p className="text-base text-gray-900 font-medium">{isbn}</p>
                            </div>

                            <div>
                            <p className="text-sm text-gray-500">Categoria</p>
                            <p className="text-base text-emerald-500 font-medium">{category}</p>
                            </div>

                            <div>
                            <p className="text-sm text-gray-500">Editora</p>
                            <p className="text-base text-gray-900 font-medium">{editora}</p>
                            </div>

                            <div>
                            <p className="text-sm text-gray-500">Ano</p>
                            <p className="text-base text-gray-900 font-medium">{year}</p>
                            </div>

                            <div>
                            <p className="text-sm text-gray-500">Quantidade Total</p>
                            <p className="text-base text-gray-900 font-medium">{total} unidades</p>
                            </div>

                            <div>
                            <p className="text-sm text-gray-500">Quantidade Disponível</p>
                            <p className="text-base text-emerald-500 font-medium">{available} unidades</p>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Empréstimos</h3>
                        
                        <div className="flex flex-col gap-3">
                        {emprestimos.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4 text-center">Nenhum empréstimo registrado</p>
                        ) : (
                            emprestimos.slice(-3).reverse().map((emprestimo, index) => (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-4 flex  justify-between"
                            >
                                <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-base font-medium text-gray-900">
                                    {emprestimo.nomeCliente}
                                    </p>
                                    <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        statusStyles[emprestimo.status]
                                    }`}
                                    >
                                    {emprestimo.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">{emprestimo.email}</p>
                                <p className="text-sm text-gray-500">
                                    Locação: <span className="font-medium mr-4">{emprestimo.dataLocacao}</span>
                                    Previsão: <span className="font-medium">{emprestimo.dataPrevisao}</span>
                                </p>
                                </div>

                                {emprestimo.status === "Atrasado" && (
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Image src={mail} alt="Mail" width={16} height={16}/>
                                    Enviar Lembrete
                                </Button>
                                )}
                            </div>
                            ))
                        )}
                        </div>
                        </div>
            </DialogContent>
        </Dialog>
    )
}