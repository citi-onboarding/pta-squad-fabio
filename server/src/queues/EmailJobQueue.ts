import {Queue} from "bullmq";
import {createRedisConnection} from "../config/RedisConfig";
import {redisConfig} from "../config/RedisConfig";

export interface EmailJobData {
  loanId: string;
}
/**
 * EmailJobQueue.ts
 *
 * Define e exporta a fila BullMQ "mail-notification", usada para
 * agendamento assíncrono do envio de e-mails de notificação de empréstimos.
 *
 * Fluxo:
 * 1. Jobs são adicionados à fila por outros módulos (ex: OutboxWorker)
 *    com um `delay` calculado para o horário ideal de envio.
 * 2. A fila gerencia tentativas automáticas em caso de falha:
 *    até 3 tentativas com backoff exponencial de 5 segundos.
 * 3. Jobs concluídos são removidos imediatamente; falhos são mantidos
 *    por até 300 segundos para inspeção/debug antes de serem descartados.
 *
 * Serve como contrato central de comunicação entre produtores
 * (OutboxWorker, RecoveryWorker) e consumidores (EmailWorker).
 */

//Sistema de fila para envio de email de notificacao de emprestimo
//a ideia, eh fazer de forma que seja possivel um fallback
// para o caso de falha no envio do email,
//  e evitar que o sistema fique sobrecarregado com tentativas de envio em massa.
// O sistema de fila permite que os emails sejam processados de forma assíncrona,
// garantindo que o servidor continue responsivo mesmo durante picos de demanda.
export const emailJobQueue = new Queue("mail-notification", {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: 300,
  },
});