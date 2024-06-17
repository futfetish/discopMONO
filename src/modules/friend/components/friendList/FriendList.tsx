import Link from "next/link";
import React, { FC, type ReactNode } from "react";
import Styles from "./friendList.module.scss";

interface FriendType {
  name: string;
  id: string;
  image: string;
}

interface Btn {
  className?: string;
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

const FriendItem: FC<{ friend: FriendType , btns? : Btn[] }> = React.memo(({ friend , btns }) => {
  return (
    <Link
      href={"/ls/" + friend.id}
      className={Styles.friend__user}
    >
      <div className={Styles.friend__user_container}>
        <img src={friend.image} alt="" className={Styles.friend__ava} />
        <div className={Styles.friend__user_info}>
          <div className={Styles.friend__name}>{friend.name}</div>
        </div>
        {btns?.map((btn) => (
          <div
            key={friend.id}
            className={`${Styles.friend__but} ${btn.className}`}
            onClick={(e) => btn.onClick(e, friend)}
          >
            {btn.icon}
          </div>
        ))}
      </div>
    </Link>
  );
});

FriendItem.displayName = "FriendItem";
