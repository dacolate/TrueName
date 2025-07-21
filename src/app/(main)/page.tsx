import GameDashboard from "@/components/main/GameDashboard";
import { auth, User } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserGameHistory } from "../actions";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user: User = session?.user;
  const gameHistory = await getUserGameHistory(user?.id || "");

  return <GameDashboard user={user} gameHistory={gameHistory} />;
}
