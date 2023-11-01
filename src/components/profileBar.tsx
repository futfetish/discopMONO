import Styles from "../styles/profileBar.module.scss";

export default function ProfileBar({
  user,
}: {
  user: { id: string; name: string; image: string };
}) {
  return (
    <div className={Styles.profile_bar}>
      <div className={Styles.profile_info}>
        <img src={user.image} className={Styles.ava}></img>
        <div className={Styles.text_info}>
          <div className={[Styles.name, Styles.info].join(" ")}>
            {user.name}
          </div>
        </div>
      </div>
      <div className={Styles.utils}>
        <div
          className={[Styles.settings, Styles.util].join(" ")}
          id="profile_settings_but"
        >
          <i className="bi bi-gear-fill"></i>
        </div>
      </div>
    </div>
  );
}
