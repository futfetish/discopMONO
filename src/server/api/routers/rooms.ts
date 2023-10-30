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
                        }
                    }
                }
            }
        })
    }),
})