import { Request, Response } from "express";
import { getLoanAndBook } from "../services/LoanService";
import { sendOverdueBookMail } from "../services/MailService";

export interface MailRequestBody {
  loanId: string;
}

type TypedRequestBody<T> = Request<{}, {}, T>;

class MailController {
  constructor(
    private readonly findLoan: typeof getLoanAndBook,
  ) {}

  async sendMail(req: TypedRequestBody<MailRequestBody>, res: Response) {
    const { loanId } = req.body;
    const loan = await this.findLoan(loanId);

    if (!loan) {
      return res.status(404).json({ message: "Empréstimo não encontrado" });
    }
    try {
    await sendOverdueBookMail(loan);
    return res.status(200).json({ message: "Email enviado com sucesso" });

  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return res.status(502).json({ message: "Erro ao enviar email" });
    }
  }
}

export default new MailController(getLoanAndBook);