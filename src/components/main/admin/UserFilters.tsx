import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  roleFilter: "all" | "admin" | "user";
  onRoleFilterChange: (filter: "all" | "admin" | "user") => void;
}

export function UserFilters({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}: UserFiltersProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter"
            />
          </div>

          <select
            title="roleFilter"
            value={roleFilter}
            onChange={(e) =>
              onRoleFilterChange(e.target.value as "all" | "admin" | "user")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter"
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="user">Utilisateurs</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
