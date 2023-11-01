import Styles from '~/styles/GroupRight.module.scss'
import { api } from '~/utils/api'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default  function GroupRight(room : any , user : any){
    const  router = useRouter()
    const  {mutate : leave} = api.rooms.leave.useMutation({
        onSuccess : () => {
            router.push('/')
        }
    })
    const [usersObjs , setUObjs] = useState(room.members)
    const  {mutate : delUser} = api.rooms.deleteUser.useMutation()
    const selfAdmin = room.members.find((u : any) => u.user.id == user.id).isAdmin
    return (
        <div className={Styles.container}>
            <label > участники - {room.members.length} </label>
                <div className={Styles.room_members}>
                    {usersObjs.map((u : any) => (
                      <div className={Styles.room_member} key={u.user.id}> 
                        <a href="#">
                            <img src={u.user.image}  className={Styles.member__ava}/>
                        <p>{u.user.name} </p> <span> {u.isAdmin ? <i className="bi bi-person-fill-exclamation"></i> : selfAdmin ? <div
                         onClick={() => {
                            delUser({roomId : room.id , userId : u.user.id})
                            setUObjs(usersObjs.filter((uO : any) => uO.user.id !== u.user.id))
                             }}
                          className={Styles.deleteUser}><i className="bi bi-x-lg"></i></div> : ''} </span>
                        </a>
                    </div>  
                    ))}
                </div>
                <div className={Styles.actions}>
                <button className={Styles.leave} onClick={() => leave({roomId : room.id})}> Выйти из группы </button> 
            </div>
        </div>
    )
}