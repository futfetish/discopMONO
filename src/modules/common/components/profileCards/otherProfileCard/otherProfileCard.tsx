import { FC, useEffect, useState } from "react";
import { ProfileCardMaket } from "../profileCardMaket/profileCardMaket";
import { userDTO } from "~/types/user";
import { ProfileInfoButton } from "../../profileInfo/profileInfo";
import { api } from "~/utils/api";

interface OtherProfileCardProps {
  user: userDTO;
}

export const OtherProfileCard: FC<OtherProfileCardProps> = ({ user }) => {
  const { data: friendStatus, isLoading } = api.friends.status.useQuery({
    id: user.id,
  });
  const { mutate: deleteFriend } = api.friends.del.useMutation();
  const { mutate: addFriend } = api.friends.acceptReq.useMutation();

  const [toStatus, setToStatus] = useState(false);
  const [fromStatus, setFromStatus] = useState(false);

  useEffect(() => {
    if (friendStatus) {
      setToStatus(friendStatus.to);
      setFromStatus(friendStatus.from);
    }
  }, [friendStatus]);

  const buttons: ProfileInfoButton[] = [];

  if (toStatus && fromStatus) {
    buttons.push({
      title: "Удалить из друзей",
      onClick: () => {
        deleteFriend({ id: user.id });
        setToStatus(false);
        setFromStatus(false);
      },
    });
  } else if (toStatus) {
    buttons.push({
      title: "Отменить запрос дружбы",
      onClick: () => {
        deleteFriend({ id: user.id });
        setToStatus(false);
      },
    });
  } else if (fromStatus) {
    buttons.push({
      title: "Принять запрос дружбы",
      onClick: () => {
        addFriend({ id: user.id });
        setToStatus(true);
      },
    });

    buttons.push({
      title: "Отклонить запрос дружбы",
      onClick: () => {
        deleteFriend({ id: user.id });
        setFromStatus(false);
      },
    });
  } else {
    buttons.push({
      title: "Отправить запрос дружбы",
      onClick: () => {
        addFriend({ id: user.id });
        setToStatus(true);
      },
    });
  }

  if(isLoading){
    return
  }

  return (
    <ProfileCardMaket
      isFriend={toStatus && fromStatus}
      buttons={buttons}
      user={user}
    />
  );
};
