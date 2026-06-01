import { Worker, Job } from "bullmq";
import { createRedisConnection, redisConfig } from "../config/RedisConfig";
import { EmailJobData } from "../queues/EmailJobQueue";
import { calcularStatus } from "../controllers/LoanController";
import Citi from "../global/Citi";
import { sendMail } from "../service/MailService";
import type { Emprestimo } from "@prisma/client";
import { getLoan, LoanReturnType } from "../service/LoanService";
import prisma from "../database";

/**
 * EmailWorker.ts
 *
 * Worker responsável por processar os jobs da fila "mail-notification".
 *
 * Fluxo:
 * 1. Consome um job da fila contendo o `loanId` de um empréstimo.
 * 2. Busca os dados completos do empréstimo no banco via `getLoan`.
 * 3. Valida se o empréstimo ainda existe e não foi devolvido — se inválido, ignora o job.
 * 4. Chama `sendMail` para disparar o e-mail de notificação ao usuário.
 * 5. Marca o evento correspondente no `OutboxEvent` como `emailEnviado: true`,
 *    garantindo rastreabilidade e evitando reenvios desnecessários.
 *
 * Configurado com concorrência de 10 jobs simultâneos.
 */

const processEmailJob = async (job: Job<EmailJobData>) => {

  const { loanId } = job.data;
  const loanWithBook: LoanReturnType | null = await getLoan(loanId);

  // validacao do estado do emprestimo
  if (!loanWithBook || loanWithBook.status === "DEVOLVIDO") {
    console.log(`[EmailWorker] Empréstimo ${loanId} não existe mais, pulando.`);
    return;
  }

  await sendMail(loanWithBook);

  await prisma.outboxEvent.updateMany({
    where: {
          payload: { path: ["loanId"], equals: loanId },
          emailEnviado: false,
        },
      data: { emailEnviado: true },
    });

  console.log(`[EmailWorker] mail send `);
};

export { processEmailJob };

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