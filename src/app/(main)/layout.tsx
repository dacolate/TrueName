import Header from "@/components/main/Header";
import { auth, User } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

// Font configurations

interface MainLayoutProps {
  children: React.ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    // Redirect to login if no session exists
    redirect("/login");
  }
  const user: User = session?.user;

  return (
    <div className="min-h-screen">
      {/* Header Component (includes sidebar) */}
      <Header user={user} />

      {/* Main Content Area */}
      <div className="lg:pl-60">
        <main className="min-h-screen">
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <small className="text-gray-500 font-inter">
                &copy; {new Date().getFullYear()} True Number Test - Tous droits
                réservés
              </small>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
