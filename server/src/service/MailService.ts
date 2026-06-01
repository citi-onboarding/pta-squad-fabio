  import nodemailer from "nodemailer";
  import type { Emprestimo } from "@prisma/client";
  import { transporter } from "../queues/EmailWorker";
  import type { Livro } from "@prisma/client";
  import { LoanReturnType } from "./LoanService";

export const sendEmail = async (loan: LoanReturnType) => {

  const dataFormatada =
    loan.dataPrevistaDevolucao.toLocaleDateString("pt-BR");

    transporter.sendMail({
    from: `"Biblioteca" <${process.env.SMTP_FROM}>`,
    to: loan.emailCliente,
    subject: `Lembrete: Devolução de "${loan.livro.titulo}" é hoje`,
    html: `
      <h2>Olá, ${loan.nomeCliente}!</h2>

      <p>
        Este é um lembrete de que o prazo de devolução do livro
        <strong>${loan.livro.titulo}</strong>
        é hoje, <strong>${dataFormatada}</strong>.
      </p>

      <p>Por favor, devolva o livro para evitar atrasos.</p>

      <br/>

      <p>
        Atenciosamente,<br/>
        Biblioteca
      </p>
    `,
  });
};