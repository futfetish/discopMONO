/*
  Warnings:

  - You are about to drop the `friendtoken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `friendtokentouser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[uniqName]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `friendtokentouser` DROP FOREIGN KEY `friendTokenToUser_tokenId_fkey`;

-- DropForeignKey
ALTER TABLE `friendtokentouser` DROP FOREIGN KEY `friendTokenToUser_userId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `uniqName` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `friendtoken`;

-- DropTable
DROP TABLE `friendtokentouser`;

-- CreateIndex
CREATE UNIQUE INDEX `User_uniqName_key` ON `User`(`uniqName`);
