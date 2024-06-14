import { FC, useEffect, useState } from "react";
import Styles from "./friendsAllPage.module.scss";
import { api } from "~/utils/api";
import { userDTO } from "~/types/user";
import { FriendList } from "~/modules/friend/components/friendList/FriendList";
import { Layout } from "~/modules/layout/pages/layout/layout";
import { FriendTop } from "~/modules/friend/features/friendsTop/FriendsTop";
import { globalSlice } from "~/store/reducers/globalReducer";
import { useAppDispatch } from "~/hooks/redux";

export const FriendsAllPage: FC = () => {

  
  const {setPage} = globalSlice.actions
  const dispatch = useAppDispatch()

  dispatch(setPage('friends'))

  return (
    <Layout
      content={ <Content /> }
      top={<FriendTop page="all" />}
      right={<div></div>}
      title="friends"
    />
  );
};

const Content = () => {
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
