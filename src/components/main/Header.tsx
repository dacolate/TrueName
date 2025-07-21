/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { User } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import {
  Gamepad2,
  UserIcon,
  LogOut,
  Play,
  History,
  Users,
  Coins,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface HeaderProps {
  user: User;
  balance?: number;
}

interface MenuItem {
  href: string;
  icon: React.ElementType;
  label: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { href: "/", icon: Play, label: "Jouer" },
  { href: "/history", icon: History, label: "Historique" },
  {
    href: "/admin/users",
    icon: Users,
    label: "Gestion Utilisateurs",
    adminOnly: true,
  },
];

export default function Header({ user, balance }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {}
  }

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header>
      {/* Top Header Bar for Mobile */}
      <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 font-inter">
                TrueNumber
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="flex items-center space-x-2 font-inter"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden md:block">Menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={closeMobileMenu}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Mobile Right Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-80 transform transition-transform duration-300 ease-in-out lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto bg-gray-200 border-l border-gray-200 px-6 pb-4">
          {/* Close Button */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 font-inter">
                TrueNumber
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeMobileMenu}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Profile Section */}
          <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-300">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 font-inter">
                {user?.name}
              </h3>
              <Badge variant="secondary" className="font-inter">
                {user?.role}
              </Badge>
            </div>
          </div>

          <nav className="flex flex-1 flex-col mt-6">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 font-inter transition-colors",
                            isActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 shrink-0",
                              isActive
                                ? "text-blue-700"
                                : "text-gray-400 group-hover:text-blue-700"
                            )}
                          />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>

              {/* Balance Display */}
              {balance !== undefined && (
                <li>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <Coins className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 font-inter">
                          Solde actuel
                        </p>
                        <p className="text-2xl font-bold text-gray-900 font-inter">
                          {balance}
                        </p>
                        <p className="text-xs text-gray-500 font-inter">
                          points
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              )}

              {/* Logout Button */}
              <li className="mt-auto">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 font-inter cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-65 lg:flex-col bg-gray-700">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-6 pb-4 bg-gray-200">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 font-inter">
                TrueNumber
              </h1>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 font-inter">
                {user?.name}
              </h3>
              <Badge variant="secondary" className="font-inter">
                {user?.role}
              </Badge>
            </div>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 font-inter transition-colors",
                            isActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 shrink-0",
                              isActive
                                ? "text-blue-700"
                                : "text-gray-400 group-hover:text-blue-700"
                            )}
                          />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>

              {/* Balance Display */}
              {balance !== undefined && pathname === "/dashboard" && (
                <li>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <Coins className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 font-inter">
                          Solde actuel
                        </p>
                        <p className="text-2xl font-bold text-gray-900 font-inter">
                          {balance}
                        </p>
                        <p className="text-xs text-gray-500 font-inter">
                          points
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              )}

              {/* Logout Button */}
              <li className="mt-auto">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 font-inter cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
