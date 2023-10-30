/*
  Warnings:

  - You are about to drop the `_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_unreadusers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_members` DROP FOREIGN KEY `_Members_A_fkey`;

-- DropForeignKey
ALTER TABLE `_members` DROP FOREIGN KEY `_Members_B_fkey`;

-- DropForeignKey
ALTER TABLE `_unreadusers` DROP FOREIGN KEY `_UnreadUsers_A_fkey`;

-- DropForeignKey
ALTER TABLE `_unreadusers` DROP FOREIGN KEY `_UnreadUsers_B_fkey`;

-- DropTable
DROP TABLE `_members`;

-- DropTable
DROP TABLE `_unreadusers`;

-- CreateTable
CREATE TABLE `Friends` (
    `fromId` VARCHAR(191) NOT NULL,
    `toId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`fromId`, `toId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRooms` (
    `userId` VARCHAR(191) NOT NULL,
    `roomId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `roomId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Friends` ADD CONSTRAINT `Friends_fromId_fkey` FOREIGN KEY (`fromId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friends` ADD CONSTRAINT `Friends_toId_fkey` FOREIGN KEY (`toId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRooms` ADD CONSTRAINT `UserRooms_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRooms` ADD CONSTRAINT `UserRooms_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
