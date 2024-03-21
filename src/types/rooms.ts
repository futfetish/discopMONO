import { z } from "zod";

export const zRoomType = z.enum(["ls", "group"]);

export type roomType = {
    type: "ls" | "group";
    name: string;
    id: number;
    _count: {
      members: number;
    };
    members: {
      user: {
        id: string;
        image: string;
        name?: string | null | undefined;
      };
    }[];
  };