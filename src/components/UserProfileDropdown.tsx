"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightStartOnRectangleIcon,
  UsersIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-[#8B5CF6]" },
  admin: { label: "Admin", color: "bg-[#3B82F6]" },
  viewer: { label: "Viewer", color: "bg-[#6B7280]" },
};

export default function UserProfileDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!session?.user) return null;

  const { name, email, role } = session.user;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const roleInfo = ROLE_LABELS[role] || ROLE_LABELS.viewer;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-[#252547] transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{name}</div>
          <div className="text-xs text-white/40 truncate">{email}</div>
        </div>
        <ChevronUpIcon
          className={`w-4 h-4 text-white/40 transition-transform ${
            open ? "" : "rotate-180"
          }`}
        />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#252547] rounded-xl shadow-xl border border-white/10 overflow-hidden">
          {/* Role badge */}
          <div className="px-4 py-3 border-b border-white/10">
            <span
              className={`text-xs font-semibold text-white px-2.5 py-1 rounded-full ${roleInfo.color}`}
            >
              {roleInfo.label}
            </span>
          </div>

          {/* Menu items */}
          {role === "super_admin" && (
            <button
              onClick={() => {
                setOpen(false);
                router.push("/users");
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <UsersIcon className="w-4 h-4" />
              Gerenciar Usu\u00e1rios
            </button>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
