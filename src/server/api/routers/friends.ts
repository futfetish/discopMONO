import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const friendRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) => {
    const ID = ctx.session.user.id;
    return ctx.db.user.findMany({
      where: {
        id: {
          not: ID,
        },
        friends: {
          some: {
            toId: ID,
          },
        },
        friendsOf: {
          some: {
            fromId: ID,
          },
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });
  }),
  del: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const main = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      const target = await ctx.db.user.findUnique({
        where: { id: input.id },
      });
      if (target && main) {
        await ctx.db.friends.deleteMany({
          where: {
            OR: [
              { fromId: input.id, toId: ctx.session.user.id },
              { fromId: ctx.session.user.id, toId: input.id },
            ],
          },
        });
        return { isSuccess: true };
      }
      return { isSuccess: false };
    }),

  add: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const friend = await ctx.db.user.findUnique({
          where: {
            uniqName: input.name,
          },
          select: {
            id: true,
            name: true,
            image: true,
          },
        });
        if (friend) {
          const ID = friend.id;
          if (ID && ID !== ctx.session.user.id) {
            await ctx.db.friends.create({
              data: {
                fromId: ctx.session.user.id,
                toId: ID,
              },
            });
          }
          return { isSuccess: true, user: { id: friend.id } };
        }
        return { isSuccess: false };
      } catch (e) {
        return { isSuccess: false };
      }
    }),

  requests: protectedProcedure.query(async ({ ctx }) => {
    const from = await ctx.db.user.findMany({
      where: {
        friends: {
          some: {
            toId: ctx.session.user.id,
          },
        },
        friendsOf: {
          none: {
            fromId: ctx.session.user.id,
          },
        },
      },
      select: {
        name: true,
        id: true,
        image: true,
      },
    });
    const to = await ctx.db.user.findMany({
      where: {
        friends: {
          none: {
            toId: ctx.session.user.id,
          },
        },
        friendsOf: {
          some: {
            fromId: ctx.session.user.id,
          },
        },
      },
      select: {
        name: true,
        id: true,
        image: true,
      },
    });
    return { from, to };
  }),

  acceptReq: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.friends.create({
        data: {
          fromId: ctx.session.user.id,
          toId: input.id,
        },
      });
      return { isSuccess: true };
    }),

  rejectReq: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.friends.deleteMany({
        where: {
          fromId: input.id,
          toId: ctx.session.user.id,
        },
      });
      return { isSuccess: true };
    }),

  cancelReq: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.friends.deleteMany({
        where: {
          fromId: ctx.session.user.id,
          toId: input.id,
        },
      });
      return { isSuccess: true };
    }),
  isHaveReq: protectedProcedure.query(async ({ ctx }) => {
    const request = await ctx.db.user.findFirst({
      where: {
        friends: {
          some: {
            toId: ctx.session.user.id,
          },
        },
        friendsOf: {
          none: {
            fromId: ctx.session.user.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
    return request !== null;
  }),
  FriendStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const fromStatus = await ctx.db.friends.findUnique({
        where: {
          fromId_toId: {
            fromId: input.id,
            toId: ctx.session.user.id,
          },
        },
      });

      const toStatus = await ctx.db.friends.findUnique({
        where: {
          fromId_toId: {
            fromId: ctx.session.user.id,
            toId: input.id,
          },
        },
      });

      return { from : !!fromStatus , to : !!toStatus }
    }),
});
