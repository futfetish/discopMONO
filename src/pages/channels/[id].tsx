import { getSession, signIn, useSession } from "next-auth/react";
import GroupRight from "~/components/GroupRight";
import RoomUntilAdd from "~/components/RoomUntilAdd";
import ErrorContent from "~/components/errorContent";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Styles from "../../styles/room.module.scss";
import MainContainer from "~/components/MainContainer";
import { api } from "~/utils/api";
import { db } from "~/server/db";
import { useEffect, useRef, useState } from "react";
import { socket } from "~/socket";

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
  
  const session = await getSession(ctx)

  if(!session){
    return {
      redirect : {
        destination: "/login",
        permanent: false,
      }
    }
  }

  await db.userRooms.update({
    where : {
      userId_roomId : {
        userId : session.user.id,
        roomId : res.id
      }
    },
    data : {
      isRead : true
    }
  })

  return {
    props: {
      data: { room: res },
    },
  };
};

export default function RoomC(props: {
  data: { room: NonNullable<Awaited<ReturnType<typeof getRoom>>> };
}) {
  const res = props.data.room;
  const router = useRouter();
  const { id } = router.query;
  const { data: sessionData } = useSession();

  useEffect(() => {
    const roomName = "room" + res.id
    socket.emit("joinRoom", roomName );

    return () => {
      socket.emit('leaveRoom' , roomName)
    };
  });

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

type roomT = NonNullable<Awaited<ReturnType<typeof getRoom>>>;

function Content({
  room,
  user,
}: {
  room: roomT;
  user: { id: string; name: string; image: string };
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<(typeof room)["msgs"]>(room.msgs)
  const [ notActiveMembers  , setNotActiveMembers] = useState(new Set( room.members.map((m) => m.user.id ) ))

  const { mutate : notifyMembers } = api.rooms.userRoomsToUnRead.useMutation({
    onSuccess : () => {
      const myRoom = {id : room.id , type : room.type , _count : { members : 2} , name : room.name , members : room.members.map((r) => ({ user: r.user}))}
      notActiveMembers.forEach((m) => {
        console.log(m)
        socket.emit('messageNotify' , {room : 'user' + m , message: myRoom})
      })
    }
  })

  useEffect(() => {
    setNotActiveMembers(new Set( room.members.map((m) => m.user.id ) ))
    setMessages(room.msgs);
  }, [room , user.id]);

  function addMessage(message: (typeof room)["msgs"][number]) {
    setMessages([...messages, message]);
  }

  const { mutate } = api.message.create.useMutation({
    onSuccess: (data) => {
      const newMessage = {
        authorId: user.id,
        id: data.messageId,
        createdAt: new Date(),
        author: user,
        text: input,
      };
      addMessage(newMessage);
      socket.emit("message", { room: "room" + room.id, message: newMessage });
      setInput("");
      notifyMembers({userIds : notActiveMembers , roomId : room.id})
    },
  });

  useEffect(() => {
    function onMessage(data: (typeof room)["msgs"][number]) {
      addMessage(data);
    }

    socket.on("message", onMessage);
    return () => {
      socket.off("message", onMessage);
    };
  });
  return (
    <div className={Styles.container}>
      <MessageList msgs={messages} />

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

function MessageList({ msgs }: { msgs: roomT["msgs"] }) {
  const messageListRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const messageListObj = messageListRef.current;
    if (messageListObj) {
      messageListObj.scrollTop = messageListObj.scrollHeight;
    }
  });

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
    <div className={Styles.chat} ref={messageListRef}>
      {msgs.map(
        (
          msg: (typeof msgs)[number],
          i: number,
          arr: (typeof msgs)[number][],
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
  message: roomT["msgs"][number];
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

  useEffect(() => {
    setRoomName(room.name);
  }, [room]);

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
