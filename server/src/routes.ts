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
routes.patch("/book/:id", bookController.reduceQuantity);

routes.get("/loans/analytics", LoanController.getAnalytics);
routes.post("/loans", LoanController.create);
routes.get("/loans", LoanController.get);
routes.get("/loans/:id", LoanController.getById);
routes.patch("/loans/:id", LoanController.update);
routes.delete("/loans/:id", LoanController.delete);
routes.post("/mail/send", (req, res) => MailController.sendMail(req, res));

routes.get("/loans/book/:livroId", LoanController.getByLivroId);

// --- ROTAS DE TESTE (remover após validação) ---
routes.post("/test/queue-email", async (req, res) => {
  const { loanId, delayMinutes = 0 } = req.body;

  console.log("BODY RECEBIDO:", req.body);

const job = await emailJobQueue.add(
  "send-mail",
  { loanId },
  {
    delay: 0,
    jobId: `send-mail-test-${loanId}-${Date.now()}`
  }
);

    const delayed = await emailJobQueue.getDelayed();

  console.log(
    "DELAYED:",
    delayed.map((j) => ({
      id: j.id,
      data: j.data,
      delay: j.opts.delay,
    }))
  );

  console.log("JOB CRIADO:", {
    id: job.id,
    name: job.name,
    data: job.data,
    delay: job.opts.delay,
  });

  return res.status(201).json({
    jobId: job.id,
    loanId,
  });
});

routes.get("/test/queue-status", async (_req, res) => {
  const [waiting, active, delayed, failed] = await Promise.all([
    emailJobQueue.getWaitingCount(),
    emailJobQueue.getActiveCount(),
    emailJobQueue.getDelayedCount(),
    emailJobQueue.getFailedCount(),
  ]);

  return res.json({
    queue: "mail-notification",
    waiting,
    active,
    delayed,
    failed,
  });
});
// --- FIM ROTAS DE TESTE ---

export default routes;
