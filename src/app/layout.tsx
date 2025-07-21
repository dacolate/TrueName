import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const InterFont = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrueNumber",
  description: "Etes vous un chanceux?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={InterFont.className}>
        <main>{children}</main>
        <Toaster richColors />
      </body>
    </html>
  );
}
