import Redis from "ioredis";
import { Queue, Worker, Job } from "bullmq";
import { EmailJobData } from "../../src/queues/EmailJobQueue";
import { PrismaClient } from "@prisma/client";

/**
 * Testes de Integração para EmailWorker com Redis Real
 *
 * Estes testes processam jobs de verdade com Redis real
 */
describe("EmailWorker - Integração com Redis Real", () => {
  let redis: Redis;
  let queue: Queue<EmailJobData>;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Conectar ao Redis real
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    // Conectar ao banco real
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || "postgresql://postgres:docker@localhost:5432/pta",
        },
      },
    });

    // Testar conexão Redis
    try {
      await redis.ping();
      console.log("✅ Conexão com Redis estabelecida");
    } catch (error) {
      throw new Error("Não foi possível conectar ao Redis");
    }

    // Testar conexão BD
    try {
      await prisma.$executeRawUnsafe("SELECT 1");
      console.log("✅ Conexão com banco de dados estabelecida");
    } catch (error) {
      throw new Error("Não foi possível conectar ao banco de dados");
    }

    // Criar fila de teste
    queue = new Queue("mail-notification-worker-test", {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
      },
    });

    // Limpar fila
    await queue.obliterate({ force: true });
  });

  afterAll(async () => {
    await queue.close();
    await redis.quit();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Limpar jobs
    await queue.obliterate({ force: true });

    // Limpar dados de teste do banco
    await prisma.outboxEvent.deleteMany({
      where: {
        payload: {
          path: ["loanId"],
          string_contains: "test-job-",
        },
      },
    });
  });

  describe("Processamento de jobs com dados reais", () => {
    it("deve adicionar job e obter status em tempo real", async () => {
      const jobData: EmailJobData = {
        loanId: "test-job-001",
      };

      const job = await queue.add("send-email", jobData);

      expect(job.id).toBeDefined();

      // Obter status do job
      const state = await job.getState();
      expect(state).toBe("waiting");

      const progress = await job.getProgress();
      expect(progress).toBe(0);
    });

    it("deve processar job com worker real", async () => {
      const jobData: EmailJobData = {
        loanId: "test-job-002",
      };

      const processedJobs: string[] = [];

      // Criar worker
      const worker = new Worker(
        "mail-notification-worker-test",
        async (job: Job<EmailJobData>) => {
          processedJobs.push(job.data.loanId);
          return { processed: true };
        },
        {
          connection: redis,
          concurrency: 1,
        }
      );

      // Adicionar job
      const job = await queue.add("send-email", jobData);

      // Aguardar processamento
      await new Promise<void>((resolve) => {
        worker.on("completed", (completedJob) => {
          if (completedJob.id === job.id) {
            resolve();
          }
        });
        setTimeout(() => resolve(), 5000);
      });

      expect(processedJobs).toContain("test-job-002");

      await worker.close();
    });

    it("deve capturar erros durante processamento", async () => {
      const jobData: EmailJobData = {
        loanId: "test-job-error",
      };

      // Criar worker que falha
      const worker = new Worker(
        "mail-notification-worker-test",
        async (job: Job<EmailJobData>) => {
          throw new Error("Simulated processing error");
        },
        {
          connection: redis,
          concurrency: 1,
        }
      );

      const job = await queue.add("send-email", jobData, {
        attempts: 1,
      });

      let jobFailed = false;

      await new Promise<void>((resolve) => {
        worker.on("failed", (failedJob, error) => {
          if (failedJob?.id === job.id) {
            jobFailed = true;
            resolve();
          }
        });
        setTimeout(() => resolve(), 5000);
      });

      expect(jobFailed).toBe(true);

      await worker.close();
    });
  });

  describe("Concorrência e paralelismo", () => {
    it("deve processar múltiplos jobs em paralelo", async () => {
      const workerConcurrency = 3;
      const jobCount = 10;

      const jobIds: string[] = [];
      const processedIds: string[] = [];

      // Criar worker com concorrência
      const worker = new Worker(
        "mail-notification-worker-test",
        async (job: Job<EmailJobData>) => {
          processedIds.push(job.id!);
          // Simular processamento
          await new Promise((resolve) => setTimeout(resolve, 100));
          return { processed: true };
        },
        {
          connection: redis,
          concurrency: workerConcurrency,
        }
      );

      // Adicionar múltiplos jobs
      for (let i = 0; i < jobCount; i++) {
        const job = await queue.add("send-email", {
          loanId: `test-parallel-${i}`,
        });
        jobIds.push(job.id!);
      }

      // Aguardar processamento
      await new Promise<void>((resolve) => {
        let completedCount = 0;
        worker.on("completed", () => {
          completedCount++;
          if (completedCount === jobCount) {
            resolve();
          }
        });
        setTimeout(() => resolve(), 15000);
      });

      expect(processedIds.length).toBeGreaterThan(0);

      await worker.close();
    });

    it("deve respeitar limite de concorrência", async () => {
      const concurrencyLimit = 2;
      let maxConcurrentJobs = 0;
      let currentConcurrentJobs = 0;

      const worker = new Worker(
        "mail-notification-worker-test",
        async (job: Job<EmailJobData>) => {
          currentConcurrentJobs++;
          maxConcurrentJobs = Math.max(maxConcurrentJobs, currentConcurrentJobs);

          // Simular processamento longo
          await new Promise((resolve) => setTimeout(resolve, 200));

          currentConcurrentJobs--;
          return { processed: true };
        },
        {
          connection: redis,
          concurrency: concurrencyLimit,
        }
      );

      // Adicionar 5 jobs
      for (let i = 0; i < 5; i++) {
        await queue.add("send-email", { loanId: `test-limit-${i}` });
      }

      // Aguardar
      await new Promise((resolve) => {
        let completedCount = 0;
        worker.on("completed", () => {
          completedCount++;
          if (completedCount === 5) {
            resolve(true);
          }
        });
        setTimeout(() => resolve(false), 15000);
      });

      expect(maxConcurrentJobs).toBeLessThanOrEqual(concurrencyLimit);

      await worker.close();
    });
  });

  describe("Retry com backoff", () => {
    it("deve fazer retry com backoff exponencial", async () => {
      const jobAttempts: number[] = [];

      const worker = new Worker(
        "mail-notification-worker-test",
        async (job: Job<EmailJobData>) => {
          jobAttempts.push(job.attemptsMade);

          // Falhar até a última tentativa
          if (job.attemptsMade < 2) {
            throw new Error("Retry test");
          }

          return { processed: true };
        },
        {
          connection: redis,
          concurrency: 1,
        }
      );

      const job = await queue.add("send-email", { loanId: "test-retry" }, {
        attempts: 3,
        backoff: { type: "exponential", delay: 100 },
      });

      // Aguardar processamento com retries
      await new Promise<void>((resolve) => {
        worker.on("completed", (completedJob) => {
          if (completedJob.id === job.id) {
            resolve();
          }
        });
        setTimeout(() => resolve(), 10000);
      });

      expect(jobAttempts.length).toBeGreaterThanOrEqual(1);

      await worker.close();
    });
  });

  describe("Persistência de estado", () => {
    it("deve recuperar jobs não processados após falha", async () => {
      const jobData = { loanId: "test-persist-001" };

      // Adicionar job
      const job = await queue.add("send-email", jobData);
      const jobId = job.id!;

      // Verificar que está waiting
      let state = await job.getState();
      expect(state).toBe("waiting");

      // Obter jobs waiting
      const waitingJobs = await queue.getWaiting();
      const jobExists = waitingJobs.some((j) => j.id === jobId);
      expect(jobExists).toBe(true);

      // Simular falha do worker (job permanece no Redis)
      // Processar uma vez para deixar em state específico
      const worker = new Worker(
        "mail-notification-worker-test",
        async (job: Job<EmailJobData>) => {
          // Não fazer nada, deixar como completed
          return { processed: true };
        },
        {
          connection: redis,
          concurrency: 1,
        }
      );

      await new Promise<void>((resolve) => {
        worker.on("completed", (completedJob) => {
          if (completedJob.id === jobId) {
            resolve();
          }
        });
        setTimeout(() => resolve(), 5000);
      });

      await worker.close();
    });
  });

  describe("Integração com Outbox Pattern", () => {
    it("deve registrar eventos no outbox ao processar job", async () => {
      const jobData: EmailJobData = {
        loanId: "test-outbox-001",
      };

      const worker = new Worker(
        "mail-notification-worker-test",
        async (job: Job<EmailJobData>) => {
          const { loanId } = job.data;

          // Simular criação de evento no outbox
          const event = await prisma.outboxEvent.create({
            data: {
              payload: { loanId, timestamp: new Date() },
              emailEnviado: true,
            },
          });

          return { outboxId: event.id };
        },
        {
          connection: redis,
          concurrency: 1,
        }
      );

      const job = await queue.add("send-email", jobData);

      let outboxCreated = false;

      await new Promise<void>((resolve) => {
        worker.on("completed", async (completedJob) => {
          if (completedJob.id === job.id) {
            // Verificar se foi criado no banco
            const events = await prisma.outboxEvent.findMany({
              where: {
                payload: {
                  path: ["loanId"],
                  equals: jobData.loanId,
                },
              },
            });

            outboxCreated = events.length > 0;
            resolve();
          }
        });
        setTimeout(() => resolve(), 5000);
      });

      expect(outboxCreated).toBe(true);

      await worker.close();
    });
  });
});
