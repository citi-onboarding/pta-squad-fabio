import express from "express";
import bookController from "./controllers/BookController";
import LoanController from "./controllers/LoanController";
import MailController from "./controllers/MailController";
import { emailJobQueue } from "./queues/EmailJobQueue";

const routes = express.Router();

routes.post("/book",bookController.create);
routes.get("/book", bookController.get);
routes.get("/book/:id", bookController.getById)
routes.delete("/book/:id", bookController.delete);


routes.get("/loans/analytics", LoanController.getAnalytics);
routes.post("/loans", LoanController.create);
routes.get("/loans", LoanController.get);
routes.get("/loans/:id", LoanController.getById);
routes.patch("/loans/:id", LoanController.update);
routes.delete("/loans/:id", LoanController.delete);
routes.post("/mail/send", (req, res) => MailController.sendMail(req, res));

// --- ROTAS DE TESTE (remover após validação) ---
routes.post("/test/queue-email", async (req, res) => {
  const { loanId, delayMinutes = 0 } = req.body;
  if (!loanId) return res.status(400).json({ error: "loanId é obrigatório" });

  const job = await emailJobQueue.add(
    "send-mail",
    { loanId },
    { delay: delayMinutes * 60 * 1000, jobId: `send-mail-${loanId}` }
  );

  return res.status(201).json({
    jobId: job.id,
    loanId,
    scheduledIn: delayMinutes > 0 ? `${delayMinutes} minuto(s)` : "imediato",
  });
});

routes.get("/test/queue-status", async (_req, res) => {
  const [waiting, active, delayed, failed] = await Promise.all([
    emailJobQueue.getWaitingCount(),
    emailJobQueue.getActiveCount(),
    emailJobQueue.getDelayedCount(),
    emailJobQueue.getFailedCount(),
  ]);

  return res.json({ queue: "mail-notification", waiting, active, delayed, failed });
});
// --- FIM ROTAS DE TESTE ---


export default routes;
