"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlusIcon, EnvelopeIcon, LockClosedIcon, UserIcon, ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (password !== confirmPassword) { setError("As senhas nao coincidem"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Erro ao criar conta");
      else { setSuccess(data.message); setName(""); setEmail(""); setPassword(""); setConfirmPassword(""); }
    } catch { setError("Erro de conexao"); } finally { setLoading(false); }
  };

  const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" };
  const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; };
  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0B0B14 0%, #1A1030 50%, #0B0B14 100%)" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-[#3B82F6]/8 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-5 flex items-center justify-center">
            <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
              <path d="M20 65 A35 35 0 0 1 80 65" stroke="url(#rg)" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M28 58 A25 25 0 0 1 72 58" stroke="url(#rg)" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M35 52 A17 17 0 0 1 65 52" stroke="url(#rg)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <ellipse cx="50" cy="60" rx="16" ry="16" fill="url(#rg)" />
              <circle cx="50" cy="58" r="7" fill="#0B0B14" />
              <circle cx="47" cy="55" r="2.5" fill="rgba(255,255,255,0.7)" />
              <defs><linearGradient id="rg" x1="20" y1="30" x2="80" y2="80"><stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient></defs>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">DomSpy</h1>
          <p className="text-white/40 mt-1 text-sm">Criar Conta</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "rgba(22, 22, 40, 0.6)", border: "1px solid rgba(124, 58, 237, 0.2)", backdropFilter: "blur(20px)" }}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><UserPlusIcon className="w-6 h-6" /> Registrar</h2>

          {error && <div className="flex items-center gap-2 bg-[#DC4C64]/15 text-[#DC4C64] px-4 py-3 rounded-xl mb-4 text-sm font-medium border border-[#DC4C64]/20"><ExclamationCircleIcon className="w-4 h-4 shrink-0" />{error}</div>}
          {success && <div className="flex items-center gap-2 bg-[#14A44D]/15 text-[#14A44D] px-4 py-3 rounded-xl mb-4 text-sm font-medium border border-[#14A44D]/20"><CheckCircleIcon className="w-4 h-4 shrink-0" />{success}</div>}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Nome</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl text-white outline-none transition-all duration-200" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} placeholder="Seu nome" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl text-white outline-none transition-all duration-200" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} placeholder="user@dominio.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Senha</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl text-white outline-none transition-all duration-200" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} placeholder="senha" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Confirmar Senha</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl text-white outline-none transition-all duration-200" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} placeholder="confirme a senha" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="ds-btn-primary w-full py-3">{loading ? "Criando..." : "Criar Conta"}</button>
            </form>
          )}

          <p className="text-center text-sm text-white/40 mt-6">Ja tem conta? <Link href="/login" className="text-[#7C3AED] font-medium hover:text-[#8B5CF6] transition-colors">Entrar</Link></p>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">DomSpy &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
