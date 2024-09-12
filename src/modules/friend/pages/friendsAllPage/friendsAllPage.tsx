import { FC, useEffect, useState } from "react";
import Styles from "./friendsAllPage.module.scss";
import { api } from "~/utils/api";
import { userDTO } from "~/types/user";
import { FriendList } from "~/modules/friend/components/friendList/FriendList";
import { Layout } from "~/modules/layout/pages/layout/layout";
import { FriendTop } from "~/modules/friend/features/friendsTop/FriendsTop";

import { useAppDispatch } from "~/hooks/redux";
import { setPage } from "~/store/reducers/globalReducer";

export const FriendsAllPage: FC = () => {
  return (
    <Layout
      content={<Content />}
      top={<FriendTop page="all" />}
      right={<div></div>}
      title="friends"
    />
  );
};

const Content = () => {

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setPage("friends"));
  }, [dispatch]);

  const { mutate } = api.friends.del.useMutation();

  const { data: friends, isLoading } = api.friends.all.useQuery();

  const [friendList, setFriendList] = useState<userDTO[]>([]);

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
              type : 'delete',
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
