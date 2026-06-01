import { PrismaClient, type Prisma } from "@prisma/client";
import { prisma } from "../database";

export type LoanCreateInput = Prisma.EmprestimoCreateInput
export type LoanReturnType = Prisma.EmprestimoGetPayload<{
  include: {
    livro: true;
  };
}>;

export function getLoan(loanId: string) {
  // Usando a instância já criada do Prisma
  return prisma.emprestimo.findUnique({
    where: { id: loanId },
    include: { livro: true },
  });
}

export function createLoan(data: LoanCreateInput) {
  // Usando a instância já criada do Prisma
  return prisma.emprestimo.create({
    data,
  });
}