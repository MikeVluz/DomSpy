"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EnvelopeIcon, LockClosedIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      if (result.error.includes("PENDING")) setError("Sua conta esta pendente de aprovacao pelo administrador.");
      else if (result.error.includes("DISABLED")) setError("Sua conta foi desativada. Contate o administrador.");
      else setError("Email ou senha incorretos");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0B0B14 0%, #1A1030 50%, #0B0B14 100%)" }}>
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B82F6]/8 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-5 flex items-center justify-center">
            <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
              <path d="M20 65 A35 35 0 0 1 80 65" stroke="url(#lg)" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M28 58 A25 25 0 0 1 72 58" stroke="url(#lg)" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M35 52 A17 17 0 0 1 65 52" stroke="url(#lg)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <ellipse cx="50" cy="60" rx="16" ry="16" fill="url(#lg)" />
              <circle cx="50" cy="58" r="7" fill="#0B0B14" />
              <circle cx="47" cy="55" r="2.5" fill="rgba(255,255,255,0.7)" />
              <path d="M38 80 A15 8 0 0 0 62 80" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3" />
              <defs><linearGradient id="lg" x1="20" y1="30" x2="80" y2="80"><stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient></defs>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">DomSpy</h1>
          <p className="text-white/40 mt-1 text-sm">Monitor de Dominios</p>
        </div>

        {/* Login Card */}
        <div className="ds-glass rounded-2xl p-8" style={{ background: "rgba(22, 22, 40, 0.6)", border: "1px solid rgba(124, 58, 237, 0.2)" }}>
          <h2 className="text-xl font-bold text-white mb-6">Entrar</h2>

          {error && (
            <div className="flex items-center gap-2 bg-[#DC4C64]/15 text-[#DC4C64] px-4 py-3 rounded-xl mb-4 text-sm font-medium border border-[#DC4C64]/20">
              <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-white transition-all duration-200 outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                  placeholder="user@dominio.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Senha</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-white transition-all duration-200 outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                  placeholder="senha" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="ds-btn-primary w-full py-3">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Nao tem conta? <Link href="/register" className="text-[#7C3AED] font-medium hover:text-[#8B5CF6] transition-colors">Criar conta</Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">DomSpy &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
