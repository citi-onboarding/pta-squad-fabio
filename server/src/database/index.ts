import { PrismaClient } from "@prisma/client";

//exportado para evitar recriação a cada chamada no banco
export const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    console.log("📦 Successfully connected with database");
  })
  .catch((error) => {
    console.log("❌ Error connecting to database", error);
  });

export default prisma;
