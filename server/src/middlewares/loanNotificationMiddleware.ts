import { Request, Response, NextFunction } from "express";
import { loanNotificationScheduler } from "../services/LoanNotificationScheduler";

export function loanNotificationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  loanNotificationScheduler.check().catch(console.error);
  next();
}