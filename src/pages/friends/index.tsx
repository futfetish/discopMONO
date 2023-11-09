import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import Styles from "../../styles/friends.module.scss";
import MainContainer from "~/components/MainContainer";
import { api } from "~/utils/api";
import { useState } from "react";
import { FriendTop } from "~/components/FriendsTop";


export default function Friends_all() {
  const { data: sessionData } = useSession();
  if (!sessionData) {
    return <button onClick={() => void signIn()}>signin </button>;
  }

  return (
    <MainContainer
      tab="friends"
      content={<Content />}
      top={<FriendTop tab="all" />}
      right={<div></div>}
      title="friends"
    />
  );
}

const Content = () => {
  interface FriendType {
    name: string;
    id: string;
    image: string;
  }

  const { mutate } = api.friends.del.useMutation();

  const { data: friends, isLoading } = api.friends.all.useQuery();

  const [friendList, setFriendList] = useState<FriendType[]>([]);

  useEffect(() => {
    if (!isLoading && friends) {
      setFriendList(friends);
    }
  }, [isLoading, friends]);

  return (
    <div className={Styles.self__self} id="friends_all_app">
      <label>всего друзей - {friendList.length || 0}</label>
      {isLoading ? (
        <div></div>
      ) : (
        friendList?.map((friend) => (
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
              <div
                className={[Styles.friend__but, Styles.friend__del].join(" ")}
                onClick={(e) => {
                  e.preventDefault();
                  setFriendList(friendList?.filter((f) => f.id !== friend.id));
                  mutate({ id: friend.id });
                }}
              >
                <i className="bi bi-x-lg"></i>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};
