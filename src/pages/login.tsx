import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const { data: sessionData } = useSession();
  const router = useRouter();
  if (sessionData) {
    router.push("/");
  }
  const { query } = useRouter();
  const { error } = query;

  return (
    <>
      <button
        onClick={() =>
          signIn("discord", {
            callbackUrl: "/",
          })
        }
      >
        login
      </button>
      {error !== undefined ? <div>ERROR: {error}</div> : <></>}
    </>
  );
}
