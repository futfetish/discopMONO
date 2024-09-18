import { FC } from "react";
import { userDTO } from "~/types/user";
import { useAppSelector } from "~/hooks/redux";
import { SelfProfileCard } from "../selfProfileCard/selfProfileCard";
import { OtherProfileCard } from "../otherProfileCard/otherProfileCard";

export interface ProfileCardProps {
  user: userDTO;
}

export const ProfileCard: FC<ProfileCardProps> = ({ user }) => {
  const selfUser = useAppSelector((state) => state.global.user);

  return user.id == selfUser.id ?  <SelfProfileCard user={user} /> : <OtherProfileCard user={user} />
};
