"use client";
import { getPageStatus, STATUS_COLORS } from "@/types";
import { XMarkIcon, GlobeAltIcon, ClockIcon, DocumentTextIcon, LinkIcon, ExclamationCircleIcon, CheckCircleIcon, EyeSlashIcon, ArrowTopRightOnSquareIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface PageDetail { id: string; url: string; title: string | null; description: string | null; h1: string | null; headings: string | null; bodyText: string | null; images: string | null; statusCode: number | null; responseTime: number | null; linksFrom: { href: string; statusCode: number | null; isExternal: boolean; anchor: string | null; }[]; }
interface PageDetailPanelProps { page: PageDetail; onClose: () => void; onDismissAlert?: (pageId: string, alertType: string) => void; dismissedAlerts?: Set<string>; }

function getTimeCategory(ms: number | null) { if (ms === null) return { label: "N/A", color: "#6B7280" }; if (ms < 1000) return { label: "Otimo", color: "#14A44D" }; if (ms < 3000) return { label: "Aceitavel", color: "#E4A11B" }; return { label: "Ruim", color: "#DC4C64" }; }

export default function PageDetailPanel({ page, onClose, onDismissAlert, dismissedAlerts = new Set() }: PageDetailPanelProps) {
  const status = getPageStatus(page.statusCode, page.responseTime);
  const colors = STATUS_COLORS[status];
  const timeCat = getTimeCategory(page.responseTime);

  const issues: { type: string; message: string }[] = [];
  if (!page.title) issues.push({ type: "missing_title", message: "Sem tag <title>" });
  if (!page.description) issues.push({ type: "missing_description", message: "Sem meta description" });
  if (!page.h1) issues.push({ type: "missing_h1", message: "Sem tag <h1>" });
  if (page.description && page.description.length < 50) issues.push({ type: "short_description", message: `Description curta (${page.description.length} chars)` });
  if (page.description && page.description.length > 160) issues.push({ type: "long_description", message: `Description longa (${page.description.length} chars)` });
  const visibleIssues = issues.filter((i) => !dismissedAlerts.has(`${page.id}:${i.type}`));
  const internalLinks = page.linksFrom.filter((l) => !l.isExternal);
  const externalLinks = page.linksFrom.filter((l) => l.isExternal);
  const brokenLinks = page.linksFrom.filter((l) => l.statusCode && l.statusCode >= 400);

  return (
    <div className="fixed right-0 top-0 h-screen w-[600px] bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto">

      {/* HEADER - Status, Performance, Avisos */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        {/* Top bar with status color */}
        <div className="px-8 py-4 flex items-center justify-between" style={{ backgroundColor: colors.bg }}>
          <div>
            <h3 className="text-lg font-bold break-all" style={{ color: colors.text }}>{page.title || page.url}</h3>
            <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-sm opacity-80 hover:opacity-100 break-all flex items-center gap-1" style={{ color: colors.text }}>{page.url} <ArrowTopRightOnSquareIcon className="w-3 h-3 shrink-0" /></a>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 shrink-0 ml-4"><XMarkIcon className="w-6 h-6" style={{ color: colors.text }} /></button>
        </div>

        {/* Performance metrics bar */}
        <div className="px-8 py-4 flex items-center gap-6 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Status</span>
            <span className="text-lg font-bold text-[#1a1a2e]">{page.statusCode === null ? "Pendente" : page.statusCode === 0 ? "ERR" : page.statusCode}</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span className="text-lg font-bold text-[#1a1a2e]">{page.responseTime ? `${page.responseTime}ms` : "N/A"}</span>
            {page.responseTime !== null && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: timeCat.color, backgroundColor: `${timeCat.color}15` }}>{timeCat.label}</span>}
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-[#1a1a2e]"><strong>{internalLinks.length}</strong> int</span>
            <span className="text-sm text-gray-400"><strong>{externalLinks.length}</strong> ext</span>
            {brokenLinks.length > 0 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DC4C64]/10 text-[#DC4C64]">{brokenLinks.length} quebrados</span>}
          </div>
        </div>

        {/* Warnings bar */}
        {visibleIssues.length > 0 && (
          <div className="px-8 py-3 bg-[#DC4C64]/5 border-t border-[#DC4C64]/10 flex items-center gap-2 flex-wrap">
            <ExclamationCircleIcon className="w-4 h-4 text-[#DC4C64] shrink-0" />
            {visibleIssues.map((issue) => (
              <span key={issue.type} className="inline-flex items-center gap-1 text-xs text-[#DC4C64] bg-white px-2.5 py-1 rounded-full border border-[#DC4C64]/20">
                {issue.message}
                {onDismissAlert && <button onClick={() => onDismissAlert(page.id, issue.type)} className="hover:bg-[#DC4C64]/10 rounded-full p-0.5"><XMarkIcon className="w-3 h-3" /></button>}
              </span>
            ))}
          </div>
        )}

        {visibleIssues.length === 0 && (
          <div className="px-8 py-2.5 bg-[#14A44D]/5 border-t border-[#14A44D]/10 flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-[#14A44D]" />
            <span className="text-xs font-medium text-[#14A44D]">Nenhum problema encontrado</span>
          </div>
        )}
      </div>

      {/* BODY - Content sections with more breathing room */}
      <div className="px-8 py-6 space-y-8">

        {/* Response Time Scale */}
        <div>
          <div className="text-xs text-gray-400 mb-2">Escala de Tempo de Carregamento</div>
          <div className="flex items-center gap-1 h-2.5 rounded-full overflow-hidden"><div className="h-full flex-1 bg-[#14A44D] rounded-l-full" /><div className="h-full flex-1 bg-[#E4A11B]" /><div className="h-full flex-1 bg-[#DC4C64] rounded-r-full" /></div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>0ms</span><span className="text-[#14A44D] font-medium">Otimo (&lt;1s)</span><span className="text-[#E4A11B] font-medium">Aceitavel (1-3s)</span><span className="text-[#DC4C64] font-medium">Ruim (&gt;3s)</span></div>
        </div>

        {/* Content Structure */}
        <div>
          <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2 mb-4"><DocumentTextIcon className="w-5 h-5" /> Estrutura de Conteudo</h4>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-4"><div className="text-xs text-gray-400 mb-1.5">Title</div><div className="text-sm text-[#1a1a2e] leading-relaxed">{page.title || <span className="text-[#DC4C64]">Nao encontrado</span>}</div></div>
            <div className="bg-gray-50 rounded-xl p-4"><div className="text-xs text-gray-400 mb-1.5">H1</div><div className="text-sm text-[#1a1a2e] leading-relaxed">{page.h1 || <span className="text-[#DC4C64]">Nao encontrado</span>}</div></div>
            <div className="bg-gray-50 rounded-xl p-4"><div className="text-xs text-gray-400 mb-1.5">Meta Description</div><div className="text-sm text-[#1a1a2e] leading-relaxed">{page.description || <span className="text-[#DC4C64]">Nao encontrada</span>}</div></div>
          </div>
        </div>

        {/* Headings */}
        {page.headings && (() => { try { const hdgs = JSON.parse(page.headings) as { tag: string; text: string }[]; if (hdgs.length === 0) return null; return (
          <div>
            <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2 mb-4"><DocumentTextIcon className="w-5 h-5" /> Cabecalhos da Pagina ({hdgs.length})</h4>
            <div className="space-y-1.5">
              {hdgs.map((h, i) => (
                <div key={i} className="bg-gray-50 rounded-lg px-4 py-2 text-sm text-[#1a1a2e] flex items-start gap-3">
                  <span className={`shrink-0 text-xs font-bold uppercase mt-0.5 ${h.tag === "h2" ? "text-[#3B82F6]" : h.tag === "h3" ? "text-[#8B5CF6]" : "text-[#6B7280]"}`}>{h.tag}</span>
                  <span className={`leading-relaxed ${h.tag === "h3" ? "pl-2" : h.tag === "h4" ? "pl-6" : ""}`}>{h.text}</span>
                </div>
              ))}
            </div>
          </div>
        ); } catch { return null; } })()}

        {/* Body Text */}
        {page.bodyText && (
          <div>
            <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2 mb-4"><DocumentTextIcon className="w-5 h-5" /> Texto Completo da Pagina</h4>
            <div className="bg-gray-50 rounded-xl p-5">
              <pre className="text-sm text-[#1a1a2e] whitespace-pre-wrap font-sans leading-relaxed">{page.bodyText}</pre>
            </div>
          </div>
        )}

        {/* Images */}
        {page.images && (() => { try { const imgs = JSON.parse(page.images) as { src: string; alt: string; format: string }[]; if (imgs.length === 0) return null; return (
          <div>
            <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2 mb-4"><PhotoIcon className="w-5 h-5" /> Imagens ({imgs.length})</h4>
            <div className="space-y-2">
              {imgs.map((img, i) => { let name = img.src; try { name = new URL(img.src).pathname.split("/").pop() || img.src; } catch {} return (
                <a key={i} href={img.src} target="_blank" rel="noopener noreferrer" className="block bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#1a1a2e] truncate flex-1">{img.alt || name}</span>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold ${img.format === "WEBP" || img.format === "AVIF" ? "bg-[#14A44D]/10 text-[#14A44D]" : img.format === "SVG" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : img.format === "PNG" || img.format === "JPG" ? "bg-[#E4A11B]/10 text-[#E4A11B]" : "bg-gray-100 text-gray-500"}`}>{img.format}</span>
                  </div>
                  <div className="text-xs text-gray-400 truncate mt-1">{img.src}</div>
                </a>
              ); })}
            </div>
          </div>
        ); } catch { return null; } })()}

        {/* Internal Links */}
        <div>
          <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2 mb-4"><LinkIcon className="w-5 h-5" /> Links Internos ({internalLinks.length})</h4>
          {internalLinks.length > 0 ? (
            <div className="space-y-1.5">
              {internalLinks.map((link, i) => { const broken = link.statusCode && link.statusCode >= 400; return (
                <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2.5 rounded-xl text-sm break-all hover:opacity-80 flex items-center gap-2 ${broken ? "bg-[#DC4C64]/5 text-[#DC4C64]" : "bg-gray-50 text-[#3B82F6]"}`}>
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1">{link.anchor || link.href}</span>
                  {link.statusCode && <span className="text-gray-400 shrink-0 text-xs">[{link.statusCode}]</span>}
                </a>
              ); })}
            </div>
          ) : <p className="text-sm text-gray-400">Nenhum link interno encontrado</p>}
        </div>

        {/* External Links */}
        <div>
          <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2 mb-4"><ArrowTopRightOnSquareIcon className="w-5 h-5" /> Links Externos ({externalLinks.length})</h4>
          {externalLinks.length > 0 ? (
            <div className="space-y-1.5">
              {externalLinks.map((link, i) => (
                <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 rounded-xl text-sm bg-gray-50 text-[#6B7280] break-all hover:text-[#3B82F6] flex items-center gap-2">
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 shrink-0" />
                  {link.anchor || link.href}
                </a>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">Nenhum link externo encontrado</p>}
        </div>

        {/* Broken Links */}
        {brokenLinks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-[#DC4C64] flex items-center gap-2 mb-4"><ExclamationCircleIcon className="w-5 h-5" /> Links Quebrados ({brokenLinks.length})</h4>
            <div className="space-y-1.5">
              {brokenLinks.map((link, i) => (
                <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="block bg-[#DC4C64]/5 px-4 py-2.5 rounded-xl text-sm text-[#DC4C64] break-all hover:opacity-80">[{link.statusCode}] {link.href}</a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
