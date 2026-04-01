"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  if (isLoginPage || status !== "authenticated") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
