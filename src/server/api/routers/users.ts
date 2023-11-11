import { ZodError, z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  user: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUniqueOrThrow({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        image: true,
        uniqName: true,
      },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        uniqName: z
          .string()
          .refine((value) => /^[a-zA-Z0-9_]+$/.test(value), {
            message:
              "Имя должно состоять только из латинских букв, цифр и подчеркиваний",
          })
          .optional(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name,
          uniqName: input.uniqName,
          image: input.image,
        },
      });
      return { isSuccess: true };
    }),
});
