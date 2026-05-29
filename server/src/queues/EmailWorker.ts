import { Worker, Job } from "bullmq";
import nodemailer from "nodemailer";
import { createRedisConnection } from "../config/RedisConfig";
import { EmailJobData } from "..EmailJobQueue";
import prisma from "@database";
import { calcularStatus } from "../controllers/LoanController";
import Citi from "@global/Citi";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  pool: true,
  maxConnections: 3,
  maxMessages: 50,
});

const processEmailJob = async (job: Job<EmailJobData>) => {
  const { emprestimoId } = job.data;

  const citi = new Citi("Emprestimo");
  const loan = await citi.getLoan(emprestimoId);

  // validacao do estado do emprestimo
  if (!loan || loan.status === "DEVOLVIDO") {
    console.log(`[EmailWorker] Empréstimo ${emprestimoId} não existe mais, pulando.`);
    return;
  }

  const dataFormatada = loan.dataPrevistaDevolucao.toLocaleDateString("pt-BR");
  //adiconar logica de envio do email

  console.log(`[EmailWorker] E-mail enviado para ${loan.emailCliente}`);
};

export const startEmailWorker = () => {
const worker = new Worker(
  "mail-notification",
  processEmailJob,
  {
    connection: createRedisConnection(),
    concurrency: 10,
  }
);

  worker.on("completed", (job) => console.log(`[EmailWorker] Job ${job.id} concluído`));
  worker.on("failed", (job, err) => console.error(`[EmailWorker] Job ${job?.id} falhou:`, err.message));

  return worker;
};