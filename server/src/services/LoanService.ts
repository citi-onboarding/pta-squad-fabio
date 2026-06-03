import { PrismaClient, type Prisma } from "@prisma/client";
import { prisma } from "../database";

export type LoanCreateInput = Prisma.EmprestimoCreateInput
export type LoanReturnType = Prisma.EmprestimoGetPayload<{
  include: {
    livro: true;
  };
}>;

export function getLoanAndBook(loanId: string) {
  return prisma.emprestimo.findUnique({
    where: { id: loanId },
    include: { livro: true },
  });
}

export function createLoan(data: LoanCreateInput) {
  return prisma.emprestimo.create({
    data,
  });
}

export function getOverdueLoans() {
  return prisma.emprestimo.findMany({
    where: {
      dataPrevistaDevolucao: {
        lt: new Date(),
      },
    },
    include: { livro: true },
  });
}

export function getLoansNotNotified() {
  return prisma.emprestimo.findMany({
    where: {
      sentMail: null,
      dataPrevistaDevolucao: {
        lt: new Date(),
      },
    },
    include: { livro: true },
  });
}

export function markLoanAsNotified(loanId: string) {
  return prisma.sentMail.create({
    data: {
      loanId,
    },
  });
}