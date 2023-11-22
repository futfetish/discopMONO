import { useState } from "react";
import Styles from "~/styles/roomSearch.module.scss";
import { api } from "~/utils/api";

export const RoomsSearch = ({ user }: { user: { id: string } }) => {
  const allRooms = api.rooms.showRoomsJoined.useQuery();
  const [rooms, setRooms] = useState(allRooms.data!.rooms);
  const [input, setInput] = useState("");
  const { mutate: selectRooms } = api.rooms.search.useMutation({
    onSuccess: (data) => {
      setRooms(data.rooms);
    },
  });
  const [open, setOpen] = useState(false);
  function openModal() {
    if (!open) {
      setOpen(true);
    }
  }

  function closeModal() {
    if (open) {
      setOpen(false);
      selectRooms({ s: "" });
      setInput("");
    }
  }

  return (
    <>
      <div className={Styles.rooms__top}>
        <div className={Styles.rooms__top_content} onClick={openModal}>
          Найти беседу
        </div>
      </div>
      {open && (
        <div className={Styles.rooms_search} onClick={closeModal}>
          <div
            className={Styles.block}
            id="rooms_search_block"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                selectRooms({ s: e.target.value });
              }}
              placeholder="Куда отправимся?"
            />
            <RoomsList rooms={rooms} userId={user.id} />
          </div>
        </div>
      )}
    </>
  );
};

type room = {
  type: "ls" | "group";
  name: string;
  id: number;
  _count: {
    members: number;
  };
  members: {
    user: {
      id: string;
      image: string;
      name?: string | null | undefined;
    };
  }[];
};

function RoomsList({ rooms, userId }: { rooms: room[]; userId: string }) {
  return (
    <div className={Styles.rooms}>
      {rooms.map((room) => (
        <RoomItem key={room.id} room={room} userId={userId} />
      ))}
    </div>
  );
}

function RoomItem({ room, userId }: { room: room; userId: string }) {
  return (
    <a href={"/channels/" + room.id} className={Styles.room}>
      <img
        src={
          room.type == "group"
            ? "/img/grav.png"
            : room.members.map((u) => u.user).find((m) => m.id !== userId)
                ?.image
        }
        alt=""
        className={Styles.room_ava}
      />{" "}
      <p>
        {" "}
        {room.type == "group"
          ? room.name
          : room.members.map((u) => u.user).find((m) => m.id !== userId)
              ?.name}{" "}
      </p>
    </a>
  );
}
