import { Button } from "@/components/ui/Button"
import { Eye, Trash2, Mail, Bookmark } from "lucide-react"

export default function PaginaTeste() {
  return (
    <div className="p-10 flex flex-row items-center gap-4 flex-wrap">
      
      {/* Botão Ver (Variante Outline) */}
      <Button variant="outline">
        <Eye className="mr-2 h-4 w-4" /> Ver
      </Button>

      {/* Botão Emprestar (Variante Default) */}
      <Button variant="default">
        <Bookmark className="mr-2 h-4 w-4" /> Emprestar
      </Button>

      {/* Botão Deletar (Variante Destructive) */}
      <Button variant="destructive" size="icon">
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Botão Enviar Lembrete (Outline com Ícone) */}
      <Button variant="outline">
        <Mail className="mr-2 h-4 w-4" /> Enviar Lembrete
      </Button>

      {/* Botão Confirmar (Default) */}
      <Button variant="default">
        Confirmar empréstimo
      </Button>

    </div>
  )
}