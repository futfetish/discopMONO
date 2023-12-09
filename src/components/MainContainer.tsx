import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { type ReactNode, useState, useRef, useEffect } from "react";
import Styles from "../styles/MainContainer.module.scss";
import ProfileBar from "~/components/profileBar";
import "bootstrap-icons/font/bootstrap-icons.css";
import { api } from "~/utils/api";
import { GlobalSettings } from "./GlobalSettings";
import { RoomsSearch } from "./roomsSearch";
import { socket } from "~/socket";

type roomType = {
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

export default function MainContainer({
  content,
  top,
  right,
  title = "dis",
  tab = "",
}: {
  content: ReactNode;
  top: ReactNode;
  right: ReactNode;
  title?: string;
  tab?: string;
}) {
  const settingsContainerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<HTMLDivElement | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data: sessionData } = useSession();
  const { data: userRoomsData } = api.rooms.showRoomsJoined.useQuery();
  const { data: user } = api.users.user.useQuery();
  const [userRooms, setUserRooms] = useState(userRoomsData?.rooms || []);
  const { data: isHaveReqQ } = api.friends.isHaveReq.useQuery();
  const [isHaveReq, setIsHaveReq] = useState(isHaveReqQ);
  const { mutate: addNewRoom } = api.rooms.getById.useMutation({
    onSuccess: (data) => {
      if (data.isSuccess) {
        setUserRooms([...userRooms, data.room!]);
      }
    },
  });

  useEffect(() => {
    setIsHaveReq(isHaveReqQ);
  }, [isHaveReqQ]);

  useEffect(() => {
    if (userRoomsData) {
      setUserRooms(userRoomsData.rooms);
    }
  }, [userRoomsData]);

  useEffect(() => {
    if (user) {
      const roomName = "user" + user.id;
      socket.connect();
      socket.emit("joinRoom", roomName);

      function onConnect() {
        console.log("connected");
      }

      function onDisconnect() {
        console.log("disconnected");
      }

      function onFriendReqNotify() {
        setIsHaveReq(true);
      }

      function onNewChat(data: number) {
        addNewRoom({ id: data });
      }

      console.log(socket);

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("friendReqNotify", onFriendReqNotify);
      socket.on("newChat", onNewChat);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("friendReqNotify", onFriendReqNotify);
        socket.off("newChat", onNewChat);
        socket.emit("leaveRoom", roomName);
        socket.disconnect();
      };
    }
  });

  if (!sessionData || !user) {
    return <button onClick={() => void signIn()}>signin </button>;
  }

  const settingsContainer = settingsContainerRef.current;
  const app = appRef.current;

  function appChangeTrue(appElement: HTMLDivElement) {
    appElement.style.transform = "scale(1)";
    appElement.style.opacity = "1";
  }

  function appChangeFalse(appElement: HTMLDivElement) {
    appElement.style.transform = "scale(0.8)";
    appElement.style.opacity = "0";
  }

  function appChange(v: boolean, appElement: HTMLDivElement) {
    if (v) {
      appChangeTrue(appElement);
    } else {
      appChangeFalse(appElement);
    }
  }
  function setSettingsContainerFalse(settingsContainerElement: HTMLDivElement) {
    settingsContainerElement.style.transform = "scale(1.2)";
    settingsContainerElement.style.opacity = "0";
  }

  function setSettingsContainerTrue(settingsContainerElement: HTMLDivElement) {
    settingsContainerElement.style.display = "block";
    setTimeout(() => {
      settingsContainerElement.style.transform = "scale(1)";
      settingsContainerElement.style.opacity = "1";
    }, 0);
  }

  function settingsContainerChange(
    v: boolean,
    settingsContainerElement: HTMLDivElement,
  ) {
    if (v) {
      setSettingsContainerFalse(settingsContainerElement);
    } else {
      setSettingsContainerTrue(settingsContainerElement);
    }
  }

  function turnOffContainer(settingsContainerElement: HTMLDivElement) {
    settingsContainerElement.style.display = "none";
    setIsSettingsOpen(false);
  }

  function turnOffContainerTime(
    time: number,
    settingsContainer: HTMLDivElement,
  ) {
    setTimeout(() => {
      turnOffContainer(settingsContainer);
    }, time);
  }

  function turnOnContainer() {
    setIsSettingsOpen(true);
  }

  function switchSettings(
    v: boolean,
    time: number,
    settingsContainerElement: HTMLDivElement,
  ) {
    if (v) {
      turnOffContainerTime(time, settingsContainerElement);
    } else {
      turnOnContainer();
    }
  }

  function toggleSettings() {
    if (settingsContainer && app) {
      appChange(isSettingsOpen, app);
      settingsContainerChange(isSettingsOpen, settingsContainer);
      switchSettings(isSettingsOpen, 200, settingsContainer);
    }
  }

  return (
    <div className={Styles.body}>
      <div className={Styles.blank}>
        <div className={Styles.nav}></div>
        <div className={Styles.left}></div>
        <div className={Styles.right}></div>
      </div>
      <HeadComponent title={title} />
      <div className={Styles.app} ref={appRef}>
        <div className={Styles.slidebar} id="slidebar">
          <UnReadRooms userId={user.id} />
        </div>
        <div className={Styles.self}>
          <div className={Styles.self__leftbar}>
            <div className={[Styles.self__leftbar_top, Styles.top].join(" ")}>
              <RoomsSearch user={user} />
            </div>

            <div className={Styles.my_rooms__bar} id="my_rooms">
              <div className={Styles.nav}>
                <Link
                  href="/friends"
                  className={tab === "friends" ? Styles.tab : ""}
                >
                  <p>
                    <i className="bi bi-people-fill"></i>Друзья
                  </p>
                  {isHaveReq && (
                    <div className={Styles.red_circle}>
                      <div className={Styles.core}></div>
                    </div>
                  )}
                </Link>
              </div>
              <br />
              <RoomList userId={user.id} userRooms={userRooms} tab={tab} />
            </div>
            <ProfileBar user={user} callBack={toggleSettings}></ProfileBar>
          </div>
          <div className={Styles.self__content} id="self_content">
            <div className={[Styles.self__top, Styles.top].join(" ")}>
              {top}
            </div>
            <div className={Styles.self__bot}>
              <div className={Styles.self__self}>{content}</div>
              <div className={Styles.self__rightbar}>{right}</div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={Styles.global_settings_container}
        ref={settingsContainerRef}
      >
        {isSettingsOpen && (
          <GlobalSettings callBack={toggleSettings} user={user} />
        )}
      </div>
    </div>
  );
}

function HeadComponent({ title }: { title: string }) {
  return (
    <Head>
      <title>{title}</title>
      <link rel="icon" href="/favicon.ico" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=REM:wght@300&family=Raleway:wght@400;600&display=swap"
        rel="stylesheet"
      />
    </Head>
  );
}

function RoomList({
  userRooms,
  tab,
  userId,
}: {
  userId: string;
  userRooms: roomType[];
  tab: string;
}) {
  return (
    <div className={Styles.my_rooms}>
      <label>личные сообщения</label>
      {userRooms.map((room) => (
        <RoomItem
          key={room.id}
          room={room}
          userId={userId}
          active={tab === "room_" + room.id}
        />
      ))}
    </div>
  );
}

function RoomItem({
  room,
  userId,
  active,
}: {
  room: roomType;
  userId: string;
  active: boolean;
}) {
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
}

function UnReadRooms({ userId }: { userId: string }) {
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
  });
  useEffect(() => {
    if (unReadRoomsQ) {
      setUnReadRooms(unReadRoomsQ.rooms);
    }
  }, [unReadRoomsQ]);

  return (
    <div className={Styles.unread_rooms_container}>
      <div className={Styles.unread_rooms}>
        {unReadRooms.map((room) => (
          <div key={room.id} className={Styles.item}>
            <div className={Styles.item__content}>
              <Link href={"/channels/" + room.id}>
                <img
                  alt=""
                  src={
                    room.type == "group"
                      ? "/img/grav.png"
                      : room.members
                          .map((u) => u.user)
                          .find((m) => m.id !== userId)?.image
                  }
                />
              </Link>
              <div className={Styles.red_circle}>
                <div className={Styles.core}></div>
              </div>
            </div>

            <div className={Styles.item__white_stick}></div>
            <div className={Styles.item_info_container}>
              <div className={Styles.arrow}></div>
              <div className={Styles.item__info}>
                <p>
                  {room.type == "group"
                    ? room.name
                    : room.members
                        .map((u) => u.user)
                        .find((m) => m.id !== userId)?.name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
