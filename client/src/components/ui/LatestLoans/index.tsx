"use client";

import { useState } from "react";
import Image from "next/image";
import { chevron_left, chevron_right } from "@/assets";

type LoanStatus = "Em andamento" | "Atrasado" | "Devolvido";

export type Loan = {
  id?: string | number;
  book: string;
  client: string;
  loanDate: string;
  returnDate: string;
  status: LoanStatus;
};

const statusStyles: Record<LoanStatus, string> = {
  "Em andamento": "border-[#FFDF20] bg-[#FEF9C2] text-[#A65F00]",
  "Atrasado": "border-[#EF44444D] bg-[#EF444433] text-[#EF4444]",
  "Devolvido": "border-[#00C3894D] bg-[#00C38933] text-[#00C389]",
};

function getLoanKey(loan: Loan) {
  return loan.id ?? `${loan.book}-${loan.client}-${loan.loanDate}`;
}

function StatusBadge({ status }: { status: LoanStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-sm leading-5 2xl:px-4 2xl:text-base ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export default function LatestLoans({ loans }: { loans: Loan[] }) {
  const [page, setPage] = useState(0);

  const loansPerPage = 4;

  // Invertendo a ordem para mostrar os mais recentes primeiro
  const orderedLoans = [...loans].reverse();

  // Calculando o total de páginas 
  const totalPages = Math.ceil(orderedLoans.length / loansPerPage);

  // Define quais os empréstimos da página atual
  const visibleLoans = orderedLoans.slice(
    page * loansPerPage,
    page * loansPerPage + loansPerPage
  );

  const canGoBack = page > 0;
  const canGoForward = page < totalPages - 1;

  return (
    <section className="flex w-full flex-col gap-6 rounded-lg border-[0.83px] border-[#D9E2E8] bg-white px-4 pb-6 pt-6 shadow-[0px_2px_4px_-2px_#0000001A,0px_4px_6px_-1px_#0000001A] sm:px-[24.83px] sm:pb-[24.83px] sm:pt-[24.83px] md:min-h-[344.73px]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[20px] font-semibold leading-6 text-[#0B0F19]">
          Últimos Empréstimos
        </h3>

        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">
              {page + 1} de {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canGoBack}
                onClick={() => setPage(page - 1)}
                aria-label="Ver empréstimos anteriores"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 shadow-sm transition hover:bg-red-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:shadow-none"
              >
                <Image
                  src={chevron_left}
                  alt=""
                  width={18}
                  height={18}
                  className={canGoBack ? "opacity-100" : "opacity-30"}
                />
              </button>

              <button
                type="button"
                disabled={!canGoForward}
                onClick={() => setPage(page + 1)}
                aria-label="Ver próximos empréstimos"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 shadow-sm transition hover:bg-red-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:shadow-none"
              >
                <Image
                  src={chevron_right}
                  alt=""
                  width={18}
                  height={18}
                  className={canGoForward ? "opacity-100" : "opacity-30"}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabela --> desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="h-[244.08px] w-full min-w-[720px] table-fixed text-left text-sm text-[#1E1E1E]">
          <thead className="border-b border-[#D9E2E8] bg-[#F7F9FA] text-sm font-semibold 2xl:text-base">
            <tr className="h-[48.82px]">
              <th className="px-4 py-3 w-[26%]">Livro</th>
              <th className="px-4 py-3 w-[15%]">Cliente</th>
              <th className="px-4 py-3 w-[19%]">Data de Locação</th>
              <th className="px-4 py-3 w-[21%]">Data de Devolução</th>
              <th className="px-4 py-3 w-[19%]">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleLoans.map((loan) => (
              <tr
                key={getLoanKey(loan)}
                className="h-[48.82px] border-b border-[#D9E2E8]"
              >
                <td className="px-4 py-3">{loan.book}</td>
                <td className="px-4 py-3">{loan.client}</td>
                <td className="px-4 py-3">{loan.loanDate}</td>
                <td className="px-4 py-3">{loan.returnDate}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={loan.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards --> mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {visibleLoans.map((loan) => (
          <div
            key={getLoanKey(loan)}
            className="rounded-md border border-[#D9E2E8] p-3"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-sm font-semibold text-[#1E1E1E]">
                  {loan.book}
                </p>
                <p className="text-xs text-gray-500">{loan.client}</p>
              </div>
              <StatusBadge status={loan.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-[#D9E2E8] pt-3">
              <div>
                <p className="text-xs text-gray-500">Locação</p>
                <p className="text-sm text-[#1E1E1E]">{loan.loanDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Devolução</p>
                <p className="text-sm text-[#1E1E1E]">{loan.returnDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}