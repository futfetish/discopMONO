import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export  const messageRouter = createTRPCRouter({
    create: protectedProcedure.input(
        z.object({
            text : z.string() , roomId : z.number()
       })
    ).mutation(({ctx , input}) => {

        const authorId = ctx.session.user.id
        return ctx.db.message.create({
            data : {
                text : input.text,
                authorId ,
                roomId : input.roomId
            },
            include : {
                author : {
                    select : {
                        id:true,
                        name:true,
                        image:true
                    }
            }
            }
            
        })
    })
})