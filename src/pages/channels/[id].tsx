import { getSession, useSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { db } from "~/server/db";
import { useEffect } from "react";
import { socket } from "~/socket";
import { ChannelType } from "~/types/rooms";
import { LoadingPage } from "~/modules/validationPages/pages/loadingPage/loadingPage";
import { ErrorPage } from "~/modules/validationPages/pages/errorPage/errorPage";
import { ChannelPage } from "~/modules/chat/pages/channelPage/channelPage";

// class MessageAuthorFlyWeight {
//   users: Map<string, room["members"][number]["user"]> = new Map<
//     string,
//     room["members"][number]["user"]
//   >();
//   db : DBtype = db

//   async getUser(id: string): Promise<room["members"][number]["user"]> {
//     if(!this.users.has(id)){
//       const newUser = await this.db.user.findUnique({
//         where  : {
//           id
//         },
//         select: {
//           id: true,
//           name: true,
//           image: true,
//         }
//       })
//       if (newUser){
//         this.users.set(id , newUser)
//       }else{
//         this.users.set(id , {id : id , name : 'unknown' , image:''})
//       }

//     }
//     return this.users.get(id)!
//   }
// }

const getRoom = async (id: number) => {
  const res = await db.room.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      members: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          isAdmin: true,
        },
      },
      msgs: {
        select: {
          authorId: true,
          id: true,
          createdAt: true,
          text: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      name: true,
      type: true,
    },
  });
  return res;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id;

  if (!id) {
    return {
      notFound: true,
    };
  }

  const res = await getRoom(parseInt(id as string));

  if (res === null || res.members.length < 1) {
    return {
      notFound: true,
    };
  }

  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const userRoomObj = await db.userRooms.findUnique({
    where: {
      userId_roomId: {
        userId: session.user.id,
        roomId: res.id,
      },
    },
  });
  if (userRoomObj) {
    await db.userRooms.update({
      where: {
        userId_roomId: {
          userId: session.user.id,
          roomId: res.id,
        },
      },
      data: {
        isRead: true,
      },
    });
  }
  return {
    props: {
      data: { room: res },
    },
  };
};

export default function RoomC(props: { data: { room: ChannelType } }) {
  const res = props.data.room;
  const router = useRouter();
  const { id } = router.query;
  const { data: sessionData } = useSession();
  useEffect(() => {
    const roomName = "room" + res.id;
    socket.emit("joinRoom", roomName);
    if (sessionData) {
      socket.emit("reg", { id: sessionData.user.id });
    }
    return () => {
      socket.emit("leaveRoom", roomName);
    };
  });

  if (!sessionData) {
    return <LoadingPage />;
  } else if (
    !id &&
    !res.members.some((u) => u.user.id === sessionData.user.id)
  ) {
    return <ErrorPage text="вы не являетесь участником этой группы" />;
  } else {
    return (
      <ChannelPage
        channel={res}
        user={{
          id: sessionData.user.id,
          image: sessionData.user.image || "",
          name: sessionData.user.name || "[blank]",
        }}
      />
    );
  }
}
