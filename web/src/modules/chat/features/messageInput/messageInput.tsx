import { FC, useState } from "react";
import Styles from "./messageInput.module.scss";
import { api } from "~/utils/api";
import { useAppSelector } from "~/hooks/redux";
import { ChannelType } from "~/types/rooms";
import { socket } from "~/socket";

export const MessageInput : FC<{addMessage : (message : ChannelType['msgs'][number])  => void ,  channel : ChannelType }> = ({addMessage , channel}) => {
  const [input, setInput] = useState("");
  const user = useAppSelector(state => state.global.user)
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

  return (
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
  );
};
