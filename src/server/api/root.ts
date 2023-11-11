import { createTRPCRouter } from "~/server/api/trpc";
import { roomsRouter } from "./routers/rooms";
import { messageRouter } from "./routers/message";
import { usersRouter } from "./routers/users";
import { friendRouter } from "./routers/friends";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  rooms  : roomsRouter,
  message : messageRouter,
  users : usersRouter,
  friends : friendRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
