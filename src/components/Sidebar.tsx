"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Squares2X2Icon,
  GlobeAltIcon,
  UsersIcon,
  ShieldCheckIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import UserProfileDropdown from "./UserProfileDropdown";

const navItems = [
  { href: "/", label: "Dashboard", icon: Squares2X2Icon },
  { href: "/domains", label: "Domínios", icon: GlobeAltIcon },
  { href: "/groups", label: "Grupos", icon: SwatchIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isSuperAdmin = session?.user?.role === "super_admin";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1a1a2e] text-white flex flex-col shadow-xl z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#14A44D] flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">DomSpy</h1>
            <p className="text-xs text-white/50">Monitor de Domínios</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#2d2d5e] text-white shadow-lg"
                  : "text-white/60 hover:bg-[#252547] hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Users - super_admin only */}
        {isSuperAdmin && (
          <Link
            href="/users"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              pathname === "/users"
                ? "bg-[#2d2d5e] text-white shadow-lg"
                : "text-white/60 hover:bg-[#252547] hover:text-white"
            }`}
          >
            <UsersIcon className="w-5 h-5" />
            Usuários
          </Link>
        )}
      </nav>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-white/10">
        <UserProfileDropdown />
      </div>
    </aside>
  );
}
