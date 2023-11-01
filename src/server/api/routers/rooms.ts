import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
            _count: z.object({ members: z.number() }),
            members: z.array(
              z.object({
                user: z.object({
                  id: z.string(),
                  name: z.string().optional().nullable(),
                  image: z.string().optional().nullable(),
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
      // TODO: разделить на два разных эндпойнта
      const roomId = input.roomId;
      const userIds = Array.from(input.userIds);
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        throw new TRPCClientError("404 room not found");
      }

      if (room.type === "ls") {
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

        return { isCreated: true, roomId: newGroupRoom.id };
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
            isAdmin: false,
            isRead: false,
          })),
        });
        return { isCreated: false, roomId: 0 };
      }
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
      return { status: "OK" };
    }),
});
