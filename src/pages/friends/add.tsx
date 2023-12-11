import { type ReactNode, useRef } from "react";
import Styles from "../../styles/friends.module.scss";
import MainContainer from "~/components/MainContainer";
import { api } from "~/utils/api";
import { useState } from "react";
import MyButton from "../../components/myButton";
import { FriendTop } from "~/components/FriendsTop";
import { socket } from "~/socket";
import { useSession } from "next-auth/react";
import { type Session } from "next-auth";

export default function Friends_add() {
  const { data: session } = useSession();
  if (!session) {
    return <div></div>;
  }

  let contentObj: ReactNode;

  if (!session) {
    contentObj = <div></div>;
  } else {
    contentObj = <Content session={session} />;
  }

  return (
    <MainContainer
      tab="friends"
      content={contentObj}
      top={<FriendTop tab="add" />}
      right={<div></div>}
      title="friends"
    />
  );
}

function Content({ session }: { session: Session }) {
  const [checkText, setCheckText] = useState("");
  const { mutate } = api.friends.add.useMutation({
    onSuccess: (data) => {
      if (data.isSuccess) {
        socket.emit("friendReqNotify", {
          room: "user" + data.user!.id,
          message: { id: session.user.id },
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
        {" "}
        {checkText}{" "}
      </div>
    </div>
  );
}
