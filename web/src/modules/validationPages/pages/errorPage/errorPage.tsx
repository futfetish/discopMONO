import { FC } from "react";
import { Layout } from "~/modules/layout/pages/layout/layout";
import ErrorContent from "../../features/errorContent/errorContent";

export const ErrorPage: FC<{ text: string }> = ({ text }) => {
  return (
    <Layout
      title={`ERR: ${text}`}
      content={<ErrorContent text={text} />}
      top={<></>}
      right={<></>}
    />
  );
};
