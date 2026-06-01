import { createRedisConnection } from "../config/RedisConfig";
import { prisma } from "../database";
import { emailJobQueue } from "../queues/EmailJobQueue";

const processOutboxEvent = async (outboxId: string) => {
    const event = await prisma.outboxEvent.findUnique({
        where: { id: outboxId },
    });

    if (!event || event.processed) return;

    const { loanId } = event.payload as { loanId: string };

    await emailJobQueue.add("send-mail", { loanId });

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