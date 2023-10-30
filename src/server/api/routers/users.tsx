import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export  const usersRouter = createTRPCRouter({

    user : protectedProcedure.query(({ctx}) => {
      return ctx.db.user.findUniqueOrThrow({
        where  :  {
          id : ctx.session.user.id
        },
        select : {
          id : true,
          name : true,
          image : true,
          tokens : {
            include : {
              token : true
            }
          },
        }
      })
    })  ,

    friends : protectedProcedure.query(({ctx}) => {
        const ID = ctx.session.user.id
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
              id:true,
              name:true,
              image:true
            }
        });
    }),
    friend_del : protectedProcedure.input(
      z.object({
        id : z.string()
      })
    ).mutation( async ({ctx , input}) => {
      const main = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      const target = await ctx.db.user.findUnique({
        where: { id :  input.id },
      });
      if (target && main){
          await  ctx.db.friends.deleteMany({
            where:{
              OR: [
              { fromId: input.id, toId: ctx.session.user.id },
              { fromId: ctx.session.user.id, toId: input.id },
              ],
            }
          });
          return {isSuccess : true}
        }
        return {isSuccess : false}
    }),

    friend_add : protectedProcedure.input(
      z.object({
        token: z.string()
      })
    ).mutation( async ({ctx , input}) => {
      try{
        const friendToken = await ctx.db.friendToken.findUniqueOrThrow({
        where : {
          token : input.token
        },
        include: {
          users : true
        }
      })
      if(friendToken){
        const ID = friendToken.users[0]?.userId
        if (ID && ID !== ctx.session.user.id){
          await ctx.db.friends.create({
            data : {
              fromId : ctx.session.user.id,
              toId : ID
            }
          })
        }
      }
      return {isSuccess : true}
      }catch(e){
        return {isSuccess : false}
      }
      
    }),

    friend_wait : protectedProcedure.query( async ({ctx}) =>  {
      const from = await ctx.db.user.findMany({
        where : {
            friends : {
              some : {
                toId :  ctx.session.user.id
              }
            },
            friendsOf : {
              none : {
                fromId : ctx.session.user.id
              }
            }
        },
        select : {
          name: true,
          id: true,
          image: true,
        }
      })
      const to = await ctx.db.user.findMany({
        where : {
            friends : {
              none : {
                toId :  ctx.session.user.id
              }
            },
            friendsOf : {
              some : {
                fromId : ctx.session.user.id
              }
            }
        },
        select : {
          name: true,
          id: true,
          image: true,
        }
      })
      return {from , to}
    }),

    friend_accept : protectedProcedure.input(z.object({
      id : z.string()
    })).mutation(async ({ctx , input}) => {
     await  ctx.db.friends.create({
        data : {
          fromId : ctx.session.user.id,
          toId : input.id
        }
      })
      return {isSuccess : true}
    }),

    friend_reject : protectedProcedure.input(z.object({
      id : z.string()
    })).mutation(async ({ctx , input}) => {
     await  ctx.db.friends.deleteMany({
        where : {
          fromId : input.id ,
          toId : ctx.session.user.id
        }
      })
      return {isSuccess : true}
    }),

    friend_cancel : protectedProcedure.input(z.object({
      id : z.string()
    })).mutation(async ({ctx , input}) => {
      await ctx.db.friends.deleteMany({
        where : {
          fromId : ctx.session.user.id  ,
          toId : input.id
        }
      })
      return {isSuccess : true}
    }),

    generateNewFriendToken : protectedProcedure.mutation( async ({ctx}) => {

      await ctx.db.friendTokenToUser.deleteMany({
        where:  {
          userId : ctx.session.user.id
        }
      })

      const token = await ctx.db.friendToken.create({})
      const randomNumber = Math.floor(Math.random() * 10000) ;
      const randomString = randomNumber.toString().padStart(4, '0');
      const updatedToken = randomString + token.id.toString();
      const updatedFriendToken = await ctx.db.friendToken.update({
        where : {
          id : token.id
        },
        data : {
          token : updatedToken
        }
      })
      await ctx.db.friendTokenToUser.create({
        data : {
          userId : ctx.session.user.id,
          tokenId : token.id
        }
      })
      return updatedFriendToken
    })
    
})