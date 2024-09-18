import Link from "next/link";
import { FC, useEffect, useState } from "react";
import Styles from "./navFriends.module.scss";
import { socket } from "~/socket";
import { api } from "~/utils/api";
import { useAppSelector } from "~/hooks/redux";

export const NavFriends: FC = () => {
  const page = useAppSelector((state) => state.global.page);
  const { data: isHaveReqQ } = api.friends.isHaveReq.useQuery();
  const [isHaveReq, setIsHaveReq] = useState(isHaveReqQ);

  useEffect(() => {
    setIsHaveReq(isHaveReqQ);
  }, [isHaveReqQ]);

  useEffect(() => {
    function onFriendReqNotify() {
      setIsHaveReq(true);
    }
    socket.on("friendReqNotify", onFriendReqNotify);

    return () => {
      socket.off("friendReqNotify", onFriendReqNotify);
    };
  }, []);

  return (
    <div>
      <Link href="/friends" className={page === "friends" ? Styles.tab : ""}>
        <p>
          <i className="bi bi-people-fill"></i>Друзья
        </p>
        {isHaveReq && (
          <div className={Styles.red_circle}>
            <div className={Styles.core}></div>
          </div>
        )}
      </Link>
    </div>
  );
};
