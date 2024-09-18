import { useSession } from "next-auth/react";
import { LoadingPage } from "~/modules/validationPages/pages/loadingPage/loadingPage";
import { FriendsAllPage } from "~/modules/friend/pages/friendsAllPage/friendsAllPage";

export default function Friends_all() {
  const { data: sessionData } = useSession();

  if (!sessionData) {
    return <LoadingPage /> ;
  }
  return (
    <FriendsAllPage />
  );
}
