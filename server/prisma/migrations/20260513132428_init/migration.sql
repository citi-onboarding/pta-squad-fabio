-- CreateEnum
CREATE TYPE "CategoriaLivro" AS ENUM ('ROMANCE', 'INFANTIL', 'TECNOLOGIA', 'HISTORIA', 'CIENCIAS');

-- CreateEnum
CREATE TYPE "StatusEmprestimo" AS ENUM ('EM_ANDAMENTO', 'DEVOLVIDO', 'ATRASADO');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Livro" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "editora" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "quantidadeTotal" INTEGER NOT NULL,
    "quantidadeDisponivel" INTEGER NOT NULL,
    "categoria" "CategoriaLivro" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Livro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emprestimo" (
    "id" TEXT NOT NULL,
    "livroId" TEXT NOT NULL,
    "nomeCliente" TEXT NOT NULL,
    "emailCliente" TEXT NOT NULL,
    "dataLocacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPrevistaDevolucao" TIMESTAMP(3) NOT NULL,
    "status" "StatusEmprestimo" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Emprestimo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Livro_isbn_key" ON "Livro"("isbn");

-- AddForeignKey
ALTER TABLE "Emprestimo" ADD CONSTRAINT "Emprestimo_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
