import fs from "fs";
import path from "path";
import { transporter } from "../config/MailTransporterConfig";
import type { LoanReturnType } from "./LoanService";

const ASSETS_PATH = path.join(process.cwd(), "assets");

function buildHtml(
  templatePath: string,
  replacements: Record<string, string>
): string {
  let html = fs.readFileSync(templatePath, "utf-8");

  for (const [key, value] of Object.entries(replacements)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }

  return html;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

export async function sendMail(
  loan: LoanReturnType
): Promise<void> {
  const templatePath = path.join(
    ASSETS_PATH,
    "email-template.html"
  );

  const html = buildHtml(templatePath, {
    nomeCliente: loan.nomeCliente,
    tituloLivro: loan.livro.titulo,
    dataFormatada: formatDate(
      loan.dataPrevistaDevolucao
    ),
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: loan.emailCliente,
    subject: `Lembrete: devolução de "${loan.livro.titulo}" é hoje`,
    html,
  });
}

export async function sendOverdueBookMail(
  loan: LoanReturnType
): Promise<void> {
  const templatePath = path.join(
    ASSETS_PATH,
    "email-atrasado-template.html"
  );

  const diasAtraso = Math.floor(
    (
      Date.now() -
      new Date(
        loan.dataPrevistaDevolucao
      ).getTime()
    ) /
      (1000 * 60 * 60 * 24)
  );

  const html = buildHtml(templatePath, {
    nomeCliente: loan.nomeCliente,
    tituloLivro: loan.livro.titulo,
    dataFormatada: formatDate(
      loan.dataPrevistaDevolucao
    ),
    diasAtraso: String(diasAtraso),
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: loan.emailCliente,
    subject: `Aviso: devolução de "${loan.livro.titulo}" está em atraso`,
    html,
  });
}