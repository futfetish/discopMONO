import { useState } from "react";
import Styles from "~/styles/globalSettings.module.scss";
import { SettingsProfile, SettingsUniqName } from "./settingsPages";

export const GlobalSettings = ({
  callBack,
  user,
}: {
  callBack: () => void;
  user: {
    id: string;
    name: string;
    uniqName: string | null;
    image: string;
  };
}) => {
  const [tab, setTab] = useState("profile");
  return (
    <>
      <div className={Styles.global_settings}>
        <div className={Styles.nav_bar} id="settings_nav">
          <div className={Styles.nav_bar_content}>
            <div className={Styles.settings_block}>
              <label>настройки пользователя</label>
              <a href="#" className={tab === "profile" ? Styles.active : ""}
              onClick={() => setTab('profile')}
              >
                Профиль
              </a>
              <a href="#" className={tab === "uniqName" ? Styles.active : ""}
              onClick={() => setTab('uniqName')}
              >
                Уникальное имя
              </a>
            </div>
          </div>
        </div>
        <div className={Styles.right}>
          <div className={Styles.content}>
            {tab == "profile" && <SettingsProfile user={user} />}
            {tab == "uniqName" && <SettingsUniqName user={user} />}
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
