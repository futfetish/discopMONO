import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import Styles from "../../styles/friends.module.scss";
import MainContainer from "~/components/MainContainer";
import { api } from "~/utils/api";
import { useState } from "react";

import { FriendTop } from "~/components/FriendsTop";
import { FriendList } from "~/components/FriendList";
import { socket } from "~/socket";

export default function Friends_wait() {
  const { data: sessionData } = useSession();
  if (!sessionData) {
    return <button onClick={() => void signIn()}>signin </button>;
  }

  return (
    <MainContainer
      tab="friends"
      content={<Content />}
      top={<FriendTop tab="wait" />}
      right={<div></div>}
      title="friends"
    />
  );
}

function Content() {
  interface FriendType {
    name: string;
    id: string;
    image: string;
  }

  const { data: friends, isLoading } = api.friends.requests.useQuery();

  const [friendListTo, setFriendListTo] = useState<FriendType[]>([]);
  const [friendListFrom, setFriendListFrom] = useState<FriendType[]>([]);
  const { mutate: reject } = api.friends.rejectReq.useMutation();
  const { mutate: cancel } = api.friends.cancelReq.useMutation();
  const { mutate: accept } = api.friends.acceptReq.useMutation();

  useEffect(() => {
    if (!isLoading && friends) {
      // console.log(friends)
      setFriendListTo(friends.to);
      setFriendListFrom(friends.from);
    }
  }, [isLoading, friends]);

  useEffect(() => {
    function onFriendReqNotify(data : {id : string , name : string , image : string}){
      if (! friendListFrom.find((f) => f.id === data.id))
      setFriendListFrom([...friendListFrom , data])
    }
    socket.on('friendReqNotify' , onFriendReqNotify)
    return () => {
      socket.off('friendReqNotify' , onFriendReqNotify)
    }
  })

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
                  e.preventDefault()
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
