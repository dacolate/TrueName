"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateUserData, UserWithRole } from "@/types";
import LoadingButton from "@/components/ui/LoadingButton";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: UserWithRole | null;
  password: string | null;
  onEditComplete: (userData: Partial<UserWithRole>) => Promise<void>;
  onCreateComplete?: (userData: CreateUserData) => Promise<void>;
  onCreateLoading?: boolean;
  isEditLoading: boolean;
}

export function UserFormModal({
  isOpen,
  onClose,
  editingUser,
  onEditComplete,
  onCreateComplete,
  onCreateLoading,
  isEditLoading,
}: UserFormModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: "admin" | "user";
    balance: number | null;
    password: string;
  }>({
    name: "",
    email: "",
    phone: "",
    role: "user",
    balance: null,
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        setFormData({
          name: editingUser.name || "",
          email: editingUser.email || "",
          phone: editingUser.phone || "",
          role: (editingUser.role as "admin" | "user") || "user",
          balance: editingUser.balance || 0,
          password: "",
        });
      } else {
        // Reset form for new user
        setFormData({
          name: "",
          email: "",
          phone: "",
          role: "user",
          balance: 0,
          password: "",
        });
      }
      setErrors({});
    }
  }, [editingUser, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est requis";
    }

    // Password validation only for new users
    if (!editingUser) {
      if (!formData.password.trim()) {
        newErrors.password = "Le mot de passe est requis";
      } else if (formData.password.length < 6) {
        newErrors.password =
          "Le mot de passe doit contenir au moins 6 caractères";
      }
    }

    if (!Number.isInteger(formData.balance)) {
      newErrors.balance = "La balance doit etre un nombre entier";
    }

    if (formData.role !== "admin" && formData.role !== "user") {
      newErrors.role = "Le rôle doit être 'admin' ou 'user'";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Clear any previous form errors
    setErrors((prev) => ({ ...prev, form: "" }));

    if (!validateForm()) {
      return;
    }

    try {
      if (editingUser) {
        // For editing, exclude password from the data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...editData } = formData;

        await onEditComplete(editData);
      } else {
        // For creating, include all data including password
        if (onCreateComplete) {
          await onCreateComplete(formData as CreateUserData);
        }
      }
    } catch (error) {
      // Handle submission errors
      let errorMessage = "Une erreur inattendue s'est produite";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setErrors((prev) => ({ ...prev, form: errorMessage }));
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md m-4">
        <CardHeader>
          <CardTitle className="font-poppins">
            {editingUser
              ? "Modifier l'utilisateur"
              : "Créer un nouvel utilisateur"}
          </CardTitle>
          <CardDescription className="font-inter">
            {editingUser
              ? `Modifiez les informations de ${editingUser.name}`
              : "Remplissez les informations pour créer un compte"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
              Nom complet
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Jean Dupont"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
              Adresse email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="jean.dupont@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="06 12 34 56 78"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Mot de passe sécurisé"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
              Rôle
            </label>
            <select
              title="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "admin" | "user",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter"
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
              Balance
            </label>
            <input
              title="balance"
              type="number"
              min="0"
              step="0.01"
              value={formData.balance === null ? "" : formData.balance}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({
                  ...formData,
                  balance: val === "" ? null : Number(val),
                });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter ${
                errors.balance ? "border-red-500" : "border-gray-300"
              }`}
            />

            {errors.balance && (
              <p className="text-red-500 text-sm mt-1">{errors.balance}</p>
            )}
          </div>
          <div>
            {" "}
            {errors.form && (
              <p className="text-red-500 text-sm mt-1">{errors.form}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <LoadingButton
              loading={editingUser ? isEditLoading : onCreateLoading || false}
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-inter"
            >
              {editingUser ? "Sauvegarder" : "Créer l'utilisateur"}
            </LoadingButton>
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 font-inter"
              disabled={editingUser ? isEditLoading : onCreateLoading || false}
            >
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
