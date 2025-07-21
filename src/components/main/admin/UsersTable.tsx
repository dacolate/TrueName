import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  Crown,
  UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserWithRole } from "@/types";

interface ToggleRoleParams {
  userId: string;
  role: "admin" | "user";
}

interface UsersTableProps {
  users: UserWithRole[];
  onEditUser: (user: UserWithRole) => void;
  onToggleRole: (params: ToggleRoleParams) => void;
  onDeleteUser: (user: UserWithRole) => void;
}

export function UsersTable({
  users,
  onEditUser,
  onToggleRole,
  onDeleteUser,
}: UsersTableProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 font-poppins">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Liste des utilisateurs ({users.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-500 font-inter">
                  Utilisateur
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 font-inter">
                  Rôle
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 font-inter">
                  Balance
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 font-inter">
                  Créé le
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 font-inter">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex flex-col space-y-1">
                      <div className="font-medium text-gray-900 font-inter">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-600 font-inter">
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-gray-500 font-inter">
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-inter",
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      )}
                    >
                      {user.role === "admin" ? (
                        <>
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-3 h-3 mr-1" />
                          Utilisateur
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={cn(
                        "font-medium font-poppins",
                        (user.balance || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {user.balance || 0} pts
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500 font-inter">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditUser(user)}
                        className="text-blue-600 hover:bg-blue-50 border-blue-200 p-2 rounded border"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          onToggleRole({
                            userId: user.id,
                            role: (user.role || "user") as "admin" | "user",
                          })
                        }
                        className="text-purple-600 hover:bg-purple-50 border-purple-200 p-2 rounded border"
                        title={
                          user.role === "admin" ? "Rétrograder" : "Promouvoir"
                        }
                      >
                        {user.role === "admin" ? (
                          <Shield className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => onDeleteUser(user)}
                        className="text-red-600 hover:bg-red-50 border-red-200 p-2 rounded border"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
