import { z } from "zod";

export const zRoomType = z.enum(["ls", "group"]);