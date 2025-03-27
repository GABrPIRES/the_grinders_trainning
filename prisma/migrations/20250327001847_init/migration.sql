-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'personal', 'aluno');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('pendente', 'pago', 'atrasado');

-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('ativo', 'expirado', 'cancelado');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personal" (
    "id" TEXT NOT NULL,
    "bio" TEXT,
    "phoneNumber" INTEGER,
    "instagram" TEXT,

    CONSTRAINT "Personal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "lesao" TEXT,
    "phoneNumber" INTEGER NOT NULL,
    "restricaoMedica" TEXT,
    "objetivo" TEXT,
    "treinosSemana" INTEGER,
    "tempoTreino" INTEGER,
    "horarioTreino" INTEGER,
    "prSupino" INTEGER,
    "prTerra" INTEGER,
    "prAgachamento" INTEGER,
    "newPrSupino" INTEGER,
    "newPrTerra" INTEGER,
    "newPrAgachamento" INTEGER,
    "personalId" TEXT,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treino" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationTime" INTEGER NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "alunoId" TEXT NOT NULL,
    "personalId" TEXT NOT NULL,

    CONSTRAINT "Treino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercicio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "treinoId" TEXT NOT NULL,

    CONSTRAINT "Exercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sections" (
    "id" TEXT NOT NULL,
    "carga" DOUBLE PRECISION,
    "series" INTEGER NOT NULL,
    "equip" TEXT,
    "rpe" DOUBLE PRECISION,
    "pr" DOUBLE PRECISION,
    "feito" BOOLEAN,
    "exercicioId" TEXT NOT NULL,

    CONSTRAINT "Sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plano" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "personalId" TEXT NOT NULL,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assinatura" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "StatusAssinatura" NOT NULL,
    "alunoId" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,

    CONSTRAINT "Assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "StatusPagamento" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alunoId" TEXT NOT NULL,
    "personalId" TEXT NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Personal" ADD CONSTRAINT "Personal_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "Personal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treino" ADD CONSTRAINT "Treino_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treino" ADD CONSTRAINT "Treino_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercicio" ADD CONSTRAINT "Exercicio_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES "Treino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sections" ADD CONSTRAINT "Sections_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plano" ADD CONSTRAINT "Plano_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
