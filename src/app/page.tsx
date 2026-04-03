"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import StatusCard from "@/components/StatusCard";
import { getPageStatus, STATUS_COLORS } from "@/types";
import {
  GlobeAltIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon,
  SignalIcon, FunnelIcon, SwatchIcon, MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

interface DomainData {
  id: string; url: string; name: string; lastCrawlAt: string | null;
  _count: { pages: number };
  crawls: { id: string; status: string; totalPages: number; brokenLinks: number; slowPages: number; startedAt: string }[];
}

interface FunnelData {
  id: string; name: string; color: string;
  pages: { page: { statusCode: number | null; responseTime: number | null } }[];
}

interface SearchResult {
  domains: { id: string; name: string; url: string; _count: { pages: number } }[];
  pages: { id: string; url: string; title: string | null; statusCode: number | null; domainId: string; domain: { name: string } }[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [funnels, setFunnels] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [exactSearch, setExactSearch] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/domains").then((r) => r.json()),
        fetch("/api/funnels").then((r) => r.json()),
      ]).then(([d, f]) => {
        if (Array.isArray(d)) setDomains(d);
        if (Array.isArray(f)) setFunnels(f);
      }).finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleSearch = async () => {
    if (!search.trim() || search.trim().length < 2) return;
    setSearching(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(search)}&exact=${exactSearch}`);
    setSearchResults(await res.json());
    setSearching(false);
  };

  useEffect(() => {
    if (!search.trim()) { setSearchResults(null); return; }
    const t = setTimeout(handleSearch, 400);
    return () => clearTimeout(t);
  }, [search, exactSearch]);

  if (status === "loading" || loading) {
    return (<div className="flex min-h-screen"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => (<div key={i} className="h-32 bg-gray-200 rounded-2xl" />))}</div></div></main></div>);
  }

  const latestCrawls = domains.map((d) => d.crawls[0]).filter(Boolean);
  const totalDomains = domains.length;
  const totalPages = latestCrawls.reduce((sum, c) => sum + c.totalPages, 0);
  const totalBroken = latestCrawls.reduce((sum, c) => sum + c.brokenLinks, 0);
  const totalSlow = latestCrawls.reduce((sum, c) => sum + c.slowPages, 0);
  const totalOk = Math.max(0, totalPages - totalBroken - totalSlow);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8 theme-transition">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
          <p style={{ color: "var(--text-secondary)" }} className="mt-1">Visao geral do monitoramento</p>
        </div>

        {/* Global Search */}
        <div className="mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar dominios, paginas, URLs ou conteudo..." className="w-full pl-12 pr-36 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3B82F6] focus:outline-none text-[#1a1a2e] bg-white" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={exactSearch} onChange={(e) => setExactSearch(e.target.checked)} className="rounded border-gray-300" />
                Exata
              </label>
              {searching && <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 animate-spin" />}
            </div>
          </div>

          {searchResults && (
            <div className="mt-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-h-[400px] overflow-y-auto">
              {searchResults.domains.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-400 bg-gray-50 sticky top-0">Dominios ({searchResults.domains.length})</div>
                  {searchResults.domains.map((d) => (
                    <div key={d.id} onClick={() => router.push(`/domains/${d.id}`)} className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3">
                      <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                      <div><div className="text-sm font-medium text-[#1a1a2e]">{d.name}</div><div className="text-xs text-gray-400">{d.url}</div></div>
                      <span className="ml-auto text-xs text-gray-400">{d._count.pages} pgs</span>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.pages.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-400 bg-gray-50 sticky top-0">Paginas ({searchResults.pages.length})</div>
                  {searchResults.pages.map((p) => {
                    const s = getPageStatus(p.statusCode, null);
                    return (
                      <div key={p.id} onClick={() => router.push(`/domains/${p.domainId}?focusPage=${p.id}`)} className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[s].bg }} />
                        <div className="min-w-0 flex-1"><div className="text-sm font-medium text-[#1a1a2e] truncate">{p.title || p.url}</div><div className="text-xs text-gray-400 truncate">{p.url}</div></div>
                        <span className="text-xs text-gray-400 shrink-0">{p.domain.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {searchResults.domains.length === 0 && searchResults.pages.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-400">Nenhum resultado para &quot;{search}&quot;</div>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard title="Dominios" value={totalDomains} status="info" icon={GlobeAltIcon} />
          <StatusCard title="Paginas OK" value={totalOk} status="ok" icon={CheckCircleIcon} />
          <StatusCard title="Paginas Lentas" value={totalSlow} status="warning" icon={ExclamationTriangleIcon} />
          <StatusCard title="Links Quebrados" value={totalBroken} status="error" icon={XCircleIcon} />
        </div>

        {/* Domain Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2"><GlobeAltIcon className="w-5 h-5" /> Status dos Dominios</h2>
            {domains.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum dominio monitorado</p>
            ) : (
              <div className="space-y-3">
                {domains.map((domain) => {
                  const crawl = domain.crawls[0];
                  const hasErrors = crawl && crawl.brokenLinks > 0;
                  const hasSlow = crawl && crawl.slowPages > 0;
                  const statusColor = !crawl ? "#6B7280" : crawl.status === "running" ? "#3B82F6" : hasErrors ? "#DC4C64" : hasSlow ? "#E4A11B" : "#14A44D";

                  return (
                    <div key={domain.id} onClick={() => router.push(`/domains/${domain.id}`)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${statusColor}15` }}>
                        <GlobeAltIcon className="w-5 h-5" style={{ color: statusColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#1a1a2e]">{domain.name}</div>
                        <div className="text-xs text-gray-400 truncate">{domain.url}</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {crawl ? (
                          <>
                            <span className="text-gray-500">{crawl.totalPages} pgs</span>
                            {crawl.brokenLinks > 0 && <span className="px-2 py-0.5 rounded-lg bg-[#DC4C64]/10 text-[#DC4C64] font-medium">{crawl.brokenLinks} erro</span>}
                            {crawl.slowPages > 0 && <span className="px-2 py-0.5 rounded-lg bg-[#E4A11B]/10 text-[#E4A11B] font-medium">{crawl.slowPages} lento</span>}
                          </>
                        ) : (
                          <span className="text-gray-400">Sem dados</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Funnels Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2"><FunnelIcon className="w-5 h-5" /> Funis Ativos</h2>
            {funnels.length === 0 ? (
              <div className="text-center py-8">
                <FunnelIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Nenhum funil criado</p>
                <button onClick={() => router.push("/funnels")} className="mt-3 text-xs text-[#3B82F6] hover:underline">Criar funil</button>
              </div>
            ) : (
              <div className="space-y-3">
                {funnels.map((funnel) => {
                  const ok = funnel.pages.filter((fp) => getPageStatus(fp.page.statusCode, fp.page.responseTime) === "ok").length;
                  const err = funnel.pages.filter((fp) => getPageStatus(fp.page.statusCode, fp.page.responseTime) === "error").length;
                  return (
                    <div key={funnel.id} onClick={() => router.push(`/funnels/${funnel.id}`)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${funnel.color}15` }}>
                        <FunnelIcon className="w-5 h-5" style={{ color: funnel.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#1a1a2e]">{funnel.name}</div>
                        <div className="text-xs text-gray-400">{funnel.pages.length} paginas</div>
                      </div>
                      <div className="flex gap-1">
                        {funnel.pages.slice(0, 8).map((fp, i) => {
                          const s = getPageStatus(fp.page.statusCode, fp.page.responseTime);
                          return <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s].bg }} />;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Groups Overview */}
        {domains.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2"><SwatchIcon className="w-5 h-5" /> Resumo Geral</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-[#1a1a2e]">{totalPages}</div>
                <div className="text-xs text-gray-500 mt-1">Total de Paginas</div>
              </div>
              <div className="bg-[#14A44D]/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-[#14A44D]">{totalOk > 0 ? Math.round((totalOk / totalPages) * 100) : 0}%</div>
                <div className="text-xs text-gray-500 mt-1">Saude Geral</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-[#1a1a2e]">{funnels.length}</div>
                <div className="text-xs text-gray-500 mt-1">Funis Ativos</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-[#1a1a2e]">{domains.filter((d) => d.crawls[0]?.status === "running").length}</div>
                <div className="text-xs text-gray-500 mt-1">Crawls em Execucao</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
