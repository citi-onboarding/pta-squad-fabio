import { createRedisConnection } from "../config/RedisConfig";
import { prisma } from "../database";
import { emailJobQueue } from "../queues/EmailJobQueue";

/**
 * OutboxWorker.ts
 *
 * Worker baseado no padrão Transactional Outbox, responsável por
 * escutar eventos publicados no Redis e enfileirar jobs de envio de e-mail.
 *
 * Fluxo:
 * 1. Abre uma conexão Redis no modo subscriber e se inscreve no canal
 *    "outbox:send-mail".
 * 2. Ao receber uma mensagem (contendo o `outboxId`), busca o evento
 *    correspondente no banco de dados.
 * 3. Valida se o evento ainda não foi processado para garantir idempotência.
 * 4. Calcula o delay ideal com base na `dataPrevistaDevolucao`
 *    (agendando o envio para às 8h do dia de devolução).
 * 5. Adiciona o job na fila "mail-notification" com o delay calculado
 *    e um `jobId` fixo para evitar duplicatas.
 * 6. Marca o evento como `processed: true` no banco.
 *
 * É o ponto de entrada principal do pipeline de notificações,
 * desacoplando a criação do empréstimo do envio do e-mail.
 */

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