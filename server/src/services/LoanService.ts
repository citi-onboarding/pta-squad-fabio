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

export async function getLoansNotNotified() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const loans = await prisma.emprestimo.findMany({
    where: {
      sentMail: null,
      dataPrevistaDevolucao: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
    livro: true,
    },
  });
  return loans;
}

export function markLoanAsNotified(loanId: string) {
  return prisma.sentMail.create({
    data: {
      loanId,
    },
  });
}