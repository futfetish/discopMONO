import { api } from "~/utils/api";
import { useState } from "react";
import MyButton from "./myButton";

export default function FriendTokenReset({tokens} : any){
    const [token, setToken] = tokens.length >= 1 ? useState(tokens[0].token.token)  : useState('у вас еще нет токена друга' )
    const {mutate : resetFriendToken} = api.users.generateNewFriendToken.useMutation({
        onSuccess : (data) => {
          if (data.token){
            setToken(data.token)
          }
        }
      })

    return(
    <div>
        <div className='text-white'>
          Ваш токен друга
        </div>
        <div className="text-gray-400"> 
          {token}
        </div>
        <br />
        <MyButton 
        onClick={()=>{
          resetFriendToken()
        }}>
          reset
        </MyButton>
      </div>
      )
}