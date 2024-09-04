import { FC } from "react";
import Styles from "./profileCard.module.scss";
import { ProfileInfo, ProfileInfoProps } from "../profileInfo/profileInfo";

export const ProfileCard: FC<ProfileInfoProps> = ({ ...props }) => {
  return (
    <div className={Styles.profile_card}>
      <ProfileInfo {...props} />
    </div>
  );
};
