import routes from "./routes";
import dotenv from "dotenv";
import express from "express";
import "@database";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Permite também requisições sem origin (ex: curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem bloqueada pelo CORS: ${origin}`));
    }
  },
}));

app.use(express.json());
app.use(routes);
app.use(express.static(__dirname + "/public"));

const allowedOrigins = [
  'http://localhost:3000',       // dev
  'https://meuapp.com',         // prod
];

app.listen(process.env.SERVER_PORT || 3001, () => {
  console.log("📦 Server running");
});
