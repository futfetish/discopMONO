import Styles from "~/styles/RoomUntilAdd.module.scss";
import { api } from "~/utils/api";
import MyButton from "./myButton";
import { useState, useRef } from "react";
import { useRouter } from "next/router";
export default function RoomUntilAdd({ room }: {room : 
  {
    id: number,
    type :  string,
    members: {
      user: { id: string; name: string; image: string };
      isAdmin: boolean;
    }[];
  }
}) {
  const [open, setOpen] = useState(false);
  function toggleModal() {
    setOpen(!open);
  }
  const { data } = api.friends.all.useQuery();
  const users = room.members.map((u) => u.user);
  const friends = data?.filter(
    (friend) => !users.some((user) => user.id === friend.id),
  );
  const router = useRouter();

  const { mutate : createRoom , isLoading : isLoading1 } =  api.rooms.createNewChat.useMutation({
    onSuccess: (data) => {
      router.push("/channels/" + data.roomId);
    },
  }) 
  const {mutate : addUsers , isLoading : isLoading2 } = api.rooms.addUsersToChat.useMutation({
    onSuccess : () => {
      toggleModal()
    }
  })

  const [members, setMembers] = useState(
    new Set<string>(users.map((u) => u.id)),
  );

  function toggleUser(id  :  string) {
    if (members.has(id)) {
      const temp = new Set(members);
      temp.delete(id);
      setMembers(temp);
    } else {
      const temp = new Set(members);
      temp.add(id);
      setMembers(temp);
    }
  }

  const modalRef = useRef<HTMLDivElement | null>(null);

  document.addEventListener("click", (e) => {
    if (
      open &&
      modalRef.current &&
      !modalRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  });

  return (
    <div className={[Styles.utils_add, Styles.util].join(" ")} ref={modalRef}>
      <i className="bi bi-person-plus-fill" onClick={toggleModal}></i>
      <div
        className={Styles.utils_add_func_init}
        style={open ? {} : { display: "none" }}
      >
        <div className={Styles.utils_add_func}>
          <h1> Выберете друзей</h1>
          <div className={Styles.input_containter}>
            <input
              id="room_add_input"
              type="text"
              v-model="name"
              placeholder="Введите имя пользователя вашего друга"
            />
          </div>

          <div className={Styles.friends}>
            {friends?.map((friend) => (
              <a
                key={friend.id}
                href="#"
                className={Styles.friend_obj}
                onClick={() => toggleUser(friend.id)}
              >
                <img src={friend.image} alt="" className={Styles.friend__ava} />
                <p>{friend.name}</p>
                <div
                  className={[
                    Styles.mark,
                    members.has(friend.id) ? Styles.in : "",
                  ].join("  ")}
                ></div>
              </a>
            ))}
          </div>
          <MyButton
            className="w-full"
            disabled={isLoading1 || isLoading2  }
            onClick={() => room.type === 'ls' ?  createRoom({userIds: members }) :  addUsers({ roomId: room.id, userIds: members }) }
          >
            Добавить
          </MyButton>
        </div>
      </div>
    </div>
  );
}
