import {  useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { LoginPage } from "~/modules/auth/pages/loginPage/loginPage";

export default function Login() {
  const { data: sessionData } = useSession();
  const router = useRouter();

  if (sessionData) {
    router.push("/");
  }

  // const { query } = useRouter();
  // const { error } = query;

  return <LoginPage />
}
