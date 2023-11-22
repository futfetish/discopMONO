import { type ReactNode, useState } from "react";
import Styles from "~/styles/globalSettings.module.scss";
import { SettingsProfile, SettingsUniqName } from "./settingsPages";
import { signOut } from "next-auth/react";

type userType = {
  id: string;
  name: string;
  uniqName: string | null;
  image: string;
}

export const GlobalSettings = ({
  callBack,
  user,
}: {
  callBack: () => void;
  user: userType
}) => {
  const [tab, setTab] = useState("profile");
  return (
    <>
      <div className={Styles.global_settings}>
        <div className={Styles.nav_bar} id="settings_nav">
          <div className={Styles.nav_bar_content}>
            <div className={Styles.settings_block}>
              <label>настройки пользователя</label>
              <SettingBut
                text="Профиль"
                tab={tab === "profile"}
                onClick={() => setTab("profile")}
              />
              <SettingBut
                text="Уникальное имя"
                tab={tab === "uniqName"}
                onClick={() => setTab("uniqName")}
              />
              <Stick />
              <SettingBut
                text="Выйти"
                onClick={() => void signOut()}
                tab={false}
                icon={<i className="bi bi-box-arrow-right"></i>}
              />
            </div>
          </div>
        </div>
        <div className={Styles.right}>
          <div className={Styles.content}>
            <Content tab={tab}  user={user}/>
          </div>
          <div className={Styles.esc}>
            <div className={Styles.esc_anim} onClick={callBack}>
              <div className={Styles.esc_but} id="settings_esc_but">
                <i className="bi bi-x"></i>
              </div>
            </div>
            <p>ESC</p>
          </div>
        </div>
      </div>
    </>
  );
};

function Stick() {
  return (
    <div className={Styles.stickContainer}>
      <div className={Styles.stick}></div>
    </div>
  );
}

function SettingBut({
  text,
  onClick,
  tab,
  icon,
}: {
  text: string;
  onClick: () => void;
  tab: boolean;
  icon?: ReactNode;
}) {
  return (
    <a href="#" className={tab ? Styles.active : ""} onClick={onClick}>
      <p>{text}</p>
      {icon && icon}
    </a>
  );
}

function Content({tab , user} : {tab : string , user : userType}){
  return(
    <>
      {tab == "profile" && <SettingsProfile user={user} />}
      {tab == "uniqName" && <SettingsUniqName user={user} />}
    </>
  )
}