"use client";

import { useEffect, useState } from "react";
import LatestLoans, { Loan } from "@/components/ui/LatestLoans";
import CardsDashboard from "@/components/ui/CardsDoDashboard";
import { BookChart } from "@/components/ui/Chart/BookChart/bookChart";
import { api } from "@/services/api";


type ApiLoan = {
  id: string;
  nomeCliente: string;
  dataLocacao: string;
  dataPrevistaDevolucao: string;
  status: "EM_ANDAMENTO" | "ATRASADO" | "DEVOLVIDO";
  livro: { titulo: string };
};

type ApiBook = {
  id: string;
  titulo: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatStatus(status: ApiLoan["status"]): Loan["status"] {
  if (status === "DEVOLVIDO") return "Devolvido";
  if (status === "ATRASADO") return "Atrasado";

  return "Em andamento";
}

function mapLoan(apiLoan: ApiLoan): Loan {
  return {
    id: apiLoan.id,
    book: apiLoan.livro.titulo,
    client: apiLoan.nomeCliente,
    loanDate: formatDate(apiLoan.dataLocacao),
    returnDate: formatDate(apiLoan.dataPrevistaDevolucao),
    status: formatStatus(apiLoan.status),
    sortDate: apiLoan.dataLocacao,
  };
}

export default function DashboardPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [totalLivros, setTotalLivros] = useState(0);
  const [emprestimosAtivos, setEmprestimosAtivos] = useState(0);
  const [livrosAtrasados, setLivrosAtrasados] = useState(0);
  
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const loansResponse = await api.get<ApiLoan[]>("/loans");
        const booksResponse = await api.get<ApiBook[]>("/book");

        const formattedLoans = loansResponse.data.map(mapLoan);

        const totalLivros = booksResponse.data.reduce(
          (total, book) => total + book.quantidadeTotal,
          0
        );

        const emprestimosAtivos = formattedLoans.filter(
          (loan) => loan.status === "Em andamento"
        ).length;

        const livrosAtrasados = formattedLoans.filter(
          (loan) => loan.status === "Atrasado"
        ).length;

        setLoans(formattedLoans);
        setTotalLivros(totalLivros);
        setEmprestimosAtivos(emprestimosAtivos);
        setLivrosAtrasados(livrosAtrasados);
      } catch (error) {
        console.error("Erro ao carregar dados da dashboard:", error);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#F7F9FA] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-[#0B0F19]">
            Dashboard
          </h1>
          <p className="text-sm text-[#6B7280]">
            Visão geral da biblioteca
          </p>
        </div>

        <CardsDashboard
          totalLivros={totalLivros}
          emprestimosAtivos={emprestimosAtivos}
          livrosAtrasados={livrosAtrasados}
        />
        <BookChart />
        <LatestLoans loans={loans} />
      </div>
    </main>
  );
}