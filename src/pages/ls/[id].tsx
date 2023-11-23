
import { type GetServerSideProps } from "next";
import { db } from "~/server/db";
import { getSession, } from "next-auth/react";

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
    include: {
      members: {
        select: {
          userId: true,
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
      include: {
        members: {
          select: { userId: true },
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
