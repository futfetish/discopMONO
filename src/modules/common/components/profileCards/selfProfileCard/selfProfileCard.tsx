import { FC } from "react";
import { ProfileCardMaket } from "../profileCardMaket/profileCardMaket";
import { userDTO } from "~/types/user";
import { ProfileInfoButton } from "../../profileInfo/profileInfo";

interface OtherProfileCardProps {
  user: userDTO;
}

export const OtherProfileCard: FC<OtherProfileCardProps> = ({ user }) => {
  const buttons: ProfileInfoButton[] = [];

  return <ProfileCardMaket buttons={buttons} user={user} />;
};
