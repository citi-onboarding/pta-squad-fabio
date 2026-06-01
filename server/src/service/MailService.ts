import fs from "fs";
import path from "path";
import { transporter } from "../config/MailTransporterConfig";
import type { LoanReturnType } from "./LoanService";

const TEMPLATE_PATH = path.join(process.cwd(), "src", "templates", "email-template.html");
const LOGO_PATH = path.join(process.cwd(), "src", "assets", "logoCITi.png");

function buildHtml(loan: LoanReturnType): string {
    const dataFormatada = new Date(loan.dataPrevistaDevolucao)
        .toLocaleDateString("pt-BR");

    return fs
        .readFileSync(TEMPLATE_PATH, "utf-8")
        .replace("{{nomeCliente}}", loan.nomeCliente)
        .replace("{{tituloLivro}}", loan.livro.titulo)
        .replace("{{dataFormatada}}", dataFormatada);
}

export async function sendMail(loan: LoanReturnType): Promise<void> {
    const html = buildHtml(loan);

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: loan.emailCliente,
        subject: `Lembrete: devolução de "${loan.livro.titulo}" é hoje`,
        html,
        attachments: [
            {
                filename: "logoCITi.png",
                path: LOGO_PATH,
                cid: "logo-citi",
            },
        ],
    });
}