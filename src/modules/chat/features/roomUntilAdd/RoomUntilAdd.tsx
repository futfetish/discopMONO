import Styles from "./RoomUntilAdd.module.scss";
import { api } from "~/utils/api";
import { MyButton } from "../../../common/ui/myButton/myButton";
import { useState, useRef } from "react";
import { useRouter } from "next/router";
import { socket } from "~/socket";
import { roomType } from "~/types/rooms";

export default function RoomUntilAdd({ room }: { room: roomType }) {
  const [open, setOpen] = useState(false);

  function toggleModal() {
    setOpen(!open);
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
      <Modal room={room} toggleFunc={toggleModal} open={open} />
    </div>
  );
}

function Modal({
  open,
  room,
  toggleFunc,
}: {
  open: boolean;
  room: roomType;
  toggleFunc: () => void;
}) {
  const { data } = api.friends.all.useQuery();
  const users = room.members.map((u) => u.user);
  const friends = data?.filter(
    (friend) => !users.some((user) => user.id === friend.id),
  );
  const router = useRouter();

  const [members, setMembers] = useState(
    new Set<string>(users.map((u) => u.id)),
  );

  function toggleUser(id: string) {
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

  const { mutate: createRoom, isLoading: isLoading1 } =
    api.rooms.createNewChat.useMutation({
      onSuccess: (data) => {
        members.forEach((m) => {
          socket.emit("newChat", { room: "user" + m, message: data.roomId });
        });
        router.push("/channels/" + data.roomId);
      },
    });

  const { mutate: addUsers, isLoading: isLoading2 } =
    api.rooms.addUsersToChat.useMutation({
      onSuccess: () => {
        members.forEach((m) => {
          if (!room.members.map((m) => m.user.id).includes(m)) {
            socket.emit("newChat", { room: "user" + m, message: room.id });
          }
        });
        toggleFunc();
      },
    });

  return (
    <div
      className={Styles.utils_add_func_init}
      style={open ? {} : { display: "none" }}
    >
      <div className={Styles.utils_add_func}>
        <h1> Выберете друзей</h1>
        <div className={Styles.input_containter}>
          <input
            type="text"
            placeholder="Введите имя пользователя вашего друга"
          />
        </div>
        {friends && (
          <FriendList
            callBack={toggleUser}
            members={members}
            friends={friends}
          />
        )}
        <MyButton
          className="w-full"
          disabled={isLoading1 || isLoading2}
          onClick={() =>
            room.type === "ls"
              ? createRoom({ userIds: members })
              : addUsers({ roomId: room.id, userIds: members })
          }
        >
          Добавить
        </MyButton>
      </div>
    </div>
  );
}

type friend = {
  image: string;
  name: string;
  id: string;
};

function FriendList({
  friends,
  callBack,
  members,
}: {
  friends: friend[];
  callBack: (id: string) => void;
  members: Set<string>;
}) {
  return (
    <div className={Styles.friends}>
      {friends.map((friend) => (
        <FriendItem
          key={friend.id}
          friend={friend}
          callBack={callBack}
          active={members.has(friend.id)}
        />
      ))}
    </div>
  );
}

function FriendItem({
  friend,
  active,
  callBack,
}: {
  friend: friend;
  active: boolean;
  callBack: (id: string) => void;
}) {
  return (
    <a
      key={friend.id}
      href="#"
      className={Styles.friend_obj}
      onClick={() => callBack(friend.id)}
    >
      <img src={friend.image} alt="" className={Styles.friend__ava} />
      <p>{friend.name}</p>
      <div className={[Styles.mark, active ? Styles.in : ""].join("  ")}></div>
    </a>
  );
}
