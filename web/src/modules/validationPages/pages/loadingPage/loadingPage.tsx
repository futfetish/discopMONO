import { FC } from "react";
import { Layout } from "~/modules/layout/pages/layout/layout";

export const LoadingPage : FC<{title? : string  }> = ({title}) => {
    return <Layout top={<></>} right={<></>} title={title? title : ''}  content={<></>}/>
}