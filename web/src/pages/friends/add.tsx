import { useSession } from "next-auth/react";
import { LoadingPage } from "~/modules/validationPages/pages/loadingPage/loadingPage";
import { FriendsAddPage } from "~/modules/friend/pages/friendsAddPage/friendsAddPage";

export default function Friends_add() {
  const { data: session } = useSession();
  if (!session) {
    return <div></div>;
  }

  if (!session) {
    return <LoadingPage />
  } 

  return (
   <FriendsAddPage user={{id : session.user.id , name : session.user.name ? session.user.name : '[blank]' , image : session.user.image ? session.user.image : 'https://cdn.discordapp.com/embed/avatars/0.png' }} />
  );
}

