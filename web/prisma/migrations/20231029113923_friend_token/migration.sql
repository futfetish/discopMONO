-- CreateTable
CREATE TABLE `FriendToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `FriendToken_token_key`(`token`),
    UNIQUE INDEX `FriendToken_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FriendToken` ADD CONSTRAINT `FriendToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
