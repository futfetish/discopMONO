import Link from "next/link";
import Styles from "../../src/styles/friends.module.scss";
import { type FC } from "react";

type TTabs = "all" | "wait" | "add";

export const FriendTop: FC<{ tab: TTabs }> = ({ tab }) => {
  return (
    <div className={Styles.self__top}>
      <div className={Styles.top__content}>
        <div className={Styles.label}>
          <i className="bi bi-people-fill"></i> Друзья
        </div>
        <div className={Styles.stick}></div>
        <div className={[Styles.utils].join(" ")}>
          <Link
            href="/friends/"
            className={tab == "all" ? Styles.friend_tab : ""}
          >
            Все
          </Link>
          <Link
            href="/friends/wait"
            className={tab == "wait" ? Styles.friend_tab : ""}
          >
            <p>Ожидание</p>
          </Link>
          <Link
            href="/friends/add"
            className={[
              Styles.add,
              tab == "add" ? Styles.friend_tab_add : "",
            ].join(" ")}
          >
            Добавить в Друзья
          </Link>
        </div>
      </div>
    </div>
  );
};
