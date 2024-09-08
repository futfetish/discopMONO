import { FC, useRef, useState } from "react";
import Styles from "./profileBar.module.scss";
import { useAppSelector } from "~/hooks/redux";
import { Panel } from "~/modules/common/ui/panel/panel";
import { ProfileCard } from "~/modules/common/components/profileCards/profileCard/profileCard";

export const ProfileBar: FC<{
  callBack: () => void;
}> = ({ callBack }) => {

  const [isOpen , setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  const toggleProfileCard = () => {
    setIsOpen(!isOpen)
    console.log(isOpen)
  }

  const user = useAppSelector((state) => state.global.user);
  return (
    <div ref={parentRef} className={Styles.profile_bar}>
      <Panel parentRef={parentRef} useTop={false} useLeft={true} offsetPx={{left : -16 , bottom : 16}} offsetPercentage={{bottom : 100}} animationDuration={50} className={Styles.profile_card} buttonRef={buttonRef}  isOpen={isOpen} setIsOpen={setIsOpen} >
        <ProfileCard user={user}  />
      </Panel>
      <div className={Styles.content}>
        <div className={Styles.profile_info} onClick={ () => toggleProfileCard() } ref={buttonRef} >
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
    </div>
  );
};
