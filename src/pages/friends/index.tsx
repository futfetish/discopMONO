import { useSession } from "next-auth/react";
import { type ReactNode, useEffect } from "react";
import Styles from "../../styles/friends.module.scss";
import { Layout } from "~/modules/layout/pages/layout/layout";
import { api } from "~/utils/api";
import { useState } from "react";
import { FriendTop } from "~/components/FriendsTop";
import { FriendList } from "~/components/FriendList";

export default function Friends_all() {
  const { data: sessionData } = useSession();

  let contentObj: ReactNode;

  if (!sessionData) {
    contentObj = <div></div>;
  } else {
    contentObj = <Content />;
  }

  return (
    <Layout
      page="friends"
      content={contentObj}
      top={<FriendTop page="all" />}
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
