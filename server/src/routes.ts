import express from "express";
import bookController from "./controllers/BookController";
import LoanController from "./controllers/LoanController";

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
routes.get("/loans/book/:livroId", LoanController.getByLivroId);

export default routes;
