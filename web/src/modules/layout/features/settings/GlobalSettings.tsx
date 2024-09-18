import React, { type ReactNode, useState, FC, useEffect, useRef } from "react";
import Styles from "./globalSettings.module.scss";
import {
  SettingsProfile,
  SettingsUniqName,
} from "../settingsPages/settingsPages";
import { signOut } from "next-auth/react";

export const GlobalSettings: FC<{
  callBack: () => void;
}> = ({ callBack }) => {
  const [page, setPage] = useState("profile");
  return (
    <div className={Styles.global_settings}>
      <div className={Styles.nav_bar} id="settings_nav">
        <SettingsNav page={page} setPage={setPage} />
      </div>
      <div className={Styles.right}>
        <div className={Styles.content}>
          <Content page={page} />
        </div>
        <div className={Styles.esc}>
          <SettingClose callBack={callBack} />
        </div>
      </div>
    </div>
  );
};

interface settingsStructurePageItem {
  name: string;
  key: string;
}

type SettingsStructureItem =
  | settingsStructurePageItem
  | { stick: boolean }
  | { label: string };

const SettingStructure: SettingsStructureItem[] = [
  { label: "настройки пользователя" },
  { name: "Профиль", key: "profile" },
  { name: "Уникальное имя", key: "uniqName" },
];

const SettingsNav: FC<{ page: string; setPage: (page: string) => void }> = ({
  page,
  setPage,
}) => {
  return (
    <div className={Styles.nav_bar_content}>
      <div className={Styles.settings_block}>
        {SettingStructure.map((item, index) => (
          <React.Fragment key={index}>
            {"label" in item && <label>{item.label}</label>}
            {"stick" in item && <Stick />}
            {"name" in item && "key" in item && (
              <SettingBut
                text={item.name}
                active={page === item.key}
                onClick={() => setPage(item.key)}
              />
            )}
          </React.Fragment>
        ))}
        <Stick />
        <SettingBut
          text="Выйти"
          onClick={() => void signOut()}
          active={false}
          icon={<i className="bi bi-box-arrow-right"></i>}
        />
      </div>
    </div>
  );
};

const SettingClose: FC<{ callBack: () => void }> = ({ callBack }) => {
  const escButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (escButtonRef.current !== null) {
        if (event.key === "Escape") {
          escButtonRef.current.click();
        }
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <>
      <div className={Styles.esc_anim} ref={escButtonRef} onClick={callBack}>
        <div className={Styles.esc_but}>
          <i className="bi bi-x"></i>
        </div>
      </div>
      <p>ESC</p>
    </>
  );
};

const Stick: FC = () => {
  return (
    <div className={Styles.stickContainer}>
      <div className={Styles.stick}></div>
    </div>
  );
};

const SettingBut: FC<{
  text: string;
  onClick: () => void;
  active: boolean;
  icon?: ReactNode;
}> = ({ text, onClick, active, icon }) => {
  return (
    <a href="#" className={active ? Styles.active : ""} onClick={onClick}>
      <p>{text}</p>
      {icon && icon}
    </a>
  );
};

const Content: FC<{ page: string }> = ({ page }) => {
  return (
    <>
      {page == "profile" && <SettingsProfile />}
      {page == "uniqName" && <SettingsUniqName />}
    </>
  );
};
