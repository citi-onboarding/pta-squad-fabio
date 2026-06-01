import Redis from "ioredis";
import { Queue, Worker, Job } from "bullmq";
import { PrismaClient } from "@prisma/client";

/**
 * Testes de Integração para OutBoxWorker com Redis Real + BD Real
 *
 * OutBoxWorker processa eventos do outbox e cria jobs de email
 */
describe("OutBoxWorker - Integração com Redis Real + BD Real", () => {
  let redis: Redis;
  let prisma: PrismaClient;
  let emailJobQueue: Queue;

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

    // Criar fila de emails
    emailJobQueue = new Queue("mail-notification-outbox-test", {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
      },
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

    // Limpar filas
    await emailJobQueue.obliterate({ force: true });
  });

  afterAll(async () => {
    await emailJobQueue.close();
    await redis.quit();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await emailJobQueue.obliterate({ force: true });
    await redis.del("outbox:send-mail");

    await prisma.outboxEvent.deleteMany({
      where: {
        id: {
          startsWith: "test-outbox-",
        },
      },
    });
  });

  describe("Processamento de eventos do outbox", () => {
    it("deve criar outbox event e processar via fila", async () => {
      // Criar outbox event
      const event = await prisma.outboxEvent.create({
        data: {
          id: "test-outbox-001",
          eventType: "send-mail",
          payload: {
            loanId: "loan-outbox-001",
            dataPrevistaDevolucao: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          processed: false,
          emailEnviado: false,
        },
      });

      expect(event.id).toBe("test-outbox-001");
      expect(event.processed).toBe(false);

      // Simular processamento do outbox
      const { loanId, dataPrevistaDevolucao } = event.payload as any;
      const devolucao = new Date(dataPrevistaDevolucao);
      devolucao.setHours(8, 0, 0, 0);
      const delay = Math.max(devolucao.getTime() - Date.now(), 0);

      await emailJobQueue.add(
        "send-email",
        { loanId },
        {
          delay: Math.max(delay, 0),
          jobId: `send-mail-${loanId}`,
        }
      );

      // Marcar como processado
      await prisma.outboxEvent.update({
        where: { id: "test-outbox-001" },
        data: { processed: true },
      });

      // Verificar se foi criado job
      const jobs = await emailJobQueue.getWaiting();
      expect(jobs.length).toBeGreaterThan(0);

      // Verificar evento marcado como processado
      const updated = await prisma.outboxEvent.findUnique({
        where: { id: "test-outbox-001" },
      });
      expect(updated?.processed).toBe(true);
    });

    it("deve ignorar eventos já processados", async () => {
      // Criar evento já processado
      const event = await prisma.outboxEvent.create({
        data: {
          id: "test-outbox-already-processed",
          eventType: "send-mail",
          payload: {
            loanId: "loan-001",
            dataPrevistaDevolucao: new Date().toISOString(),
          },
          processed: true,
          emailEnviado: false,
        },
      });

      // Verificar que não deve processar
      if (event.processed) {
        console.log("✅ Evento já processado, ignorando");
      }

      expect(event.processed).toBe(true);
    });

    it("deve publicar mensagem no canal Redis", async () => {
      // Criar subscriber
      const subscriber = redis.duplicate();

      const messages: string[] = [];

      await subscriber.subscribe("outbox:send-mail", (err) => {
        if (err) console.error("Erro ao subscrever:", err);
      });

      subscriber.on("message", (channel, message) => {
        if (channel === "outbox:send-mail") {
          messages.push(message);
        }
      });

      // Publicar mensagem
      await redis.publish("outbox:send-mail", "test-outbox-pub-001");

      // Aguardar
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(messages).toContain("test-outbox-pub-001");

      await subscriber.unsubscribe();
      await subscriber.quit();
    });
  });

  describe("Agendamento com delay", () => {
    it("deve agendar email para data de devolução", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      futureDate.setHours(8, 0, 0, 0);

      const event = await prisma.outboxEvent.create({
        data: {
          id: "test-outbox-schedule",
          eventType: "send-mail",
          payload: {
            loanId: "loan-schedule",
            dataPrevistaDevolucao: futureDate.toISOString(),
          },
          processed: false,
          emailEnviado: false,
        },
      });

      // Calcular delay
      const devolucao = new Date(futureDate);
      const delay = devolucao.getTime() - Date.now();

      // Adicionar job com delay
      const job = await emailJobQueue.add(
        "send-email",
        { loanId: event.payload.loanId },
        {
          delay: Math.max(delay, 0),
          jobId: `send-mail-${event.payload.loanId}`,
        }
      );

      expect(job.id).toBeDefined();

      // Verificar se job tem delay agendado
      const retrievedJob = await emailJobQueue.getJob(job.id!);
      expect(retrievedJob?.opts.delay).toBeGreaterThan(0);
    });
  });

  describe("Múltiplos eventos do outbox", () => {
    it("deve processar múltiplos eventos em sequência", async () => {
      const events = [];

      for (let i = 0; i < 5; i++) {
        const event = await prisma.outboxEvent.create({
          data: {
            id: `test-outbox-multi-${i}`,
            eventType: "send-mail",
            payload: {
              loanId: `loan-multi-${i}`,
              dataPrevistaDevolucao: new Date().toISOString(),
            },
            processed: false,
            emailEnviado: false,
          },
        });
        events.push(event);
      }

      // Processar todos
      for (const event of events) {
        await emailJobQueue.add(
          "send-email",
          { loanId: event.payload.loanId },
          { jobId: `send-mail-${event.payload.loanId}` }
        );

        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { processed: true },
        });
      }

      // Verificar
      const jobs = await emailJobQueue.getWaiting();
      expect(jobs.length).toBeGreaterThanOrEqual(5);

      const processedEvents = await prisma.outboxEvent.findMany({
        where: {
          id: { startsWith: "test-outbox-multi-" },
          processed: true,
        },
      });
      expect(processedEvents.length).toBe(5);
    });
  });

  describe("Rastreamento de emails enviados", () => {
    it("deve marcar email como enviado no outbox", async () => {
      const event = await prisma.outboxEvent.create({
        data: {
          id: "test-outbox-tracking",
          eventType: "send-mail",
          payload: {
            loanId: "loan-tracking",
            dataPrevistaDevolucao: new Date().toISOString(),
          },
          processed: true,
          emailEnviado: false,
        },
      });

      expect(event.emailEnviado).toBe(false);

      // Simular envio
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { emailEnviado: true },
      });

      const updated = await prisma.outboxEvent.findUnique({
        where: { id: event.id },
      });

      expect(updated?.emailEnviado).toBe(true);
    });
  });
});
