import { FC } from "react";
import Styles from "./profileBar.module.scss";

export const ProfileBar: FC<{
  user: { id: string; name: string; image: string };
  callBack: () => void;
}> = ({ user, callBack }) => {
  return (
    <div className={Styles.profile_bar}>
      <div className={Styles.profile_info}>
        <img alt="" src={user.image} className={Styles.ava}></img>
        <div className={Styles.text_info}>
          <p className={[Styles.name, Styles.info].join(" ")}>{user.name}</p>
        </div>
      </div>
      <div className={Styles.utils}>
        <div
          className={[Styles.settings, Styles.util].join(" ")}
          id="profile_settings_but"
          onClick={callBack}
        >
          <i className="bi bi-gear-fill"></i>
        </div>
      </div>
    </div>
  );
};
