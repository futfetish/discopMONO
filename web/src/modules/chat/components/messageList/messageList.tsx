import React, { FC, useEffect, useRef, useState } from "react";
import { ChannelType } from "~/types/rooms";
import Styles from "./messageList.module.scss";
import { ProfileCard } from "~/modules/common/components/profileCards/profileCard/profileCard";
import { Panel } from "~/modules/common/ui/panel/panel";

export const MessageList: FC<{ msgs: ChannelType["msgs"] }> = ({ msgs }) => {
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
};

const MessageItem: FC<{
  message: ChannelType["msgs"][number];
  isNewMessage: boolean;
}> = React.memo(({ message, isNewMessage }) => {
  console.log(`rerender message : ${message.id}`);
  const nameRef = useRef<HTMLDivElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const [ isPanelOpen , setIsPanelOpen ] = useState(false)

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

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
        {isNewMessage && (
          <div ref={authorRef} className={Styles.message__author}>
            <p ref={nameRef} onClick={() => togglePanel()} className={Styles.message__author_name}>{message.author.name}</p>
            <Panel opacityAnimation={{ duration : 50}} useLeft={true} useTop={true} offsetPx={{left : 10, top:-10} } offsetPercentage={{left : 100}} parentRef={authorRef} className={Styles.panel} isOpen={isPanelOpen} setIsOpen={setIsPanelOpen} buttonRef={nameRef} >
              <ProfileCard user={message.author} />
            </Panel>
          </div>
        )}

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
});

MessageItem.displayName = "MessageItem";
