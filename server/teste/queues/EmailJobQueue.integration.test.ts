import Redis from "ioredis";
import { Queue } from "bullmq";
import { EmailJobData } from "../../src/queues/EmailJobQueue";

/**
 * Testes de Integração para EmailJobQueue com Redis Real
 *
 * Estes testes usam Redis REAL
 * Certifique-se de que Redis está rodando via docker-compose
 */
describe("EmailJobQueue - Integração com Redis Real", () => {
  let redis: Redis;
  let testQueue: Queue<EmailJobData>;

  beforeAll(async () => {
    // Conectar ao Redis real
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    // Testar conexão
    try {
      await redis.ping();
      console.log("✅ Conexão com Redis estabelecida");
    } catch (error) {
      console.error("❌ Erro ao conectar ao Redis:", error);
      throw new Error("Não foi possível conectar ao Redis");
    }

    // Criar fila de teste
    testQueue = new Queue("mail-notification-test-real", {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
      },
    });

    // Limpar fila antes dos testes
    await testQueue.obliterate({ force: true });
  });

  afterAll(async () => {
    await testQueue.close();
    await redis.quit();
  });

  afterEach(async () => {
    // Limpar jobs após cada teste
    await testQueue.obliterate({ force: true });
  });

  describe("Operações básicas com Redis", () => {
    it("deve adicionar um job e recuperá-lo", async () => {
      const jobData: EmailJobData = {
        loanId: "loan-redis-001",
      };

      const job = await testQueue.add("send-email", jobData);

      expect(job.id).toBeDefined();

      const retrievedJob = await testQueue.getJob(job.id!);

      expect(retrievedJob).toBeDefined();
      expect(retrievedJob?.data).toEqual(jobData);
    });

    it("deve contar jobs na fila", async () => {
      await testQueue.add("send-email", { loanId: "loan-1" });
      await testQueue.add("send-email", { loanId: "loan-2" });
      await testQueue.add("send-email", { loanId: "loan-3" });

      const counts = await testQueue.getJobCounts();

      expect(counts.waiting).toBe(3);
    });
  });

  describe("Persistência de dados", () => {
    it("jobs devem persistir entre conexões", async () => {
      const jobData = { loanId: "loan-persist" };

      const job = await testQueue.add("send-email", jobData);
      const jobId = job.id!;

      // Fechar fila
      await testQueue.close();

      // Aguardar um pouco
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Reconectar
      const newQueue = new Queue("mail-notification-test-real", {
        connection: redis,
      });

      // Verificar que job ainda está lá
      const retrievedJob = await newQueue.getJob(jobId);
      expect(retrievedJob).toBeDefined();
      expect(retrievedJob?.data).toEqual(jobData);

      await newQueue.close();
    });
  });

  describe("Operações em lote", () => {
    it("deve adicionar múltiplos jobs eficientemente", async () => {
      const jobsData = Array.from({ length: 10 }, (_, i) => ({
        loanId: `loan-batch-${i + 1}`,
      }));

      const jobs = await Promise.all(
        jobsData.map((data) => testQueue.add("send-email", data))
      );

      expect(jobs).toHaveLength(10);

      const counts = await testQueue.getJobCounts();
      expect(counts.waiting).toBe(10);
    });

    it("deve processar jobs em ordem FIFO", async () => {
      const jobIds: string[] = [];

      for (let i = 0; i < 5; i++) {
        const job = await testQueue.add("send-email", {
          loanId: `loan-fifo-${i}`,
        });
        jobIds.push(job.id!);
      }

      const waitingJobs = await testQueue.getWaiting(0, 4);

      // Verificar que jobs estão em ordem
      expect(waitingJobs.map((j) => j.id)).toEqual(jobIds);
    });
  });

  describe("Retry e backoff", () => {
    it("deve respeitar configuração de retry", async () => {
      const job = await testQueue.add(
        "send-email",
        { loanId: "loan-retry" },
        {
          attempts: 5,
          backoff: { type: "exponential", delay: 1000 },
        }
      );

      const savedJob = await testQueue.getJob(job.id!);

      expect(savedJob?.opts.attempts).toBe(5);
      expect((savedJob?.opts.backoff as any)?.type).toBe("exponential");
    });
  });

  describe("Limpeza de dados", () => {
    it("deve remover jobs antigos da fila", async () => {
      const job1 = await testQueue.add("send-email", { loanId: "loan-old-1" });
      const job2 = await testQueue.add("send-email", { loanId: "loan-old-2" });

      const counts = await testQueue.getJobCounts();
      expect(counts.waiting).toBeGreaterThanOrEqual(2);

      // Limpar a fila
      await testQueue.obliterate({ force: true });

      const countsAfter = await testQueue.getJobCounts();
      expect(countsAfter.waiting).toBe(0);
    });
  });
});
