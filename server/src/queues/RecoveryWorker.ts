// src/workers/RecoveryWorker.ts
import { Worker, Queue } from "bullmq";
import { redisConfig } from "../config/RedisConfig";
import { prisma } from "../database";
import { emailJobQueue } from "../queues/EmailJobQueue";

const recoveryQueue = new Queue("recovery-check", { connection: redisConfig });

const processRecovery = async () => {

  //mails processados entretanto nao enviados
    const perdidos = await prisma.outboxEvent.findMany({
        where: {
            eventType: "send-mail",
            processed: true,
            emailEnviado: false,
        },
    });

    for (const event of perdidos) {
        const { loanId, dataPrevistaDevolucao } = event.payload as {
            loanId: string;
            dataPrevistaDevolucao: string;
        };

        const devolucao = new Date(dataPrevistaDevolucao);
        devolucao.setHours(8, 0, 0, 0);
        const delay = Math.max(devolucao.getTime() - Date.now(), 0);

        await emailJobQueue.add(
            "send-mail",
            { loanId },
            { delay, jobId: `send-mail-${loanId}` }
        );
    }

    console.log(`[RecoveryWorker] ${perdidos.length} job(s) reprocessado(s)`);
};

export const startRecoveryWorker = async () => {
    await recoveryQueue.add(
        "recovery-check",
        {},
        {
            repeat: { pattern: "0 */12 * * *" }, // a cada 12 horas
            jobId: "recovery-12h",
        }
    );

    const worker = new Worker("recovery-check", processRecovery, {
        connection: redisConfig,
        concurrency: 1,
    });

    worker.on("completed", (job) => console.log(`[RecoveryWorker] Job ${job.id} concluído`));
    worker.on("failed", (job, err) => console.error(`[RecoveryWorker] Job ${job?.id} falhou:`, err.message));

    return worker;
};