import { Html, Head, Main, NextScript } from "next/document";
import { HeadComponent } from "~/modules/layout/pages/head/head";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <HeadComponent />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}