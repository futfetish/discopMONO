import { FC, useEffect, useRef, useState } from "react";
import { socket } from "~/socket";
import { roomType } from "~/types/rooms";
import { api } from "~/utils/api";
import Styles from "./unreadRooms.module.scss";
import Link from "next/link";
import { useAppSelector } from "~/hooks/redux";
import { Panel } from "~/modules/common/ui/panel/panel";

export const UnReadRooms: FC = () => {
  const user = useAppSelector((state) => state.global.user);
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
    <div className={`${Styles.unread_rooms} hidden_scroll`}>
      {unReadRooms.map((room) => (
        <UnReadRoomItem
          key={room.id}
          room={room}
          onClick={() => deleteFromUnReadList(room.id)}
          image={
            room.type == "group"
              ? "/img/grav.png"
              : room.members.map((u) => u.user).find((m) => m.id !== user.id)
                  ?.image || ""
          }
          name={
            (room.type == "group"
              ? room.name
              : room.members.map((u) => u.user).find((m) => m.id !== user.id)
                  ?.name) || "[blank]"
          }
        />
      ))}
    </div>
  );
};

const UnReadRoomItem: FC<{
  room: roomType;
  onClick: () => void;
  image: string;
  name: string;
}> = ({ room, onClick, image, name }) => {

  const parentRef = useRef<HTMLDivElement>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div key={room.id} className={Styles.item}  ref={parentRef} >
      <div
        className={Styles.item__content}
        onMouseEnter={() => setIsPanelOpen(true)}
        onMouseLeave={() => setIsPanelOpen(false)}
      >
        <Link href={"/channels/" + room.id} onClick={() => onClick()}>
          <img alt="" src={image} />
        </Link>
        <div className={Styles.red_circle}>
          <div className={Styles.core}></div>
        </div>
      </div>

      <div className={Styles.item__white_stick}></div>
      <Panel
      scaleAnimation={{startScale : 20 , duration : 200}}
      opacityAnimation={{duration : 200}}
      yCenter={true}
        useLeft={true}
        offsetPercentage={{ left: 100 }}
        isOpen={isPanelOpen}
        setIsOpen={setIsPanelOpen}
        parentRef={parentRef}
      >
        <div className={Styles.item_info_container}>
          <div className={Styles.arrow}></div>
          <div className={Styles.item__info}>
            <p>{name}</p>
          </div>
        </div>
      </Panel>
    </div>
  );
};
