import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import MyButton from "~/components/myButton";
import Styles from "~/styles/login.module.scss";

export default function Login() {
  const { data: sessionData } = useSession();
  const router = useRouter();

  if (sessionData) {
    router.push("/");
  }

  // const { query } = useRouter();
  // const { error } = query;

  return (
    <div className={Styles.container}>
      <MyButton
        className={Styles.but}
        onClick={() =>
          signIn("discord", {
            callbackUrl: "/",
          })
        }
      >
        login with discord
      </MyButton>
      {/* {error !== undefined ? <div>ERROR: {error}</div> : <></>} */}
    </div>
  );
}
