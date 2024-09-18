/*
  Warnings:

  - Made the column `userId` on table `friendtoken` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `friendtoken` DROP FOREIGN KEY `FriendToken_userId_fkey`;

-- AlterTable
ALTER TABLE `friendtoken` MODIFY `token` INTEGER NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `FriendToken` ADD CONSTRAINT `FriendToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
