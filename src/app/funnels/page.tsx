"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { FunnelIcon, PlusIcon, TrashIcon, ArrowPathIcon, LinkIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { getPageStatus, STATUS_COLORS } from "@/types";

interface FunnelData {
  id: string; name: string; description: string | null; color: string;
  pages: { page: { id: string; url: string; title: string | null; statusCode: number | null; responseTime: number | null; domain: { name: string } } }[];
  linksFrom: { toFunnel: { id: string; name: string; color: string } }[];
  linksTo: { fromFunnel: { id: string; name: string; color: string } }[];
}

export default function FunnelsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [funnels, setFunnels] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#3B82F6");
  const [adding, setAdding] = useState(false);

  const isAdmin = session?.user?.role === "super_admin" || session?.user?.role === "admin";

  const fetchFunnels = () => { fetch("/api/funnels").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setFunnels(d); }).finally(() => setLoading(false)); };

  useEffect(() => { fetchFunnels(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newName.trim()) return; setAdding(true);
    await fetch("/api/funnels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName, description: newDesc, color: newColor }) });
    setNewName(""); setNewDesc(""); setNewColor("#3B82F6"); setAdding(false); fetchFunnels();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remover funil "${name}"?`)) return;
    await fetch(`/api/funnels/${id}`, { method: "DELETE" }); fetchFunnels();
  };

  const colors = ["#3B82F6", "#14A44D", "#E4A11B", "#DC4C64", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"];

  if (loading) return (<div className="flex min-h-screen"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48" /></div></main></div>);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1a1a2e] flex items-center gap-2"><FunnelIcon className="w-7 h-7" /> Funis</h1>
          <p className="text-gray-500 mt-1">Crie funis personalizados para monitorar fluxos de paginas</p>
        </div>

        {isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2"><PlusIcon className="w-5 h-5 text-[#3B82F6]" /> Criar Funil</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="flex gap-4">
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do funil" className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3B82F6] focus:outline-none text-[#1a1a2e]" required />
                <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descricao (opcional)" className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3B82F6] focus:outline-none text-[#1a1a2e]" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Cor:</span>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button key={c} type="button" onClick={() => setNewColor(c)} className={`w-7 h-7 rounded-full border-2 ${newColor === c ? "border-[#1a1a2e] scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <button type="submit" disabled={adding} className="ml-auto px-6 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                  {adding ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />} Criar
                </button>
              </div>
            </form>
          </div>
        )}

        {funnels.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <FunnelIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-400">Nenhum funil criado</p>
            <p className="text-sm text-gray-400 mt-1">Crie um funil para agrupar e monitorar fluxos de paginas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funnels.map((funnel) => {
              const okPages = funnel.pages.filter((fp) => { const s = getPageStatus(fp.page.statusCode, fp.page.responseTime); return s === "ok"; }).length;
              const errorPages = funnel.pages.filter((fp) => { const s = getPageStatus(fp.page.statusCode, fp.page.responseTime); return s === "error"; }).length;
              const linkedFunnels = [...funnel.linksFrom.map((l) => l.toFunnel), ...funnel.linksTo.map((l) => l.fromFunnel)];

              return (
                <div key={funnel.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/funnels/${funnel.id}`)}>
                  <div className="h-2" style={{ backgroundColor: funnel.color }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-[#1a1a2e] text-lg">{funnel.name}</h3>
                        {funnel.description && <p className="text-xs text-gray-400 mt-0.5">{funnel.description}</p>}
                      </div>
                      {isAdmin && (
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(funnel.id, funnel.name); }} className="p-1.5 rounded-lg hover:bg-[#DC4C64]/10 text-gray-400 hover:text-[#DC4C64]">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm mb-3">
                      <span className="text-gray-500">{funnel.pages.length} paginas</span>
                      {okPages > 0 && <span className="px-2 py-0.5 rounded-lg bg-[#14A44D]/10 text-[#14A44D] text-xs font-medium">{okPages} OK</span>}
                      {errorPages > 0 && <span className="px-2 py-0.5 rounded-lg bg-[#DC4C64]/10 text-[#DC4C64] text-xs font-medium">{errorPages} erro</span>}
                    </div>

                    {linkedFunnels.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                        {linkedFunnels.map((lf) => (
                          <span key={lf.id} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${lf.color}20`, color: lf.color }}>{lf.name}</span>
                        ))}
                      </div>
                    )}

                    {funnel.pages.length > 0 && (
                      <div className="flex gap-1 mt-3">
                        {funnel.pages.slice(0, 10).map((fp) => {
                          const s = getPageStatus(fp.page.statusCode, fp.page.responseTime);
                          return <div key={fp.page.id} className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[s].bg }} title={fp.page.url} />;
                        })}
                        {funnel.pages.length > 10 && <span className="text-[10px] text-gray-400 ml-1">+{funnel.pages.length - 10}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
