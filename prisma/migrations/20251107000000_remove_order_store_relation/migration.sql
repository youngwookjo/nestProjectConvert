-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_storeId_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "storeId";
