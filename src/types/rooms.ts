import { z } from "zod";

export const zRoomType = z.enum(["ls", "group"]);

export type roomType = {
  type: "ls" | "group";
  name: string;
  id: number;
  _count?: {
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

export type ChannelType = {
  type: "ls" | "group";
  name: string;
  id: number;
  msgs: {
    text: string;
    id: number;
    createdAt: Date;
    authorId: string;
    author: {
      image: string;
      id: string;
      name: string;
    };
  }[];
  members: {
    user: {
        id: string;
        image: string;
        name: string;
    };
    isAdmin: boolean;
}[];
};
