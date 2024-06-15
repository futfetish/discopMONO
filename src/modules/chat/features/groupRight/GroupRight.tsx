import Styles from "./GroupRight.module.scss";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { ChannelType } from "~/types/rooms";
import { useAppSelector } from "~/hooks/redux";

export const GroupRight: FC<{
  room: ChannelType;
}> = ({ room }) => {
  const user = useAppSelector((state) => state.global.user);
  return (
    <div className={Styles.container}>
      <label> участники - {room.members.length} </label>
      <MembersList
        room={room}
        selfAdmin={room.members.find((u) => u.user.id == user.id)!.isAdmin}
      />
      <ActionsList room={room} />
    </div>
  );
};

function MembersList({
  room,
  selfAdmin,
}: {
  room: ChannelType;
  selfAdmin: boolean;
}) {
  const [usersObjs, setUObjs] = useState<typeof room.members>([]);
  useEffect(() => {
    setUObjs(room.members)
  } , [room.members])
  const { mutate: delUser } = api.rooms.kickUser.useMutation();
  return (
    <div className={Styles.room_members}>
      {usersObjs.map((u) => (
        <MemberItem
          key={u.user.id}
          callback={() => {
            delUser({ roomId: room.id, userId: u.user.id });
            setUObjs(usersObjs.filter((uO) => uO.user.id !== u.user.id));
          }}
          member={u}
          selfAdmin={selfAdmin}
        />
      ))}
    </div>
  );
}

function MemberItem({
  member,
  callback,
  selfAdmin,
}: {
  member: ChannelType["members"][number];
  callback: () => void;
  selfAdmin: boolean;
}) {
  return (
    <div className={Styles.room_member} key={member.user.id}>
      <a href="#">
        <img alt="" src={member.user.image} className={Styles.member__ava} />
        <p>{member.user.name} </p>
        <span>
          {member.isAdmin ? (
            <i className="bi bi-person-fill-exclamation"></i>
          ) : selfAdmin ? (
            <div onClick={callback} className={Styles.deleteUser}>
              <i className="bi bi-x-lg"></i>
            </div>
          ) : (
            ""
          )}
        </span>
      </a>
    </div>
  );
}

function ActionsList({ room }: { room: ChannelType }) {
  const router = useRouter();
  const { mutate: leave } = api.rooms.leave.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

  return (
    <div className={Styles.actions}>
      <button
        className={Styles.leave}
        onClick={() => leave({ roomId: room.id })}
      >
        Выйти из группы
      </button>
    </div>
  );
}
