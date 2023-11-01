import Styles from '~/styles/RoomUntilAdd.module.scss'
import { api } from '~/utils/api'
import MyButton from './myButton'
import { useState , useRef } from 'react'
import { useRouter } from 'next/router'

export default function RoomUntilAdd({room }: any){
    const {data}= api.users.friends.useQuery()
    const users = room.members.map((u : any) => u.user)
    const friends = data?.filter((friend) => !users.some((user : any) => user.id === friend.id));
    const router = useRouter()

    const {mutate , isLoading} = api.rooms.groupChat.useMutation({
        onSuccess : (data) => {
           if (data.create){
            router.push('/channels/' + data.roomId)
           }
        }
    })
    
    const [members , setMembers] = useState(new Set<string>(users.map((u:any) => u.id)))

    const [open , setOpen] = useState(false)
    
    function toggleModal(){
        setOpen(!open)
    }

    function toggleUser(id :  any){
        if (members.has(id)){
            const temp = new Set(members)
            temp.delete(id)
            setMembers(temp)
        }else{
            const temp = new Set(members)
            temp.add(id)
            setMembers(temp)
        }
    }

    const modalRef = useRef<HTMLDivElement | null>(null)

    document.addEventListener('click' , (e) => {
        if (open && modalRef.current && !modalRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      })

    return(
        <div className={[Styles.utils_add , Styles.util].join(' ')} ref={modalRef}>
              <i className="bi bi-person-plus-fill" onClick={toggleModal}></i>
              <div className={Styles.utils_add_func_init} style={open? {} : {display :'none'}  }>
                <div className={Styles.utils_add_func} >
                    <h1> Выберете друзей</h1>
                    <div className={Styles.input_containter}>
                            <input id="room_add_input"  type="text" v-model="name" placeholder="Введите имя пользователя вашего друга"/>
                    </div>
                        
                    
                    <div className={Styles.friends} >
                        {friends?.map((friend : any) => (
                            <a href="#" className={Styles.friend_obj} onClick={() => toggleUser(friend.id)} >
                            <img src={friend.image} alt="" className={Styles.friend__ava}/>
                            <p>{friend.name}</p>
                            <div className={[Styles.mark , members.has(friend.id) ? Styles.in : ''].join('  ')} ></div>
                        </a> 
                        ))}
                    </div>
                    <MyButton className='w-full' disabled={isLoading} 
                    onClick={() =>  (
                        mutate({roomId : room.id , userIds : members})
                    )}
                    >Добавить</MyButton>
                </div>
            </div>

            </div>
    )
}