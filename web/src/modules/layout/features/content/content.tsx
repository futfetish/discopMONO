import { FC, ReactNode } from "react";
import Styles from "./content.module.scss";

export const Content: FC<{
  content: ReactNode;
  top: ReactNode;
  right: ReactNode;
}> = ({top , content , right    }) => {
  return (
    <div className={Styles.self__content}>
      <div className={Styles.self__top}>{top}</div>
      <div className={Styles.self__bot}>
        <div className={Styles.self__self}>{content}</div>
        <div className={Styles.self__rightbar}>{right}</div>
      </div>
    </div>
  );
};
