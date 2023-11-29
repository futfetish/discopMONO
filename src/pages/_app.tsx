import { type Session } from "next-auth";
import { SessionProvider, getSession } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";

import "~/styles/global.scss";
import { type AppContextType } from "next/dist/shared/lib/utils";
import { type NextRouter } from "next/router";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

MyApp.getInitialProps = async ({
  Component,
  ctx,
}: AppContextType<NextRouter>) => {
  const session = await getSession({ req: ctx.req });

  if (!session && !ctx.req?.url?.startsWith("/login")) {
    if (ctx.res) {
      ctx.res.writeHead(302, { Location: "/login" });
      ctx.res.end();
    } else if (typeof window !== "undefined") {
      // Для клиентского рендеринга
      window.location.href = "/login";
    }
  }

  return { session };
};

export default api.withTRPC(MyApp);
