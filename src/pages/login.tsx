import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const { data: sessionData } = useSession();
  const router = useRouter();
  if (sessionData) {
    router.push("/");
  }

  return <button onClick={() => signIn()}>login</button>;
}
