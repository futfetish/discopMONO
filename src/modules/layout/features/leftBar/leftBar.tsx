import { FC } from "react";
import Styles from './leftBar.module.scss'
import { RoomsSearch } from "../../components/roomsSearch/roomsSearch";
import { ProfileBar } from "../../components/profileBar/profileBar";
import { NavBar } from "../navBar/navBar";

export const LeftBar: FC<{ toggleSettingsF : () => void}> = ({ toggleSettingsF}) => {


  return (
    <div className={Styles.self__leftbar}>
      <div className={Styles.self__leftbar_top}>
        <RoomsSearch  />
      </div>
      <NavBar />
      <ProfileBar  callBack={toggleSettingsF}></ProfileBar>
    </div>
  );
};

