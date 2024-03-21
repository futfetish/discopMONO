import Link from "next/link";
import Styles from './friendsTop.module.scss'
import { useState, type FC, useEffect } from "react";
import { api } from "~/utils/api";
import { socket } from "~/socket";
type TPage = "all" | "wait" | "add";

export const FriendTop: FC<{ page: TPage }> = ({ page }) => {
  const { data: isHaveReqQ } = api.friends.isHaveReq.useQuery();
  const [isHaveReq, setIsHaveReq] = useState(isHaveReqQ);

  useEffect(() => {
    setIsHaveReq(isHaveReqQ);
  }, [isHaveReqQ]);

  useEffect(() => {
    function onFriendReqNotify(){
      setIsHaveReq(true)
    }
    socket.on('friendReqNotify' , onFriendReqNotify)
    return () => {
      socket.off('friendReqNotify' , onFriendReqNotify)
    }
  } , [])

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
            className={page == "all" ? Styles.friend_tab : ""}
          >
            Все
          </Link>
          <Link
            href="/friends/wait"
            className={page == "wait" ? Styles.friend_tab : ""}
          >
            <p>Ожидание</p>
            {isHaveReq && (
              <div className={Styles.red_circle}>
                <div className={Styles.core}></div>
              </div>
            )}
          </Link>
          <Link
            href="/friends/add"
            className={[
              Styles.add,
              page == "add" ? Styles.friend_tab_add : "",
            ].join(" ")}
          >
            Добавить в Друзья
          </Link>
        </div>
      </div>
    </div>
  );
};
