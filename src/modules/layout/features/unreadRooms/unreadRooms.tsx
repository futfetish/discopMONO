import { FC, useEffect, useState } from "react";
import { socket } from "~/socket";
import { roomType } from "~/types/rooms";
import { api } from "~/utils/api";
import Styles from "./unreadRooms.module.scss";
import Link from "next/link";
import { useAppSelector } from "~/hooks/redux";

export const UnReadRooms: FC = () => {
  const user = useAppSelector(state => state.global.user)
  const { data: unReadRoomsQ } = api.rooms.unReadRooms.useQuery();
  const [unReadRooms, setUnReadRooms] = useState<roomType[]>([]);
  const { mutate: addRoomToUnread } = api.rooms.getById.useMutation({
    onSuccess: (data) => {
      if (data.isSuccess) {
        setUnReadRooms([data.room!, ...unReadRooms]);
      }
    },
  });

  useEffect(() => {
    function onMessageNotify(data: roomType) {
      console.log(data);
      if (!unReadRooms.find((r) => r.id == data.id)) {
        addRoomToUnread({ id: data.id });
      }
    }
    socket.on("messageNotify", onMessageNotify);

    return () => {
      socket.off("messageNotify", onMessageNotify);
    };
  }, [addRoomToUnread, unReadRooms]);

  useEffect(() => {
    if (unReadRoomsQ) {
      setUnReadRooms(unReadRoomsQ.rooms);
    }
  }, [unReadRoomsQ]);

  function deleteFromUnReadList(id: number) {
    setUnReadRooms((unReadRooms) => unReadRooms.filter((r) => r.id !== id));
  }

  return (
    <div className={Styles.unread_rooms_container}>
      <div className={Styles.unread_rooms}>
        {unReadRooms.map((room) => (
          <UnReadRoomItem
            key={room.id}
            room={room}
            onClick={() => deleteFromUnReadList(room.id)}
            image={
              room.type == "group"
                ? "/img/grav.png"
                : room.members.map((u) => u.user).find((m) => m.id !== user.id)
                    ?.image || ''
            }
            name={
              (room.type == "group"
                ? room.name
                : room.members.map((u) => u.user).find((m) => m.id !== user.id)
                    ?.name) || '[blank]'
            }
          />
        ))}
      </div>
    </div>
  );
};

const UnReadRoomItem: FC<{
  room: roomType;
  onClick: () => void;
  image: string;
  name: string;
}> = ({ room, onClick, image, name }) => {
  return (
    <div key={room.id} className={Styles.item}>
      <div className={Styles.item__content}>
        <Link href={"/channels/" + room.id} onClick={() => onClick()}>
          <img alt="" src={image} />
        </Link>
        <div className={Styles.red_circle}>
          <div className={Styles.core}></div>
        </div>
      </div>

      <div className={Styles.item__white_stick}></div>
      <div className={Styles.item_info_container}>
        <div className={Styles.arrow}></div>
        <div className={Styles.item__info}>
          <p>{name}</p>
        </div>
      </div>
    </div>
  );
};
