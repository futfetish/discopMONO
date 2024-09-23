import Link from "next/link";
import React, { FC, useRef, useState, type ReactNode } from "react";
import Styles from "./friendList.module.scss";
import { Panel } from "~/modules/common/ui/panel/panel";

interface FriendType {
  name: string;
  id: string;
  image: string;
}

type BtnType = "cancel" | "delete" | "accept" | "reject";

interface Btn {
  className?: string;
  type?: BtnType;
  helper?: string;
  icon: ReactNode;
  onClick: (e: React.MouseEvent, friend: FriendType) => void;
}

export function FriendList({
  friends,
  btns,
}: {
  friends: FriendType[];
  btns?: Btn[];
}) {
  return (
    <>
      {friends.map((friend) => (
        <FriendItem key={friend.id} friend={friend} btns={btns} />
      ))}
    </>
  );
}

const FriendItem: FC<{ friend: FriendType; btns?: Btn[] }> = React.memo(
  ({ friend, btns }) => {
    return (
      <Link href={"/ls/" + friend.id} className={Styles.friend__user}>
        <div className={Styles.friend__user_container}>
          <img src={friend.image} alt="" className={Styles.friend__ava} />
          <div className={Styles.friend__user_info}>
            <div className={Styles.friend__name}>{friend.name}</div>
          </div>
          {btns?.map((btn, index) => (
            <FriendButton btn={btn} friend={friend} key={index} />
          ))}
        </div>
      </Link>
    );
  },
);

FriendItem.displayName = "FriendItem";

const FriendButton: FC<{ btn: Btn; friend: FriendType }> = ({
  btn,
  friend,
}) => {
  const buttonsClasses: {
    [key in BtnType]: string;
  } = {
    reject: Styles.friend__reject || "",
    accept: Styles.friend__accept || "",
    delete: Styles.friend__del || "",
    cancel: Styles.friend__cancel || "",
  };

  const buttonsHelpers: {
    [key in BtnType]: string;
  } = {
    reject: "Отклонить",
    accept: "Принять",
    delete: "Удалить из друзей",
    cancel: "Отмена",
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div ref={parentRef} className={Styles.button__container}>
      <Panel
      opacityAnimation={{ duration : 50}}
      scaleAnimation={  { duration : 50 , startScale : 97 }}
        isOpen={isPanelOpen}
        setIsOpen={setIsPanelOpen}
        parentRef={parentRef}
        offsetPx={{left : 10 , top : 5}}
        xCenter={true}
        offsetPercentage={{top : -100 }}
      >
        {(btn.helper || btn.type) && (
          <div className={Styles.helper}>
            {btn.type ? buttonsHelpers[btn.type] : btn.helper}
          </div>
        )}
      </Panel>
      <div
        onMouseEnter={() => setIsPanelOpen(true)}
        // onMouseLeave={() => setIsPanelOpen(false)}
        className={`${Styles.friend__but} ${btn.className} ${
          btn.type && buttonsClasses[btn.type]
        }`}
        onClick={(e) => btn.onClick(e, friend)}
      >
        {btn.icon}
      </div>
    </div>
  );
};
