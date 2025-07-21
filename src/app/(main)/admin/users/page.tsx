import AdminUserManagement from "@/components/main/AdminDashboard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user.role || session.user.role !== "admin") {
    // Redirect to homepage if user is not an admin
    redirect("/");
  }
  const users = await auth.api.listUsers({
    query: {
      searchValue: "",
      searchField: "name",
      searchOperator: "contains",
    },
    // This endpoint requires session cookies.
    headers: await headers(),
  });
  return <AdminUserManagement users={users.users} />;
}
