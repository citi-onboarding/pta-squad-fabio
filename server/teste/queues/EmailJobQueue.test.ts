import { emailJobQueue, EmailJobData } from "../EmailJobQueue";
import { redisConfig } from "../../config/RedisConfig";

jest.mock("../../config/RedisConfig", () => ({
  redisConfig: {
    host: "localhost",
    port: 6379,
  },
  createRedisConnection: jest.fn(),
}));

jest.mock("bullmq", () => {
  return {
    Queue: jest.fn().mockImplementation((name, config) => {
      return {
        name,
        config,
        add: jest.fn().mockResolvedValue({ id: "job-123" }),
        getJob: jest.fn(),
        remove: jest.fn(),
        close: jest.fn(),
      };
    }),
  };
});

describe("EmailJobQueue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar fila com configurações padrão corretas", () => {
    expect(emailJobQueue).toBeDefined();
    expect(emailJobQueue.name).toBe("mail-notification");
  });

  it("deve ter configuração de retry com 3 tentativas", () => {
    expect(emailJobQueue.opts?.defaultJobOptions?.attempts).toBe(3);
  });

  it("deve ter backoff exponencial com delay de 5 segundos", () => {
    const backoff = emailJobQueue.opts?.defaultJobOptions?.backoff;
    expect(backoff?.type).toBe("exponential");
    expect(backoff?.delay).toBe(5000);
  });

  it("deve remover jobs completados automaticamente", () => {
    expect(
      emailJobQueue.opts?.defaultJobOptions?.removeOnComplete
    ).toBe(true);
  });

  it("deve remover jobs falhados após 300 milissegundos", () => {
    expect(emailJobQueue.opts?.defaultJobOptions?.removeOnFail).toBe(300);
  });

  it("deve adicionar job com dados válidos", async () => {
    const jobData: EmailJobData = {
      loanId: "loan-123",
    };

    const job = await emailJobQueue.add("email-job", jobData);

    expect(job).toBeDefined();
    expect(job.id).toBe("job-123");
  });

  it("deve adicionar múltiplos jobs à fila", async () => {
    const jobsData: EmailJobData[] = [
      { loanId: "loan-1" },
      { loanId: "loan-2" },
      { loanId: "loan-3" },
    ];

    const jobs = await Promise.all(
      jobsData.map((data) => emailJobQueue.add("email-job", data))
    );

    expect(jobs).toHaveLength(3);
    jobs.forEach((job) => {
      expect(job.id).toBeDefined();
    });
  });
});
