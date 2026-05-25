"use client"
import { Button } from "../Button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ModalDeleteProps = {
    isOpen: boolean;
    onClose: () => void;
    booktitle: string;
}

export default function ModalDelete({ isOpen, onClose, booktitle}: ModalDeleteProps){
    const handleDelete = () => {
        onClose()
    };
    return(
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[350px] md:w-[393px] lg:w-[464px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Excluir Livro</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <p className="text-sm text-gray-600">
            Tem certeza que deseja excluir o livro{" "}
            <span className="font-semibold text-gray-900">{booktitle}</span>?
            Esta ação não pode ser desfeita.
          </p>

            <div className="flex gap-3 mt-2">
                <Button variant={"outline"} className="flex-1" onClick={onClose}>
                Cancelar
                </Button>
                <Button variant={"destructive"} className="flex-1" onClick={handleDelete}>
                Confirmar Exclusão
                </Button>
            </div>
        </div>

      </DialogContent>
    </Dialog>
    )
}