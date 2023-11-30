import { signIn, useSession } from "next-auth/react";
import GroupRight from "~/components/GroupRight";
import RoomUntilAdd from "~/components/RoomUntilAdd";
import ErrorContent from "~/components/errorContent";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Styles from "../../styles/room.module.scss";
import MainContainer from "~/components/MainContainer";
import { api } from "~/utils/api";
import { db } from "~/server/db";
import { useState } from "react";

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

  return {
    props: {
      data: { room : res},
    },
  };
};

export default function RoomC(props: {
  data: {room  : NonNullable<Awaited<ReturnType<typeof getRoom>>>};
}) {
  const res = props.data.room;
  const router = useRouter();
  const { id } = router.query;
  const { data: sessionData } = useSession();

  if (!sessionData) {
    return <button onClick={() => void signIn()}>signin </button>;
  }
  if (!id || !res.members.some((u) => u.user.id === sessionData.user.id)) {
    <MainContainer
      tab="none"
      content={<ErrorContent text="вы не являетесь участником этой группы" />}
      top={<div></div>}
      right={<div></div>}
      title={"вы не являетесь участником этой группы"}
    />;
  }

  return (
    <MainContainer
      tab={"room_" + res.id}
      content={
        <Content
          room={res}
          user={{
            id: sessionData.user.id,
            image: sessionData.user.image || "",
            name: sessionData.user.name || "[blank]",
          }}
        />
      }
      top={
        <Top
          room={res}
          user={{
            id: sessionData.user.id,
            image: sessionData.user.image || "",
            name: sessionData.user.name || "[blank]",
          }}
        />
      }
      right={
        res.type == "ls" ? (
          <Right />
        ) : (
          <GroupRight
            room={res}
            user={{
              id: sessionData.user.id,
              image: sessionData.user.image || "",
              name: sessionData.user.name || "[blank]",
            }}
          />
        )
      }
      title={
        res.type == "ls"
          ? res.members
              .map((u) => u.user)
              .filter((m) => m.id !== sessionData.user.id)
              .map((m) => m.name)
              .join(", ")
          : res.name
      }
    />
  );
}

type room = NonNullable<Awaited<ReturnType<typeof getRoom>>>;

function Content({
  room,
  user,
}: {
  room: room;
  user: { id: string; name: string; image: string };
}) {
  const [input, setInput] = useState("");

  const { mutate } = api.message.create.useMutation({
    onSuccess: (data) => {
      room.msgs.push({
        authorId: user.id,
        id: data.messageId,
        createdAt: new Date(),
        author: user,
        text: input,
      });
      console.log(room.msgs);
      setInput("");
    },
  });

  return (
    <div className={Styles.container}>
      <MessageList room={room} />

      <div className={Styles.input_area}>
        <div className={Styles.input_container}>
          <input
            autoComplete="off"
            type="text"
            v-model="msg_text"
            className={Styles.message_input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (input !== "") {
                  mutate({ text: input, roomId: room.id });
                }
              }
            }}
            placeholder={
              "написать " +
              (room.type == "ls"
                ? room.members
                    .map((u) => u.user)
                    .filter((m) => m.id !== user.id)
                    .map((m) => m.name)
                    .join(", ")
                : room.name)
            }
          />
        </div>
      </div>
    </div>
  );
}

function MessageList({ room }: { room: room }) {
  function isSameDay(date1: Date | string, date2: Date | string): boolean {
    const dateObj1 = typeof date1 === "string" ? new Date(date1) : date1;
    const dateObj2 = typeof date2 === "string" ? new Date(date2) : date2;

    if (
      !(dateObj1 instanceof Date) ||
      !(dateObj2 instanceof Date) ||
      isNaN(dateObj1.getTime()) ||
      isNaN(dateObj2.getTime())
    ) {
      return false;
    }

    return (
      dateObj1.getFullYear() === dateObj2.getFullYear() &&
      dateObj1.getMonth() === dateObj2.getMonth() &&
      dateObj1.getDate() === dateObj2.getDate()
    );
  }

  function isNewMessage(
    message: {
      authorId: string;
      createdAt: Date | string;
    },
    pastMessage: {
      authorId: string;
      createdAt: Date | string;
    },
  ) {
    return (
      (message && pastMessage && message.authorId !== pastMessage.authorId) ||
      !isSameDay(message.createdAt, pastMessage.createdAt)
    );
  }

  return (
    <div className={Styles.chat}>
      {room.msgs.map(
        (
          msg: (typeof room.msgs)[number],
          i: number,
          arr: (typeof room.msgs)[number][],
        ) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isNewMessage={!arr[i - 1] || isNewMessage(msg, arr[i - 1]!)}
          />
        ),
      )}
    </div>
  );
}

function MessageItem({
  message,
  isNewMessage,
}: {
  message: room["msgs"][number];
  isNewMessage: boolean;
}) {
  function formatDate(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    const day = (dateObj.getDate() + 1).toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  function formatTimeDate(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}`;
  }
  
  return (
    <div
      className={[
        Styles.message,
        isNewMessage ? Styles.message_new : Styles.message_past,
      ].join(" ")}
    >
      <div className={Styles.message__info}>
        {isNewMessage ? (
          <img
            src={message.author.image}
            className={Styles.message__author_ava}
            alt=""
          />
        ) : null}
        <div className={Styles.message__author}> {message.author.name} </div>
        {isNewMessage ? (
          <div className={Styles.message__date}>
            {formatDate(message.createdAt)}
          </div>
        ) : (
          <div className={Styles.message__date}>
            {formatTimeDate(message.createdAt)}
          </div>
        )}
      </div>

      <div className={Styles.message__text}>{message.text}</div>
    </div>
  );
}

function Top({
  room,
  user,
}: {
  room: NonNullable<Awaited<ReturnType<typeof getRoom>>>;
  user: { id: string; name: string; image: string };
}) {
  const [roomName, setRoomName] = useState(room.name);
  const { mutate: changeRoomName } = api.rooms.changeName.useMutation();
  return (
    <div className={Styles.self__top}>
      <img
        src={
          room.type == "ls"
            ? room.members.map((u) => u.user).filter((m) => m.id !== user.id)[0]
                ?.image
            : "/img/grav.png"
        }
        alt=""
        className={Styles.room_big_ava}
      />
      {room.type === "ls" ? (
        <p className={Styles.room_title}>
          {room.members
            .map((u) => u.user)
            .filter((m) => m.id !== user.id)
            .map((m) => m.name)
            .join(", ")}
        </p>
      ) : (
        <input
          type="text"
          className={[Styles.room_title__input, Styles.room_title].join(" ")}
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          onBlur={() => changeRoomName({ roomId: room.id, name: roomName })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        />
      )}

      <div className={Styles.top_utils}>
        <RoomUntilAdd
          room={{ id: room.id, members: room.members, type: room.type }}
        />
      </div>
    </div>
  );
}

function Right() {
  return <h1>right</h1>;
}
