import { FC, useRef, useState } from "react";
import { Layout } from "~/modules/layout/pages/layout/layout";
import { userDTO } from "~/types/user";
import { FriendTop } from "../../features/friendsTop/FriendsTop";
import { api } from "~/utils/api";
import { socket } from "~/socket";
import Styles from "./friendsAddPage.module.scss";
import { MyButton } from "~/modules/common/ui/myButton/myButton";

export const FriendsAddPage: FC<{ user: userDTO }> = ({ user }) => {
  return (
    <Layout
      page="friends"
      content={<Content user={user} />}
      top={<FriendTop page="add" />}
      right={<div></div>}
      title="friends"
    />
  );
};

const Content: FC<{ user: userDTO }> = ({ user }) => {
  const [checkText, setCheckText] = useState("");
  const { mutate } = api.friends.add.useMutation({
    onSuccess: (data) => {
      if (data.isSuccess) {
        socket.emit("friendReqNotify", {
          room: "user" + data.user!.id,
          message: { id: user.id },
        });
      }
    },
  });
  const [input, setInput] = useState("");

  // console.log(user)

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={Styles.self__self}>
      <div className={Styles.friends__text}>ДОБАВИТЬ В ДРУЗЬЯ</div>
      <div className={Styles.add_friend_container} ref={formRef}>
        <input
          value={input}
          type="text"
          v-model="name"
          placeholder="Вы можете добавить друзей по уникальному имени"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (buttonRef.current) {
                buttonRef.current.click();
              }
            }
          }}
        />
        <MyButton
          ref={buttonRef}
          className={[Styles.but].join(" ")}
          onClick={() => {
            if (input !== "") {
              setCheckText(
                "Запрос дружбы отправлен пользователю с уникальным именем " +
                  input,
              );
              if (formRef.current) {
                formRef.current.style.borderColor = "#42d66b";
              }
              setInput("");
              mutate({ name: input });
            }
          }}
        >
          Отправить запрос дружбы
        </MyButton>
      </div>
      <div className={Styles.check} id="check">
        {checkText}
      </div>
    </div>
  );
};
