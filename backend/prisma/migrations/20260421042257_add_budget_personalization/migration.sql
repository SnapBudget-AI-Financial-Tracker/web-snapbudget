-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "googleId" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "budgetBulanan" INTEGER NOT NULL DEFAULT 2000000,
    "budgetMakanan" INTEGER NOT NULL DEFAULT 700000,
    "budgetMinuman" INTEGER NOT NULL DEFAULT 200000,
    "budgetTransportasi" INTEGER NOT NULL DEFAULT 300000,
    "budgetBelanja" INTEGER NOT NULL DEFAULT 200000,
    "budgetTagihan" INTEGER NOT NULL DEFAULT 240000,
    "budgetHiburan" INTEGER NOT NULL DEFAULT 160000,
    "budgetKesehatan" INTEGER NOT NULL DEFAULT 100000,
    "budgetLainLain" INTEGER NOT NULL DEFAULT 100000,
    "tanggalGajian" INTEGER NOT NULL DEFAULT 25,
    "targetTabungan" INTEGER NOT NULL DEFAULT 0,
    "isOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
