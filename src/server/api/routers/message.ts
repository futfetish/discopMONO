import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const messageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        roomId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.session.user.id;
      const messageCreated = await ctx.db.message.create({
        data: {
          text: input.text,
          authorId,
          roomId: input.roomId,
        },
      });
      return { status: "OK", messageId: messageCreated.id };
      // TODO: уведомить участников канала
      // TODO: Вернуть пользователю статус отправки
    }),
  // TODO: Добавить удаление сообщении
});
