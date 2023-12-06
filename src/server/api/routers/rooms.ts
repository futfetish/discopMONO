import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import {  z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { zRoomType } from "~/types/rooms";

export const roomsRouter = createTRPCRouter({
  // Показать все чаты в которых есть пользователь
  showRoomsJoined: protectedProcedure
    .output(
      z.object({
        status: z.string(),
        rooms: z.array(
          z.object({
            id: z.number(),
            type: zRoomType,
            name: z.string(),
            _count: z.object({ members: z.number() }),
            members: z.array(
              z.object({
                user: z.object({
                  id: z.string(),
                  name: z.string().optional().nullable(),
                  image: z.string(),
                }),
              }),
            ),
          }),
        ),
      }),
    )
    .query(async ({ ctx }) => {
      const roomsJoined = await ctx.db.room.findMany({
        where: {
          members: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
          _count: {
            select: {
              members: true,
            },
          },
          members: {
            take: 5,
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
      return { status: "OK", rooms: roomsJoined };
    }),
  addUsersToChat: protectedProcedure
    .input(
      z.object({
        userIds: z.set(z.string()),
        roomId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const roomId = input.roomId;
      const userIds = Array.from(input.userIds);
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        throw new TRPCClientError("404 room not found");
      }

      if (room.type === "ls") {
        throw new TRPCClientError("wrong type of room");
      } else {
        const existingMembers = await ctx.db.userRooms.findMany({
          where: {
            roomId,
            userId: {
              in: userIds,
            },
          },
        });

        const newUsers = userIds.filter(
          (userId) =>
            !existingMembers.some((member) => member.userId === userId),
        );

        await ctx.db.userRooms.createMany({
          data: newUsers.map((userId) => ({
            userId,
            roomId,
          })),
        });
        return { isSuccess: true };
      }
    }),

  createNewChat: protectedProcedure
    .input(
      z.object({
        userIds: z.set(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userIds = Array.from(input.userIds);
      const newGroupRoom = await ctx.db.room.create({
        data: {
          name: "Новая группа",
          type: "group",
        },
      });

      await ctx.db.userRooms.createMany({
        data: userIds.map((userId) => ({
          userId,
          roomId: newGroupRoom.id,
          isAdmin: userId === ctx.session.user.id,
        })),
      });

      return { roomId: newGroupRoom.id };
    }),

  leave: protectedProcedure
    .input(
      z.object({
        roomId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.userRooms.delete({
        where: {
          userId_roomId: {
            roomId: input.roomId,
            userId: ctx.session.user.id,
          },
        },
      });
      return { isSuccses: true };
    }),

  kickUser: protectedProcedure
    .input(
      z.object({
        roomId: z.number(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userRequested = await ctx.db.userRooms.findUnique({
        where: {
          userId_roomId: {
            roomId: input.roomId,
            userId: ctx.session.user.id,
          },
        },
      });
      if (!userRequested || !userRequested.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      await ctx.db.userRooms.delete({
        where: {
          userId_roomId: {
            roomId: input.roomId,
            userId: input.userId,
          },
        },
      });
      return { isSuccses: true };
    }),

  changeName: protectedProcedure
    .input(
      z.object({
        roomId: z.number(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userIn = await ctx.db.userRooms.findUnique({
        where: {
          userId_roomId: {
            userId: ctx.session.user.id,
            roomId: input.roomId,
          },
        },
      });
      if (userIn) {
        await ctx.db.room.update({
          where: {
            id: input.roomId,
          },
          data: {
            name: input.name,
          },
        });
      }
    }),

  search: protectedProcedure
    .output(
      z.object({
        rooms: z.array(
          z.object({
            id: z.number(),
            type: zRoomType,
            name: z.string(),
            _count: z.object({ members: z.number() }),
            members: z.array(
              z.object({
                user: z.object({
                  id: z.string(),
                  name: z.string().optional().nullable(),
                  image: z.string(),
                }),
              }),
            ),
          }),
        ),
      }),
    )
    .input(
      z.object({
        s: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const search = input.s;
      console.log("s", search);
      const userId = ctx.session.user.id;
      const rooms = await ctx.db.room.findMany({
        where: {
          AND: [
            {
              members: {
                some: {
                  userId: userId,
                },
              },
            },
            {
              OR: [
                {
                  members: {
                    some: {
                      user: {
                        name: {
                          contains: search,
                        },
                        id: {
                          not: userId,
                        },
                      },
                    },
                  },
                },
                {
                  name: {
                    contains: search,
                  },
                },
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          type: true,
          _count: {
            select: {
              members: true,
            },
          },
          members: {
            take: 5,
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
      return { rooms };
    }),
  unReadRooms: protectedProcedure
    .output(
      z.object({
        rooms: z.array(
          z.object({
            id: z.number(),
            type: zRoomType,
            name: z.string(),
            _count: z.object({ members: z.number() }),
            members: z.array(
              z.object({
                user: z.object({
                  id: z.string(),
                  name: z.string().optional().nullable(),
                  image: z.string(),
                }),
              }),
            ),
          }),
        ),
      }),
    )
    .query(async ({ ctx }) => {
      const unReadUserRooms = await ctx.db.userRooms.findMany({
        where: {
          isRead: false,
          userId: ctx.session.user.id,
        },
        select: {
          room: {
            select: {
              id: true,
              name: true,
              type: true,
              _count: {
                select: {
                  members: true,
                },
              },
              members: {
                take: 5,
                select: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const unReadRooms = unReadUserRooms.map((r) => r.room);
      return { rooms: unReadRooms };
    }),
  userRoomsToUnRead: publicProcedure
    .input(
      z.object({
        userIds: z.set(z.string()),
        roomId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const roomId = input.roomId;
      const userIds = Array.from(input.userIds);
      await ctx.db.userRooms.updateMany({
        where: {
          roomId: roomId,
          userId: { in: userIds },
        },
        data: {
          isRead: false,
        },
      });
      return { isSuccess: true };
    }),
  getById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          type: true,
          _count: {
            select: {
              members: true,
            },
          },
          members: {
            take: 5,
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
      if (room) {
        return { isSuccess: true, room: room };
      }else {
        return {isSuccess : false }
      }
    }),
});
