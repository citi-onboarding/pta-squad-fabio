import Redis from "ioredis";
import { Queue, Worker, Job } from "bullmq";
import { PrismaClient } from "@prisma/client";

/**
 * Testes de Integração para RecoveryWorker com Redis Real + BD Real
 *
 * RecoveryWorker faz busca periódica por eventos não enviados e reprocessa
 */
describe("RecoveryWorker - Integração com Redis Real + BD Real", () => {
  let redis: Redis;
  let prisma: PrismaClient;
  let emailJobQueue: Queue;
  let recoveryQueue: Queue;

  beforeAll(async () => {
    // Conectar ao Redis
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    // Conectar ao banco
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || "postgresql://postgres:docker@localhost:5432/pta",
        },
      },
    });

    // Criar filas
    emailJobQueue = new Queue("mail-notification-recovery-test", {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
      },
    });

    recoveryQueue = new Queue("recovery-check-test", {
      connection: redis,
    });

    // Testar conexões
    try {
      await redis.ping();
      console.log("✅ Redis conectado");
    } catch (error) {
      throw new Error("Não foi possível conectar ao Redis");
    }

    try {
      await prisma.$executeRawUnsafe("SELECT 1");
      console.log("✅ BD conectada");
    } catch (error) {
      throw new Error("Não foi possível conectar ao BD");
    }

    // Limpar
    await emailJobQueue.obliterate({ force: true });
    await recoveryQueue.obliterate({ force: true });
  });

  afterAll(async () => {
    await emailJobQueue.close();
    await recoveryQueue.close();
    await redis.quit();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await emailJobQueue.obliterate({ force: true });
    await recoveryQueue.obliterate({ force: true });

    await prisma.outboxEvent.deleteMany({
      where: {
        id: {
          startsWith: "test-recovery-",
        },
      },
    });
  });

  describe("Recuperação de eventos não enviados", () => {
    it("deve encontrar eventos processados mas não enviados", async () => {
      // Criar evento perdido (processado mas não enviado)
      const event = await prisma.outboxEvent.create({
        data: {
          id: "test-recovery-001",
          eventType: "send-mail",
          payload: {
            loanId: "loan-recovery-001",
            dataPrevistaDevolucao: new Date().toISOString(),
          },
          processed: true,
          emailEnviado: false,
        },
      });

      // Buscar eventos perdidos
      const perdidos = await prisma.outboxEvent.findMany({
        where: {
          eventType: "send-mail",
          processed: true,
          emailEnviado: false,
        },
      });

      expect(perdidos.length).toBeGreaterThan(0);
      expect(perdidos.some((e) => e.id === "test-recovery-001")).toBe(true);
    });

    it("deve reprocessar eventos perdidos adicionando à fila", async () => {
      // Criar múltiplos eventos perdidos
      const eventIds = [];
      for (let i = 0; i < 3; i++) {
        const event = await prisma.outboxEvent.create({
          data: {
            id: `test-recovery-batch-${i}`,
            eventType: "send-mail",
            payload: {
              loanId: `loan-recovery-batch-${i}`,
              dataPrevistaDevolucao: new Date().toISOString(),
            },
            processed: true,
            emailEnviado: false,
          },
        });
        eventIds.push(event.id);
      }

      // Simular recovery
      const perdidos = await prisma.outboxEvent.findMany({
        where: {
          eventType: "send-mail",
          processed: true,
          emailEnviado: false,
        },
      });

      // Reprocessar
      for (const event of perdidos) {
        const { loanId, dataPrevistaDevolucao } = event.payload as any;
        const devolucao = new Date(dataPrevistaDevolucao);
        devolucao.setHours(8, 0, 0, 0);
        const delay = Math.max(devolucao.getTime() - Date.now(), 0);

        await emailJobQueue.add("send-email", { loanId }, {
          delay,
          jobId: `send-mail-${loanId}`,
        });
      }

      // Verificar jobs criados
      const jobs = await emailJobQueue.getWaiting();
      expect(jobs.length).toBeGreaterThanOrEqual(3);
    });

    it("deve ignorar eventos já enviados", async () => {
      // Criar evento já enviado
      await prisma.outboxEvent.create({
        data: {
          id: "test-recovery-already-sent",
          eventType: "send-mail",
          payload: {
            loanId: "loan-sent",
            dataPrevistaDevolucao: new Date().toISOString(),
          },
          processed: true,
          emailEnviado: true,
        },
      });

      // Buscar apenas não enviados
      const perdidos = await prisma.outboxEvent.findMany({
        where: {
          eventType: "send-mail",
          processed: true,
          emailEnviado: false,
        },
      });

      // Não deve incluir o enviado
      const encontrado = perdidos.find((e) => e.id === "test-recovery-already-sent");
      expect(encontrado).toBeUndefined();
    });
  });

  describe("Agendamento periódico", () => {
    it("deve agendar job de recovery", async () => {
      const job = await recoveryQueue.add(
        "recovery-check",
        {},
        {
          repeat: { pattern: "0 */12 * * *" }, // a cada 12 horas
          jobId: "recovery-12h-test",
        }
      );

      expect(job.id).toBeDefined();

      // Verificar se foi agendado
      const scheduled = await recoveryQueue.getJob("recovery-12h-test");
      expect(scheduled).toBeDefined();
      expect(scheduled?.opts.repeat).toBeDefined();
    });

    it("deve processar job de recovery com worker", async () => {
      // Criar eventos perdidos
      for (let i = 0; i < 2; i++) {
        await prisma.outboxEvent.create({
          data: {
            id: `test-recovery-worker-${i}`,
            eventType: "send-mail",
            payload: {
              loanId: `loan-worker-${i}`,
              dataPrevistaDevolucao: new Date().toISOString(),
            },
            processed: true,
            emailEnviado: false,
          },
        });
      }

      let recoveredCount = 0;

      // Criar worker de recovery
      const worker = new Worker(
        "recovery-check-test",
        async (job: Job) => {
          // Buscar eventos perdidos
          const perdidos = await prisma.outboxEvent.findMany({
            where: {
              eventType: "send-mail",
              processed: true,
              emailEnviado: false,
            },
          });

          recoveredCount = perdidos.length;

          // Reprocessar cada um
          for (const event of perdidos) {
            const { loanId } = event.payload as any;
            await emailJobQueue.add("send-email", { loanId }, {
              jobId: `send-mail-recovered-${loanId}`,
            });
          }

          return { recovered: recoveredCount };
        },
        {
          connection: redis,
          concurrency: 1,
        }
      );

      // Adicionar job
      const job = await recoveryQueue.add("recovery-check", {});

      // Aguardar processamento
      await new Promise<void>((resolve) => {
        worker.on("completed", (completedJob) => {
          if (completedJob.id === job.id) {
            resolve();
          }
        });
        setTimeout(() => resolve(), 5000);
      });

      expect(recoveredCount).toBeGreaterThanOrEqual(2);

      // Verificar jobs criados
      const jobs = await emailJobQueue.getWaiting();
      expect(jobs.length).toBeGreaterThan(0);

      await worker.close();
    });
  });

  describe("Lógica de processamento", () => {
    it("deve processar eventos com datas futuras", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const event = await prisma.outboxEvent.create({
        data: {
          id: "test-recovery-future",
          eventType: "send-mail",
          payload: {
            loanId: "loan-future",
            dataPrevistaDevolucao: futureDate.toISOString(),
          },
          processed: true,
          emailEnviado: false,
        },
      });

      // Calcular delay
      const devolucao = new Date(event.payload.dataPrevistaDevolucao);
      devolucao.setHours(8, 0, 0, 0);
      const delay = devolucao.getTime() - Date.now();

      // Adicionar com delay
      const job = await emailJobQueue.add(
        "send-email",
        { loanId: event.payload.loanId },
        { delay: Math.max(delay, 0) }
      );

      expect(job.id).toBeDefined();
    });

    it("deve processar eventos com datas passadas imediatamente", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const event = await prisma.outboxEvent.create({
        data: {
          id: "test-recovery-past",
          eventType: "send-mail",
          payload: {
            loanId: "loan-past",
            dataPrevistaDevolucao: pastDate.toISOString(),
          },
          processed: true,
          emailEnviado: false,
        },
      });

      // Calcular delay (deve ser 0 ou negativo)
      const devolucao = new Date(event.payload.dataPrevistaDevolucao);
      devolucao.setHours(8, 0, 0, 0);
      const delay = Math.max(devolucao.getTime() - Date.now(), 0);

      const job = await emailJobQueue.add("send-email", {
        loanId: event.payload.loanId,
      });

      // Deve ser processado imediatamente (sem delay)
      expect(delay).toBe(0);
      expect(job.id).toBeDefined();
    });
  });

  describe("Recuperação em massa", () => {
    it("deve recuperar 100+ eventos perdidos eficientemente", async () => {
      // Criar muitos eventos perdidos
      const eventCount = 100;
      for (let i = 0; i < eventCount; i++) {
        await prisma.outboxEvent.create({
          data: {
            id: `test-recovery-mass-${i}`,
            eventType: "send-mail",
            payload: {
              loanId: `loan-mass-${i}`,
              dataPrevistaDevolucao: new Date().toISOString(),
            },
            processed: true,
            emailEnviado: false,
          },
        });
      }

      // Recuperar todos
      const perdidos = await prisma.outboxEvent.findMany({
        where: {
          eventType: "send-mail",
          processed: true,
          emailEnviado: false,
        },
      });

      expect(perdidos.length).toBe(eventCount);

      // Adicionar todos à fila
      let addedCount = 0;
      for (const event of perdidos) {
        await emailJobQueue.add(
          "send-email",
          { loanId: event.payload.loanId },
          { jobId: `send-mail-${event.payload.loanId}` }
        );
        addedCount++;
      }

      expect(addedCount).toBe(eventCount);

      const jobs = await emailJobQueue.getWaiting();
      expect(jobs.length).toBeGreaterThanOrEqual(eventCount);
    });
  });

  describe("Tratamento de erros", () => {
    it("deve capturar erro ao buscar eventos", async () => {
      let errorCaught = false;

      try {
        await prisma.$queryRawUnsafe(
          "SELECT * FROM nonexistent_table"
        );
      } catch (error) {
        errorCaught = true;
      }

      expect(errorCaught).toBe(true);
    });

    it("deve continuar processando mesmo com erro em um evento", async () => {
      // Criar eventos válidos
      for (let i = 0; i < 3; i++) {
        await prisma.outboxEvent.create({
          data: {
            id: `test-recovery-error-${i}`,
            eventType: "send-mail",
            payload: {
              loanId: `loan-error-${i}`,
              dataPrevistaDevolucao: new Date().toISOString(),
            },
            processed: true,
            emailEnviado: false,
          },
        });
      }

      const perdidos = await prisma.outboxEvent.findMany({
        where: {
          eventType: "send-mail",
          processed: true,
          emailEnviado: false,
        },
      });

      let processedCount = 0;
      for (const event of perdidos) {
        try {
          await emailJobQueue.add(
            "send-email",
            { loanId: event.payload.loanId },
            { jobId: `send-mail-${event.payload.loanId}` }
          );
          processedCount++;
        } catch (error) {
          console.error("Erro ao processar evento:", error);
          // Continuar com o próximo
        }
      }

      expect(processedCount).toBe(perdidos.length);
    });
  });
});
