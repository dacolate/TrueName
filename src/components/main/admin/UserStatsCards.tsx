import { Card, CardContent } from "@/components/ui/card";
import { Users, Crown, UserIcon } from "lucide-react";

interface UserStatsCardsProps {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  bannedUsers: number;
  totalBalance: number;
}

export function UserStatsCards({
  totalUsers,
  adminUsers,
  totalBalance,
}: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 font-inter">
                Total utilisateurs
              </p>
              <p className="text-3xl font-bold text-blue-700 font-poppins">
                {totalUsers}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 font-inter">
                Administrateurs
              </p>
              <p className="text-3xl font-bold text-purple-700 font-poppins">
                {adminUsers}
              </p>
            </div>
            <Crown className="w-12 h-12 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 font-inter">
                Total points
              </p>
              <p className="text-3xl font-bold text-orange-700 font-poppins">
                {totalBalance.toLocaleString()}
              </p>
            </div>
            <UserIcon className="w-12 h-12 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
