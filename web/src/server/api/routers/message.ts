import { z } from "zod";
import { TRPCClientError } from "@trpc/client";

import {
  createTRPCRouter,
  protectedProcedure,
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
    }),

  delete : protectedProcedure.input(z.object({
    messageId: z.number(),
  })).mutation( async ({ctx , input}) => {
    await ctx.db.message.delete({
      where : {
        id : input.messageId
      }
    })
    return {isSuccess : true}
  }),

  update : protectedProcedure.input(z.object({
    text : z.string(),
    messageId: z.number(),
  })).mutation( async ({ctx , input}) => {
    const message = await ctx.db.message.findUnique({
      where : {
        id : input.messageId
      }
    })

    if (!message){
      throw new TRPCClientError("404 room not found");
    }

    const updatedMessage = await ctx.db.message.update({
      where : {
        id : input.messageId
      },
      data : {
        text : input.text
      }
    })

    return {status : "OK" , message : updatedMessage }
  }),
});
