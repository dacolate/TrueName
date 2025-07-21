/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { UserStatsCards } from "./admin/UserStatsCards";
import { UserFilters } from "./admin/UserFilters";
import { UsersTable } from "./admin/UsersTable";
import { UserFormModal } from "./admin/UserFormModal";

import { authClient } from "@/lib/auth-client";
import { translateAuthError } from "@/lib/errors-to-french";
import { editUserInMongo } from "@/app/actions";
import { CreateUserData, UserWithRole } from "@/types";

// Types
interface AdminUserManagementProps {
  users: UserWithRole[];
}

type RoleFilter = "all" | "admin" | "user";

// Constants
const DEFAULT_ROLE: "user" | "admin" = "user";
const SUCCESS_MESSAGES = {
  USER_CREATED: "Utilisateur créé avec succès !",
  USER_UPDATED: "Utilisateur mis à jour avec succès !",
  USER_DELETED: "Utilisateur supprimé avec succès !",
  ROLE_UPDATED: "Rôle de l'utilisateur mis à jour avec succès !",
} as const;

const ERROR_MESSAGES = {
  UPDATE_FAILED: "Erreur lors de la mise à jour de l'utilisateur.",
  DELETE_FAILED: "Erreur lors de la suppression de l'utilisateur.",
  ROLE_CHANGE_FAILED: "Erreur lors du changement de rôle de l'utilisateur: ",
  UNEXPECTED_ERROR: "Erreur inattendue lors de la suppression.",
} as const;

export default function AdminUserManagement({
  users: initialUsers,
}: AdminUserManagementProps) {
  // State management
  const [users, setUsers] = useState<UserWithRole[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Computed values
  const filteredUsers = users.filter((user) => {
    const matchesSearch = [user.name, user.email, user.phone]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const userStats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => !u.banned).length,
    adminUsers: users.filter((u) => u.role === "admin").length,
    bannedUsers: users.filter((u) => u.banned).length,
    totalBalance: users.reduce((sum, u) => sum + (u.balance || 0), 0),
  };

  // Utility functions
  const toggleRole = (role: "admin" | "user"): "admin" | "user" =>
    role === "admin" ? "user" : "admin";

  const closeModal = useCallback(() => {
    setEditingUser(null);
    setIsCreateModalOpen(false);
  }, []);

  const showSuccess = (message: string) => toast.success(message);
  const showError = (message: string) => toast.error(message);

  // Event handlers
  const handleEditUser = useCallback((user: UserWithRole) => {
    setEditingUser(user);
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateNewUser = useCallback(() => {
    setEditingUser(null);
    setIsCreateModalOpen(true);
  }, []);

  const handleUpdateUser = useCallback(
    async (userData: Partial<UserWithRole>) => {
      if (!editingUser) return;

      setIsEditLoading(true);

      try {
        const response = await editUserInMongo(editingUser.id, userData);

        if (!response.success) {
          showError(ERROR_MESSAGES.UPDATE_FAILED);
          return;
        }

        showSuccess(SUCCESS_MESSAGES.USER_UPDATED);

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === editingUser.id
              ? { ...user, ...userData, updatedAt: new Date() }
              : user
          )
        );

        closeModal();
      } catch (error) {
        showError(ERROR_MESSAGES.UPDATE_FAILED);
        setIsEditLoading(false);
      }
    },
    [editingUser, closeModal]
  );

  const handleCreateUser = useCallback(
    async (userData: CreateUserData) => {
      setIsCreateLoading(true);

      try {
        const { error } = await authClient.admin.createUser({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          role: (userData.role || DEFAULT_ROLE) as "admin" | "user",
          data: {
            phone: userData.phone,
            balance: userData.balance || 0,
          },
        });

        if (error) {
          const translatedError = translateAuthError({ message: error.code });
          showError(translatedError);
          return;
        }

        showSuccess(SUCCESS_MESSAGES.USER_CREATED);

        const newUser: UserWithRole = {
          id: userData.email,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role || DEFAULT_ROLE,
          balance: userData.balance || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          banned: false,
          emailVerified: false,
        };

        setUsers((prev) => [...prev, newUser]);
        closeModal();
      } catch (error) {
        showError(ERROR_MESSAGES.UPDATE_FAILED);
      } finally {
        setIsCreateLoading(false);
      }
    },
    [closeModal]
  );

  const handleToggleRole = useCallback(
    async ({ userId, role }: { userId: string; role: "admin" | "user" }) => {
      const newRole = toggleRole(role);

      try {
        const { error } = await authClient.admin.setRole({
          userId,
          role: newRole,
        });

        if (error) {
          const translatedError = translateAuthError({ message: error.code });
          showError(ERROR_MESSAGES.ROLE_CHANGE_FAILED + translatedError);
          return;
        }

        showSuccess(SUCCESS_MESSAGES.ROLE_UPDATED);

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
      } catch (error) {
        showError(ERROR_MESSAGES.ROLE_CHANGE_FAILED);
      }
    },
    []
  );

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      const { error } = await authClient.admin.removeUser({ userId });

      if (error) {
        const translatedError = translateAuthError({ message: error.code });
        showError(`Error deleting user: ${translatedError}`);
        return;
      }

      showSuccess(SUCCESS_MESSAGES.USER_DELETED);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      showError(ERROR_MESSAGES.DELETE_FAILED);
    }
  }, []);

  const confirmDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    try {
      await handleDeleteUser(userToDelete.id);
    } catch (error) {
      showError(ERROR_MESSAGES.UNEXPECTED_ERROR);
    } finally {
      setUserToDelete(null);
    }
  }, [userToDelete, handleDeleteUser]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-poppins mb-2">
              Administration des utilisateurs 👥
            </h1>
            <p className="text-blue-100 font-inter">
              Gérez tous les utilisateurs de la plateforme TrueNumber
            </p>
          </div>
          <Button
            onClick={handleCreateNewUser}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            <span className="hidden lg:block">Nouvel utilisateur</span>
          </Button>
        </div>
      </header>

      {/* Statistics Cards */}
      <UserStatsCards {...userStats} />

      {/* Filters */}
      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      {/* Users Table */}
      <UsersTable
        users={filteredUsers}
        onEditUser={handleEditUser}
        onToggleRole={handleToggleRole}
        onDeleteUser={setUserToDelete}
      />

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isCreateModalOpen}
        onClose={closeModal}
        editingUser={editingUser}
        onEditComplete={handleUpdateUser}
        onCreateComplete={handleCreateUser}
        onCreateLoading={isCreateLoading}
        isEditLoading={isEditLoading}
        password=""
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;utilisateur sera supprimé
              définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
