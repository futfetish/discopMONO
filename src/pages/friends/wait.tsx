import { signIn, useSession } from "next-auth/react";
import  { useEffect } from 'react';
import  Styles  from"../../styles/friends.module.scss"
import MainContainer from "~/components/MainContainer";
import { api } from "~/utils/api";
import { useState } from "react";

import { FriendTop } from "~/components/FriendsTop";


export default function Friends_wait()  {


    const {data : sessionData } = useSession()
    if (!sessionData ){
      return (  <button onClick={()=> void signIn()}>signin </button> )
    }



  return (
    <MainContainer tab='friends'  content={<Content/>} top={ <FriendTop tab="wait" /> }  right={<div></div> } title='friends' />
  );
}



function Content(){
    interface FriendType {
        name: string;
        id: string;
        image: string;
      }

    const {data : friends , isLoading} =  api.friends.requests.useQuery()
    
    
    const [friendListTo, setFriendListTo] = useState<FriendType[]>([]);
    const [friendListFrom, setFriendListFrom] = useState<FriendType[]>([]);
    const {mutate : reject} = api.friends.rejectReq.useMutation()
    const {mutate : cancel} = api.friends.cancelReq.useMutation()
    const {mutate : accept} = api.friends.acceptReq.useMutation()

    useEffect(() => {
      if (!isLoading && friends) {
        // console.log(friends)
        setFriendListTo(friends.to);
        setFriendListFrom(friends.from)
      }
    }, [isLoading, friends]);
    

    return(
        <div className={Styles.self__self} id="friends_all_app" >
            <label>ожидание - {friendListTo.length + friendListFrom.length}</label>
            {isLoading ? <div></div> :<> {friendListFrom?.map((friend) => (
                <div key={friend.id}  className={Styles.friend__user} >
                    <div className={Styles.friend__user_container}>
                      <img src={friend.image} alt="" className={Styles.friend__ava}/>
                      <div className={Styles.friend__user_info}>
                          <div className={Styles.friend__name}>{friend.name}</div>
                          <div className={Styles.friend__some}>Входящий запрос дружбы</div>
                      </div> 
                      <div
                      onClick={() => {
                        setFriendListFrom(friendListFrom.filter((f) => f.id !== friend.id))
                        accept({id : friend.id})
                      }}
                      className={[Styles.friend__accept , Styles.friend__but].join(' ')}>
                        <i className="bi bi-check2"></i>
                      </div>
                      <div
                      onClick={() => {
                        setFriendListFrom(friendListFrom.filter((f) => f.id !== friend.id))
                        reject({id : friend.id})
                      }}
                      className={[Styles.friend__reject , Styles.friend__but].join(' ')}>
                          <i className="bi bi-x-lg"></i>
                      </div>
                    </div>
                </div>
            ))}
            {friendListTo?.map((friend) => (
              <div key={friend.id} className={Styles.friend__user} >
                  <div className={Styles.friend__user_container}>
                    <img src={friend.image} alt="" className={Styles.friend__ava}/>
                    <div className={Styles.friend__user_info}>
                        <div className={Styles.friend__name}>{friend.name}</div>
                        <div className={Styles.friend__some}>Исходящий запрос дружбы</div>
                    </div> 
                    <div
                    onClick={() =>{ 
                      setFriendListTo(friendListTo.filter((f) => f.id !== friend.id))
                      cancel({id : friend.id})
                  }}
                     className={[Styles.friend__cancel , Styles.friend__but].join(' ')}>
                        <i className="bi bi-x-lg"></i>
                    </div>
                  </div>
              </div>
          ))}
          </>
            }
        </div>
    )
}