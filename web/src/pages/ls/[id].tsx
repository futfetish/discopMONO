
import { type GetServerSideProps } from "next";
import { db } from "~/server/db";
import { getSession, } from "next-auth/react";
// import { socket } from "~/socket";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  const id = ctx.params?.id;
  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }
  const user = await db.user.findUnique({
    where: {
      id: id,
    },
  });
  if (!user) {
    return {
      notFound: true,
    };
  }
  let room = await db.room.findFirst({
    where: {
      type: "ls",
      members: {
        every: {
          OR: [{ userId: id }, { userId: session.user.id }],
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
  if (!room || room.members.length < 2) {
    room = await db.room.create({
      data: {
        type: "ls",
        name : ''
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

    await db.userRooms.create({
      data: {
        roomId: room.id,
        userId: id,
      },
    });

    await db.userRooms.create({
      data: {
        roomId: room.id,
        userId: session.user.id,
      },
    });
    // socket.connect()
    // socket.emit( 'newChat' ,{room : 'user' + id , message : room})
    // socket.disconnect()
  }

  return {
    redirect: {
      destination: "/channels/" + room.id,
      permanent: false,
    },
  };
};

export default function ls() {
  return <div> ... </div>;
}
