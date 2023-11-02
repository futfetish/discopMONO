import { z } from "zod";

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
        uniqName : true
      },
    });
  }),
});
