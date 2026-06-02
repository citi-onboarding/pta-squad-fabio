import { runLoanNotificationJob } from "./runLoanNotificationJob";

class LoanNotificationScheduler {
  private running = false;
  private lastCheck = 0;

  async check() {
    const now = Date.now();

    if (this.running) return;
    if (now - this.lastCheck < 12 * 60 * 60 * 1000) return;

    this.running = true;

    try {
      await runLoanNotificationJob();
      this.lastCheck = Date.now();
    } finally {
      this.running = false;
    }
  }
}

export const loanNotificationScheduler =
  new LoanNotificationScheduler();