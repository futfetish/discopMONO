/*
  Warnings:

  - A unique constraint covering the columns `[tokenId]` on the table `friendTokenToUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `friendTokenToUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `friendTokenToUser_tokenId_key` ON `friendTokenToUser`(`tokenId`);

-- CreateIndex
CREATE UNIQUE INDEX `friendTokenToUser_userId_key` ON `friendTokenToUser`(`userId`);
