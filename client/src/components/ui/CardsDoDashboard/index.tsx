"use client"
import Image from "next/image";
import { circle_alert, clock_red, book_red } from "@/assets"


type DashboardCardProps = {
 title: string
 value: number | string
 icon: React.ReactNode
 bgColor: string
}

function DashboardCard({
 title,
 value,
 icon,
 bgColor,
}: DashboardCardProps) {
 return (
   <div className="bg-white rounded-xl shadow-md p-4 w-full">
     <div className="flex items-center gap-3">


       <div className={`p-2 rounded-lg ${bgColor}`}>
           {icon}
       </div>


       <div className="flex flex-col">
         <p className="text-gray-500 text-sm">
           {title}
         </p>


         <h2 className="text-xl font-bold text-gray-700 leading-none">
           {value}
         </h2>
       </div>


     </div>
   </div>
 )
}


export default function CardsDashboard() {


 const totalLivros = "1,245"
 const emprestimosAtivos = 87
 const livrosAtrasados = 12


 return (
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


     <DashboardCard
       title="Total de Livros"
       value={totalLivros}
       icon={<Image src={book_red} alt="Livro" width={24} height={24} />}
       bgColor="bg-red-100"
     />


     <DashboardCard
       title="Empréstimos Ativos"
       value={emprestimosAtivos}
       icon={<Image src={clock_red} alt="Relógio" width={24} height={24} />}
       bgColor="bg-red-100"
     />


     <DashboardCard
       title="Livros Atrasados"
       value={livrosAtrasados}
       icon={<Image src={circle_alert} alt="Alerta" width={24} height={24} />}
       bgColor="bg-red-100"
     />


   </div>
 )
}