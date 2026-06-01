import { Worker, Job } from "bullmq";
import nodemailer from "nodemailer";
import { createRedisConnection, redisConfig } from "../config/RedisConfig";
import { EmailJobData } from "../queues/EmailJobQueue";
import { calcularStatus } from "../controllers/LoanController";
import Citi from "../global/Citi";
import { sendEmail } from "../service/MailService";
import type { Emprestimo } from "@prisma/client";
import { getLoan, LoanReturnType } from "../service/LoanService";

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

  const { loanId } = job.data;
  const loanWithBook: LoanReturnType | null = await getLoan(loanId);

  // validacao do estado do emprestimo
  if (!loanWithBook || loanWithBook.status === "DEVOLVIDO") {
    console.log(`[EmailWorker] Empréstimo ${loanId} não existe mais, pulando.`);
    return;
  }

  await sendEmail(loanWithBook);

  console.log(`[EmailWorker] mail send `);
};

export const startEmailWorker = () => {
const worker = new Worker(
  "mail-notification",
  processEmailJob,
  {
    connection: redisConfig,
    concurrency: 10,
  }
);

  worker.on("completed", (job) => console.log(`[EmailWorker] Job ${job.id} concluído`));
  worker.on("failed", (job, err) => console.error(`[EmailWorker] Job ${job?.id} falhou:`, err.message));

  return worker;
};