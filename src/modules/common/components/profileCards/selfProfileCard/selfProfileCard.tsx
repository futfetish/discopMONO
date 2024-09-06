import { FC } from "react";
import { ProfileCardMaket } from "../profileCardMaket/profileCardMaket";
import { ProfileInfoButton } from "../../profileInfo/profileInfo";
import { ProfileCardProps } from "../profileCard/profileCard";



export const SelfProfileCard: FC<ProfileCardProps> = ({ user }) => {
  const buttons: ProfileInfoButton[] = [];

  return <ProfileCardMaket buttons={buttons} user={user} />;
};
