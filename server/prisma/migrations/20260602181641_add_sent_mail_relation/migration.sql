-- CreateTable
CREATE TABLE "SentMail" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,

    CONSTRAINT "SentMail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SentMail_loanId_key" ON "SentMail"("loanId");

-- AddForeignKey
ALTER TABLE "SentMail" ADD CONSTRAINT "SentMail_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Emprestimo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
