import { Request, Response } from "express";
import { getLoan } from "../../service/LoanService";
import * as MailService from "../../service/MailService";

// Importar a classe, não a instância default
const MailControllerClass = require("../MailController").default.constructor;

describe("MailController", () => {
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let getLoanMock: jest.Mock;
  let controller: any;

  beforeEach(() => {
    jsonMock = jest.fn().mockReturnValue({});
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    };

    // Mock da função getLoan
    getLoanMock = jest.fn();
    
    // Criar controller com mock dinamicamente
    const MailController = require("../MailController").default.constructor;
    controller = new MailController(getLoanMock);

    jest.clearAllMocks();
  });

  describe("sendMail", () => {
    it("deve enviar email com sucesso quando o empréstimo existe", async () => {
      const mockLoan = {
        id: "loan-123",
        status: "ATIVO",
        usuarioId: "user-123",
        livroId: "book-123",
      };

      getLoanMock.mockResolvedValue(mockLoan);
      jest.spyOn(MailService, "sendOverdueBookMail").mockResolvedValue(undefined);

      const req = {
        body: {
          to: "user@example.com",
          loanId: "loan-123",
        },
      } as any;

      await controller.sendMail(req, res as Response);

      expect(getLoanMock).toHaveBeenCalledWith("loan-123");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Email enviado com sucesso",
      });
    });

    it("deve retornar 404 quando o empréstimo não existe", async () => {
      getLoanMock.mockResolvedValue(null);

      const req = {
        body: {
          to: "user@example.com",
          loanId: "loan-inexistente",
        },
      } as any;

      await controller.sendMail(req, res as Response);

      expect(getLoanMock).toHaveBeenCalledWith("loan-inexistente");
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Empréstimo não encontrado",
      });
    });

    it("deve retornar 500 quando ocorre erro ao enviar o email", async () => {
      const mockLoan = {
        id: "loan-123",
        status: "ATIVO",
      };

      getLoanMock.mockResolvedValue(mockLoan);
      jest
        .spyOn(MailService, "sendOverdueBookMail")
        .mockRejectedValue(new Error("Erro de conexão SMTP"));

      const req = {
        body: {
          to: "user@example.com",
          loanId: "loan-123",
        },
      } as any;

      await controller.sendMail(req, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Erro ao enviar email",
      });
    });

    it("deve chamar sendOverdueBookMail com os dados corretos do empréstimo", async () => {
      const mockLoan = {
        id: "loan-456",
        status: "ATIVO",
        usuarioId: "user-456",
        livroId: "book-456",
      };

      getLoanMock.mockResolvedValue(mockLoan);
      const sendMailSpy = jest
        .spyOn(MailService, "sendOverdueBookMail")
        .mockResolvedValue(undefined);

      const req = {
        body: {
          to: "user@example.com",
          loanId: "loan-456",
        },
      } as any;

      await controller.sendMail(req, res as Response);

      expect(getLoanMock).toHaveBeenCalledWith("loan-456");
      expect(sendMailSpy).toHaveBeenCalledWith(mockLoan);
    });
  });
});
