import { FC, useCallback, useEffect, useState } from "react";
import { Layout } from "~/modules/layout/pages/layout/layout";
import { ChannelType } from "~/types/rooms";
import Styles from "./channelPage.module.scss";
import { api } from "~/utils/api";
import RoomUntilAdd from "~/modules/chat/features/roomUntilAdd/RoomUntilAdd";
import { GroupRight } from "~/modules/chat/features/groupRight/GroupRight";
import { socket } from "~/socket";
import { MessageList } from "../../components/messageList/messageList";
import { useAppDispatch, useAppSelector } from "~/hooks/redux";
import { setPage } from "~/store/reducers/globalReducer";

export const ChannelPage: FC<{ channel: ChannelType }> = ({ channel }) => {
  return (
    <Layout
      top={<Top channel={channel} />}
      right={<Right channel={channel} />}
      content={<Content channel={channel} />}
      title={(user) =>
        channel.type == "ls"
          ? channel.members
              .map((u) => u.user)
              .filter((m) => m.id !== user.id)
              .map((m) => m.name)
              .join(", ")
          : channel.name
      }
    />
  );
};

const Content: FC<{ channel: ChannelType }> = ({ channel }) => {
  const user = useAppSelector((state) => state.global.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setPage("room_" + channel.id));
  }, [dispatch, channel.id]);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<(typeof channel)["msgs"]>(
    channel.msgs,
  );
  const notActiveMembers = new Set(channel.members.map((m) => m.user.id));

  const { mutate: notifyMembers } = api.rooms.userRoomsToUnRead.useMutation({
    onSuccess: () => {
      notActiveMembers.forEach((m) => {
        socket.emit("messageNotify", {
          room: "user" + m,
          message: { id: channel.id },
        });
      });
    },
  });

  // function addMessage(message: (typeof room)["msgs"][number]) {
  //   setMessages((messages) => [...messages, message]);
  // }

  const addMessage = useCallback(
    (message: (typeof channel)["msgs"][number]) => {
      setMessages((messages) => [...messages, message]);
    },
    [setMessages],
  );

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
      socket.emit("message", {
        room: "room" + channel.id,
        message: newMessage,
      });
      setInput("");
      notifyMembers({ userIds: notActiveMembers, roomId: channel.id });
    },
  });

  useEffect(() => {
    setMessages(channel.msgs);
  }, [channel]);

  useEffect(() => {
    function onMessage(data: (typeof channel)["msgs"][number]) {
      addMessage(data);
    }

    socket.on("message", onMessage);
    return () => {
      socket.off("message", onMessage);
    };
  }, [addMessage]);

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
                  mutate({ text: input, roomId: channel.id });
                }
              }
            }}
            placeholder={
              "написать " +
              (channel.type == "ls"
                ? channel.members
                    .map((u) => u.user)
                    .filter((m) => m.id !== user.id)
                    .map((m) => m.name)
                    .join(", ")
                : channel.name)
            }
          />
        </div>
      </div>
    </div>
  );
};

const Top: FC<{ channel: ChannelType }> = ({ channel }) => {
  const user = useAppSelector((state) => state.global.user);
  const [roomName, setRoomName] = useState(channel.name);
  const { mutate: changeRoomName } = api.rooms.changeName.useMutation();

  useEffect(() => {
    setRoomName(channel.name);
  }, [channel]);

  return (
    <div className={Styles.self__top}>
      <img
        src={
          channel.type == "ls"
            ? channel.members
                .map((u) => u.user)
                .filter((m) => m.id !== user.id)[0]?.image
            : "/img/grav.png"
        }
        alt=""
        className={Styles.room_big_ava}
      />
      {channel.type === "ls" ? (
        <p className={Styles.room_title}>
          {channel.members
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
          onBlur={() => changeRoomName({ roomId: channel.id, name: roomName })}
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
          room={{
            id: channel.id,
            members: channel.members,
            type: channel.type,
            name: channel.name,
          }}
        />
      </div>
    </div>
  );
};

const Right: FC<{ channel: ChannelType }> = ({ channel }) => {
  if (channel.type == "group") {
    return <GroupRight room={channel} />;
  }

  return <h1>right</h1>;
};

