import express from "express";
import userController from "./controllers/UserController";
import bookController from "./controllers/BookController";

const routes = express.Router();

routes.post("/user", userController.create);
routes.get("/user", userController.get);
routes.delete("/user/:id", userController.delete);
routes.patch("/user/:id", userController.update);

routes.post("/book",bookController.create);
routes.get("/book", bookController.get);
routes.get("/book/:id", bookController.getById)
routes.delete("/book/:id", bookController.delete);
routes.patch("/book/:id", bookController.update);

export default routes;
