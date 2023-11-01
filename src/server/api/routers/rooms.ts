import { TRPCClientError } from "@trpc/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export  const roomsRouter = createTRPCRouter({
    userRooms: protectedProcedure
    .query( ({ctx}) => {
        return ctx.db.room.findMany({
            where : {
                members : {
                    some:  {
                        userId : ctx.session.user.id
                        }
                    }
                },
            include:{
                members  : {
                    select:{
                        user : {
                            select : {
                                id: true,
                                name:true,
                                image:true
                            }
                        },
                        isAdmin : true
                    }
                }
            }
        })
    }),
    groupChat: protectedProcedure.input(
        z.object({
            userIds : z.set(z.string()),
            roomId : z.number()
        })
    ).mutation( async ({ctx , input}) => {
         
            const roomId = input.roomId
            const userIds = Array.from(input.userIds);
            const room = await ctx.db.room.findUnique({
              where: { id: roomId },
            });
          
            if (!room) {
              throw new TRPCClientError('404 room not f');
            }
          
            if (room.type === 'ls') {
              const newGroupRoom = await ctx.db.room.create({
                data: {
                  name: 'Новая группа',
                  type: 'group',
                },
              });
          
              await ctx.db.userRooms.createMany({
                data: userIds.map((userId) => ({
                  userId,
                  roomId: newGroupRoom.id,
                })),
              });

              await ctx.db.userRooms.updateMany({
                where : {
                    userId : ctx.session.user.id,
                    roomId : newGroupRoom.id
                },
                data : {
                    isAdmin  : true
                }
              })

              return {create : true , roomId : newGroupRoom.id}
            } else {
              const existingMembers = await ctx.db.userRooms.findMany({
                where: {
                  roomId,
                  userId: {
                    in: userIds
                  },
                },
              });
          
              const newUsers = userIds.filter((userId) =>
                !existingMembers.some((member) => member.userId === userId)
              );
          
              await ctx.db.userRooms.createMany({
                data: newUsers.map((userId) => ({
                  userId,
                  roomId,
                  isAdmin: false,
                  isRead: false,
                })),
              });
              return {create : false , roomId : 0}
            }
    }),

    leave : protectedProcedure.input(
      z.object({
        roomId : z.number()
      })
    ).mutation( async ({ctx , input}) => {
      await ctx.db.userRooms.deleteMany({
        where: {
          roomId : input.roomId,
          userId : ctx.session.user.id
        }
      })
      return {isSuccses : true}
    }),

    deleteUser : protectedProcedure.input(
      z.object({
        roomId : z.number(),
        userId : z.string()
      })
    ).mutation( async ({ctx , input}) => {
      const con = await ctx.db.userRooms.findFirst({
        where : {
          roomId : input.roomId,
          userId : ctx.session.user.id
        }
      })
      if(!con || !con.isAdmin){
        return
      }
      await ctx.db.userRooms.deleteMany({
        where  :  {
          roomId : input.roomId,
          userId : input.userId
        }
      })
      return
    })
})