import { FC, useEffect, useState } from "react";
import { Layout } from "~/modules/layout/pages/layout/layout";
import { FriendTop } from "../../features/friendsTop/FriendsTop";
import { api } from "~/utils/api";
import { userDTO } from "~/types/user";
import { socket } from "~/socket";
import { FriendList } from "../../components/friendList/FriendList";
import Styles from "./friendsWaitPage.module.scss";
import { useAppDispatch } from "~/hooks/redux";
import { setPage } from "~/store/reducers/globalReducer";

export const FriendsWaitPage: FC = () => {
  return (
    <Layout
      content={<Content />}
      top={<FriendTop page="wait" />}
      right={<div></div>}
      title="friends"
    />
  );
};

const Content: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setPage("friends"));
  }, [dispatch]);
  const { data: friends, isLoading } = api.friends.requests.useQuery();

  const [friendListTo, setFriendListTo] = useState<userDTO[]>([]);
  const [friendListFrom, setFriendListFrom] = useState<userDTO[]>([]);
  const { mutate: reject } = api.friends.rejectReq.useMutation();
  const { mutate: cancel } = api.friends.cancelReq.useMutation();
  const { mutate: accept } = api.friends.acceptReq.useMutation();

  // const { mutate: addNewReq } = api.users.getById.useMutation({
  //   onSuccess: (data) => {
  //     setFriendListFrom([...friendListFrom, data]);
  //   },
  // });

  useEffect(() => {
    if (!isLoading && friends) {
      // console.log(friends)
      setFriendListTo(friends.to);
      setFriendListFrom(friends.from);
    }
  }, [isLoading, friends]);

  useEffect(() => {
    function onFriendReqNotify(data: { id: string }) {
      if (!friendListFrom.find((f) => f.id === data.id)) {
        addNewReq({ id: data.id });
      }
    }

    const addNewReq = ({ id }: { id: string }) => {
      const { data: user } = api.users.getById.useQuery({ id });
      if (user) {
        setFriendListFrom([...friendListFrom, user]);
      }
    };
    
    socket.on("friendReqNotify", onFriendReqNotify);
    return () => {
      socket.off("friendReqNotify", onFriendReqNotify);
    };
  }, [friendListFrom]);

  return (
    <div className={Styles.self__self} id="friends_all_app">
      <label>ожидание - {friendListTo.length + friendListFrom.length}</label>
      {isLoading ? (
        <div></div>
      ) : (
        <>
          <FriendList
            friends={friendListFrom}
            btns={[
              {
                type : 'accept',
                icon: <i className="bi bi-check2"></i>,
                onClick: (e, friend) => {
                  e.preventDefault();
                  setFriendListFrom(
                    friendListFrom.filter((f) => f.id !== friend.id),
                  );
                  accept({ id: friend.id });
                },
              },
              {
                type : 'reject',
                icon: <i className="bi bi-x-lg"></i>,
                onClick: (e, friend) => {
                  e.preventDefault();
                  setFriendListFrom(
                    friendListFrom.filter((f) => f.id !== friend.id),
                  );
                  reject({ id: friend.id });
                },
              },
            ]}
          />
          <FriendList
            friends={friendListTo}
            btns={[
              {
                type : 'cancel',
                icon: <i className="bi bi-x-lg"></i>,
                onClick: (e, friend) => {
                  e.preventDefault();
                  setFriendListTo(
                    friendListTo.filter((f) => f.id !== friend.id),
                  );
                  cancel({ id: friend.id });
                },
              },
            ]}
          />
        </>
      )}
    </div>
  );
};
