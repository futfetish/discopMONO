import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { type ReactNode, useState, useRef } from "react";
import Styles from "../styles/MainContainer.module.scss";
import ProfileBar from "~/components/profileBar";
import "bootstrap-icons/font/bootstrap-icons.css";
import { api } from "~/utils/api";
import { GlobalSettings } from "./GlobalSettings";
import { RoomsSearch } from "./roomsSearch";

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
  const userRooms = userRoomsData?.rooms || [];

  if (!sessionData || !user) {
    return <button onClick={() => void signIn()}>signin </button>;
  }

  const settingsContainer = settingsContainerRef.current;
  const app = appRef.current;

  function appChange(v: boolean) {
    if (!app) {
      return;
    }
    if (v) {
      app.style.transform = "scale(1)";
      app.style.opacity = "1";
    } else {
      app.style.transform = "scale(0.8)";
      app.style.opacity = "0";
    }
  }

  function settingsContainerChange(v: boolean) {
    if (!settingsContainer) {
      return;
    }
    if (v) {
      settingsContainer.style.transform = "scale(1.2)";
      settingsContainer.style.opacity = "0";
      setTimeout(() => {
        settingsContainer.style.display = "none";
        setIsSettingsOpen(!isSettingsOpen);
      }, 200);
    } else {
      setIsSettingsOpen(!isSettingsOpen);
      settingsContainer.style.display = "block";
      setTimeout(() => {
        settingsContainer.style.transform = "scale(1)";
        settingsContainer.style.opacity = "1";
      }, 0);
    }
  }

  function toggleSettings() {
    if (settingsContainer && app) {
      appChange(isSettingsOpen);
      settingsContainerChange(!isSettingsOpen);
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
          <div className={Styles.unread_rooms}></div>
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
