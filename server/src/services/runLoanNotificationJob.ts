import { getLoansNotNotified, markLoanAsNotified } from "./LoanService";
import { sendMail } from "./MailService";

export async function runLoanNotificationJob() {
    try {
      const loans = await getLoansNotNotified();

      if (loans.length === 0) {
        console.log("[CronJob] Nenhum empréstimo para notificar.");
        return;
      }

      for (const loan of loans) {
        try {
           await sendMail(loan);
           await markLoanAsNotified(loan.id);
          console.log(`[CronJob] Empréstimo ${loan.id} marcado como notificado.`);
        } catch (err) {
          console.error(`[CronJob] Erro ao notificar empréstimo ${loan.id}:`, err);
        }
      }
    } catch (err) {
      console.error("[CronJob] Erro ao buscar empréstimos:", err);
    }
  console.log("[CronJob] Job de notificação de empréstimos concluído.");
}