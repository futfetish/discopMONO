import { FC } from "react";
import Styles from "./profileCardMaket.module.scss";
import { ProfileInfo, ProfileInfoProps } from "../../profileInfo/profileInfo";

export const ProfileCardMaket: FC<ProfileInfoProps> = ({ ...props }) => {
  return (
    <div className={Styles.profile_card}>
      <ProfileInfo {...props} />
    </div>
  );
};
