import Styles from "../styles/profileBar.module.scss";

export default function ProfileBar({
  user,
  callBack
}: {
  user: { id: string; name: string; image: string },
  callBack : () => void
}) {
  return (
    <div className={Styles.profile_bar}>
      <div className={Styles.profile_info}>
        <img alt="" src={user.image} className={Styles.ava}></img>
        <div className={Styles.text_info}>
          <p className={[Styles.name, Styles.info].join(" ")}>
            {user.name}
          </p>
        </div>
      </div>
      <div className={Styles.utils}>
        <div
          className={[Styles.settings, Styles.util].join(" ")}
          id="profile_settings_but"
          onClick={callBack}
        >
          <i  className="bi bi-gear-fill"></i>
        </div>
      </div>
    </div>
  );
}
