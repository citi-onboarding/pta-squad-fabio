import {Queue} from "bullmq";
import {createRedisConnection} from "../config/RedisConfig";
import {redisConfig} from "../config/RedisConfig";

export interface EmailJobData {
  loanId: string;
}

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