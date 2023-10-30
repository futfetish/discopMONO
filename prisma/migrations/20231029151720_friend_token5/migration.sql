/*
  Warnings:

  - You are about to drop the column `userId` on the `friendtoken` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `friendtoken` DROP FOREIGN KEY `FriendToken_userId_fkey`;

-- AlterTable
ALTER TABLE `friendtoken` DROP COLUMN `userId`;

-- CreateTable
CREATE TABLE `friendTokenToUser` (
    `tokenId` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tokenId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `friendTokenToUser` ADD CONSTRAINT `friendTokenToUser_tokenId_fkey` FOREIGN KEY (`tokenId`) REFERENCES `FriendToken`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `friendTokenToUser` ADD CONSTRAINT `friendTokenToUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
