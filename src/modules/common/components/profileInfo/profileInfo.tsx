import { FC } from "react";
import Styles from "./profileInfo.module.scss";
import { userDTO } from "~/types/user";
import Link from "next/link";

export interface ProfileCardButton {
  href: string;
  title?: string;
  onClick?: () => void;
  
}

export interface ProfileInfoProps {
  user: userDTO;
  buttons: ProfileCardButton[];
  additionalPaddingTop?: number;
}

export const ProfileInfo: FC<ProfileInfoProps> = ({ user, buttons, additionalPaddingTop }) => {
  return (
    <div className={Styles.container} >
      <div className={Styles.additionalPaddingTop} style={{height : `${additionalPaddingTop}px`}} >

      </div>
      <div className={Styles.profile_info}>
        <div className={Styles.ava}>
          <img alt="" src={user.image} />
        </div>

        <div className={Styles.info}>
          <div className={[Styles.name, Styles.info].join(" ")}>
            {user.name}
          </div>
        </div>

        <div className={Styles.content}>
          <div className={Styles.buttons}>
            { buttons?.map((button, index) => (
              <Link
                className={Styles.button}
                href={button.href ? button.href : "#"}
                key={index}
                onClick={() => button.onClick && button.onClick()}
              >
                {button.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
