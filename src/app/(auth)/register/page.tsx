import { RegisterPage } from "@/components/auth/RegisterPage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Inscription | TrueNumber",
};

export default async function Register() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }
  return <RegisterPage />;
}
