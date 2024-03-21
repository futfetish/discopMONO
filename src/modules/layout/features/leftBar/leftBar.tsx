import { FC } from "react";
import Styles from './leftBar.module.scss'
import { userType } from "~/types/user";
import { RoomsSearch } from "../../components/roomsSearch/roomsSearch";
import { ProfileBar } from "../../components/profileBar/profileBar";
import { NavBar } from "../navBar/navBar";

export const LeftBar: FC<{user : userType , page : string , toggleSettingsF : () => void}> = ({user , page , toggleSettingsF}) => {
  return (
    <div className={Styles.self__leftbar}>
      <div className={Styles.self__leftbar_top}>
        <RoomsSearch user={user} />
      </div>
      <NavBar page={page} user={user} />
      <ProfileBar user={user} callBack={toggleSettingsF}></ProfileBar>
    </div>
  );
};

