import Styles from "~/styles/error.module.scss";

export default function ErrorContent({ text }: { text: string }) {
  return (
    <div className={Styles.error}>
      <div className={Styles.icon}>
        <i className="bi bi-x-square"></i>
      </div>
      <div className={Styles.text}>{text}</div>
    </div>
  );
}
