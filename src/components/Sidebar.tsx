"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Squares2X2Icon,
  GlobeAltIcon,
  UsersIcon,
  SwatchIcon,
  FunnelIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import UserProfileDropdown from "./UserProfileDropdown";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/", label: "Dashboard", icon: Squares2X2Icon },
  { href: "/domains", label: "Dominios", icon: GlobeAltIcon },
  { href: "/funnels", label: "Funis", icon: FunnelIcon },
  { href: "/groups", label: "Grupos", icon: SwatchIcon },
];

function DomSpyLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer radar arc */}
      <path d="M20 65 A35 35 0 0 1 80 65" stroke="url(#grad)" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Middle radar arc */}
      <path d="M28 58 A25 25 0 0 1 72 58" stroke="url(#grad)" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Inner radar arc */}
      <path d="M35 52 A17 17 0 0 1 65 52" stroke="url(#grad)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {/* Eye outer */}
      <ellipse cx="50" cy="60" rx="16" ry="16" fill="url(#grad)" />
      {/* Eye pupil */}
      <circle cx="50" cy="58" r="7" fill="#0B0B14" />
      {/* Eye reflection */}
      <circle cx="47" cy="55" r="2.5" fill="rgba(255,255,255,0.7)" />
      {/* Bottom reflection arcs */}
      <path d="M38 80 A15 8 0 0 0 62 80" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d="M42 84 A10 5 0 0 0 58 84" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.2" />
      <defs>
        <linearGradient id="grad" x1="20" y1="30" x2="80" y2="80">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  const isSuperAdmin = session?.user?.role === "super_admin";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col shadow-xl z-50 theme-transition" style={{ background: "var(--sidebar-bg)" }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <DomSpyLogo />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">DomSpy</h1>
            <p className="text-xs text-white/40">Monitor de Dominios</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-white shadow-lg"
                  : "text-white/50 hover:text-white/80"
              }`}
              style={isActive ? { background: "linear-gradient(135deg, #7C3AED, #6D28D9)", boxShadow: "0 4px 15px rgba(124,58,237,0.3)" } : {}}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--sidebar-hover)"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = ""; }}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        {isSuperAdmin && (
          <Link href="/users"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              pathname === "/users" ? "text-white shadow-lg" : "text-white/50 hover:text-white/80 hover:bg-[var(--sidebar-hover)]"
            }`}
            style={pathname === "/users" ? { background: "linear-gradient(135deg, #7C3AED, #6D28D9)" } : {}}
          >
            <UsersIcon className="w-5 h-5" />
            Usuarios
          </Link>
        )}
      </nav>

      {/* Theme Toggle */}
      <div className="px-3 py-2">
        <button onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 transition-all duration-200"
          style={{ background: "transparent" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--sidebar-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
        >
          {theme === "dark" ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
        </button>
      </div>

      {/* User Profile */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <UserProfileDropdown />
      </div>
    </aside>
  );
}
