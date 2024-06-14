import React, { type ReactNode, useState, FC } from "react";
import Styles from "./globalSettings.module.scss";
import {
  SettingsProfile,
  SettingsUniqName,
} from "../../components/settingsPages/settingsPages";
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
                page={page === item.key}
                onClick={() => setPage(item.key)}
              />
            )}
          </React.Fragment>
        ))}
        <Stick />
        <SettingBut
          text="Выйти"
          onClick={() => void signOut()}
          page={false}
          icon={<i className="bi bi-box-arrow-right"></i>}
        />
      </div>
    </div>
  );
};

const SettingClose: FC<{ callBack: () => void }> = ({ callBack }) => {
  return (
    <>
      <div className={Styles.esc_anim} onClick={callBack}>
        <div className={Styles.esc_but} id="settings_esc_but">
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
  page: boolean;
  icon?: ReactNode;
}> = ({ text, onClick, page, icon }) => {
  return (
    <a href="#" className={page ? Styles.active : ""} onClick={onClick}>
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
