import {Queue} from "bullmq";
import {createRedisConnection} from "../config/RedisConfig";

export interface EmailJobData {
  loanId: string;
}

export const emailJobQueue = new Queue("mail-notification", {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: 300,
  },
});

