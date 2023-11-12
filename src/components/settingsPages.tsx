import { useRef, useState } from "react";
import Styles from "~/styles/settingPages.module.scss";
import MyButton from "./myButton";
import { api } from "~/utils/api";

export const SettingsProfile = ({
  user,
}: {
  user: {
    id: string;
    name: string;
    uniqName: string | null;
    image: string;
  };
}) => {
  const [name, setName] = useState(user.name);
  const avaInput = useRef<HTMLInputElement>(null);
  const ava = useRef<HTMLImageElement>(null);
  const noti = useRef<HTMLDivElement>(null);
  const [saveReq, setSaveReq] = useState(false);
  const { mutate: updateUser, isSuccess: mutateIsSuccess, isLoading: mutateIsLoading, isError: mutateIsError } = api.users.update.useMutation({
    onSuccess: ()=> {
              closeNoti();
    }
  });

  function editAva() {
    if (avaInput.current) {
      avaInput.current.click();
    }
  }
  function avaTake() {
    if (avaInput.current) {
      const file = avaInput.current.files
        ? avaInput.current.files[0]
        : undefined;
      if (file) {
        if (!file.type.startsWith("image/")) {
          return;
        }
        const imageURL = URL.createObjectURL(file);
        if (ava.current) {
          ava.current.src = imageURL;
        }
      }
    }
  }
  function openNoti() {
    if (!saveReq) {
      if (noti.current) {
        noti.current.style.bottom = "50px";
        setTimeout(() => {
          if (noti.current) {
            noti.current.style.bottom = "30px";
          }
        }, 150);
        setSaveReq(true);
      }
    }
  }
  function closeNoti() {
    if (saveReq) {
      if (noti.current) {
        noti.current.style.bottom = "50px";
        setTimeout(() => {
          if (noti.current) {
            noti.current.style.bottom = "-60px";
          }
        }, 150);
        setSaveReq(false);
      }
    }
  }
  return (
    <>
      <div className={Styles.settings_profile}>
        <h2>Профиль</h2>
        <div className={Styles.s_content}>
          <div className={Styles.edit}>
            <label> ОТОБРАЖАЕМОЕ ИМЯ </label>
            <input
              type="text"
              placeholder={user.name}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                openNoti();
              }}
            />
            <div className={Styles.stick}> </div>
            <label> АВАТАР </label>
            <MyButton onClick={editAva}>смена аватара</MyButton>
            <input
              type="file"
              ref={avaInput}
              className="hidden"
              onChange={() => {
                avaTake();
                openNoti();
              }}
            />
          </div>
          <div className={Styles.preview}>
            <label> ПРЕДОСМОТР </label>
            <div className={Styles.profile_cart} id="self_profile_cart">
              <div className={Styles.ava} onClick={editAva}>
                <div className={Styles.hover_thing}>
                  <i className="bi bi-pencil-fill"></i>
                </div>
                <img alt='' ref={ava} src={user.image} />
              </div>
              <div className={Styles.profile_cart__content}>
                <div className={Styles.profile_cart__info}>
                  <div className={[Styles.name, Styles.info].join(" ")}>
                    {name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={Styles.save_notification} ref={noti}>
          <p>Аккуратнее, вы не сохранили изменения!</p>
          <button
            className={Styles.cancel}
            onClick={() => {
              closeNoti();
              setName(user.name);
              if (ava.current) {
                ava.current.src = user.image;
              }
            }}
          >
            сброс
          </button>
          <button
            className={Styles.save}
            disabled={mutateIsLoading|| mutateIsSuccess}
            onClick={() => {
              updateUser({ name: name });
            }}
          >
           {mutateIsError? "Ошибка" : mutateIsLoading?
           "Загрузка" : mutateIsSuccess ?"Успех" : "сохранить изменения"}  
          </button>
        </div>
      </div>
    </>
  );
};

export const SettingsUniqName = ({
  user,
}: {
  user: {
    id: string;
    uniqName: string | null;
  };
}) => {
  const [uniqName, setUniqName] = useState(user.uniqName ? user.uniqName : "");
  const [uniqNameError, setUniqNameError] = useState<string | null>(null);
  const { mutate: updateUser } = api.users.update.useMutation({
    onError: (error) => {
      // TODO: uniqName
      setUniqNameError(error.message);
    },
    onSuccess: () => {
      setUniqNameError(null);
    },
  });

  return (
    <>
      <div className={Styles.settings_profile}>
        <h2>Уникальное имя</h2>
        <div className={Styles.s_content}>
          <div className={Styles.edit}>
            <div className={Styles.uniq_name_container}>
              <label>
                {" "}
                УНИКАЛЬНОЕ ИМЯ{" "}
                {uniqNameError !== null ? "- " + uniqNameError : ""}{" "}
              </label>
              <div className={Styles.help_text}>
                Уникальное имя нужно для того чтобы другие пользователи могли
                вас найти
              </div>
              <input
                type="text"
                placeholder={
                  user.uniqName
                    ? user.uniqName
                    : "У вас еще нет уникального имени"
                }
                value={uniqName}
                onChange={(e) => setUniqName(e.target.value)}
              />
              <br />
              <MyButton onClick={() => updateUser({ uniqName: uniqName })}>
                сохранить
              </MyButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
