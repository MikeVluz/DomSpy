"use client";
import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import StatusCard from "@/components/StatusCard";
import SiteTreeGraph from "@/components/SiteTreeGraph";
import PageDetailPanel from "@/components/PageDetailPanel";
import { getPageStatus, STATUS_COLORS, getStatusLabel } from "@/types";
import {
  ArrowLeftIcon, FunnelIcon, PlusIcon, TrashIcon, ArrowPathIcon, LinkIcon,
  CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, SignalIcon,
  PencilIcon, CheckIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, XMarkIcon,
} from "@heroicons/react/24/outline";

interface FunnelPage {
  page: {
    id: string; url: string; title: string | null; statusCode: number | null;
    responseTime: number | null; domain: { id: string; name: string; url: string };
    linksFrom: { href: string; statusCode: number | null; isExternal: boolean }[];
    groupMembers: { group: { id: string; name: string; color: string } }[];
  };
}

interface FunnelDetail {
  id: string; name: string; description: string | null; color: string;
  pages: FunnelPage[];
  linksFrom: { id: string; toFunnel: { id: string; name: string; color: string } }[];
  linksTo: { id: string; fromFunnel: { id: string; name: string; color: string } }[];
}

interface AllFunnel { id: string; name: string; color: string; }

export default function FunnelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [funnel, setFunnel] = useState<FunnelDetail | null>(null);
  const [allFunnels, setAllFunnels] = useState<AllFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState("");
  const [search, setSearch] = useState("");
  const [linkFunnelId, setLinkFunnelId] = useState("");
  const [dropdownPageId, setDropdownPageId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPageData, setSelectedPageData] = useState<Record<string, unknown> | null>(null);
  const [groups, setGroups] = useState<{ id: string; name: string; color: string }[]>([]);
  const [allPages, setAllPages] = useState<{ id: string; url: string; title: string | null; statusCode: number | null; responseTime: number | null; domainId: string; domainName: string }[]>([]);
  const [pageSearch, setPageSearch] = useState("");
  const [showPageBrowser, setShowPageBrowser] = useState(false);

  const isAdmin = session?.user?.role === "super_admin" || session?.user?.role === "admin";

  const fetchFunnel = () => { fetch(`/api/funnels/${id}`).then((r) => r.json()).then(setFunnel).finally(() => setLoading(false)); };
  const fetchAllFunnels = () => { fetch("/api/funnels").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setAllFunnels(d.map((f: AllFunnel) => ({ id: f.id, name: f.name, color: f.color }))); }); };
  const fetchAllPages = () => {
    fetch("/api/domains").then((r) => r.json()).then(async (domains) => {
      if (!Array.isArray(domains)) return;
      const pages: typeof allPages = [];
      for (const domain of domains) {
        const res = await fetch(`/api/domains/${domain.id}`);
        const data = await res.json();
        if (data.pages) {
          for (const p of data.pages) {
            pages.push({ id: p.id, url: p.url, title: p.title, statusCode: p.statusCode, responseTime: p.responseTime, domainId: domain.id, domainName: domain.name });
          }
        }
      }
      setAllPages(pages);
    });
  };

  useEffect(() => { fetchFunnel(); fetchAllFunnels(); }, [id]);

  const handleRename = async () => {
    if (!newName.trim()) return;
    await fetch(`/api/funnels/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName }) });
    setEditingName(false); fetchFunnel();
  };

  const handleBulkImport = async () => {
    const urls = bulkUrls.split("\n").map((u) => u.trim()).filter((u) => u.length > 0);
    if (urls.length === 0) return; setImporting(true); setImportResult("");
    const res = await fetch("/api/funnels/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ funnelId: id, urls }) });
    if (res.ok) { const data = await res.json(); setImportResult(`${data.added} adicionadas, ${data.skipped} ignoradas`); setBulkUrls(""); fetchFunnel(); }
    setImporting(false);
  };

  const handleRemovePage = async (pageId: string) => {
    await fetch(`/api/funnels/members?funnelId=${id}&pageId=${pageId}`, { method: "DELETE" }); fetchFunnel();
  };

  const handleAddToFunnel = async (pageId: string, funnelId: string) => {
    await fetch("/api/funnels/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ funnelId, pageId }) });
    setDropdownPageId(null); fetchFunnel();
  };

  const handleLinkFunnel = async () => {
    if (!linkFunnelId) return;
    await fetch("/api/funnels/links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fromFunnelId: id, toFunnelId: linkFunnelId }) });
    setLinkFunnelId(""); fetchFunnel();
  };

  const handleUnlinkFunnel = async (linkId: string) => {
    await fetch(`/api/funnels/links?id=${linkId}`, { method: "DELETE" }); fetchFunnel();
  };

  if (loading || !funnel) return (<div className="flex min-h-screen"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48" /></div></main></div>);

  const totalPages = funnel.pages.length;
  const okPages = funnel.pages.filter((fp) => getPageStatus(fp.page.statusCode, fp.page.responseTime) === "ok").length;
  const errorPages = funnel.pages.filter((fp) => getPageStatus(fp.page.statusCode, fp.page.responseTime) === "error").length;
  const warningPages = funnel.pages.filter((fp) => getPageStatus(fp.page.statusCode, fp.page.responseTime) === "warning").length;
  const linkedFunnels = [...funnel.linksFrom.map((l) => ({ linkId: l.id, ...l.toFunnel })), ...funnel.linksTo.map((l) => ({ linkId: l.id, ...l.fromFunnel }))];
  const otherFunnels = allFunnels.filter((f) => f.id !== id && !linkedFunnels.some((lf) => lf.id === f.id));

  const filteredPages = search.trim()
    ? funnel.pages.filter((fp) => {
        const q = search.toLowerCase();
        return fp.page.url.toLowerCase().includes(q) || fp.page.title?.toLowerCase().includes(q) || fp.page.domain.name.toLowerCase().includes(q);
      })
    : funnel.pages;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <button onClick={() => router.push("/funnels")} className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#1a1a2e] mb-2">
            <ArrowLeftIcon className="w-4 h-4" /> Voltar para Funis
          </button>

          <div className="flex items-center gap-3 mb-1">
            <div className="w-3 h-8 rounded-full" style={{ backgroundColor: funnel.color }} />
            {editingName ? (
              <div className="flex items-center gap-2">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="text-2xl font-bold text-[#1a1a2e] border-b-2 border-[#3B82F6] focus:outline-none bg-transparent" autoFocus onKeyDown={(e) => e.key === "Enter" && handleRename()} />
                <button onClick={handleRename} className="p-1 rounded bg-[#14A44D] text-white"><CheckIcon className="w-5 h-5" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#1a1a2e]">{funnel.name}</h1>
                {isAdmin && <button onClick={() => { setEditingName(true); setNewName(funnel.name); }} className="p-1 rounded hover:bg-gray-100 text-gray-400"><PencilIcon className="w-4 h-4" /></button>}
              </div>
            )}
          </div>
          {funnel.description && <p className="text-gray-500 text-sm">{funnel.description}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatusCard title="Paginas no Funil" value={totalPages} status="info" icon={SignalIcon} />
          <StatusCard title="Paginas OK" value={okPages} status="ok" icon={CheckCircleIcon} />
          <StatusCard title="Avisos" value={warningPages} status="warning" icon={ExclamationTriangleIcon} />
          <StatusCard title="Erros" value={errorPages} status="error" icon={XCircleIcon} />
        </div>

        {/* Funnel Tree View */}
        {funnel.pages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Arvore do Funil</h2>
            <SiteTreeGraph
              pages={funnel.pages.map((fp) => ({
                id: fp.page.id,
                url: fp.page.url,
                title: fp.page.title,
                statusCode: fp.page.statusCode,
                responseTime: fp.page.responseTime,
                parentPageId: null,
                linksFrom: fp.page.linksFrom.map((l) => ({ href: l.href, toPageId: null })),
                groupMembers: fp.page.groupMembers,
              }))}
              domainId={`funnel-${id}`}
              focusNodeId={selectedPageId || undefined}
              onNodeClick={(pageId) => {
                setSelectedPageId(pageId);
                setSelectedPageData(null);
                const fp = funnel.pages.find((f) => f.page.id === pageId);
                if (fp) {
                  // Fetch full page data from domain API
                  fetch(`/api/domains/${fp.page.domain.id}`).then((r) => r.json()).then((domainData) => {
                    const fullPage = domainData.pages?.find((p: { id: string }) => p.id === pageId);
                    if (fullPage) setSelectedPageData(fullPage);
                  });
                  fetch(`/api/groups?domainId=${fp.page.domain.id}`).then((r) => r.json()).then((data) => { if (Array.isArray(data)) setGroups(data); });
                }
              }}
            />
          </div>
        )}

        {/* Linked Funnels */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-sm font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><LinkIcon className="w-4 h-4 text-[#3B82F6]" /> Funis Vinculados</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {linkedFunnels.length === 0 && <span className="text-xs text-gray-400">Nenhum funil vinculado</span>}
            {linkedFunnels.map((lf) => (
              <span key={lf.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80" style={{ backgroundColor: `${lf.color}20`, color: lf.color }} onClick={() => router.push(`/funnels/${lf.id}`)}>
                {lf.name}
                {isAdmin && <button onClick={(e) => { e.stopPropagation(); handleUnlinkFunnel(lf.linkId); }} className="hover:bg-white/30 rounded-full p-0.5"><XMarkIcon className="w-3 h-3" /></button>}
              </span>
            ))}
          </div>
          {isAdmin && otherFunnels.length > 0 && (
            <div className="flex items-center gap-2">
              <select value={linkFunnelId} onChange={(e) => setLinkFunnelId(e.target.value)} className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#3B82F6] focus:outline-none text-[#1a1a2e]">
                <option value="">Selecionar funil para vincular...</option>
                {otherFunnels.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <button onClick={handleLinkFunnel} disabled={!linkFunnelId} className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50">Vincular</button>
            </div>
          )}
        </div>

        {/* Add pages */}
        {isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-sm font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><ArrowDownTrayIcon className="w-4 h-4 text-[#14A44D]" /> Adicionar Paginas ao Funil</h2>
            <textarea value={bulkUrls} onChange={(e) => setBulkUrls(e.target.value)} placeholder="Cole URLs (uma por linha) - devem ser paginas ja escaneadas" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#14A44D] focus:outline-none text-xs text-[#1a1a2e] h-20 resize-y font-mono" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">{importResult || (bulkUrls.trim() ? `${bulkUrls.split("\n").filter((u) => u.trim()).length} URLs` : "URLs de paginas ja escaneadas")}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { if (!showPageBrowser) fetchAllPages(); setShowPageBrowser(!showPageBrowser); }} className="px-4 py-2 bg-[#3B82F6]/10 text-[#3B82F6] rounded-lg text-xs font-semibold hover:bg-[#3B82F6]/20 flex items-center gap-1">
                  <MagnifyingGlassIcon className="w-3 h-3" /> {showPageBrowser ? "Fechar Lista" : "Selecionar da Lista"}
                </button>
                <button onClick={handleBulkImport} disabled={importing || !bulkUrls.trim()} className="px-4 py-2 bg-[#14A44D] text-white rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
                  {importing ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <PlusIcon className="w-3 h-3" />} Adicionar
                </button>
              </div>
            </div>

            {/* Page Browser - clickable list of all scanned pages */}
            {showPageBrowser && (
              <div className="mt-4 border-2 border-[#3B82F6]/20 rounded-xl overflow-hidden">
                <div className="p-3 bg-[#3B82F6]/5 border-b border-[#3B82F6]/10">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={pageSearch} onChange={(e) => setPageSearch(e.target.value)} placeholder="Filtrar paginas escaneadas..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:border-[#3B82F6] focus:outline-none text-[#1a1a2e]" />
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50">
                  {allPages.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-gray-400">Carregando paginas...</div>
                  ) : (() => {
                    const funnelPageIds = new Set(funnel.pages.map((fp) => fp.page.id));
                    const filtered = pageSearch.trim()
                      ? allPages.filter((p) => {
                          const q = pageSearch.toLowerCase();
                          return p.url.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q) || p.domainName.toLowerCase().includes(q);
                        })
                      : allPages;
                    return filtered.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-400">Nenhuma pagina encontrada</div>
                    ) : filtered.map((p) => {
                      const inFunnel = funnelPageIds.has(p.id);
                      const status = getPageStatus(p.statusCode, p.responseTime);
                      const colors = STATUS_COLORS[status];
                      return (
                        <button key={p.id} disabled={inFunnel} onClick={async () => {
                          await fetch("/api/funnels/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ funnelId: id, pageId: p.id }) });
                          fetchFunnel();
                        }} className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${inFunnel ? "opacity-40 cursor-not-allowed bg-gray-50" : "hover:bg-[#14A44D]/5 cursor-pointer"}`}>
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors.bg }} />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-[#1a1a2e] truncate">{p.title || p.url}</div>
                            <div className="text-[10px] text-gray-400 truncate">{p.url}</div>
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">{p.domainName}</span>
                          {inFunnel ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Ja adicionada</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#14A44D]/10 text-[#14A44D] font-medium">+ Adicionar</span>
                          )}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar paginas neste funil..." className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3B82F6] focus:outline-none text-[#1a1a2e]" />
          </div>
        </div>

        {/* Pages */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Paginas do Funil ({filteredPages.length})</h2>
          </div>
          {filteredPages.length === 0 ? (
            <div className="px-6 py-12 text-center"><p className="text-gray-400">{search ? "Nenhuma pagina encontrada" : "Adicione paginas ao funil"}</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredPages.map((fp) => {
                const status = getPageStatus(fp.page.statusCode, fp.page.responseTime);
                const colors = STATUS_COLORS[status];
                return (
                  <div key={fp.page.id} className="px-6 py-3 hover:bg-gray-50 flex items-center justify-between relative">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors.bg }} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-[#1a1a2e] truncate">{fp.page.title || fp.page.url}</div>
                        <div className="text-xs text-gray-400 truncate">{fp.page.url}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-400">{fp.page.domain.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-lg" style={{ backgroundColor: `${colors.bg}20`, color: colors.bg }}>{getStatusLabel(fp.page.statusCode)}</span>

                      {isAdmin && (
                        <div className="relative">
                          <button onClick={() => setDropdownPageId(dropdownPageId === fp.page.id ? null : fp.page.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                            <FunnelIcon className="w-4 h-4" />
                          </button>
                          {dropdownPageId === fp.page.id && (
                            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                              <div className="px-3 py-2 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">Adicionar a funil</div>
                              {allFunnels.filter((f) => f.id !== id).map((f) => (
                                <button key={f.id} onClick={() => handleAddToFunnel(fp.page.id, f.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-left">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} /> {f.name}
                                </button>
                              ))}
                              <div className="border-t border-gray-100">
                                <button onClick={() => { handleRemovePage(fp.page.id); setDropdownPageId(null); }} className="w-full px-3 py-2 text-xs text-[#DC4C64] hover:bg-[#DC4C64]/5 text-left">Remover deste funil</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {selectedPageId && (() => {
        const fp = funnel.pages.find((f) => f.page.id === selectedPageId);
        if (!fp) return null;
        const p = fp.page;
        const fullPage = selectedPageData as Record<string, unknown> | null;
        return <PageDetailPanel
          page={{
            id: p.id, url: p.url,
            title: (fullPage?.title as string | null) ?? p.title,
            description: (fullPage?.description as string | null) ?? null,
            h1: (fullPage?.h1 as string | null) ?? null,
            headings: (fullPage?.headings as string | null) ?? null,
            bodyText: (fullPage?.bodyText as string | null) ?? null,
            images: (fullPage?.images as string | null) ?? null,
            statusCode: p.statusCode, responseTime: p.responseTime,
            linksFrom: (fullPage?.linksFrom as { href: string; statusCode: number | null; isExternal: boolean; anchor: string | null }[]) ?? p.linksFrom.map((l) => ({ ...l, anchor: null })),
            groupMembers: (fullPage?.groupMembers as { group: { id: string; name: string; color: string } }[]) ?? p.groupMembers,
          }}
          onClose={() => setSelectedPageId(null)}
          groups={groups}
          onAssignGroup={isAdmin ? async (pageId, groupId) => {
            await fetch("/api/groups/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageId, groupId }) });
            fetchFunnel();
          } : undefined}
          onRemoveFromSpecificGroup={isAdmin ? async (pageId, groupId) => {
            await fetch(`/api/groups/members?pageId=${pageId}&groupId=${groupId}`, { method: "DELETE" });
            fetchFunnel();
          } : undefined}
          onCrawlPage={isAdmin ? async (url) => {
            const domainId = fp.page.domain.id;
            await fetch("/api/crawl-page", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageUrl: url, domainId }) });
            fetchFunnel();
          } : undefined}
        />;
      })()}
    </div>
  );
}
