import { Router, Request, Response } from "express";
import { emailJobQueue } from "../queues/EmailJobQueue";

const router = Router();

//ESTE CONTROLLER É APENAS PARA TESTES DE FILA DE EMAILS, NÃO É PARA USO REAL NO SISTEMA
//ESSE ARQUIVO NAO DEVE IR PARA PRODUCAO
// POST /test/queue-email
router.post("/queue-email", async (req: Request, res: Response) => {
  const { loanId, delayMinutes = 0 } = req.body;

  if (!loanId) {
    return res.status(400).json({ error: "loanId é obrigatório" });
  }

  try {
    const delay = delayMinutes * 60 * 1000;

    const job = await emailJobQueue.add(
      "send-mail",
      { loanId },
      {
        delay,
        jobId: `send-mail-${loanId}`,
      }
    );

    return res.status(201).json({
      message: "Job adicionado à fila com sucesso",
      jobId: job.id,
      loanId,
      scheduledIn: delayMinutes > 0 ? `${delayMinutes} minuto(s)` : "imediato",
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao adicionar job na fila" });
  }
});

// GET /test/queue-status
router.get("/queue-status", async (_req: Request, res: Response) => {
  try {
    const [waiting, active, delayed, failed, completed] = await Promise.all([
      emailJobQueue.getWaitingCount(),
      emailJobQueue.getActiveCount(),
      emailJobQueue.getDelayedCount(),
      emailJobQueue.getFailedCount(),
      emailJobQueue.getCompletedCount(),
    ]);

    return res.json({
      queue: "mail-notification",
      waiting,
      active,
      delayed,
      failed,
      completed,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar status da fila" });
  }
});

export default router;