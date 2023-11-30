import Link from "next/link";
import { type ReactNode } from "react";
import Styles from "~/styles/friendList.module.scss";

interface FriendType {
  name: string;
  id: string;
  image: string;
}

export function FriendList({
  friends,
  btns,
}: {
  friends: FriendType[];
  btns?: {
    className?: string;
    icon: ReactNode;
    onClick: (e: React.MouseEvent, friend: FriendType) => void;
  }[];
}) {
  return (
    <>
      {friends.map((friend) => (
        <Link
          key={friend.id}
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
      ))}
    </>
  );
}
