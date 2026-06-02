import routes from "./routes";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import "@database";
import { runLoanNotificationJob } from "./services/runLoanNotificationJob";

dotenv.config();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8082",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origem bloqueada pelo CORS: ${origin}`));
      }
    },
  })
);


app.use(express.json());

//midleware para rodar o job de notificação de empréstimos atrasados
let running = false;

app.use((req, res, next) => {
  res.on("finish", () => {
    if (running) return;

    running = true;

    runLoanNotificationJob()
      .catch(console.error)
      .finally(() => {
        running = false;
      });
  });

  next();
});

app.use(routes);
app.use(express.static(__dirname + "/public"));

app.listen(process.env.SERVER_PORT || 3001, () => {
  console.log("📦 Server running");
});