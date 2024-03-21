import { FC } from "react";
import Styles from "./loginPage.module.scss";
import { MyButton } from "~/modules/common/ui/myButton/myButton";
import { signIn } from "next-auth/react";

export const LoginPage: FC = () => {
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
    </div>
  );
};
