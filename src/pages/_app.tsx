import { type Session } from "next-auth";
import { SessionProvider, getSession } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/global.css";
import "~/styles/global.scss";
import { type AppContextType } from "next/dist/shared/lib/utils";
import { type NextRouter } from "next/router";
import { Provider as ReduxProvider } from "react-redux";
import { setupStore } from "~/store/store";

const store = setupStore();

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ReduxProvider store={store}>
        <Component {...pageProps} />
      </ReduxProvider>
    </SessionProvider>
  );
};

MyApp.getInitialProps = async ({ ctx }: AppContextType<NextRouter>) => {
  const session = await getSession({ req: ctx.req });

  if (!session && !ctx.req?.url?.startsWith("/login")) {
    if (ctx.res) {
      ctx.res.writeHead(302, { Location: "/login" });
      ctx.res.end();
    } else if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return { session };
};

export default api.withTRPC(MyApp);
