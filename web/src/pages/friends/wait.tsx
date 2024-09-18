import { useSession } from "next-auth/react";
import { LoadingPage } from "~/modules/validationPages/pages/loadingPage/loadingPage";
import { FriendsWaitPage } from "~/modules/friend/pages/friendsWaitPage/friendsWaitPage";

export default function Friends_wait() {
  const { data: sessionData } = useSession();

  if (!sessionData) {
    return <LoadingPage />;
  }

  return <FriendsWaitPage />;
}
