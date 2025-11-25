/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `stores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "stores_userId_key" ON "stores"("userId");
