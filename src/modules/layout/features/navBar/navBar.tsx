import { FC } from "react";
import Styles from './navBar.module.scss'
import { userType } from "~/types/user";
import { NavFriends } from "../../components/navFriends/navFrriends";
import { RoomList } from "../../components/roomList/roomList";

export const NavBar: FC<{user : userType , page : string}> = ({ user , page}) => {
  return (
    <div className={Styles.my_rooms__bar}>
      <NavFriends page={page} />
      <br />
      <RoomList userId={user.id} page={page} />
    </div>
  );
};
