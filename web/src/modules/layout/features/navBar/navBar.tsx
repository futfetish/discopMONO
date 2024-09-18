import { FC } from "react";
import Styles from './navBar.module.scss'
import { NavFriends } from "../../components/navFriends/navFrriends";
import { RoomList } from "../../components/roomList/roomList";

export const NavBar: FC = () => {
  return (
    <div className={Styles.my_rooms__bar}>
      <NavFriends />
      <br />
      <RoomList />
    </div>
  );
};
