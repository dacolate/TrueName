import { auth, User } from "@/lib/auth";
import { headers } from "next/headers";
import HistoryPage from "@/components/main/HistoryPage";
import { getUserGameHistory } from "@/app/actions";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user: User = session?.user;
  const gameHistory = await getUserGameHistory(user?.id || "");

  return <HistoryPage user={user} gameHistory={gameHistory} />;
}
