import { createRedisConnection } from "../config/RedisConfig";
import { prisma } from "../database";
import { emailJobQueue } from "../queues/EmailJobQueue";

const processOutboxEvent = async (outboxId: string) => {
    const event = await prisma.outboxEvent.findUnique({
        where: { id: outboxId },
    });

    if (!event || event.processed) return;

    const { loanId, dataPrevistaDevolucao } = event.payload as {
         loanId: string;
        dataPrevistaDevolucao: string
    };

    const devolucao = new Date(dataPrevistaDevolucao);
    devolucao.setHours(8, 0, 0, 0); // envia às 8h do dia de devolução
    const delay = Math.max(devolucao.getTime() - Date.now(), 0);

    await emailJobQueue.add(
        "send-mail",
        { loanId },
        {
            delay,
            jobId: `send-mail-${loanId}`,
        }
    );

    await prisma.outboxEvent.update({
        where: { id: outboxId },
        data: { processed: true },
    });
};

export const startOutboxWorker = () => {
    const subscriber = createRedisConnection();

    subscriber.subscribe("outbox:send-mail", (err) => {
        if (err) console.error("[OutboxWorker] Erro ao subscrever:", err);
        else console.log("[OutboxWorker] Inscrito no canal outbox:send-mail");
    });

    subscriber.on("message", async (channel, outboxId) => {
        if (channel !== "outbox:send-mail") return;
        try {
            await processOutboxEvent(outboxId);
        } catch (error) {
            console.error("[OutboxWorker] Erro ao processar evento:", error);
        }
    });
};