import { roomType } from "~/types/rooms";
import Styles from "./roomList.module.scss";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { api } from "~/utils/api";
import { socket } from "~/socket";

export const RoomList: FC<{
  userId: string;
  page: string;
}> = ({ page, userId }) => {

  const { data: userRoomsData } = api.rooms.showRoomsJoined.useQuery();
  const { mutate: addNewRoom } = api.rooms.getById.useMutation({
    onSuccess: (data) => {
      if (data.isSuccess) {
        setRooms([...rooms, data.room!]);
      }
    },
  });

  useEffect(() => {
    if(userRoomsData){
      setRooms(userRoomsData.rooms)
    }
  } , [userRoomsData])

  useEffect(() => {
    function onNewChat(data: number) {
      addNewRoom({ id: data });
    }

    socket.on("newChat", onNewChat);

    return () => {
      socket.off("newChat", onNewChat);
    }

  } , [addNewRoom])
  
  const [rooms , setRooms] = useState(userRoomsData?.rooms || []);

  return (
    <div className={Styles.my_rooms}>
      <label>личные сообщения</label>
      {rooms.map((room) => (
        <RoomItem
          key={room.id}
          room={room}
          userId={userId}
          active={page === "room_" + room.id}
        />
      ))}
    </div>
  );
};

const RoomItem: FC<{
  room: roomType;
  userId: string;
  active: boolean;
}> = ({ room, userId, active }) => {
  return (
    <Link
      className={active ? Styles.tab : ""}
      href={"/channels/" + room.id}
      key={room.id}
    >
      <img
        alt=""
        src={
          room.type == "group"
            ? "/img/grav.png"
            : room.members.map((u) => u.user).find((m) => m.id !== userId)
                ?.image
        }
        className={Styles.room_ava}
      />
      <p>
        {room.type == "group"
          ? room.name
          : room.members.map((u) => u.user).find((m) => m.id !== userId)?.name}
      </p>
    </Link>
  );
};
