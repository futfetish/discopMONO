import { FC, useEffect, useState } from "react";
import { Layout } from "~/modules/layout/pages/layout/layout";
import { FriendTop } from "../../features/friendsTop/FriendsTop";
import { api } from "~/utils/api";
import { userDTO } from "~/types/user";
import { socket } from "~/socket";
import { FriendList } from "../../components/friendList/FriendList";
import Styles from './friendsWaitPage.module.scss'

export const FriendsWaitPage : FC = () => {
    return <Layout
    page="friends"
    content={<Content />}
    top={<FriendTop page="wait" />}
    right={<div></div>}
    title="friends"
  />
}

const Content : FC = () => {
    const { data: friends, isLoading } = api.friends.requests.useQuery();

    const [friendListTo, setFriendListTo] = useState<userDTO[]>([]);
    const [friendListFrom, setFriendListFrom] = useState<userDTO[]>([]);
    const { mutate: reject } = api.friends.rejectReq.useMutation();
    const { mutate: cancel } = api.friends.cancelReq.useMutation();
    const { mutate: accept } = api.friends.acceptReq.useMutation();
    const { mutate: addNewReq } = api.users.getById.useMutation({
      onSuccess: (data) => {
        setFriendListFrom([...friendListFrom, data]);
      },
    });
  
  
    useEffect(() => {
  
      if (!isLoading && friends) {
        // console.log(friends)
        setFriendListTo(friends.to);
        setFriendListFrom(friends.from);
      }
    }, [isLoading, friends]);
  
    useEffect(() => {
      console.log('wait rere')
      function onFriendReqNotify(data: { id: string }) {
        if (!friendListFrom.find((f) => f.id === data.id)) {
          addNewReq({ id: data.id });
        }
      }
      socket.on("friendReqNotify", onFriendReqNotify);
      return () => {
        socket.off("friendReqNotify", onFriendReqNotify);
      };
    } , [addNewReq , friendListFrom]);
  
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
                  className: Styles.friend__accept,
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
                  className: Styles.friend__reject,
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
                  className: Styles.friend__cancel,
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
}