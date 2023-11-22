import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import Styles from "../../styles/friends.module.scss";
import MainContainer from "~/components/MainContainer";
import { api } from "~/utils/api";
import { useState } from "react";
import { FriendTop } from "~/components/FriendsTop";
import { FriendList } from "~/components/FriendList";

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

interface FriendType {
  name: string;
  id: string;
  image: string;
}

const Content = () => {
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
        <FriendList
          friends={friendList}
          btns={[
            {
              className: Styles.friend__del,
              icon: <i className="bi bi-x-lg"></i>,
              onClick: (e, friend) => {
                e.preventDefault();
                setFriendList(friendList?.filter((f) => f.id !== friend.id));
                mutate({ id: friend.id });
              },
            },
          ]}
        />
      )}
    </div>
  );
};
