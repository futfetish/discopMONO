

import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import GroupRight from "~/components/GroupRight";

import RoomUntilAdd from "~/components/RoomUntilAdd";
import ErrorContent from "~/components/errorContent";
import { GetServerSideProps } from "next";
import { useRouter } from 'next/router';
import  Styles  from"../../styles/room.module.scss"
import MainContainer from "~/components/MainContainer";
import { api } from "~/utils/api";
import { db } from "~/server/db";
import { useState } from "react";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  
    const id = ctx.params?.id;

    if (!id){
      return {
        notFound : true
      }
    }
  
    const res = await db.room.findUnique({
        where : {
           id: parseInt(id as string)
        },
        select : {
          id :true ,
          members  : {
            select :  {
              user: {  select:{
                id:true,
                name:true,
                image:true
            }},
            isAdmin : true
            }
            
          },
          msgs : {
            include : {
              author :  {
                select : {
                  id:true,
                name:true,
                image:true
                }
              }
            },
            orderBy: {
              createdAt: 'asc', 
            }
          },
          name  : true,
          type : true
        }
    })
  
    if(!res){
      return {
        notFound : true
      }
    }

    return {
      props: {
        data : JSON.stringify(res)
      },
    };
  };

export default function Room( props: {data : string} ) {
    const res = JSON.parse(props.data)
    const router = useRouter();
    const { id } = router.query;
    if(!id){
      <MainContainer tab="none" content={() => ErrorContent('вы не являетесь участником этой группы') } top={() => <div></div> }  right={() => <div></div>} title={ 'вы не являетесь участником этой группы'} />
    }
    
    const {data : sessionData } = useSession()
    if (!sessionData ){
      return (  <button onClick={()=> void signIn()}>signin </button> )
    }
    console.log(res.members)
    if( !res.members.some((u : any) => u.user.id === sessionData.user.id) ){
      return (
        <MainContainer tab="none" content={() => ErrorContent('вы не являетесь участником этой группы') } top={() => <div></div> }  right={() => <div></div>} title={ 'вы не являетесь участником этой группы'} />
      )
    }



  return (
    <MainContainer tab={'room_' + res.id} content={() => content(res , sessionData.user) } top={() =>  top(res , sessionData.user) }  right={() => res.type == 'ls' ? right() : GroupRight(res , sessionData.user)} title={ res.type == 'ls' ? res.members.map((u :  any) => u.user).filter((m : any) => m.id !== sessionData.user.id).map((m : any) => m = m.name).join(', ')  :  res.name} />
  );
}



function content(room : any , user : any){

  const [input , setInput] = useState('')

  const {mutate} = api.message.create.useMutation({
    onSuccess : (data) => {
      room.msgs.push(data)
    }
  })

  

  let msgs : any = room.msgs

  function formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
  
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
  
    const day = (dateObj.getDate() + 1).toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }
  
  function formatTimeDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
  
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
  
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
  
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}`;
  }
  
  function isSameDay(date1: Date | string, date2: Date | string): boolean {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
    if (
      !(dateObj1 instanceof Date) ||
      !(dateObj2 instanceof Date) ||
      isNaN(dateObj1.getTime()) ||
      isNaN(dateObj2.getTime())
    ) {
      return false;
    }
  
    return (
      dateObj1.getFullYear() === dateObj2.getFullYear() &&
      dateObj1.getMonth() === dateObj2.getMonth() &&
      dateObj1.getDate() === dateObj2.getDate()
    );
  }

msgs.forEach((msg : any, i : number, arr : any[]) => {
  if (!arr[i - 1] || (msg && arr[i - 1] && msg.authorId !== arr[i - 1]?.authorId) || !isSameDay(msg.createdAt, arr[i - 1].createdAt )) {
    msg.type = 'new';
  } else {
    msg.type = 'past';
  }
});

// for (let i = 0; i < msgs.length; i++) {
//   if (i === 0 || (!msgs[i - 1] || (msgs[i] && msgs[i - 1] && msgs[i].authorId !== msgs[i - 1].authorId)) || !isSameDay(msgs[i].createdAt, msgs[i - 1].createdAt)) {
//     msgs[i].type = 'new';
//   } else {
//     msgs[i].type = 'past';
//   }
// }


  return(
   <div  className={Styles.container}>
    
    <div className={Styles.chat} >
      {
      msgs.map((msg : any , i : number, arr : any[]) => (
        <div key={msg.id} className={[Styles.message , (!arr[i - 1] || (msg && arr[i - 1] && msg.authorId !== arr[i - 1]?.authorId) || !isSameDay(msg.createdAt, arr[i - 1].createdAt)) ? Styles.message_new : Styles.message_past ].join(' ')}>
            <div className={Styles.message__info}>
            {(!arr[i - 1] || (msg && arr[i - 1] && msg.authorId !== arr[i - 1]?.authorId) || !isSameDay(msg.createdAt, arr[i - 1].createdAt)) ? (
            <img src={msg.author.image} className={Styles.message__author_ava} />
          ) : null}
            <div className={Styles.message__author}> {msg.author.name} </div>
          {msg.type=='new' ? 
            <div v-if="msg.type === 'new'" className={Styles.message__date}>{ formatDate(msg.createdAt ) }</div>
            :
            <div  className={Styles.message__date}>{ formatTimeDate(msg.createdAt ) }</div>
          }
            </div>
            
            <div className={Styles.message__text}>{msg.text}</div>
        </div>
      ))
    }
        

  </div>
  <div className={Styles.input_area}>
    <div className={Styles.input_container}>
        <input
         autoComplete="off"
          type="text" 
          v-model="msg_text" 
          className={Styles.message_input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input !== "") {
                mutate({ text: input , roomId : room.id });
                setInput('')
              }
            }
          }}
          placeholder={'написать ' +( room.type == 'ls' ?  room.members.map((u :  any) => u.user).filter((m : any) => m.id !== user.id).map((m : any)=> m = m.name).join(', ')  :  room.name) }  />
    </div>
  </div>
  </div>
  )
}

function top( room : any , user : any){
  return(
    <div className={Styles.self__top}>
      <img src={ room.type == 'ls' ? room.members.map((u :  any) => u.user).filter((m : any) => m.id !== user.id)[0].image : '/img/grav.png' } alt="" className={Styles.room_big_ava}/>
        <p className={Styles.room_title}> { room.type == 'ls' ? room.members.map((u :  any) => u.user).filter((m : any) => m.id !== user.id).map((m : any)=> m = m.name).join(', ')  :  room.name} </p>
        <div className={Styles.top_utils}>
            <RoomUntilAdd room={room}/>
        </div>
    </div>
  )
}

function right(){
  return(
    <h1>right</h1>
  )
}