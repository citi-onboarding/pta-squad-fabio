import { Job } from "bullmq";
import { startEmailWorker } from "../EmailWorker";
import * as LoanService from "../../service/LoanService";
import * as MailService from "../../service/MailService";
import prisma from "../../database";
import { EmailJobData } from "../EmailJobQueue";

// Mock das dependências externas
jest.mock("../../service/LoanService");
jest.mock("../../service/MailService");
jest.mock("../../database", () => ({
  __esModule: true,
  default: {
    outboxEvent: {
      updateMany: jest.fn(),
    },
  },
}));
jest.mock("../../config/RedisConfig", () => ({
  redisConfig: {
    host: "localhost",
    port: 6379,
  },
}));
jest.mock("bullmq", () => {
  const actualBullMQ = jest.requireActual("bullmq");
  return {
    ...actualBullMQ,
    Worker: jest.fn().mockImplementation((queueName, processor, options) => ({
      on: jest.fn().mockReturnThis(),
    })),
  };
});

describe("EmailWorker - processEmailJob", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve processar email com sucesso quando empréstimo existe", async () => {
    const mockLoan = {
      id: "loan-123",
      status: "ATIVO",
      usuarioId: "user-123",
      livroId: "book-123",
    };

    const job = {
      data: { loanId: "loan-123" },
    } as Job<EmailJobData>;

    jest.spyOn(LoanService, "getLoan").mockResolvedValue(mockLoan as any);
    jest.spyOn(MailService, "sendMail").mockResolvedValue(undefined);

    // Importar a função processEmailJob
    const { processEmailJob } = require("../EmailWorker");

    await processEmailJob(job);

    expect(LoanService.getLoan).toHaveBeenCalledWith("loan-123");
    expect(MailService.sendMail).toHaveBeenCalledWith(mockLoan);
    expect(prisma.outboxEvent.updateMany).toHaveBeenCalledWith({
      where: {
        payload: { path: ["loanId"], equals: "loan-123" },
        emailEnviado: false,
      },
      data: { emailEnviado: true },
    });
  });

  it("deve pular job quando empréstimo não existe", async () => {
    const job = {
      data: { loanId: "loan-inexistente" },
    } as Job<EmailJobData>;

    jest.spyOn(LoanService, "getLoan").mockResolvedValue(null);

    const { processEmailJob } = require("../EmailWorker");

    await processEmailJob(job);

    expect(LoanService.getLoan).toHaveBeenCalledWith("loan-inexistente");
    expect(MailService.sendMail).not.toHaveBeenCalled();
    expect(prisma.outboxEvent.updateMany).not.toHaveBeenCalled();
  });

  it("deve pular job quando empréstimo já foi devolvido", async () => {
    const mockLoan = {
      id: "loan-123",
      status: "DEVOLVIDO",
    };

    const job = {
      data: { loanId: "loan-123" },
    } as Job<EmailJobData>;

    jest.spyOn(LoanService, "getLoan").mockResolvedValue(mockLoan as any);

    const { processEmailJob } = require("../EmailWorker");

    await processEmailJob(job);

    expect(LoanService.getLoan).toHaveBeenCalledWith("loan-123");
    expect(MailService.sendMail).not.toHaveBeenCalled();
  });

  it("deve lançar erro quando falha ao enviar email", async () => {
    const mockLoan = {
      id: "loan-123",
      status: "ATIVO",
    };

    const job = {
      data: { loanId: "loan-123" },
    } as Job<EmailJobData>;

    jest.spyOn(LoanService, "getLoan").mockResolvedValue(mockLoan as any);
    jest
      .spyOn(MailService, "sendMail")
      .mockRejectedValue(new Error("Erro SMTP"));

    const { processEmailJob } = require("../EmailWorker");

    await expect(processEmailJob(job)).rejects.toThrow("Erro SMTP");
  });
});
