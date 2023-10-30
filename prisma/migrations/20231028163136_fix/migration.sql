/*
  Warnings:

  - You are about to drop the `_userfriends` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_userfriends` DROP FOREIGN KEY `_UserFriends_A_fkey`;

-- DropForeignKey
ALTER TABLE `_userfriends` DROP FOREIGN KEY `_UserFriends_B_fkey`;

-- AlterTable
ALTER TABLE `userrooms` ADD COLUMN `isRead` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `_userfriends`;
